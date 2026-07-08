import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';
import ArenaRoom from '../modules/minerva/models/quiz_battle.model';

// â”€â”€â”€ Damage calculation based on answer speed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calculateDamage(timeMs: number, isDoubleStrike: boolean): number {
    let base = 0;
    if (timeMs <= 3000)       base = 300; // ⚡ Critical Hit
    else if (timeMs <= 7000)  base = 200; // ⚔️ Strong Hit
    else if (timeMs <= 15000) base = 100; // 🎯 Weak Hit
    else                      base = 75;  // Late hit
    return isDoubleStrike ? base * 2 : base;
}

// ─── AI Bot response simulator ────────────────────────────────────────────────
async function simulateAIAnswer(
    roomCode: string,
    roundIndex: number,
    difficulty: 'ROOKIE' | 'SCHOLAR' | 'GRANDMASTER',
    io: Server
) {
    // Delay before AI answers (simulate thinking)
    const delays = { ROOKIE: [8000, 12000], SCHOLAR: [5000, 8000], GRANDMASTER: [2000, 4000] };
    const accuracy = { ROOKIE: 0.40, SCHOLAR: 0.72, GRANDMASTER: 0.94 };
    const [minD, maxD] = delays[difficulty];
    const delay = minD + Math.random() * (maxD - minD);

    await new Promise(res => setTimeout(res, delay));

    const room = await ArenaRoom.findOne({ roomCode });
    if (!room || room.status !== 'ACTIVE' || room.currentRound !== roundIndex) return;

    const isCorrect = Math.random() < accuracy[difficulty];
    const timeMs = delay;

    // AI is always on Team B in SOLO_VS_AI
    const opponentTeam = 'B';

    const damage = isCorrect ? calculateDamage(timeMs, false) : 0;
    const selfDamage = !isCorrect ? 150 : 0;

    const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
    if (!roundState) return;

    if (isCorrect) {
        room.teamA.hp = Math.max(0, room.teamA.hp - damage);
        (roundState.teamBCorrectlyClaimed as any) = true;
    } else {
        room.teamB.hp = Math.max(0, room.teamB.hp - selfDamage);
    }

    // Record AI answer in Mongoose Map
    (roundState.teamBAnswers as any).set('AI', { option: isCorrect ? 0 : 1, isCorrect, timeMs });

    // Call unified evaluator
    const roundComplete = await (SocketService as any)._evaluateRoundComplete(room, roundIndex, roomCode, io);

    io.to(roomCode).emit('arena_update', {
        room: room.toJSON(),
        event: 'AI_ANSWER',
        answeredBy: 'AI',
        team: opponentTeam,
        roundIndex,
        isCorrect,
        damage: isCorrect ? damage : selfDamage,
        timeMs,
        roundComplete
    });
}

export class SocketService {
    private static io: Server;
    // ─── Per-round auto-advance timers ───────────────────────────────────────
    private static roundTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
    // ─── Global session expiry timers (1 per room) ───────────────────────────
    private static globalSessionTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

    private static startRoundTimer(roomCode: string, roundIndex: number, io: Server) {
        // Clear any existing timer for this room
        const existingKey = `${roomCode}:${roundIndex}`;
        const prev = SocketService.roundTimers.get(existingKey);
        if (prev) clearTimeout(prev);

        const timer = setTimeout(async () => {
            try {
                SocketService.roundTimers.delete(existingKey);
                const room = await ArenaRoom.findOne({ roomCode });
                if (!room || (room.status !== 'ACTIVE' && room.status !== 'WAITING')) return;
                
                const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
                if (!roundState) return;
                if ((roundState as any).finishedAt) return; // Already finished

                logger.info(`[Arena] ⏱️ Server timer expired. Terminating room ${roomCode} immediately to prevent stuck state.`);

                // Mark the room as cancelled/terminated
                room.status = 'CANCELLED' as any;
                await room.save();

                // Clear ALL server-side timers for this room (per-round + global session)
                SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);

                // Broadcast to ALL players in the room — they will see the stop screen and redirect
                io.to(roomCode).emit('arena_teacher_stopped', {
                    roomCode,
                    message: 'Quiz has been terminated automatically due to round inactivity or stuck state.',
                    stoppedAt: new Date().toISOString(),
                    reason: 'ROUND_STUCK'
                });
            } catch (err: any) {
                logger.error('[Arena] Round auto-termination error:', err.message);
            }
        }, 22000); // 22 seconds (15s question + 7s buffer for slow connections)

