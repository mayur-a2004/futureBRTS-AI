import mongoose, { Schema, Document } from 'mongoose';

export interface IContactInquiry extends Document {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    source?: string;
    status: 'UNREAD' | 'READ' | 'RESPONDED';
    admin_notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactInquirySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    source: { type: String, default: 'contact_form' },
    status: { type: String, enum: ['UNREAD', 'READ', 'RESPONDED'], default: 'UNREAD' },
    admin_notes: { type: String, default: '' },
}, { timestamps: true });

ContactInquirySchema.index({ createdAt: -1 });
ContactInquirySchema.index({ status: 1 });

const ContactInquiry = mongoose.model<IContactInquiry>('ContactInquiry', ContactInquirySchema);
export default ContactInquiry;
