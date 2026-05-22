import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    userId?: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    messageId?: string;
    type: 'up' | 'down';
    timestamp: Date;
}

const FeedbackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    messageId: { type: String },
    type: { type: String, enum: ['up', 'down'], required: true },
    timestamp: { type: Date, default: Date.now }
});

FeedbackSchema.index({ type: 1 });
FeedbackSchema.index({ timestamp: -1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
