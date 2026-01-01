// 👉 Ye model landing page par user ke message (intent) ko save karta hai
// 👉 Isse humein pata chalta hai ki user kya dhund raha hai

import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingIntent extends Document {
    message: string;
    sessionId: string;
    createdAt: Date;
}

const LandingIntentSchema: Schema = new Schema({
    message: { type: String, required: true },
    sessionId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILandingIntent>('LandingIntent', LandingIntentSchema);
