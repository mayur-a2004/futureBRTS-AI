import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSummary extends Document {
    sessionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    summaryText: string;
    keySignals: {
        stage: string;
        field: string;
        persona?: string;
        domain?: string;
        problems: string[];
        constraints: string[];
        goals: string[];
        main_topic?: string;
        sub_topics?: string[];
        intended_stack?: string;
        user_vibe?: string;
    };
    approved: boolean;
    createdAt: Date;
}

const ChatSummarySchema: Schema = new Schema({
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    summaryText: { type: String, required: true },
    keySignals: {
        stage: { type: String },
        field: { type: String },
        persona: { type: String },
        domain: { type: String },
        problems: [{ type: String }],
        constraints: [{ type: String }],
        goals: [{ type: String }],
        main_topic: { type: String },
        sub_topics: [{ type: String }],
        intended_stack: { type: String },
        user_vibe: { type: String }
    },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChatSummary>('ChatSummary', ChatSummarySchema);
