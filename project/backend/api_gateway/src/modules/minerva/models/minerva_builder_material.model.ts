import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaBuilderMaterial extends Document {
    session_id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: string; // 'summary' | 'flashcards' | 'cheatsheet' | 'essay'
    language: string; // 'hinglish' | 'english' | 'hindi' | 'marathi' | 'gujarati'
    topic_title: string;
    subject: string;
    materialText?: string;
    flashcards?: Array<{
        term: string;
        definition: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaBuilderMaterialSchema = new Schema({
    session_id: { type: Schema.Types.ObjectId, ref: 'MinervaStudySession', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    language: { type: String, required: true },
    topic_title: { type: String, required: true },
    subject: { type: String, required: true },
    materialText: { type: String, default: '' },
    flashcards: [{
        term: { type: String, required: true },
        definition: { type: String, required: true }
    }]
}, { timestamps: true });

MinervaBuilderMaterialSchema.index({ userId: 1, createdAt: -1 });

const MinervaBuilderMaterial = mongoose.model<IMinervaBuilderMaterial>('MinervaBuilderMaterial', MinervaBuilderMaterialSchema);
export default MinervaBuilderMaterial;
