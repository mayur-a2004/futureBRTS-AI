import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectBuildStep extends Document {
    projectId: mongoose.Types.ObjectId;
    stepName: string;
    stepIndex: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
    progress: number;
    errorMessage?: string;
    metadata?: any;
    updatedAt: Date;
}

const ProjectBuildStepSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    stepName: { type: String, required: true },
    stepIndex: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'retrying'], default: 'pending' },
    progress: { type: Number, default: 0 },
    errorMessage: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IProjectBuildStep>('ProjectBuildStep', ProjectBuildStepSchema);
