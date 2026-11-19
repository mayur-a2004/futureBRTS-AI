import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficialChapter {
    chapter_number: number;
    chapter_name: string;
    official_pdf_url?: string;
    official_chapter_url?: string;
    learning_outcomes?: string;
    prerequisites?: string[];
    key_concepts?: string[];
    activities?: string[];
    exercises?: string[];
    assessment?: string;
    next_chapter?: string;
}

export interface IMinervaOfficialCurriculum extends Document {
    board: string;
    medium: string;
    class_level: string;
    subject: string;
    textbook_name: string;
    textbook_edition?: string;
    isbn?: string;
    official_book_url: string;
    official_pdf_url: string;
    official_chapter_index_url: string;
    official_syllabus_url: string;
    learning_outcomes_url?: string;
    diksha_course_id?: string;
    epathshala_id?: string;
    reference_source: string;
    chapters: IOfficialChapter[];
    last_updated: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OfficialChapterSchema = new Schema({
    chapter_number: { type: Number, required: true },
    chapter_name: { type: String, required: true },
    official_pdf_url: { type: String, default: '' },
    official_chapter_url: { type: String, default: '' },
    learning_outcomes: { type: String, default: '' },
    prerequisites: [{ type: String }],
    key_concepts: [{ type: String }],
    activities: [{ type: String }],
    exercises: [{ type: String }],
    assessment: { type: String, default: '' },
    next_chapter: { type: String, default: '' }
}, { _id: false });

const MinervaOfficialCurriculumSchema = new Schema({
    board: { type: String, required: true, lowercase: true, trim: true },
    medium: { type: String, required: true, lowercase: true, trim: true },
    class_level: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, lowercase: true, trim: true },
    textbook_name: { type: String, required: true },
    textbook_edition: { type: String, default: '2024-2025 Official Edition' },
    isbn: { type: String, default: '' },
    official_book_url: { type: String, required: true },
    official_pdf_url: { type: String, required: true },
    official_chapter_index_url: { type: String, required: true },
    official_syllabus_url: { type: String, required: true },
    learning_outcomes_url: { type: String, default: '' },
    diksha_course_id: { type: String, default: '' },
    epathshala_id: { type: String, default: '' },
    reference_source: { type: String, required: true },
    chapters: [OfficialChapterSchema],
    last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

MinervaOfficialCurriculumSchema.index({ board: 1, medium: 1, class_level: 1, subject: 1 }, { unique: true });

const MinervaOfficialCurriculum = mongoose.model<IMinervaOfficialCurriculum>('MinervaOfficialCurriculum', MinervaOfficialCurriculumSchema);

export default MinervaOfficialCurriculum;
