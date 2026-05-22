import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentGateway extends Document {
    provider: 'razorpay' | 'stripe' | 'phonepe' | 'gpay' | 'manual';
    name: string;
    isActive: boolean;
    config: {
        apiKey?: string;
        apiSecret?: string;
        webhookSecret?: string;
        merchantId?: string;
        upiId?: string; // For GPay/PhonePe manual/deep links
    };
    metadata: {
        label: string;
        description: string;
        icon: string; // Lucide icon name or URL
    };
    createdAt: Date;
    updatedAt: Date;
}

const PaymentGatewaySchema: Schema = new Schema({
    provider: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    config: {
        apiKey: { type: String },
        apiSecret: { type: String },
        webhookSecret: { type: String },
        merchantId: { type: String },
        upiId: { type: String }
    },
    metadata: {
        label: { type: String, required: true },
        description: { type: String },
        icon: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<IPaymentGateway>('PaymentGateway', PaymentGatewaySchema);
