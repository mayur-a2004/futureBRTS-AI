import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingPlan extends Document {
    tier: string; // e.g., 'day', 'week', 'monthly', '3_month', '6_month', 'yearly'
    name: string;
    description: string;
    price: number;
    tokens: number;
    duration: string; // e.g., '1 Day', '1 Month'
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const PricingPlanSchema: Schema = new Schema({
    tier: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    tokens: { type: Number, required: true },
    duration: { type: String, required: true },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IPricingPlan>('PricingPlan', PricingPlanSchema);
