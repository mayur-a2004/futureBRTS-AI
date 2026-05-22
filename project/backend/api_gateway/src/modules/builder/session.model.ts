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
        attachments?: {
            file_id: string;
            type: string;
            original_name: string;
            storage_path: string;
            mime_type?: string;
            status: 'uploaded' | 'processed' | 'failed';
            preview?: string;
        }[];
        summary?: string;
        suggestions?: string[];
    }[];
    hasRoadmap: boolean;
    hasTasks: boolean;
    summary?: string;
    status: 'active' | 'archived';
    isPinned: boolean;

    // Links
    onboardingProfileId?: mongoose.Types.ObjectId;
    landingIntentId?: mongoose.Types.ObjectId;
    activeRoadmapId?: mongoose.Types.ObjectId;
    onboardingSnapshot?: any; // Locked data

    // Session Context
    sessionState?: {
        mode: 'onboarding' | 'clarification' | 'execution' | 'documentation' | 'review';
        questionsRemaining: number;
        isRoadmapGenerated: boolean;
    };
    userContext?: {
        education?: string;
        year?: string;
        domain?: string;
        goal?: string;
        confidenceLevel?: string;
        lockedFacts?: string[];
        rank?: 'Normal' | 'Middle' | 'High Chat' | 'Legend';
    };

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
        timestamp: { type: Date, default: Date.now },
        attachments: [{
            file_id: { type: String }, // UUID
            type: { type: String }, // image | pdf | ...
            original_name: { type: String },
            storage_path: { type: String },
            mime_type: { type: String },
            status: { type: String, enum: ['uploaded', 'processed', 'failed'], default: 'uploaded' },
            preview: { type: String } // Base64 or URL for UI
        }],
        summary: { type: String },
        suggestions: [{ type: String }]
    }],
    hasRoadmap: { type: Boolean, default: false },
    hasTasks: { type: Boolean, default: false },
    summary: { type: String },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    isPinned: { type: Boolean, default: false },

    // ✅ Link to Single Source of Truth
    onboardingProfileId: { type: Schema.Types.ObjectId, ref: 'OnboardingProfile' },
    landingIntentId: { type: Schema.Types.ObjectId, ref: 'LandingIntent' },
    activeRoadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },

    // ✅ Session Immutability Snapshot
    onboardingSnapshot: { type: Schema.Types.Mixed }, // Locked copy of onboarding data

    // ✅ Session Context Contract Fields
    sessionState: {
        mode: { type: String, enum: ['onboarding', 'clarification', 'execution', 'documentation', 'review'], default: 'execution' },
        questionsRemaining: { type: Number, default: 0 },
        isRoadmapGenerated: { type: Boolean, default: false }
    },
    userContext: {
        education: { type: String },
        year: { type: String },
        domain: { type: String },
        goal: { type: String },
        confidenceLevel: { type: String },
        lockedFacts: [{ type: String }], // Store exact strings like "BCA final year"
        rank: { type: String, enum: ['Normal', 'Middle', 'High Chat', 'Legend'], default: 'Normal' }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISession>('Session', SessionSchema);
