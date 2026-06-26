import mongoose, { Schema, Document } from 'mongoose';

export interface IYoutubeLink {
    title: string;
    url: string;
    channel: string;
    timestamp?: string;
    language: string;
}

export interface IStudyResource {
    type: string; // 'youtube' | 'pdf' | 'article' | 'diagram' | 'formula'
    title: string;
    url?: string;
    content?: string;
}

export interface IMinervaKnowledgeNode extends Document {
    session_id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    chapter: string;
    topic: string;
    subtopic: string;
    priority: string; // 'HIGH' | 'MEDIUM' | 'LOW'
    priority_reason: string;
    board_relevance: string;
    exam_weightage_percent: number;
    status: string; // 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'DONE' | 'NEEDS_REVIEW'
    order_index: number;
    // Content
    explanation_simple: string;    // Basic explanation
    explanation_detailed: string;  // Full theory
    real_world_example: string;    // Analogy / example
    key_formulas: string[];
    key_points: string[];
    // Resources
    youtube_links: IYoutubeLink[];
    study_resources: IStudyResource[];
    // Assessment
    micro_tasks: mongoose.Types.ObjectId[]; // ref MinervaTask
    last_score: number; // 0-100
    attempts: number;
    passed: boolean;
    // Spaced Repetition
    sr_due_date: Date | null;
    sr_interval_days: number;
    sr_ease_factor: number;
    sr_repetitions: number;
    // Metadata
    estimated_time_minutes: number;
    difficulty: string; // 'basic' | 'intermediate' | 'advanced'
    createdAt: Date;
    updatedAt: Date;
}

const YoutubeLink = new Schema({
    title: String,
    url: String,
    channel: String,
    timestamp: String,
    language: { type: String, default: 'hindi' },
}, { _id: false });

const StudyResource = new Schema({
    type: String,
    title: String,
    url: String,
    content: String,
}, { _id: false });

const MinervaKnowledgeNodeSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'MinervaStudySession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    chapter: { type: String, default: '' },
    topic: { type: String, default: '' },
    subtopic: { type: String, default: '' },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    priority_reason: { type: String, default: '' },
    board_relevance: { type: String, default: '' },
    exam_weightage_percent: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'DONE', 'NEEDS_REVIEW'], 
        default: 'LOCKED' 
    },
    order_index: { type: Number, default: 0 },
    explanation_simple: { type: String, default: '' },
    explanation_detailed: { type: String, default: '' },
    real_world_example: { type: String, default: '' },
    key_formulas: { type: [String], default: [] },
    key_points: { type: [String], default: [] },
    youtube_links: { type: [YoutubeLink], default: [] },
    study_resources: { type: [StudyResource], default: [] },
    micro_tasks: [{ type: Schema.Types.ObjectId, ref: 'MinervaTask' }],
    last_score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    sr_due_date: { type: Date, default: null },
    sr_interval_days: { type: Number, default: 1 },
    sr_ease_factor: { type: Number, default: 2.5 },
    sr_repetitions: { type: Number, default: 0 },
    estimated_time_minutes: { type: Number, default: 20 },
    difficulty: { type: String, enum: ['basic', 'intermediate', 'advanced'], default: 'intermediate' },
}, { timestamps: true });

MinervaKnowledgeNodeSchema.index({ session_id: 1, order_index: 1 });
MinervaKnowledgeNodeSchema.index({ userId: 1, sr_due_date: 1 });
MinervaKnowledgeNodeSchema.index({ userId: 1, status: 1 });

const MinervaKnowledgeNode = mongoose.model<IMinervaKnowledgeNode>('MinervaKnowledgeNode', MinervaKnowledgeNodeSchema);
export default MinervaKnowledgeNode;
