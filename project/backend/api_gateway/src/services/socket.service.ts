import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';
import ArenaRoom, { calculateTeamHP } from '../modules/minerva/models/quiz_battle.model';

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

    (roundState.teamBAnswers as any).set('AI', { option: isCorrect ? 0 : 1, isCorrect, timeMs });

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
    private static roundTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
    private static globalSessionTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

    public static calculateActivePlayerForRound(room: any, roundIndex: number) {
        const teamAPlayers = room.players
            .filter((p: any) => p.team === 'A')
            .sort((a: any, b: any) => a.userId.toString().localeCompare(b.userId.toString()));
        
        let teamBPlayers = room.players
            .filter((p: any) => p.team === 'B')
            .sort((a: any, b: any) => a.userId.toString().localeCompare(b.userId.toString()));

        if (room.mode === 'SOLO_VS_AI') {
            teamBPlayers = [{ userId: null, firstName: 'AI', team: 'B' }];
        }

        if (teamAPlayers.length === 0 && teamBPlayers.length === 0) return null;

        const turnSequence: any[] = [];
        const maxLen = Math.max(teamAPlayers.length, teamBPlayers.length, 1);
        for (let i = 0; i < maxLen * 4; i++) {
            if (teamAPlayers.length > 0) {
                turnSequence.push(teamAPlayers[i % teamAPlayers.length]);
            }
            if (teamBPlayers.length > 0) {
                turnSequence.push(teamBPlayers[i % teamBPlayers.length]);
            }
        }

        return turnSequence[roundIndex % turnSequence.length];
    }

    private static startRoundTimer(roomCode: string, roundIndex: number, io: Server, extraMs: number = 0) {
        const existingKey = `${roomCode}:${roundIndex}`;
        const prev = SocketService.roundTimers.get(existingKey);
        if (prev) clearTimeout(prev);

        const timer = setTimeout(async () => {
            try {
                SocketService.roundTimers.delete(existingKey);
                const room = await ArenaRoom.findOne({ roomCode });
                if (!room || room.status !== 'ACTIVE') return;
                
                const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
                if (!roundState) return;
                if ((roundState as any).finishedAt) return;

                logger.info(`[Arena] ⏱️ Round timer expired for room ${roomCode}, round ${roundIndex}. Auto-submitting timeouts.`);

                if (room.battleStyle === 'ALTERNATING') {
                    const activePlayer = SocketService.calculateActivePlayerForRound(room, roundIndex);
                    if (activePlayer) {
                        const activePlayerIdStr = activePlayer.userId ? activePlayer.userId.toString() : 'AI';
                        if (activePlayerIdStr === 'AI') {
                            logger.info(`[Arena] Auto-submitting AI timeout for round ${roundIndex}`);
                            const opponentTeam = 'B';
                            const selfDamage = 150;
                            room.teamB.hp = Math.max(0, room.teamB.hp - selfDamage);
                            (roundState.teamBAnswers as any).set('AI', { option: -1, isCorrect: false, timeMs: 15000 });
                            const roundComplete = await SocketService._evaluateRoundComplete(room, roundIndex, roomCode, io);
                            io.to(roomCode).emit('arena_update', {
                                room: room.toJSON(),
                                event: 'AI_ANSWER',
                                answeredBy: 'AI',
                                team: opponentTeam,
                                roundIndex,
                                isCorrect: false,
                                damage: selfDamage,
                                timeMs: 15000,
                                roundComplete
                            });
                        } else {
                            logger.info(`[Arena] Auto-submitting timeout for player: ${activePlayer.firstName} (${activePlayerIdStr})`);
                            await SocketService.processAnswer(roomCode, activePlayerIdStr, roundIndex, -1, 15000, io);
                        }
                    }
                } else {
                    const inactivePlayers = room.players.filter((p: any) => {
                        const teamAnswers = p.team === 'A' ? roundState.teamAAnswers : roundState.teamBAnswers;
                        return !((teamAnswers as any).get((p.userId._id || p.userId).toString()));
                    });

                    if (inactivePlayers.length > 0) {
                        for (const player of inactivePlayers) {
                            const pIdStr = (player.userId._id || player.userId).toString();
                            await SocketService.processAnswer(roomCode, pIdStr, roundIndex, -1, 15000, io);
                        }
                    }
                }
            } catch (err: any) {
                logger.error('[Arena] Round auto-advance timeout error:', err.message);
            }
        }, 22000 + extraMs);

        SocketService.roundTimers.set(existingKey, timer);
    }

    private static clearAllRoomTimers(roomCode: string, totalRounds: number = 15) {
        for (let i = 0; i < totalRounds; i++) {
            const key = `${roomCode}:${i}`;
            const t = SocketService.roundTimers.get(key);
            if (t) { clearTimeout(t); SocketService.roundTimers.delete(key); }
        }
        const gt = SocketService.globalSessionTimers.get(roomCode);
        if (gt) { clearTimeout(gt); SocketService.globalSessionTimers.delete(roomCode); }
    }

    private static startGlobalSessionTimer(roomCode: string, totalRounds: number, io: Server) {
        const prev = SocketService.globalSessionTimers.get(roomCode);
        if (prev) { clearTimeout(prev); }

        const totalMs = (totalRounds * 22000) + 10000;

        logger.info(`[Arena] 🕐 Global session timer started for room ${roomCode} — expires in ${Math.ceil(totalMs / 1000)}s`);

        const timer = setTimeout(async () => {
            try {
                SocketService.globalSessionTimers.delete(roomCode);
                const room = await ArenaRoom.findOne({ roomCode });
                if (!room) return;
                if (room.status === 'FINISHED' || room.status === 'CANCELLED') return;

                logger.warn(`[Arena] ⚠️ GLOBAL SESSION TIMER EXPIRED for room ${roomCode}. Force-terminating quiz.`);

                room.status = 'CANCELLED' as any;
                await room.save();

                SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);

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

    public static async processAnswer(
        roomCode: string,
        userId: string,
        roundIndex: number,
        selectedOption: number,
        timeMs: number,
        io: Server,
        socket?: Socket
    ): Promise<void> {
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

            if (teamAnswers.get(userId)) return;

            if ((room as any).battleStyle === 'ALTERNATING') {
                const activePlayer = SocketService.calculateActivePlayerForRound(room, roundIndex);
                if (!activePlayer) return;
                const activePlayerIdStr = activePlayer.userId ? activePlayer.userId.toString() : 'AI';
                if (userId !== activePlayerIdStr) {
                    logger.info(`[Arena] Blocking out-of-turn answer from ${player.firstName}. Active representative is: ${activePlayer.firstName}`);
                    return;
                }
            }

            const playerQs = (room.playerQuestions as any).get(userId);
            if (!playerQs || !playerQs[roundIndex]) return;

            const question = playerQs[roundIndex];
            const isCorrect = selectedOption !== -1 && question.correctAnswer === selectedOption;

            const teamAlreadyClaimed = team === 'A'
                ? roundState.teamACorrectlyClaimed
                : roundState.teamBCorrectlyClaimed;

            if (teamAlreadyClaimed && isCorrect) {
                teamAnswers.set(userId, { option: selectedOption, isCorrect, timeMs, alreadyClaimed: true });
                room.markModified('roundStates');
                room.markModified('players');
                await room.save();
                if (socket) {
                    socket.emit('arena_answer_ack', { alreadyClaimed: true, isCorrect, roundIndex });
                }
                return;
            }

            let damage = 0;
            let selfDamage = 0;
            let shieldUsed = false;

            if (isCorrect) {
                const isDoubleStrikeActive = (player as any).powerupsUsed.includes('doubleStrike');
                damage = calculateDamage(timeMs, isDoubleStrikeActive);

                (player as any).streakCount += 1;
                if ((player as any).streakCount >= 3) {
                    damage += 250;
                    (player as any).streakCount = 0;
                    io.to(roomCode).emit('arena_combo', { userId, team, message: '🔥 COMBO STRIKE! +250 bonus damage!' });
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

                if (selectedOption !== -1) {
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
            }

            teamAnswers.set(userId, { option: selectedOption, isCorrect, timeMs });
            (player as any).answersRecord.push({
                questionId: roundIndex,
                selectedOption,
                isCorrect,
                timeMs,
                damage: isCorrect ? damage : selfDamage
            });
            (player as any).score += isCorrect ? damage : 0;

            let forceRoundEnd = false;
            if ((room as any).battleStyle === 'SPEED_RACE' || room.mode === 'SOLO_VS_AI') {
                if (isCorrect) {
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

            if ((room as any).battleStyle === 'ALTERNATING') {
                forceRoundEnd = true;
                const opponentTeam = team === 'A' ? 'B' : 'A';
                const oppAnswers = opponentTeam === 'A' ? (roundState.teamAAnswers as any) : (roundState.teamBAnswers as any);
                const oppPlayers = room.players.filter((p: any) => p.team === opponentTeam);
                oppPlayers.forEach((p: any) => {
                    const pIdStr = (p.userId._id || p.userId).toString();
                    if (!oppAnswers.get(pIdStr)) {
                        oppAnswers.set(pIdStr, { option: -1, isCorrect: false, timeMs: 0, skippedByAttacker: true });
                    }
                });
            }

            let roundComplete = false;
            if (forceRoundEnd) {
                roundComplete = await SocketService._evaluateRoundComplete(room, roundIndex, roomCode, io, true);
            } else {
                roundComplete = await SocketService._evaluateRoundComplete(room, roundIndex, roomCode, io, false);
            }

            let newTurn = room.currentTurn;
            if (roundComplete && (room as any).battleStyle === 'ALTERNATING') {
                newTurn = room.currentTurn;
            }

            io.to(roomCode).emit('arena_update', {
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
                io.to(roomCode).emit('arena_teammate_wrong', {
                    userId,
                    team,
                    roundIndex,
                    wrongOption: selectedOption
                });
            }
        } catch (err: any) {
            logger.error('[Arena Socket] processAnswer error:', err.message);
        }
    }

    private static async _evaluateRoundComplete(room: any, roundIndex: number, roomCode: string, io: Server, forceComplete: boolean = false) {
        const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
        if (!roundState) return false;

        let roundComplete = false;
        if (forceComplete) {
            roundComplete = true;
        } else if (room.battleStyle === 'ALTERNATING') {
            roundComplete = true;
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
                
                if (room.battleStyle === 'ALTERNATING') {
                    const nextActivePlayer = SocketService.calculateActivePlayerForRound(room, nextRound);
                    if (nextActivePlayer) {
                        room.activePlayerId = nextActivePlayer.userId;
                        room.activePlayerName = nextActivePlayer.firstName;
                        room.currentTurn = nextActivePlayer.team;
                    } else {
                        room.activePlayerId = null;
                        room.activePlayerName = '';
                        room.currentTurn = 'A';
                    }
                } else {
                    room.activePlayerId = null;
                    room.activePlayerName = '';
                    room.currentTurn = 'A';
                }

                room.roundStates.push({
                    roundIndex: nextRound,
                    teamAAnswers: {} as any,
                    teamBAnswers: {} as any,
                    teamACorrectlyClaimed: false,
                    teamBCorrectlyClaimed: false,
                    startedAt: new Date()
                } as any);

                const nextActivePlayer = SocketService.calculateActivePlayerForRound(room, nextRound);
                const isAITurn = nextActivePlayer && nextActivePlayer.firstName === 'AI';
                if (room.mode === 'SOLO_VS_AI' && room.aiDifficulty && isAITurn) {
                    simulateAIAnswer(roomCode, nextRound, room.aiDifficulty as any, io);
                }

                SocketService.startRoundTimer(roomCode, nextRound, io);

            } else if (!winnerTeam) {
                winnerTeam = room.teamA.hp > room.teamB.hp ? 'A' : room.teamB.hp > room.teamA.hp ? 'B' : 'DRAW';
            }
        }

        if (winnerTeam) {
            room.status = 'FINISHED';
            room.winnerTeam = winnerTeam as any;
            SocketService.clearAllRoomTimers(roomCode, room.totalRounds || 15);
            await SocketService._awardXP(room);
        }

        room.markModified('players');
        room.markModified('roundStates');
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
            socket.on('join_arena_lobby', async (data: { 
                roomCode: string; userId: string; 
                joinMode?: string; grade?: string; board?: string; 
                subject?: string; topic?: string;
            }) => {
                const { roomCode, userId, joinMode, grade, board, subject, topic } = data;
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
                    room.markModified('players');
                    await room.save();

                    const updated = await ArenaRoom.findOne({ roomCode })
                        .populate('players.userId', 'firstName lastName grade')
                        .populate('hostId', 'firstName lastName');

                    this.io.to(roomCode).emit('arena_lobby_update', { room: updated ? updated.toJSON() : null });

                    // Notify host (and everyone in room) with joiner's choice details
                    if (player) {
                        const playerName = (player as any).firstName || 'A player';
                        this.io.to(roomCode).emit('arena_player_joined', {
                            playerName,
                            joinMode: joinMode || 'SAME',
                            grade: grade || String((player as any).grade || '?'),
                            board: board || (player as any).board || '?',
                            subject: subject || '',
                            topic: topic || ''
                        });
                    }
                } catch (err: any) {
                    logger.error('[Arena Socket] join_arena_lobby error:', err.message);
                }
            });

            // ─── SWITCH TEAM IN LOBBY ─────────────────────────────────────────────
            socket.on('arena_switch_team', async (data: { roomCode: string; userId: string; targetTeam: 'A' | 'B' }) => {
                const { roomCode, userId, targetTeam } = data;
                try {
                    if (!['A', 'B'].includes(targetTeam)) return;
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room) return;
                    if (room.status !== 'WAITING' && room.status !== 'LOBBY_READY') return;

                    const player = room.players.find((p: any) => p.userId.toString() === userId);
                    if (!player) return;
                    if (player.team === targetTeam) return;

                    const targetTeamPlayers = room.players.filter((p: any) => p.team === targetTeam);
                    const targetSize = targetTeam === 'A' ? room.teamASizeTarget : room.teamBSizeTarget;
                    if (targetTeamPlayers.length >= targetSize) return;

                    const oldTeam = player.team;
                    player.team = targetTeam;

                    if (oldTeam === 'A') {
                        room.teamA.playerIds = room.teamA.playerIds.filter((id: any) => id.toString() !== userId);
                    } else {
                        room.teamB.playerIds = room.teamB.playerIds.filter((id: any) => id.toString() !== userId);
                    }

                    if (targetTeam === 'A') {
                        room.teamA.playerIds.push(player.userId);
                    } else {
                        room.teamB.playerIds.push(player.userId);
                    }

                    // Recalculate team HPs
                    const teamAPlayersCount = room.players.filter((p: any) => p.team === 'A').length;
                    const teamBPlayersCount = room.players.filter((p: any) => p.team === 'B').length;
                    const newTeamAHp = calculateTeamHP(teamAPlayersCount || 1, teamBPlayersCount || 1);
                    const newTeamBHp = room.mode === 'SOLO_VS_AI' ? newTeamAHp : calculateTeamHP(teamBPlayersCount || 1, teamAPlayersCount || 1);

                    room.teamA.hp = newTeamAHp;
                    room.teamA.maxHp = newTeamAHp;
                    room.teamB.hp = newTeamBHp;
                    room.teamB.maxHp = newTeamBHp;

                    await room.save();

                    const updatedRoom = await ArenaRoom.findOne({ roomCode })
                        .populate('players.userId', 'firstName lastName grade')
                        .populate('hostId', 'firstName lastName');

                    this.io.to(roomCode).emit('arena_room_updated', updatedRoom?.toJSON() || room.toJSON());
                } catch (err: any) {
                    logger.error('[Arena Socket] arena_switch_team error:', err.message);
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
                    
                    const hostIdStr = room.hostId && typeof room.hostId === 'object' && '_id' in room.hostId
                        ? (room.hostId as any)._id.toString()
                        : room.hostId.toString();
                        
                    if (hostIdStr !== userId) return; // Only host can start
                    if (room.status === 'ACTIVE') return;

                    room.status = 'ACTIVE';
                    room.currentRound = 0;
                    room.currentTurn = 'A';

                    // Set initial active player (Team A starts)
                    if (room.battleStyle === 'ALTERNATING') {
                        const activePlayer = SocketService.calculateActivePlayerForRound(room, 0);
                        if (activePlayer) {
                            room.activePlayerId = activePlayer.userId;
                            room.activePlayerName = activePlayer.firstName;
                            room.currentTurn = activePlayer.team;
                        }
                    } else {
                        room.activePlayerId = null;
                        room.activePlayerName = '';
                    }

                    // Init first round state
                    room.roundStates.push({
                        roundIndex: 0,
                        teamAAnswers: {} as any,
                        teamBAnswers: {} as any,
                        teamACorrectlyClaimed: false,
                        teamBCorrectlyClaimed: false,
                        startedAt: new Date()
                    } as any);
                    room.markModified('roundStates');
                    await room.save();

                    this.io.to(roomCode).emit('arena_started', { room: room.toJSON() });

                    // Start server-side round timer to auto-advance if players don't answer
                    SocketService.startRoundTimer(roomCode, 0, this.io);

                    // ─── Start GLOBAL session expiry timer ───────────────────────────
                    // Absolute safety net: if quiz is stuck for (totalRounds × 22s) total,
                    // forcefully terminate and kick all users — regardless of mode or stuck type.
                    SocketService.startGlobalSessionTimer(roomCode, room.totalRounds || 10, this.io);

                    // If AI mode, start AI simulation for round 0 only if it is the AI's turn!
                    const activePlayerRound0 = SocketService.calculateActivePlayerForRound(room, 0);
                    const isAITurnRound0 = activePlayerRound0 && activePlayerRound0.firstName === 'AI';
                    if (room.mode === 'SOLO_VS_AI' && room.aiDifficulty && isAITurnRound0) {
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
                    const hostIdStr = room.hostId && typeof room.hostId === 'object' && '_id' in room.hostId
                        ? (room.hostId as any)._id.toString()
                        : room.hostId.toString();
                        
                    if (hostIdStr !== userId) {
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
                await SocketService.processAnswer(roomCode, userId, roundIndex, selectedOption, timeMs, this.io, socket);
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
                        // Extend server-side round timer by 10 seconds
                        SocketService.startRoundTimer(roomCode, room.currentRound, this.io, 10000);
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
                    room.markModified('players');
                    await room.save();
                    // Broadcast updated room state to all clients so they instantly see powerup used/greyed out
                    this.io.to(roomCode).emit('arena_update', {
                        room: room.toJSON(),
                        event: 'POWERUP_USED',
                        answeredBy: userId,
                        powerup,
                        team: player.team,
                        isCorrect: false,
                        damage: 0,
                        selfDamage: 0,
                        roundComplete: false
                    });
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

                    room.markModified('players');
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

                    room.markModified('players');
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
