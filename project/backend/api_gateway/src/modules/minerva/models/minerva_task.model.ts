import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaTask extends Document {
    node_id: mongoose.Types.ObjectId;
    session_id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: string; // 'text_answer' | 'fill_blank' | 'mcq' | 'diagram' | 'numerical'
    task_type: string; // 'micro_task' | 'homework' | 'review'
    prompt: string;
    options?: string[]; // for MCQ
    correct_answer?: string;
    topic_title: string;
    subject: string;
    marks: number;
    difficulty: string;
    // Submission
    student_answer: string;
    ai_score: number; // 0-100
    ai_feedback: string;
    ai_correction: string;
    passed: boolean;
    submitted: boolean;
    submitted_at: Date | null;
    // Homework specific
    is_homework: boolean;
    due_date: Date | null;
    homework_date: string; // 'YYYY-MM-DD'
    createdAt: Date;
    updatedAt: Date;
}

const MinervaTaskSchema = new Schema({
    node_id: { type: Schema.Types.ObjectId, ref: 'MinervaKnowledgeNode', required: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'MinervaStudySession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['text_answer', 'fill_blank', 'mcq', 'diagram', 'numerical'], 
        default: 'text_answer' 
    },
    task_type: { 
        type: String, 
        enum: ['micro_task', 'homework', 'review'], 
        default: 'micro_task' 
    },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correct_answer: { type: String, default: '' },
    topic_title: { type: String, default: '' },
    subject: { type: String, default: '' },
    marks: { type: Number, default: 5 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    student_answer: { type: String, default: '' },
    ai_score: { type: Number, default: 0 },
    ai_feedback: { type: String, default: '' },
    ai_correction: { type: String, default: '' },
    passed: { type: Boolean, default: false },
    submitted: { type: Boolean, default: false },
    submitted_at: { type: Date, default: null },
    is_homework: { type: Boolean, default: false },
    due_date: { type: Date, default: null },
    homework_date: { type: String, default: '' },
}, { timestamps: true });

MinervaTaskSchema.index({ userId: 1, is_homework: 1, submitted: 1 });
MinervaTaskSchema.index({ userId: 1, homework_date: 1 });
MinervaTaskSchema.index({ node_id: 1 });

const MinervaTask = mongoose.model<IMinervaTask>('MinervaTask', MinervaTaskSchema);
export default MinervaTask;
