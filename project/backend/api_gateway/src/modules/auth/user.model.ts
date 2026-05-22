// 👉 User schema jo login aur profile details store karta hai
// 👉 Isme local aur social (Google/GitHub) dono login supported hain

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash?: string;
    dateOfBirth?: Date;
    age?: number;
    provider: 'local' | 'google' | 'github';
    onboarding_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;
    onboardingCompleted: boolean;
    profile?: {
        type?: string;
        bio?: string;
        location?: string;
        skills?: string[];
        socialLinks?: {
            github?: string;
            linkedin?: string;
            twitter?: string;
            website?: string;
        };
    };
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
    tokenBalance: number;
    isPremium: boolean;
    subscriptionTier: 'free' | 'day' | 'week' | 'monthly' | '3_month' | '6_month' | 'yearly';
    subscriptionExpiresAt?: Date;
    lastTokenRefreshedAt: Date;
    adConsumptionCount: number;
    lastActiveAt: Date;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    onboarding_status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'DONE'], default: 'NOT_STARTED' },
    onboardingCompleted: { type: Boolean, default: false },
    profile: {
        type: { type: String },
        bio: { type: String, default: '' },
        location: { type: String, default: '' },
        skills: { type: [String], default: [] },
        socialLinks: {
            github: { type: String },
            linkedin: { type: String },
            twitter: { type: String },
            website: { type: String }
        }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    tokenBalance: { type: Number, default: 1000 }, // 1000 for new users as requested
    isPremium: { type: Boolean, default: false },
    subscriptionTier: { type: String, enum: ['free', 'day', 'week', 'monthly', '3_month', '6_month', 'yearly'], default: 'free' },
    subscriptionExpiresAt: { type: Date },
    lastTokenRefreshedAt: { type: Date, default: Date.now },
    adConsumptionCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// 👉 Janam tarikh se age calculate karne ka logic
UserSchema.pre('save', function (this: IUser, next) {
    if (this.dateOfBirth) {
        const today = new Date();
        let age = today.getFullYear() - (this.dateOfBirth as Date).getFullYear();
        const m = today.getMonth() - (this.dateOfBirth as Date).getMonth();
        if (m < 0 || (m === 0 && today.getDate() < (this.dateOfBirth as Date).getDate())) {
            age--;
        }
        this.age = age;
    }
    next();
});

export default mongoose.model<IUser>('User', UserSchema);
