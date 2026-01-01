// 👉 Landing page intents ka schema
// 👉 Isme user ka input aur associated user ID (agar hai) save hota hai

import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingIntent extends Document {
    userId?: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
}

const LandingIntentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILandingIntent>('LandingIntent', LandingIntentSchema);