        SocketService.roundTimers.set(existingKey, timer);
    }

    // ─── Clear ALL timers for a room (per-round + global) ────────────────────
    private static clearAllRoomTimers(roomCode: string, totalRounds: number = 15) {
        // Clear per-round timers
        for (let i = 0; i < totalRounds; i++) {
            const key = `${roomCode}:${i}`;
            const t = SocketService.roundTimers.get(key);
            if (t) { clearTimeout(t); SocketService.roundTimers.delete(key); }
        }
        // Clear global session timer
        const gt = SocketService.globalSessionTimers.get(roomCode);
        if (gt) { clearTimeout(gt); SocketService.globalSessionTimers.delete(roomCode); }
    }

    // ─── Global session expiry timer ─────────────────────────────────────────
    // Fires after (totalRounds × 22s) from game start.
    // This is the absolute safety net — if the quiz is stuck for ANY reason,
    // (AI hang, all players unresponsive, multiple consecutive round stucks)
    // the session is forcefully terminated and all users are kicked.
    private static startGlobalSessionTimer(roomCode: string, totalRounds: number, io: Server) {
        // Clear any existing global timer for this room
        const prev = SocketService.globalSessionTimers.get(roomCode);
        if (prev) { clearTimeout(prev); }

        // Total allowed time = (totalRounds rounds × 22s per round) + 10s grace
        const totalMs = (totalRounds * 22000) + 10000;

        logger.info(`[Arena] 🕐 Global session timer started for room ${roomCode} — expires in ${Math.ceil(totalMs / 1000)}s`);

        const timer = setTimeout(async () => {
            try {
                SocketService.globalSessionTimers.delete(roomCode);
                const room = await ArenaRoom.findOne({ roomCode });
                if (!room) return;
                // Only act if still active (not already finished/cancelled)
                if (room.status === 'FINISHED' || room.status === 'CANCELLED') return;

                logger.warn(`[Arena] ⚠️ GLOBAL SESSION TIMER EXPIRED for room ${roomCode}. Force-terminating quiz.`);

                // Mark room cancelled
                room.status = 'CANCELLED' as any;
                await room.save();

                // Clear per-round timers too
                SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);

                // Broadcast termination to ALL connected clients
                io.to(roomCode).emit('arena_teacher_stopped', {
                    roomCode,
                    message: 'Quiz session time has expired. The quiz has ended automatically.',
                    stoppedAt: new Date().toISOString(),
                    reason: 'SESSION_EXPIRED'
                });
            } catch (err: any) {
                logger.error('[Arena] Global session timer error:', err.message);
            }
        }, totalMs);

        SocketService.globalSessionTimers.set(roomCode, timer);
    }

    // ─── Unified Round Evaluator ──────────────────────────────────────────────
    private static async _evaluateRoundComplete(room: any, roundIndex: number, roomCode: string, io: Server, forceComplete: boolean = false) {
        const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
        if (!roundState) return false;

        let roundComplete = false;
        if (forceComplete) {
            roundComplete = true;
        } else if (room.battleStyle === 'ALTERNATING') {
            roundComplete = false;
        } else {
            const allTeamADone = room.players.filter((p: any) => p.team === 'A').every(
                (p: any) => !!(roundState.teamAAnswers as any).get((p.userId._id || p.userId).toString())
            );
            let allTeamBDone = false;
            if (room.mode === 'SOLO_VS_AI') {
                allTeamBDone = !!(roundState.teamBAnswers as any).get('AI');
            } else {
                allTeamBDone = room.players.filter((p: any) => p.team === 'B').every(
                    (p: any) => !!(roundState.teamBAnswers as any).get((p.userId._id || p.userId).toString())
                );
            }
            roundComplete = allTeamADone && allTeamBDone;
        }

        let winnerTeam: string | null = null;
        if (room.teamA.hp <= 0) winnerTeam = 'B';
        else if (room.teamB.hp <= 0) winnerTeam = 'A';

        if (roundComplete) {
            (roundState as any).finishedAt = new Date();
            const nextRound = roundIndex + 1;
            if (nextRound < room.totalRounds && !winnerTeam) {
                room.currentRound = nextRound;
                room.currentTurn = (room.battleStyle === 'ALTERNATING') ? (nextRound % 2 === 0 ? 'A' : 'B') : 'A';
                room.roundStates.push({
                    roundIndex: nextRound,
                    teamAAnswers: {} as any,
                    teamBAnswers: {} as any,
                    teamACorrectlyClaimed: false,
                    teamBCorrectlyClaimed: false,
                    startedAt: new Date()
                } as any);
                // Trigger AI for next round
                if (room.mode === 'SOLO_VS_AI' && room.aiDifficulty) {
                    simulateAIAnswer(roomCode, nextRound, room.aiDifficulty as any, io);
                }
                // Start server-side auto-advance timer for next round
                SocketService.startRoundTimer(roomCode, nextRound, io);

            } else if (!winnerTeam) {
                // All rounds done — determine winner by HP
                winnerTeam = room.teamA.hp > room.teamB.hp ? 'A' : room.teamB.hp > room.teamA.hp ? 'B' : 'DRAW';
            }
        }

        if (winnerTeam) {
            room.status = 'FINISHED';
            room.winnerTeam = winnerTeam as any;
            // Game finished cleanly — cancel global session timer
            SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);
            await SocketService._awardXP(room);
        }

        await room.save();

        if (winnerTeam) {
            io.to(roomCode).emit('arena_finished', { room: room.toJSON() });
        }

        return roundComplete;
    }

    public static init(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        this.io.on('connection', (socket: Socket) => {
            logger.info(`Socket Connected: ${socket.id}`);

            // Legacy session room support
            socket.on('join_session', (sessionId: string) => {
                socket.join(sessionId);
            });

            // ─── JOIN ARENA LOBBY ─────────────────────────────────────────────────
            socket.on('join_arena_lobby', async (data: { roomCode: string; userId: string }) => {
                const { roomCode, userId } = data;
                socket.join(roomCode);

                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room) return;

                    // Update socket ID for this player
                    const player = room.players.find((p: any) => (p.userId._id || p.userId).toString() === userId);
                    if (player) {
                        (player as any).socketId = socket.id;
                        (player as any).isConnected = true;
                    }
                    await room.save();

                    const updated = await ArenaRoom.findOne({ roomCode })
                        .populate('players.userId', 'firstName lastName grade')
                        .populate('hostId', 'firstName lastName');

                    this.io.to(roomCode).emit('arena_lobby_update', { room: updated ? updated.toJSON() : null });
                } catch (err: any) {
                    logger.error('[Arena Socket] join_arena_lobby error:', err.message);
                }
            });

            // ─── TEACHER TOURNAMENT BROADCAST INVITATION ─────────────────────────
            socket.on('broadcast_tournament_invite', (data: { roomCode: string; subject: string; topic?: string }) => {
                this.io.emit('student_tournament_invite', {
                    roomCode: data.roomCode,
                    subject: data.subject,
                    topic: data.topic,
                    sender: 'Teacher'
                });
            });

            // ─── HOST STARTS THE GAME ─────────────────────────────────────────────
            socket.on('start_arena_match', async (data: { roomCode: string; userId: string }) => {
                const { roomCode, userId } = data;
                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room) return;
                    if (room.hostId.toString() !== userId) return; // Only host can start
                    if (room.status === 'ACTIVE') return;

                    room.status = 'ACTIVE';
                    room.currentRound = 0;
                    // Init first round state
                    room.roundStates.push({
                        roundIndex: 0,
                        teamAAnswers: {} as any,
                        teamBAnswers: {} as any,
                        teamACorrectlyClaimed: false,
                        teamBCorrectlyClaimed: false,
                        startedAt: new Date()
                    } as any);
                    await room.save();

                    this.io.to(roomCode).emit('arena_started', { room: room.toJSON() });

                    // Start server-side round timer to auto-advance if players don't answer
                    SocketService.startRoundTimer(roomCode, 0, this.io);

                    // ─── Start GLOBAL session expiry timer ───────────────────────────
                    // Absolute safety net: if quiz is stuck for (totalRounds × 22s) total,
                    // forcefully terminate and kick all users — regardless of mode or stuck type.
                    SocketService.startGlobalSessionTimer(roomCode, room.totalRounds || 10, this.io);

                    // If AI mode, start AI simulation for round 0
                    if (room.mode === 'SOLO_VS_AI' && room.aiDifficulty) {
                        simulateAIAnswer(roomCode, 0, room.aiDifficulty as any, this.io);
                    }
                } catch (err: any) {
                    logger.error('[Arena Socket] start_arena_match error:', err.message);
                }
            });

            // ─── TEACHER FORCE STOP QUIZ ──────────────────────────────────────────
            socket.on('teacher_stop_quiz', async (data: { roomCode: string; userId: string }) => {
                const { roomCode, userId } = data;
                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room) return;
                    // Only the host (teacher) can stop the quiz
                    if (room.hostId.toString() !== userId) {
                        socket.emit('arena_error', { message: 'Only the host teacher can stop this quiz.' });
                        return;
                    }
                    if (room.status === 'CANCELLED' || room.status === 'FINISHED') return;

                    // Mark room as cancelled
                    room.status = 'CANCELLED' as any;
                    await room.save();

                    // Clear ALL server-side timers for this room (per-round + global session)
                    SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);

                    // Broadcast to ALL players in the room — they will see the stop screen and redirect
                    this.io.to(roomCode).emit('arena_teacher_stopped', {
                        roomCode,
                        message: 'Quiz has been stopped by the teacher. You are being redirected.',
                        stoppedAt: new Date().toISOString()
                    });

                    logger.info(`[Arena Socket] Teacher stopped quiz room: ${roomCode}`);
                } catch (err: any) {
                    logger.error('[Arena Socket] teacher_stop_quiz error:', err.message);
                }
            });


            socket.on('submit_arena_answer', async (data: {
                roomCode: string;
                userId: string;
                roundIndex: number;
                selectedOption: number;
                timeMs: number;
            }) => {
                const { roomCode, userId, roundIndex, selectedOption, timeMs } = data;

                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room || room.status !== 'ACTIVE') return;

                    const player = room.players.find((p: any) => (p.userId._id || p.userId).toString() === userId);
                    if (!player) return;

                    const team = (player as any).team as 'A' | 'B';
                    const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
                    if (!roundState) return;

                    const teamAnswers = team === 'A'
                        ? (roundState.teamAAnswers as any)
                        : (roundState.teamBAnswers as any);

                    if (teamAnswers.get(userId)) return; // Already answered

                    // ─────────────────────────────────────────────────────────
                    // ALTERNATING MODE: Only currentTurn team can answer
                    // ─────────────────────────────────────────────────────────
                    if ((room as any).battleStyle === 'ALTERNATING' && room.mode !== 'SOLO_VS_AI') {
                        const currentTurn = (room as any).currentTurn as 'A' | 'B';
                        // If it's not this player's team's turn AND they have not been given a defender turn
                        const isDefenderPhase = !!(roundState.teamAAnswers as any).size && currentTurn === 'B' && team === 'B' ||
                                                !!(roundState.teamBAnswers as any).size && currentTurn === 'A' && team === 'A';
                        if (team !== currentTurn && !isDefenderPhase) return; // Not your turn, blocked
                    }

                    // Get player's questions
                    const playerQs = (room.playerQuestions as any).get(userId);
                    if (!playerQs || !playerQs[roundIndex]) return;

                    const question = playerQs[roundIndex];
                    const isCorrect = selectedOption !== -1 && question.correctAnswer === selectedOption;

                    // ─── Team Ownership Rule ──────────────────────────────────
                    const teamAlreadyClaimed = team === 'A'
                        ? roundState.teamACorrectlyClaimed
                        : roundState.teamBCorrectlyClaimed;

                    if (teamAlreadyClaimed && isCorrect) {
                        teamAnswers.set(userId, { option: selectedOption, isCorrect, timeMs, alreadyClaimed: true });
                        await room.save();
                        socket.emit('arena_answer_ack', { alreadyClaimed: true, isCorrect, roundIndex });
                        return;
                    }

                    let damage = 0;
                    let selfDamage = 0;
                    let shieldUsed = false;

                    if (isCorrect) {
                        damage = calculateDamage(timeMs, false);

                        // Streak bonus
                        (player as any).streakCount += 1;
                        if ((player as any).streakCount >= 3) {
                            damage += 250;
                            (player as any).streakCount = 0;
                            this.io.to(roomCode).emit('arena_combo', { userId, team, message: '🔥 COMBO STRIKE! +250 bonus damage!' });
                        }

                        if (team === 'A') {
                            room.teamB.hp = Math.max(0, room.teamB.hp - damage);
                            (roundState.teamACorrectlyClaimed as any) = true;
                        } else {
                            room.teamA.hp = Math.max(0, room.teamA.hp - damage);
                            (roundState.teamBCorrectlyClaimed as any) = true;
                        }
                    } else {
                        (player as any).streakCount = 0;
                        if ((player as any).powerups.shield && !(player as any).powerupsUsed.includes('shield')) {
                            shieldUsed = true;
                            (player as any).powerups.shield = false;
                            (player as any).powerupsUsed.push('shield');
                        } else {
                            selfDamage = 150;
                            if (team === 'A') {
                                room.teamA.hp = Math.max(0, room.teamA.hp - selfDamage);
                            } else {
                                room.teamB.hp = Math.max(0, room.teamB.hp - selfDamage);
                            }
                        }

                        // Deduct 10 XP for wrong answer
                        try {
                            const { default: User } = require('../modules/auth/user.model');
                            const u = await User.findById(userId);
                            if (u) {
                                u.xp = Math.max(0, (u.xp || 0) - 10);
                                await u.save();
                            }
                        } catch (e: any) {
                            logger.error('[Arena Socket] XP deduct error:', e.message);
                        }
                    }

                    // Record answer
                    teamAnswers.set(userId, { option: selectedOption, isCorrect, timeMs });
                    (player as any).answersRecord.push({
                        questionId: roundIndex,
                        selectedOption,
                        isCorrect,
                        timeMs,
                        damage: isCorrect ? damage : selfDamage
                    });
                    (player as any).score += isCorrect ? damage : 0;

                    // ─────────────────────────────────────────────────────────
                    // SPEED_RACE: First correct answer = instant round advance
                    // ─────────────────────────────────────────────────────────
                    let forceRoundEnd = false;
                    if ((room as any).battleStyle === 'SPEED_RACE' || room.mode === 'SOLO_VS_AI') {
                        if (isCorrect) {
                            // Mark other team's slot as done too so round evaluator fires
                            const oppAnswers = team === 'A' ? (roundState.teamBAnswers as any) : (roundState.teamAAnswers as any);
                            const oppPlayers = room.players.filter((p: any) => p.team !== team);
                            if (room.mode !== 'SOLO_VS_AI') {
                                oppPlayers.forEach((p: any) => {
                                    const pIdStr = (p.userId._id || p.userId).toString();
                                    if (!oppAnswers.get(pIdStr)) {
                                        oppAnswers.set(pIdStr, { option: -1, isCorrect: false, timeMs: 0, skippedBySpeedRace: true });
                                    }
                                });
                            }
                            forceRoundEnd = true;
                        }
                    }

                    // ─────────────────────────────────────────────────────────
                    // ALTERNATING: Wrong/timeout → switch turn to opponent
                    // ─────────────────────────────────────────────────────────
                    let turnSwitched = false;
                    let newTurn: 'A' | 'B' = (room as any).currentTurn;

                    if ((room as any).battleStyle === 'ALTERNATING' && room.mode !== 'SOLO_VS_AI') {
                        const currentTurn = (room as any).currentTurn as 'A' | 'B';
                        const opponentTeam: 'A' | 'B' = currentTurn === 'A' ? 'B' : 'A';

                        if (team === currentTurn) {
                            if (!isCorrect) {
                                // Attacker got it wrong → switch turn to defender
                                (room as any).currentTurn = opponentTeam;
                                newTurn = opponentTeam;
                                turnSwitched = true;
                            } else {
                                // Attacker got it right → round ends, alternate who starts next round
                                forceRoundEnd = true;
                                // Mark opponent as answered (skipped)
                                const oppAnswers = opponentTeam === 'A' ? (roundState.teamAAnswers as any) : (roundState.teamBAnswers as any);
                                const oppPlayers = room.players.filter((p: any) => p.team === opponentTeam);
                                oppPlayers.forEach((p: any) => {
                                     const pIdStr = (p.userId._id || p.userId).toString();
                                     if (!oppAnswers.get(pIdStr)) {
                                         oppAnswers.set(pIdStr, { option: -1, isCorrect: false, timeMs: 0, skippedByAttacker: true });
                                     }
                                 });
                            }
                        } else {
                            // Defender answered → round always ends after defender responds
                            forceRoundEnd = true;
                        }
                    }

                    // Emit turn switch if needed (before evaluating round)
                    if (turnSwitched) {
                        await room.save();
                        this.io.to(roomCode).emit('arena_turn_switch', {
                            roomCode,
                            roundIndex,
                            activeTurn: newTurn,
                            reason: 'ATTACKER_WRONG',
                            timerSeconds: 10 // Defender gets 10 seconds
                        });
                        this.io.to(roomCode).emit('arena_update', {
                            room: room.toJSON(),
                            event: 'ANSWER',
                            answeredBy: userId,
                            playerName: (player as any).firstName,
                            team,
                            roundIndex,
                            isCorrect,
                            damage: 0,
                            selfDamage,
                            shieldUsed,
                            xpDeducted: !isCorrect && !shieldUsed ? 10 : 0,
                            roundComplete: false
                        });
                        return; // Don't evaluate round yet — wait for defender
                    }

                    // If force round end (Speed Race correct or Alternating complete), auto-close round
                    let roundComplete = false;
                    if (forceRoundEnd) {
                        roundComplete = await SocketService._evaluateRoundComplete(room, roundIndex, roomCode, this.io, true);
                    } else {
                        roundComplete = await SocketService._evaluateRoundComplete(room, roundIndex, roomCode, this.io, false);
                    }

                    if (roundComplete && (room as any).battleStyle === 'ALTERNATING') {
                        newTurn = (room as any).currentTurn;
                    }

                    this.io.to(roomCode).emit('arena_update', {
                        room: room.toJSON(),
                        event: 'ANSWER',
                        answeredBy: userId,
                        playerName: (player as any).firstName,
                        team,
                        roundIndex,
                        isCorrect,
                        damage: isCorrect ? damage : 0,
                        selfDamage,
                        shieldUsed,
                        xpDeducted: !isCorrect && !shieldUsed ? 10 : 0,
                        roundComplete,
                        activeTurn: newTurn
                    });

                    if (!isCorrect) {
                        this.io.to(roomCode).emit('arena_teammate_wrong', {
                            userId,
                            team,
                            roundIndex,
                            wrongOption: selectedOption
                        });
                    }
                } catch (err: any) {
                    logger.error('[Arena Socket] submit_arena_answer error:', err.message);
                }
            });

            // â”€â”€â”€ USE POWER-UP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // ─────────────────────────────────────────────────────────── USE POWER-UP ───────────────────────────────────────────────────────────
            socket.on('use_arena_powerup', async (data: { roomCode: string; userId: string; powerup: string }) => {
                const { roomCode, userId, powerup } = data;
                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room || room.status !== 'ACTIVE') return;
                    const player = room.players.find((p: any) => (p.userId._id || p.userId).toString() === userId);
                    if (!player) return;
                    if ((player as any).powerupsUsed.includes(powerup)) return;

                    (player as any).powerupsUsed.push(powerup);
                    if (powerup === 'freeze') {
                        (player as any).powerups.freeze = false;
                        this.io.to(roomCode).emit('arena_powerup_used', { userId, powerup: 'freeze', effect: 'TIMER_FROZEN', duration: 10000 });
                    } else if (powerup === 'doubleStrike') {
                        (player as any).powerups.doubleStrike = false;
                        socket.emit('arena_powerup_used', { userId, powerup: 'doubleStrike', effect: 'NEXT_ATTACK_2X' });
                    } else if (powerup === 'fiftyFifty') {
                        (player as any).powerups.fiftyFifty = false;
                        const roundIdx = room.currentRound;
                        const playerQs = (room.playerQuestions as any).get(userId);
                        if (playerQs && playerQs[roundIdx]) {
                            const q = playerQs[roundIdx];
                            // Find 2 wrong option indices to hide
                            const wrongIndices = [0,1,2,3].filter(i => i !== q.correctAnswer);
                            const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
                            socket.emit('arena_powerup_used', { userId, powerup: 'fiftyFifty', effect: 'HIDE_OPTIONS', hideIndices: toHide });
                        }
                    }
                    await room.save();
                } catch (err: any) {
                    logger.error('[Arena Socket] use_arena_powerup error:', err.message);
                }
            });

            // ─── LEAVE BATTLE UI EVENT ──────────────────────────────────────────
            socket.on('leave_arena_battle', async (data: { roomCode: string; userId: string }) => {
                logger.info(`[Arena Socket] Player left arena battle via UI: ${data.userId} in room ${data.roomCode}`);
                try {
                    const room = await ArenaRoom.findOne({
                        roomCode: data.roomCode,
                        status: 'ACTIVE'
                    });
                    if (!room) return;

                    const leavingPlayer = room.players.find((p: any) => (p.userId._id || p.userId).toString() === data.userId);
                    if (!leavingPlayer) return;

                    (leavingPlayer as any).isConnected = false;

                    // Check if all players from one team disconnected/forfeited
                    const teamAConnected = room.players.filter((p: any) => p.team === 'A' && (p as any).isConnected).length;
                    const teamBConnected = room.players.filter((p: any) => p.team === 'B' && (p as any).isConnected).length;

                    if (room.mode === 'SOLO_VS_AI') {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'B' as any; // AI wins
                    } else if (teamAConnected === 0 && teamBConnected > 0) {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'B' as any;
                        await SocketService._awardXP(room);
                    } else if (teamBConnected === 0 && teamAConnected > 0) {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'A' as any;
                        await SocketService._awardXP(room);
                    } else if (teamAConnected === 0 && teamBConnected === 0) {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'DRAW' as any;
                    }

                    await room.save();

                    this.io.to(room.roomCode).emit('arena_forfeit', {
                        room: room.toJSON(),
                        forfeitedBy: (leavingPlayer as any).userId,
                        forfeitedTeam: (leavingPlayer as any).team
                    });
                } catch (err: any) {
                    logger.error('[Arena Socket] leave_arena_battle error:', err.message);
                }
            });

            // ─── DISCONNECT / FORFEIT ───────────────────────────────────────────
            socket.on('disconnect', async () => {
                logger.info(`Socket Disconnected: ${socket.id}`);
                try {
                    const room = await ArenaRoom.findOne({
                        status: 'ACTIVE',
                        'players.socketId': socket.id
                    });
                    if (!room) return;

                    const leavingPlayer = room.players.find((p: any) => (p as any).socketId === socket.id);
                    if (!leavingPlayer) return;

                    (leavingPlayer as any).isConnected = false;

                    // Check if all players from one team disconnected
                    const teamAConnected = room.players.filter((p: any) => p.team === 'A' && (p as any).isConnected).length;
                    const teamBConnected = room.players.filter((p: any) => p.team === 'B' && (p as any).isConnected).length;

                    if (teamAConnected === 0 && teamBConnected > 0) {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'B' as any;
                        await this._awardXP(room);
                    } else if (teamBConnected === 0 && teamAConnected > 0) {
                        room.status = 'FINISHED';
                        room.winnerTeam = 'A' as any;
                        await this._awardXP(room);
                    }

                    await room.save();

                    if (room.status === 'FINISHED') {
                        this.io.to(room.roomCode).emit('arena_forfeit', {
                            room: room.toJSON(),
                            forfeitedBy: (leavingPlayer as any).userId,
                            forfeitedTeam: (leavingPlayer as any).team
                        });
                    }
                } catch (err: any) {
                    logger.error('[Arena Socket] disconnect error:', err.message);
                }
            });
        });
    }

    // ─── XP Award + Badge + Battle Stats Logic ────────────────────────────────
    public static async _awardXP(room: any) {
        try {
            const { default: User } = require('../modules/auth/user.model');
            const winnerTeam = room.winnerTeam;
            const isDaily = room.roomCode && room.roomCode.startsWith('DAILY-');

            for (const player of room.players) {
                const isWinner = player.team === winnerTeam;
                const isDraw = winnerTeam === 'DRAW';
                let xp = 100; // Base participation

                if (isDraw) xp = 150;
                else if (isWinner) {
                    xp = 300;
                    // MVP bonus: most damage dealt
                    const topScorer = room.players.reduce((prev: any, cur: any) => cur.score > prev.score ? cur : prev);
                    if (player.userId.toString() === topScorer.userId.toString()) {
                        xp += 150; // MVP bonus
                        room.mvpPlayerId = player.userId;
                    }
                }

                // Double XP for Daily Challenges
                if (isDaily) {
                    xp = xp * 2;
                }

                // Build battleStats update
                const statsInc: any = {
                    xp,
                    'battleStats.totalBattles': 1,
                    'battleStats.totalDamageDealt': player.score || 0
                };
                if (isDraw) statsInc['battleStats.draws'] = 1;
                else if (isWinner) statsInc['battleStats.wins'] = 1;
                else statsInc['battleStats.losses'] = 1;

                const streak = player.streakCount || 0;

                // ─── Badge Check ───────────────────────────────────────────────
                const userDoc = await User.findById(player.userId).select('xp badges battleStats schoolName');
                if (userDoc) {
                    const existingBadges = (userDoc.badges || []).map((b: any) => b.name);
                    const newBadges: { name: string; icon: string }[] = [];

                    const totalBattles = (userDoc.battleStats?.totalBattles || 0) + 1;
                    const totalWins = (userDoc.battleStats?.wins || 0) + (isWinner ? 1 : 0);
                    const correctAnswers = player.answersRecord?.filter((a: any) => a.isCorrect).length || 0;
                    const totalAnswers = player.answersRecord?.length || 0;
                    const newXP = (userDoc.xp || 0) + xp;

                    // 🏆 First Victory
                    if (isWinner && totalWins === 1 && !existingBadges.includes('First Victory'))
                        newBadges.push({ name: 'First Victory', icon: '🏆' });

                    // ⚡ Speed Demon — answered 10+ times in < 3 seconds total
                    const fastAnswers = player.answersRecord?.filter((a: any) => a.isCorrect && a.timeMs <= 3000).length || 0;
                    if (fastAnswers >= 3 && !existingBadges.includes('Speed Demon'))
                        newBadges.push({ name: 'Speed Demon', icon: '⚡' });

                    // 📚 Perfect Score — 10/10 correct
                    if (totalAnswers >= 10 && correctAnswers === totalAnswers && !existingBadges.includes('Perfect Score'))
                        newBadges.push({ name: 'Perfect Score', icon: '📚' });

                    // 🔥 Combo King — 5+ streak in one battle
                    if ((player.streakCount || 0) >= 5 && !existingBadges.includes('Combo King'))
                        newBadges.push({ name: 'Combo King', icon: '🔥' });

                    // 🤖 AI Destroyer — beat Grandmaster AI
                    if (isWinner && room.mode === 'SOLO_VS_AI' && room.aiDifficulty === 'GRANDMASTER' && !existingBadges.includes('AI Destroyer'))
                        newBadges.push({ name: 'AI Destroyer', icon: '🤖' });

                    // 👊 Giant Slayer — Solo team won against larger team
                    const myTeamSize = player.team === 'A' ? room.teamASizeTarget : room.teamBSizeTarget;
                    const oppTeamSize = player.team === 'A' ? room.teamBSizeTarget : room.teamASizeTarget;
                    if (isWinner && myTeamSize === 1 && oppTeamSize >= 3 && !existingBadges.includes('Giant Slayer'))
                        newBadges.push({ name: 'Giant Slayer', icon: '👊' });

                    // Rank badges
                    if (newXP >= 500 && (userDoc.xp || 0) < 500 && !existingBadges.includes('Scholar Rank'))
                        newBadges.push({ name: 'Scholar Rank', icon: '📖' });
                    if (newXP >= 3000 && (userDoc.xp || 0) < 3000 && !existingBadges.includes('Champion Rank'))
                        newBadges.push({ name: 'Champion Rank', icon: '🏆' });

                    // Update user with XP, stats and new badges
                    const updateOp: any = { $inc: statsInc };
                    if (newBadges.length > 0) {
                        updateOp.$push = {
                            badges: { $each: newBadges.map(b => ({ ...b, unlockedAt: new Date() })) }
                        };
                    }
                    
                    // Use $max for longestStreak
                    if (streak > 0) {
                        updateOp.$max = { 'battleStats.longestStreak': streak };
                    }

                    // Mark daily challenge played
                    if (isDaily) {
                        updateOp.lastDailyChallengePlayedAt = new Date();
                    }

                    await User.findByIdAndUpdate(player.userId, updateOp);

                    // Emit badge unlock notification
                    if (newBadges.length > 0 && this.io) {
                        this.io.to(room.roomCode).emit('arena_badge_unlocked', {
                            userId: player.userId.toString(),
                            playerName: player.firstName,
                            badges: newBadges
                        });
                    }

                    if (isDaily && this.io) {
                        this.io.to(room.roomCode).emit('arena_daily_complete', {
                            userId: player.userId.toString(),
                            doubleXpEarned: xp
                        });
                    }
                } else {
                    const updateOp: any = { $inc: statsInc };
                    if (isDaily) {
                        updateOp.lastDailyChallengePlayedAt = new Date();
                    }
                    await User.findByIdAndUpdate(player.userId, updateOp);
                }
            }
        } catch (err: any) {
            logger.error('[Arena] XP award error:', err.message);
        }
    }

    public static emit(event: string, data: any) {
        if (!this.io) return;
        this.io.emit(event, data);
    }

    public static emitToSession(sessionId: string, event: string, data: any) {
        if (!this.io) return;
        this.io.to(sessionId).emit(event, data);
    }
}
