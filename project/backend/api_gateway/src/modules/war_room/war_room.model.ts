import mongoose from 'mongoose';

export interface IWarRoomAudit extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    url: string;
    score: number;
    metrics?: any;
    audit_details?: any;
    pillars?: any;
    marketing_insights?: any;
    competitors: {
        name: string;
        gap: string;
        attack_vector?: string;
    }[];
    strategy: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
}

const WarRoomAuditSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    score: Number,
    metrics: { type: Object },
    audit_details: { type: Object },
    pillars: { type: Object }, // Store 6 Industrial Pillars
    marketing_insights: { type: Object }, // Store Spend, Hashtags, Channels
    competitors: [{
        name: String,
        gap: String,
        attack_vector: String
    }],
    strategy: String,
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

export default mongoose.model<IWarRoomAudit>('WarRoomAudit', WarRoomAuditSchema);
