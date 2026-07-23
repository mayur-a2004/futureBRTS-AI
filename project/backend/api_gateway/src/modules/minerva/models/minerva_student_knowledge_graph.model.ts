import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaStudentKnowledgeGraph extends Document {
    userId: mongoose.Types.ObjectId;
    subject: string;
    topic: string;
    subtopic?: string;
    masteryScore: number; // 0 to 100
    errorCount: number;
    successCount: number;
    weakConcepts: string[];
    misconceptions: string[];
    lastPracticedAt: Date;
    nextReviewDue: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaStudentKnowledgeGraphSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, default: 'General' },
    topic: { type: String, required: true },
    subtopic: { type: String, default: '' },
    masteryScore: { type: Number, default: 50, min: 0, max: 100 },
    errorCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    weakConcepts: [{ type: String }],
    misconceptions: [{ type: String }],
    lastPracticedAt: { type: Date, default: Date.now },
    nextReviewDue: { type: Date, default: Date.now }
}, { timestamps: true });

MinervaStudentKnowledgeGraphSchema.index({ userId: 1, topic: 1, subject: 1 }, { unique: true });
MinervaStudentKnowledgeGraphSchema.index({ userId: 1, nextReviewDue: 1 });

const MinervaStudentKnowledgeGraph = mongoose.model<IMinervaStudentKnowledgeGraph>(
    'MinervaStudentKnowledgeGraph',
    MinervaStudentKnowledgeGraphSchema
);

export default MinervaStudentKnowledgeGraph;
