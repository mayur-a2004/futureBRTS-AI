import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizBattleQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // 0-3 index
}

export interface IQuizBattle extends Document {
    roomCode: string;
    creatorId: mongoose.Types.ObjectId;
    opponentId?: mongoose.Types.ObjectId;
    status: 'WAITING' | 'ACTIVE' | 'FINISHED';
    subject: string;
    difficulty: string;
    questions: IQuizBattleQuestion[];
    creatorScore: number;
    opponentScore: number;
    creatorSocketId?: string;
    opponentSocketId?: string;
    currentQuestionIndex: number;
    winnerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const QuizBattleSchema: Schema = new Schema({
    roomCode: { type: String, required: true, unique: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opponentId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED'], default: 'WAITING' },
    subject: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }
    }],
    creatorScore: { type: Number, default: 0 },
    opponentScore: { type: Number, default: 0 },
    creatorSocketId: { type: String },
    opponentSocketId: { type: String },
    currentQuestionIndex: { type: Number, default: 0 },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.model<IQuizBattle>('QuizBattle', QuizBattleSchema);
