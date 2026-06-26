import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaStudySession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    subject: string;
    board: string;
    grade_level: string;
    education_type: string;
    state: string;
    medium: string;
    source_type: string; // 'chat' | 'pdf' | 'photo' | 'topic_request'
    source_content: string; // raw text from PDF/OCR or user prompt
    detected_language: string;
    detected_board: string;
    detected_grade: string;
    status: string; // 'active' | 'completed' | 'archived'
    progress_percent: number;
    total_nodes: number;
    completed_nodes: number;
    nodes: mongoose.Types.ObjectId[]; // ref to KnowledgeNodes
    last_accessed: Date;
    exam_ready: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaStudySessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, default: '' },
    board: { type: String, default: 'cbse' },
    grade_level: { type: String, default: 'class_10' },
    education_type: { type: String, default: 'school' },
    state: { type: String, default: 'general' },
    medium: { type: String, default: 'english' },
    source_type: { type: String, enum: ['chat', 'pdf', 'photo', 'topic_request'], default: 'chat' },
    source_content: { type: String, default: '' },
    detected_language: { type: String, default: 'english' },
    detected_board: { type: String, default: 'cbse' },
    detected_grade: { type: String, default: 'class_10' },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    progress_percent: { type: Number, default: 0 },
    total_nodes: { type: Number, default: 0 },
    completed_nodes: { type: Number, default: 0 },
    nodes: [{ type: Schema.Types.ObjectId, ref: 'MinervaKnowledgeNode' }],
    last_accessed: { type: Date, default: Date.now },
    exam_ready: { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast user-based queries
MinervaStudySessionSchema.index({ userId: 1, status: 1 });
MinervaStudySessionSchema.index({ userId: 1, createdAt: -1 });

const MinervaStudySession = mongoose.model<IMinervaStudySession>('MinervaStudySession', MinervaStudySessionSchema);
export default MinervaStudySession;
