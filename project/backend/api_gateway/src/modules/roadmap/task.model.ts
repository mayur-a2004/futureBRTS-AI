import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    roadmapStepId?: string;
    title: string;
    status: 'todo' | 'doing' | 'done';
    createdAt: Date;
}

const TaskSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapStepId: { type: String },
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITask>('Task', TaskSchema);
