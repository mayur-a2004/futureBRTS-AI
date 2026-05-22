import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillGap extends Document {
    userId: mongoose.Types.ObjectId;
    skillName: string;
    gapIntensity: number; // 1-100
    source: string; // e.g., 'Task #4 Evolution'
    persona: string;
    remediationStep?: string;
    status: 'detected' | 'in_progress' | 'resolved';
    createdAt: Date;
}

const SkillGapSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    gapIntensity: { type: Number, default: 0 },
    source: { type: String },
    persona: { type: String },
    remediationStep: { type: String },
    status: { type: String, enum: ['detected', 'in_progress', 'resolved'], default: 'detected' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISkillGap>('SkillGap', SkillGapSchema);
