// import mongoose, { Schema, Document } from 'mongoose';

// export interface ITaskLog extends Document {
//     taskId: mongoose.Types.ObjectId;
//     userId: mongoose.Types.ObjectId;
//     action: 'completed' | 'verified' | 'unlocked';
//     createdAt: Date;
// }

// const TaskLogSchema: Schema = new Schema({
//     taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
//     userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     action: { type: String, enum: ['completed', 'verified', 'unlocked'], required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model<ITaskLog>('TaskLog', TaskLogSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskLog extends Document {
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: 'completed' | 'verified' | 'unlocked';
    createdAt: Date;
}

const TaskLogSchema: Schema = new Schema({
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['completed', 'verified', 'unlocked'], required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITaskLog>('TaskLog', TaskLogSchema);