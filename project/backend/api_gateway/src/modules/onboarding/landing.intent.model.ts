import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingIntent extends Document {
    userId?: mongoose.Types.ObjectId;
    intentText: string;
    source: string;
    processed: boolean;
    createdAt: Date;
}

const LandingIntentSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    intentText: { type: String, required: true },
    source: { type: String, default: 'unknown' },
    processed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const LandingIntent = mongoose.model<ILandingIntent>('LandingIntent', LandingIntentSchema);
