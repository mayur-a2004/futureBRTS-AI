import mongoose, { Schema, Document } from 'mongoose';

export interface IEducationDomain extends Document {
    name: string; // e.g. "Engineering & Technology"
    description: string;
    degrees: {
        UG: string[];
        PG: string[];
        Diploma: string[];
        Doctoral: string[];
        Vocational?: string[];
    };
    projectTypes: string[];
    suggestedTechStack: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    regulator?: string;
    createdAt: Date;
}

const EducationDomainSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    degrees: {
        UG: [String],
        PG: [String],
        Diploma: [String],
        Doctoral: [String],
        Vocational: [String]
    },
    projectTypes: [String],
    suggestedTechStack: {
        primary: { type: String, default: '' },
        secondary: { type: String, default: '' },
        tertiary: { type: String, default: '' }
    },
    regulator: { type: String, default: 'UGC' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IEducationDomain>('EducationDomain', EducationDomainSchema);
