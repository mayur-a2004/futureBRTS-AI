import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';
import ArenaRoom from '../modules/minerva/models/quiz_battle.model';

// â”€â”€â”€ Damage calculation based on answer speed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calculateDamage(timeMs: number, isDoubleStrike: boolean): number {
    let base = 0;
    if (timeMs <= 3000)       base = 300; // âš¡ Critical Hit
    else if (timeMs <= 7000)  base = 200; // âš”ï¸ Strong Hit
    else if (timeMs <= 15000) base = 100; // ðŸŽ¯ Weak Hit
    else                      base = 75;  // Late hit
    return isDoubleStrike ? base * 2 : base;
}

// â”€â”€â”€ AI Bot response simulator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    const playerTeam = 'A';

    const damage = isCorrect ? calculateDamage(timeMs, false) : 0;
    const selfDamage = !isCorrect ? 150 : 0;

    if (isCorrect) {
        room.teamA.hp = Math.max(0, room.teamA.hp - damage);
    } else {
        room.teamB.hp = Math.max(0, room.teamB.hp - selfDamage);
    }

    // Check win condition
    let winnerTeam: string | null = null;
    if (room.teamA.hp <= 0) winnerTeam = 'B';
    else if (room.teamB.hp <= 0) winnerTeam = 'A';

    if (winnerTeam) {
        room.status = 'FINISHED';
        room.winnerTeam = winnerTeam as any;
    }

    await room.save();

    io.to(roomCode).emit('arena_update', {
        room,
        event: 'AI_ANSWER',
        answeredBy: 'AI',
        team: opponentTeam,
        roundIndex,
        isCorrect,
        damage: isCorrect ? damage : selfDamage,
        timeMs
    });

    if (winnerTeam) {
        io.to(roomCode).emit('arena_finished', { room });
    }
}

export class SocketService {
    private static io: Server;

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

