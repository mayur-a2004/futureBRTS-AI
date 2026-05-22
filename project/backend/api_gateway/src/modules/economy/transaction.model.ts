import mongoose, { Schema, Document } from 'mongoose';

export interface IEconomyTransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'TOKEN_CONSUMPTION' | 'AD_REWARD' | 'PURCHASE' | 'DAILY_REFRESH';
    amount: number; // Positive for rewards/purchase, negative for consumption
    description: string;
    metadata: {
        adUrl?: string;
        planTier?: string;
        actionType?: string; // e.g., 'CHAT', 'ROADMAP'
    };
    timestamp: Date;
}

const EconomyTransactionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['TOKEN_CONSUMPTION', 'AD_REWARD', 'PURCHASE', 'DAILY_REFRESH'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    metadata: {
        adUrl: { type: String },
        planTier: { type: String },
        actionType: { type: String }
    },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IEconomyTransaction>('EconomyTransaction', EconomyTransactionSchema);
