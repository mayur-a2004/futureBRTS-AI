import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/utils/logger';
import mongoose from 'mongoose';
import QuizBattle from '../modules/minerva/models/quiz_battle.model';

export class SocketService {
    private static io: Server;

    public static init(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*", // Allow all for dev
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket: Socket) => {
            logger.info(`Socket Connected: ${socket.id}`);

            socket.on('join_session', (sessionId: string) => {
                socket.join(sessionId);
                logger.info(`Socket ${socket.id} joined session ${sessionId}`);
            });

            // ─── QUIZ BATTLE SOCKET HANDLERS ────────────────
            socket.on('join_battle_lobby', async (data: { roomCode: string; userId: string }) => {
                const { roomCode, userId } = data;
                socket.join(roomCode);
                logger.info(`Socket ${socket.id} joined battle lobby room ${roomCode}`);

                try {
                    const battle = await QuizBattle.findOne({ roomCode });
                    if (!battle) return;

                    const isCreator = battle.creatorId.toString() === userId;
                    if (isCreator) {
                        battle.creatorSocketId = socket.id;
                    } else {
                        battle.opponentId = new mongoose.Types.ObjectId(userId) as any;
                        battle.opponentSocketId = socket.id;
                        battle.status = 'ACTIVE'; // Start game immediately when opponent joins
                    }
                    await battle.save();

                    // Notify room of lobby update
                    const updatedBattle = await QuizBattle.findOne({ roomCode })
                        .populate('creatorId', 'firstName lastName')
                        .populate('opponentId', 'firstName lastName');
                    
                    this.io.to(roomCode).emit('lobby_update', { battle: updatedBattle });

                    if (battle.status === 'ACTIVE') {
                        logger.info(`[QuizBattle] Starting match in room ${roomCode}`);
                        this.io.to(roomCode).emit('battle_start', { battle: updatedBattle });
                    }
                } catch (err: any) {
                    logger.error('[QuizBattle Socket] Join lobby error:', err.message);
                }
            });

            socket.on('submit_battle_answer', async (data: { roomCode: string; userId: string; questionIndex: number; selectedOption: number }) => {
                const { roomCode, userId, questionIndex, selectedOption } = data;

                try {
                    const battle = await QuizBattle.findOne({ roomCode });
                    if (!battle || battle.status !== 'ACTIVE') return;

                    const isCreator = battle.creatorId.toString() === userId;
                    const question = battle.questions[questionIndex];
                    if (!question) return;

                    const isCorrect = question.correctAnswer === selectedOption;

                    if (isCreator) {
                        if (isCorrect) battle.creatorScore += 100; // 100 points per correct answer
                    } else {
                        if (isCorrect) battle.opponentScore += 100;
                    }

                    // Check if both players completed all 5 questions
                    const isLastQuestion = questionIndex === 4;
                    
                    // Since socket actions are asynchronous, we increment currentQuestionIndex
                    // We can track the overall state. Let's see: we want to sync the progression
                    // Emitting update
                    await battle.save();

                    const updatedBattle = await QuizBattle.findOne({ roomCode })
                        .populate('creatorId', 'firstName lastName')
                        .populate('opponentId', 'firstName lastName');

                    this.io.to(roomCode).emit('battle_update', { 
                        battle: updatedBattle,
                        answeredBy: userId,
                        questionIndex,
                        isCorrect
                    });
                } catch (err: any) {
                    logger.error('[QuizBattle Socket] Submit answer error:', err.message);
                }
            });

            socket.on('finish_battle', async (data: { roomCode: string }) => {
                const { roomCode } = data;
                try {
                    const battle = await QuizBattle.findOne({ roomCode });
                    if (!battle || battle.status === 'FINISHED') return;

                    battle.status = 'FINISHED';

                    let winnerId = null;
                    if (battle.creatorScore > battle.opponentScore) {
                        winnerId = battle.creatorId;
                    } else if (battle.opponentScore > battle.creatorScore) {
                        winnerId = battle.opponentId;
                    } // Draw leaves winnerId null

                    battle.winnerId = winnerId;
                    await battle.save();

                    // Award XP to participants
                    const { default: User } = require('../modules/auth/user.model');
                    if (winnerId) {
                        // Winner gets 300 XP
                        await User.findByIdAndUpdate(winnerId, { $inc: { xp: 300 } });
                        // Loser gets 100 XP
                        const loserId = winnerId.toString() === battle.creatorId.toString() ? battle.opponentId : battle.creatorId;
                        if (loserId) {
                            await User.findByIdAndUpdate(loserId, { $inc: { xp: 100 } });
                        }
                    } else {
                        // Draw: both get 150 XP
                        await User.findByIdAndUpdate(battle.creatorId, { $inc: { xp: 150 } });
                        if (battle.opponentId) {
                            await User.findByIdAndUpdate(battle.opponentId, { $inc: { xp: 150 } });
                        }
                    }

                    const finalBattle = await QuizBattle.findOne({ roomCode })
                        .populate('creatorId', 'firstName lastName')
                        .populate('opponentId', 'firstName lastName');

                    this.io.to(roomCode).emit('battle_finished', { battle: finalBattle });
                } catch (err: any) {
                    logger.error('[QuizBattle Socket] Finish battle error:', err.message);
                }
            });

            socket.on('disconnect', async () => {
                logger.info(`Socket Disconnected: ${socket.id}`);
                // Handle battle forfeit if player disconnects mid-game
                try {
                    const battle = await QuizBattle.findOne({
                        $and: [
                            { status: 'ACTIVE' },
                            { $or: [{ creatorSocketId: socket.id }, { opponentSocketId: socket.id }] }
                        ]
                    });

                    if (battle) {
                        battle.status = 'FINISHED';
                        const isCreatorDisconnect = battle.creatorSocketId === socket.id;
                        battle.winnerId = isCreatorDisconnect ? battle.opponentId : battle.creatorId;
                        // Award victory to remaining player
                        if (battle.winnerId) {
                            const { default: User } = require('../modules/auth/user.model');
                            await User.findByIdAndUpdate(battle.winnerId, { $inc: { xp: 300 } });
                        }
                        await battle.save();

                        const finishedBattle = await QuizBattle.findById(battle._id)
                            .populate('creatorId', 'firstName lastName')
                            .populate('opponentId', 'firstName lastName');
                        
                        this.io.to(battle.roomCode).emit('battle_forfeit', { 
                            battle: finishedBattle, 
                            leftPlayerSocketId: socket.id 
                        });
                    }
                } catch (err: any) {
                    logger.error('[QuizBattle Socket] Forfeit handle error:', err.message);
                }
            });
        });
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
