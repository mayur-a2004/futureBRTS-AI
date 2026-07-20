import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaStudyTimeLog extends Document {
    userId: mongoose.Types.ObjectId;
    minutes: number;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaStudyTimeLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    minutes: { type: Number, required: true },
}, { timestamps: true });

MinervaStudyTimeLogSchema.index({ userId: 1, createdAt: -1 });

const MinervaStudyTimeLog = mongoose.model<IMinervaStudyTimeLog>('MinervaStudyTimeLog', MinervaStudyTimeLogSchema);
export default MinervaStudyTimeLog;
