import mongoose, { Schema, Document } from 'mongoose';

export interface IStrategicAnalytic extends Document {
    userId?: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    keywords: string[];
    intent: string;
    location: {
        city?: string;
        region?: string;
        country?: string;
        ip?: string;
    };
    device?: string;
    timestamp: Date;
}

const StrategicAnalyticSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    keywords: [{ type: String }],
    intent: { type: String },
    location: {
        city: String,
        region: String,
        country: String,
        ip: String
    },
    device: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// Indexes for fast retrieval
StrategicAnalyticSchema.index({ timestamp: -1 });
StrategicAnalyticSchema.index({ keywords: 1 });

export default mongoose.model<IStrategicAnalytic>('StrategicAnalytic', StrategicAnalyticSchema);
