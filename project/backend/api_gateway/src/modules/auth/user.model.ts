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
        type: string;
    };
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    onboarding_status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'DONE'], default: 'NOT_STARTED' },
    onboardingCompleted: { type: Boolean, default: false },
    profile: {
        type: { type: String } // e.g. Student, Exam, etc.
    },
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
