import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    parentRoadmapId?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    type: 'main' | 'normal' | 'micro';
    locked: boolean;
    progress: number;
    neuralScore?: number;
    detectedStack?: string[];
    userPersona?: string;
    steps: {
        _id?: any;
        stepNumber: number;
        phase?: string;
        title: string;
        description?: string;
        what?: string;
        why?: string;
        how?: string;
        who?: string;
        isLocked: boolean;
        state: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
        microSteps: {
            title: string;
            what?: string;
            why?: string;
            how?: string;
            who?: string;
            skillSignal?: string;
            difficulty_level: 1 | 2 | 3 | 4 | 5;
            timeEstimate: string;
            youtubeLink?: string;
            isCompleted: boolean;
            innerTopics?: {
                title: string;
                what?: string;
                why?: string;
                how?: string;
                who?: string;
            }[];
        }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const RoadmapSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    parentRoadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    title: { type: String, default: 'My Roadmap' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },

    type: { type: String, enum: ['main', 'normal', 'micro'], default: 'main' },
    locked: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    neuralScore: { type: Number, default: 0 },
    detectedStack: [{ type: String }],
    userPersona: { type: String, default: 'PROFESSIONAL' },

    steps: [{
        stepNumber: Number,
        phase: String,
        title: String,
        description: String,
        what: String,
        why: String,
        how: String,
        who: String,
        isLocked: { type: Boolean, default: true },
        state: { type: String, enum: ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED'], default: 'LOCKED' },
        microSteps: [{
            title: String,
            what: String,
            why: String,
            how: String,
            who: String,
            skillSignal: String,
            difficulty_level: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
            timeEstimate: String,
            youtubeLink: String,
            isCompleted: { type: Boolean, default: false },
            innerTopics: [{
                title: String,
                what: String,
                why: String,
                how: String,
                who: String
            }]
        }]
    }],
    achievements_unlocked: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// MED-9 FIX: Compound Index for fast roadmap queries
RoadmapSchema.index({ userId: 1, sessionId: 1 });

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);

/**
 * ----------------------------------------------------------------------------
 * LEGACY MODEL (DO NOT REMOVE AS PER USER REQUEST)
 * ----------------------------------------------------------------------------
 * // export interface IRoadmapLegacy extends Document {
 * //     steps: {
 * //         smallTopics: {
 * //             title: string;
 * //             description: string;
 * //             detailedContext?: string;
 * //             isCompleted: boolean;
 * //         }[];
 * //     }[];
 * // }
 */