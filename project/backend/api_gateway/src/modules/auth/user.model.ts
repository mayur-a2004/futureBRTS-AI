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
    grade?: number;            // Class 6-12 — for quiz battle grade matching
    schoolName?: string;       // e.g. "DPS Gandhinagar" — for school leaderboard
    city?: string;             // e.g. "Gandhinagar" — for city-wise leaderboard
    tenantOrgId?: string;      // e.g. "mount_carmel_school"
    educationType?: 'k12' | 'higher_ed' | 'competitive';
    board?: string;            // e.g. "CBSE", "ICSE", "GSEB"
    standard?: string;         // e.g. "10", "11", "B.Tech"
    section?: string;          // e.g. "A", "B", "CSE-1"
    stream?: string;           // e.g. "Science", "Commerce", "Arts"
    medium?: string;           // e.g. "english", "hindi", "gujarati"
    mobile_number?: string;
    rollNumber?: string;       // e.g. "14"
    enrollmentNo?: string;     // e.g. "12-ER-2026-1001"
    isSchoolStudent?: boolean;
    avatarUrl?: string;
    avatar?: string;
    branch?: string;
    semester?: string;
    provider: 'local' | 'google' | 'github';
    parentDetails?: {
        parentEmail?: string;
        parentPhone?: string;
        parentEmailVerified?: boolean;
        parentVerificationToken?: string;
    };
    xp?: number;
    level?: number;
    battleStats?: {
        totalBattles?: number;
        wins?: number;
        losses?: number;
        draws?: number;
        totalDamageDealt?: number;
        longestStreak?: number;
    };
    badges?: Array<{
        name: string;
        icon: string;
        unlockedAt?: Date;
    }>;
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
    role: 'user' | 'admin' | 'teacher';
    status: 'active' | 'inactive' | 'suspended';
    tokenBalance: number;
    isPremium: boolean;
    subscriptionTier: 'free' | 'day' | 'week' | 'monthly' | '3_month' | '6_month' | 'yearly';
    subscriptionExpiresAt?: Date;
    lastTokenRefreshedAt: Date;
    adConsumptionCount: number;
    lastActiveAt: Date;
    lastDailyChallengePlayedAt?: Date; // To track daily challenge limit
    teacherDetails?: {
        schoolName?: string;
        teacherId?: string;
        schoolAddress?: string;
        subject?: string;
        roleInSchool?: string;
        gender?: string;
        whatsappNumber?: string;
    };
    lastIpAddress?: string;
    registeredIpAddress?: string;
    locationDetails?: {
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        countryCode?: string;
        isp?: string;
    };
    deviceInfo?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    grade: { type: Number, default: 10 },          // Class 6-12
    schoolName: { type: String, default: '' },      // "DPS Gandhinagar"
    city: { type: String, default: 'Ahmedabad' },
    tenantOrgId: { type: String, default: 'mount_carmel_school', index: true },
    educationType: { type: String, enum: ['k12', 'higher_ed', 'competitive'], default: 'k12' },
    board: { type: String, default: 'CBSE' },
    standard: { type: String, default: '10' },
    section: { type: String, default: 'A' },
    stream: { type: String, default: 'Science' },
    medium: { type: String, default: 'english' },
    mobile_number: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    enrollmentNo: { type: String, default: '' },
    isSchoolStudent: { type: Boolean, default: true },
    avatarUrl: { type: String, default: '' },
    avatar: { type: String, default: '' },
    branch: { type: String, default: '' },
    semester: { type: String, default: '' },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    auth_source: { type: String, default: 'Direct Email Registration' },
    parentDetails: {
        parentEmail: { type: String, lowercase: true, default: "" },
        parentPhone: { type: String, default: "" },
        parentEmailVerified: { type: Boolean, default: false },
        parentVerificationToken: { type: String, default: "" }
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    battleStats: {
        totalBattles: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        totalDamageDealt: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 }
    },
    badges: [{
        name: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
    }],
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
    role: { type: String, enum: ['user', 'admin', 'teacher'], default: 'user' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    tokenBalance: { type: Number, default: 1000 }, // 1000 for new users as requested
    isPremium: { type: Boolean, default: false },
    subscriptionTier: { type: String, enum: ['free', 'day', 'week', 'monthly', '3_month', '6_month', 'yearly'], default: 'free' },
    subscriptionExpiresAt: { type: Date },
    lastTokenRefreshedAt: { type: Date, default: Date.now },
    adConsumptionCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    lastDailyChallengePlayedAt: { type: Date },
    resetPasswordToken: { type: String },

    resetPasswordExpiry: { type: Date },
    teacherDetails: {
        schoolName: { type: String, default: '' },
        teacherId: { type: String, default: '' },
        schoolAddress: { type: String, default: '' },
        subject: { type: String, default: '' },
        roleInSchool: { type: String, default: '' },
        gender: { type: String, default: '' },
        whatsappNumber: { type: String, default: '' }
    },
    lastIpAddress: { type: String, default: '' },
    registeredIpAddress: { type: String, default: '' },
    locationDetails: {
        ip: { type: String, default: '' },
        city: { type: String, default: '' },
        region: { type: String, default: '' },
        country: { type: String, default: '' },
        countryCode: { type: String, default: '' },
        isp: { type: String, default: '' }
    },
    deviceInfo: { type: String, default: '' },
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
