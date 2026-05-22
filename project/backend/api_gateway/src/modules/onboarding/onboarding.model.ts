import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingProfile extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    field: string;
    final_goal: string;
    future_interest: string;
    life_stage: string; // was level/life_stage
    phase: string; // was target_outcome
    problem: string;
    project_level: string;
    target_outcome: string;
    category?: string;
    subCategory?: string;
    currentLevel?: string;
    goal?: string;
    constraints?: string[];
    languagePreference?: string;
    onboardingCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OnboardingProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' }, // Optional link to specific session

    // STRICT FIELDS FROM MASTER PROMPT
    category: { type: String },       // school | graduation | pg | job | business
    subCategory: { type: String },                    // BCA, BBA, Science
    currentLevel: { type: String },                   // Final Year, etc.
    goal: { type: String },           // The main objective
    constraints: { type: [String], default: [] },     // Time, Money, etc.
    languagePreference: { type: String, default: 'Hinglish' },

    // completed: { type: Boolean, default: false },
    field: { type: String, required: true },       // school | graduation | pg | job | business
    final_goal: { type: String },                    // BCA, BBA, Science
    future_interest: { type: String },                   // Final Year, etc.
    life_stage: { type: String, required: true },           // The main objective
    phase: { type: String, required: true },     // Time, Money, etc.
    problem: { type: String, default: 'Hinglish' },
    project_level: { type: String },
    target_outcome: { type: String },

    onboardingCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { strict: false, timestamps: true });

export const OnboardingProfile = mongoose.model<IOnboardingProfile>('OnboardingProfile', OnboardingProfileSchema);
