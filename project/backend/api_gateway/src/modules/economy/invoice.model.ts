import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    userId: mongoose.Types.ObjectId;
    transactionId: string;
    planTier: string;
    amount: number;
    currency: string;
    gateway: string;
    status: 'paid' | 'pending';
    billingDetails: {
        name: string;
        email: string;
    };
    issuedAt: Date;
    expiresAt: Date;
}

const InvoiceSchema: Schema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: String, required: true },
    planTier: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    gateway: { type: String, required: true },
    status: { type: String, enum: ['paid', 'pending'], default: 'paid' },
    billingDetails: {
        name: { type: String },
        email: { type: String }
    },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;
