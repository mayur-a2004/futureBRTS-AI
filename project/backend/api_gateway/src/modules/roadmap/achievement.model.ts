
import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    icon?: string;
    category: 'ROADMAP' | 'TASK' | 'STREAK' | 'BATTLE';
    unlockedAt: Date;
}

const AchievementSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    category: { type: String, enum: ['ROADMAP', 'TASK', 'STREAK', 'BATTLE'], default: 'TASK' },
    unlockedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
