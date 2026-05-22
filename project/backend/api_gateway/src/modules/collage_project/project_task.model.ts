import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectTask extends Document {
    projectId: mongoose.Types.ObjectId;
    taskType: 'analyze' | 'blueprint' | 'context_memory' | 'database' | 'api' | 'backend_module' | 'frontend_module' | 'admin_module' | 'validation' | 'documentation' | 'diagram' | 'packaging';
    moduleName?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    priority: number;
    retryCount: number;
    metadata?: any;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectTaskSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    taskType: { type: String, required: true },
    moduleName: { type: String },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    priority: { type: Number, default: 0 },
    retryCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    errorMessage: { type: String },
}, { timestamps: true });

// Index for the worker to find the next task efficiently
ProjectTaskSchema.index({ projectId: 1, status: 1, priority: -1, createdAt: 1 });

export default mongoose.model<IProjectTask>('ProjectTask', ProjectTaskSchema);
