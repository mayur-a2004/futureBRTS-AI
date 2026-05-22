import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
    projectId?: mongoose.Types.ObjectId;
    logType: string;
    message: string;
    createdAt: Date;
}

const SystemLogSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true, index: true },
    logType: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
