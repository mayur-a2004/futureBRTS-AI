import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    initialPrompt: string;
    messages: {
        id: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    initialPrompt: { type: String },
    messages: [{
        id: { type: String },
        role: { type: String, enum: ['user', 'assistant'] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISession>('Session', SessionSchema);
