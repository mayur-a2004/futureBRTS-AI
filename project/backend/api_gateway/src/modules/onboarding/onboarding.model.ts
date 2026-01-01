import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingProfile extends Document {
    userId: mongoose.Types.ObjectId;
    stage: string;
    main_problems: string[];
    original_goal_text: string;
    selected_mode: 'ROADMAP' | 'BUILDER';
    timestamp: Date;
    createdAt: Date;
}

const OnboardingProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stage: { type: String, required: true },
    main_problems: { type: [String], default: [] },
    original_goal_text: { type: String },
    selected_mode: { type: String, enum: ['ROADMAP', 'BUILDER'], default: 'BUILDER' },
    timestamp: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export const OnboardingProfile = mongoose.model<IOnboardingProfile>('OnboardingProfile', OnboardingProfileSchema);
