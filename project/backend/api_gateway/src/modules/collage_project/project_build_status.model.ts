import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectBuildStatus extends Document {
    projectId: mongoose.Types.ObjectId;
    status: 'BUILDING' | 'GENERATING' | 'REPAIRING' | 'STABLE' | 'FAILED' | 'COMPLETED';
    progress?: number;
    stageResults?: any;
    updatedAt: Date;
}

const ProjectBuildStatusSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true, unique: true },
    status: { type: String, enum: ['BUILDING', 'GENERATING', 'REPAIRING', 'STABLE', 'FAILED', 'COMPLETED'], default: 'BUILDING' },
    progress: { type: Number, default: 0 },
    stageResults: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<IProjectBuildStatus>('ProjectBuildStatus', ProjectBuildStatusSchema);
