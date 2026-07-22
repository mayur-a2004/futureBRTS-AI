import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveExamQuestion {
    question_number: number;
    question: string;
    options: string[];
    correctAnswer: number;
    marks: number;
    topic: string;
    explanation?: string;
}

export interface ILiveExamParticipant {
    userId: mongoose.Types.ObjectId;
    firstName: string;
    grade: string | number;
    board: string;
    answers: Record<string, number>;
    submittedAt?: Date | null;
    score: number;
    percentage: number;
    rank?: number;
    timeTakenSeconds: number;
}

export interface ILiveExamRoom extends Document {
    roomCode: string;
    hostId: mongoose.Types.ObjectId;
    hostName: string;
    mode: 'TEACHER_CLASS' | 'PEER_GROUP' | 'SOLO_AI';
    status: 'WAITING' | 'ACTIVE' | 'FINISHED';
    title: string;
    standard: string;
    board: string;
    subject: string;
    topic: string;
    language: string;
    totalQuestions: number;
    totalMarks: number;
    durationMinutes: number;
    questions: ILiveExamQuestion[];
    participants: ILiveExamParticipant[];
    startedAt?: Date | null;
    finishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const LiveExamParticipantSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    grade: { type: Schema.Types.Mixed, default: '10' },
    board: { type: String, default: 'CBSE' },
    answers: { type: Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: null },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 }
}, { _id: false });

const LiveExamQuestionSchema = new Schema({
    question_number: Number,
    question: String,
    options: [String],
    correctAnswer: Number,
    marks: { type: Number, default: 1 },
    topic: String,
    explanation: String
}, { _id: false });

const LiveExamRoomSchema = new Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true },
    mode: { type: String, enum: ['TEACHER_CLASS', 'PEER_GROUP', 'SOLO_AI'], default: 'PEER_GROUP' },
    status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED'], default: 'WAITING' },
    title: { type: String, required: true },
    standard: { type: String, default: '10' },
    board: { type: String, default: 'CBSE' },
    subject: { type: String, default: 'Science' },
    topic: { type: String, default: 'General' },
    language: { type: String, default: 'English' },
    totalQuestions: { type: Number, default: 10 },
    totalMarks: { type: Number, default: 10 },
    durationMinutes: { type: Number, default: 15 },
    questions: [LiveExamQuestionSchema],
    participants: [LiveExamParticipantSchema],
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<ILiveExamRoom>('LiveExamRoom', LiveExamRoomSchema);