            // â”€â”€â”€ JOIN ARENA LOBBY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            socket.on('join_arena_lobby', async (data: { roomCode: string; userId: string }) => {
                const { roomCode, userId } = data;
                socket.join(roomCode);

                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room) return;

                    // Update socket ID for this player
                    const player = room.players.find((p: any) => p.userId.toString() === userId);
                    if (player) {
                        (player as any).socketId = socket.id;
                        (player as any).isConnected = true;
                    }
                    await room.save();

                    const updated = await ArenaRoom.findOne({ roomCode });
                    this.io.to(roomCode).emit('arena_lobby_update', { room: updated ? updated.toJSON() : null });
                } catch (err: any) {
                    logger.error('[Arena Socket] join_arena_lobby error:', err.message);
                }
            });

            // â”€â”€â”€ HOST STARTS THE GAME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

                    // If AI mode, start AI simulation for round 0
                    if (room.mode === 'SOLO_VS_AI' && room.aiDifficulty) {
                        simulateAIAnswer(roomCode, 0, room.aiDifficulty as any, this.io);
                    }
                } catch (err: any) {
                    logger.error('[Arena Socket] start_arena_match error:', err.message);
                }
            });

            // â”€â”€â”€ SUBMIT ANSWER (Core Team Ownership Logic) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

                    const player = room.players.find((p: any) => p.userId.toString() === userId);
                    if (!player) return;

                    const team = (player as any).team as 'A' | 'B';
                    const roundState = room.roundStates.find((r: any) => r.roundIndex === roundIndex);
                    if (!roundState) return;

                    // Check if this player already answered this round
                    const teamAnswers = team === 'A'
                        ? (roundState.teamAAnswers as any)
                        : (roundState.teamBAnswers as any);

                    if (teamAnswers[userId]) return; // Already answered

                    // Get player's questions
                    const playerQs = (room.playerQuestions as any).get(userId);
                    if (!playerQs || !playerQs[roundIndex]) return;

                    const question = playerQs[roundIndex];
                    const isCorrect = question.correctAnswer === selectedOption;

                    // â”€â”€â”€ Team Ownership Rule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    const teamAlreadyClaimed = team === 'A'
                        ? roundState.teamACorrectlyClaimed
                        : roundState.teamBCorrectlyClaimed;

                    // If team already got a correct answer, this player's answer is just recorded but has no effect
                    if (teamAlreadyClaimed && isCorrect) {
                        // Still record but no damage (already claimed)
                        teamAnswers[userId] = { option: selectedOption, isCorrect, timeMs, alreadyClaimed: true };
                        await room.save();
                        socket.emit('arena_answer_ack', { alreadyClaimed: true, isCorrect, roundIndex });
                        return;
                    }

                    // ————————————————————————————————————————————————————————————————————————
                    let damage = 0;
                    let selfDamage = 0;
                    let shieldUsed = false;

                    if (isCorrect) {
                        const useDoubleStrike = (player as any).powerups.doubleStrike && (player as any).powerupsUsed.includes('doubleStrike_used') === false;
                        damage = calculateDamage(timeMs, false); // we check explicitly below

                        // Streak bonus
                        (player as any).streakCount += 1;
                        if ((player as any).streakCount >= 3) {
                            damage += 250; // Ultimate combo bonus
                            (player as any).streakCount = 0;
                            this.io.to(roomCode).emit('arena_combo', { userId, team, message: '🔥 COMBO STRIKE! +250 bonus damage!' });
                        }

                        // Deduct from opponent team HP
                        if (team === 'A') {
                            room.teamB.hp = Math.max(0, room.teamB.hp - damage);
                            (roundState.teamACorrectlyClaimed as any) = true;
                        } else {
                            room.teamA.hp = Math.max(0, room.teamA.hp - damage);
                            (roundState.teamBCorrectlyClaimed as any) = true;
                        }
                    } else {
                        // Wrong answer — check shield
                        (player as any).streakCount = 0;
                        if ((player as any).powerups.shield && !(player as any).powerupsUsed.includes('shield')) {
                            shieldUsed = true;
                            (player as any).powerups.shield = false;
                            (player as any).powerupsUsed.push('shield');
                            // Shield absorbs damage — no HP loss
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
                    teamAnswers[userId] = { option: selectedOption, isCorrect, timeMs };

                    // Record in player's history
                    (player as any).answersRecord.push({
                        questionId: roundIndex,
                        selectedOption,
                        isCorrect,
                        timeMs,
                        damage: isCorrect ? damage : selfDamage
                    });
                    (player as any).score += isCorrect ? damage : 0;

                    // ─── Check Win Condition ──────────────────────────────────
                    let winnerTeam: string | null = null;
                    if (room.teamA.hp <= 0) winnerTeam = 'B';
                    else if (room.teamB.hp <= 0) winnerTeam = 'A';

                    // ─── Advance Round (if all active players on both teams answered) ──
                    const allTeamADone = room.players.filter((p: any) => p.team === 'A').every(
                        (p: any) => !!(roundState.teamAAnswers as any)[p.userId.toString()]
                    );
                    const allTeamBDone = room.players.filter((p: any) => p.team === 'B').every(
                        (p: any) => !!(roundState.teamBAnswers as any)[p.userId.toString()]
                    );

                    const roundComplete = allTeamADone && allTeamBDone;
                    if (roundComplete) {
                        (roundState as any).finishedAt = new Date();
                        const nextRound = roundIndex + 1;
                        if (nextRound < room.totalRounds && !winnerTeam) {
                            room.currentRound = nextRound;
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
                                simulateAIAnswer(roomCode, nextRound, room.aiDifficulty as any, this.io);
                            }
                        } else if (!winnerTeam) {
                            // All rounds done — determine winner by HP
                            winnerTeam = room.teamA.hp > room.teamB.hp ? 'A' : room.teamB.hp > room.teamA.hp ? 'B' : 'DRAW';
                        }
                    }

                    if (winnerTeam) {
                        room.status = 'FINISHED';
                        room.winnerTeam = winnerTeam as any;
                        await this._awardXP(room);
                    }

                    await room.save();

                    this.io.to(roomCode).emit('arena_update', {
                        room: room.toJSON(),
                        event: 'ANSWER',
                        answeredBy: userId,
                        playerName: player.firstName,
                        team,
                        roundIndex,
                        isCorrect,
                        damage: isCorrect ? damage : 0,
                        selfDamage,
                        shieldUsed,
                        xpDeducted: !isCorrect && !shieldUsed ? 10 : 0,
                        roundComplete
                    });

                    if (winnerTeam) {
                        this.io.to(roomCode).emit('arena_finished', { room: room.toJSON() });
                    }

                    // Broadcast wrong answer visibility to teammates (so they can see what was selected)
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
            socket.on('use_arena_powerup', async (data: { roomCode: string; userId: string; powerup: string }) => {
                const { roomCode, userId, powerup } = data;
                try {
                    const room = await ArenaRoom.findOne({ roomCode });
                    if (!room || room.status !== 'ACTIVE') return;
                    const player = room.players.find((p: any) => p.userId.toString() === userId);
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

            // â”€â”€â”€ DISCONNECT / FORFEIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€â”€ XP Award Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private static async _awardXP(room: any) {
        try {
            const { default: User } = require('../modules/auth/user.model');
            const winnerTeam = room.winnerTeam;

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

                await User.findByIdAndUpdate(player.userId, { $inc: { xp } });
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
