import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaChatSession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    summary?: string;
    status: string; // 'active' | 'archived'
    isPinned: boolean;
    last_accessed: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaChatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'New Chat' },
    summary: { type: String, default: '' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    isPinned: { type: Boolean, default: false },
    last_accessed: { type: Date, default: Date.now },
}, { timestamps: true });

MinervaChatSessionSchema.index({ userId: 1, status: 1 });
MinervaChatSessionSchema.index({ userId: 1, last_accessed: -1 });

const MinervaChatSession = mongoose.model<IMinervaChatSession>('MinervaChatSession', MinervaChatSessionSchema);
export default MinervaChatSession;
