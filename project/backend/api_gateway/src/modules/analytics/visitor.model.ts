
import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    location: {
        country: string;
        city: string;
    };
    path: string;
    referrer: string;
    timestamp: Date;
}

const VisitorSchema: Schema = new Schema({
    ip: { type: String, required: true },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
    device: { type: String },
    location: {
        country: { type: String, default: 'Detected' },
        city: { type: String, default: 'Analyzing' }
    },
    path: { type: String },
    referrer: { type: String },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IVisitor>('Visitor', VisitorSchema);
