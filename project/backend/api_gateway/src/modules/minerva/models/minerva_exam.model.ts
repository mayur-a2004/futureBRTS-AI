import mongoose, { Schema, Document } from 'mongoose';

export interface IExamQuestion {
    section: string;
    question_number: number;
    type: string; // 'mcq' | 'short' | 'long' | 'fill_blank' | 'true_false'
    question: string;
    options?: string[];
    marks: number;
    topic: string;
    difficulty: string;
    expected_answer?: string;
}

export interface IMinervaExam extends Document {
    session_id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    exam_type: string; // 'chapter_test' | 'mid_term' | 'grand_finale' | 'topic_test'
    board: string;
    grade_level: string;
    subject: string;
    total_marks: number;
    duration_minutes: number;
    sections: any[];
    questions: IExamQuestion[];
    // Attempt
    status: string; // 'generated' | 'attempted' | 'submitted' | 'graded'
    student_answers: any[];
    total_obtained: number;
    percentage: number;
    grade: string; // 'A+' | 'A' | 'B' | etc.
    ai_report: string; // detailed feedback
    weak_areas: string[];
    strong_areas: string[];
    submitted_at: Date | null;
    time_taken_minutes: number;
    // PDF
    pdf_path: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExamQuestionSchema = new Schema({
    section: String,
    question_number: Number,
    type: { type: String, enum: ['mcq', 'short', 'long', 'fill_blank', 'true_false'] },
    question: String,
    options: [String],
    marks: Number,
    topic: String,
    difficulty: String,
    expected_answer: String,
}, { _id: false });

const MinervaExamSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'MinervaStudySession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    exam_type: { 
        type: String, 
        enum: ['chapter_test', 'mid_term', 'grand_finale', 'topic_test', 'weekly_test'], 
        default: 'chapter_test' 
    },
    board: { type: String, default: 'cbse' },
    grade_level: { type: String, default: 'class_10' },
    subject: { type: String, default: '' },
    total_marks: { type: Number, default: 50 },
    duration_minutes: { type: Number, default: 60 },
    sections: { type: Schema.Types.Mixed, default: [] },
    questions: { type: [ExamQuestionSchema], default: [] },
    status: { 
        type: String, 
        enum: ['generated', 'attempted', 'submitted', 'graded'], 
        default: 'generated' 
    },
    student_answers: { type: Schema.Types.Mixed, default: [] },
    total_obtained: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    ai_report: { type: String, default: '' },
    weak_areas: { type: [String], default: [] },
    strong_areas: { type: [String], default: [] },
    submitted_at: { type: Date, default: null },
    time_taken_minutes: { type: Number, default: 0 },
    pdf_path: { type: String, default: '' },
}, { timestamps: true });

MinervaExamSchema.index({ userId: 1, status: 1 });
MinervaExamSchema.index({ session_id: 1 });

const MinervaExam = mongoose.model<IMinervaExam>('MinervaExam', MinervaExamSchema);
export default MinervaExam;
