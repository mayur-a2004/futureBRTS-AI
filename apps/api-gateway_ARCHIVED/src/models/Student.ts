import mongoose, { Schema, Document } from 'mongoose';

export enum StudentLevel {
    TENTH = '10th',
    TWELFTH = '12th',
    COLLEGE = 'college',
    FRESHER = 'fresher'
}

export interface IStudent extends Document {
    name: string;
    age: number;
    level: StudentLevel;
    field: string;
    createdAt: Date;
}

const StudentSchema: Schema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    level: { type: String, enum: Object.values(StudentLevel), required: true },
    field: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IStudent>('Student', StudentSchema);
