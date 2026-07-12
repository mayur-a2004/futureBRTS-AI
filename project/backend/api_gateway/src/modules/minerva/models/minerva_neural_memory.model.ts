import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaNeuralMemory extends Document {
    topic: string;
    analogy: string;
    studentLevel: string; // 'school' | 'college' | 'phd' | 'doctor' | 'professional'
    language: string; // 'hinglish' | 'gujarati' | 'marathi' | 'english' etc.
    successCount: number;
    isGlobal: boolean;
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaNeuralMemorySchema = new Schema({
    topic: { type: String, required: true },
    analogy: { type: String, required: true },
    studentLevel: { type: String, required: true, default: 'college' },
    language: { type: String, required: true, default: 'hinglish' },
    successCount: { type: Number, default: 1 },
    isGlobal: { type: Boolean, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

MinervaNeuralMemorySchema.index({ topic: 1, studentLevel: 1, language: 1 });

const MinervaNeuralMemory = mongoose.model<IMinervaNeuralMemory>('MinervaNeuralMemory', MinervaNeuralMemorySchema);
export default MinervaNeuralMemory;
