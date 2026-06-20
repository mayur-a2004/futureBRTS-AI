import mongoose, { Schema, Document } from 'mongoose';

export interface IExamPaper extends Document {
    subject: string;
    board: string;
    standard: string;
    examScope: string;
    chapter?: string;
    topic?: string;
    marks: string;
    difficulty: string;
    fileName: string;
    filePath: string;
    referenceFileName?: string;
    referenceFilePath?: string;
    generatedPaper: any; // JSON containing questions
    createdAt: Date;
}

const ExamPaperSchema: Schema = new Schema({
    subject: { type: String, required: true },
    board: { type: String, required: true },
    standard: { type: String, required: true },
    examScope: { type: String, required: true },
    chapter: { type: String, required: false },
    topic: { type: String, required: false },
    marks: { type: String, required: true },
    difficulty: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    referenceFileName: { type: String, required: false },
    referenceFilePath: { type: String, required: false },
    generatedPaper: { type: Schema.Types.Mixed }, // Store the complete AI JSON output
    createdAt: { type: Date, default: Date.now }
});

const ExamPaper = (mongoose.models.ExamPaper as mongoose.Model<IExamPaper>) || mongoose.model<IExamPaper>('ExamPaper', ExamPaperSchema);
export default ExamPaper;
