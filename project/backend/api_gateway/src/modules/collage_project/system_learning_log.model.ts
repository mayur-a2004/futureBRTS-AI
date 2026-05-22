import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLearningLog extends Document {
    errorType: string;
    filePath?: string;
    fixApplied: string;
    projectId?: mongoose.Types.ObjectId;
    timestamp: Date;
}

const SystemLearningLogSchema: Schema = new Schema({
    errorType: { type: String, required: true },
    filePath: { type: String },
    fixApplied: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<ISystemLearningLog>('SystemLearningLog', SystemLearningLogSchema);
