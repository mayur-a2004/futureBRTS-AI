import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaStudentProfile extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    grade_level: string; // 'class_1' to 'phd' | 'upsc' | 'ssc' | 'banking' etc.
    education_type: string; // 'school' | 'college' | 'competitive' | 'professional' | 'govt_exam'
    board: string; // 'cbse' | 'icse' | 'maharashtra_ssc' | 'up_board' | 'gseb' etc.
    state: string; // 'maharashtra' | 'gujarat' | 'uttar_pradesh' etc.
    medium: string; // 'hindi' | 'english' | 'marathi' | 'gujarati' etc.
    language_preference: string; // UI language
    learning_style: string; // 'visual' | 'reading' | 'practice' | 'mixed'
    daily_time_minutes: number; // how many minutes per day
    weak_subjects: string[];
    strong_subjects: string[];
    streak_days: number;
    last_active: Date;
    total_study_minutes: number;
    total_topics_done: number;
    total_exams_taken: number;
    onboarding_done: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaStudentProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, default: '' },
    grade_level: { type: String, default: 'class_10' },
    education_type: { type: String, default: 'school' },
    board: { type: String, default: 'cbse' },
    state: { type: String, default: 'general' },
    medium: { type: String, default: 'english' },
    language_preference: { type: String, default: 'english' },
    learning_style: { type: String, default: 'mixed' },
    daily_time_minutes: { type: Number, default: 60 },
    weak_subjects: { type: [String], default: [] },
    strong_subjects: { type: [String], default: [] },
    streak_days: { type: Number, default: 0 },
    last_active: { type: Date, default: Date.now },
    total_study_minutes: { type: Number, default: 0 },
    total_topics_done: { type: Number, default: 0 },
    total_exams_taken: { type: Number, default: 0 },
    onboarding_done: { type: Boolean, default: false },
}, { timestamps: true });

const MinervaStudentProfile = mongoose.model<IMinervaStudentProfile>('MinervaStudentProfile', MinervaStudentProfileSchema);
export default MinervaStudentProfile;
