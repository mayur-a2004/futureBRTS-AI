import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMessage extends Document {
    projectId: mongoose.Types.ObjectId;
    userMessage: string;
    aiResponse?: string;
    featurePlan?: any;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
}

const ProjectMessageSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    userMessage: { type: String, required: true },
    aiResponse: { type: String },
    featurePlan: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProjectMessage>('ProjectMessage', ProjectMessageSchema);
