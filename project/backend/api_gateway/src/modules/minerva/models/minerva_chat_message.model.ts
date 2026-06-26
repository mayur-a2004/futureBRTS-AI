import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaChatMessage extends Document {
    userId: mongoose.Types.ObjectId;
    chat_session_id: mongoose.Types.ObjectId | null;
    session_id: mongoose.Types.ObjectId | null;
    role: string; // 'student' | 'minerva'
    content: string;
    content_type: string; // 'text' | 'roadmap' | 'resource' | 'task' | 'exam_ready' | 'homework'
    metadata: any; // any structured data attached (roadmap JSON, task JSON, etc.)
    createdAt: Date;
}

const MinervaChatMessageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chat_session_id: { type: Schema.Types.ObjectId, ref: 'MinervaChatSession', default: null },
    session_id: { type: Schema.Types.ObjectId, ref: 'MinervaStudySession', default: null },
    role: { type: String, enum: ['student', 'minerva'], required: true },
    content: { type: String, required: true },
    content_type: { 
        type: String, 
        enum: ['text', 'roadmap', 'resource', 'task', 'exam_ready', 'homework', 'onboarding', 'error'],
        default: 'text'
    },
    metadata: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

MinervaChatMessageSchema.index({ userId: 1, createdAt: -1 });
MinervaChatMessageSchema.index({ session_id: 1 });

const MinervaChatMessage = mongoose.model<IMinervaChatMessage>('MinervaChatMessage', MinervaChatMessageSchema);
export default MinervaChatMessage;
