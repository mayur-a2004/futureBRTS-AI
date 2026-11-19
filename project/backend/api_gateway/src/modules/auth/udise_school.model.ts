import mongoose, { Schema, Document } from 'mongoose';

export interface IUdiseSchool extends Document {
    udiseCode: string;
    schoolName: string;
    state: string;
    district: string;
    city: string;
    pincode: string;
    board: string;
    medium: string;
    category: string;
    fullAddress: string;
    managementType: string;
    isCustom?: boolean;
    studentCount?: number;
    teacherCount?: number;
}

const UdiseSchoolSchema: Schema = new Schema(
    {
        udiseCode: { type: String, required: true, index: true, unique: true },
        schoolName: { type: String, required: true, index: true },
        state: { type: String, required: true, index: true },
        district: { type: String, required: true, index: true },
        city: { type: String, required: true, index: true },
        pincode: { type: String, default: '380001', index: true },
        board: { type: String, default: 'GSEB' },
        medium: { type: String, default: 'English' },
        category: { type: String, default: 'Higher Secondary (1-12)' },
        fullAddress: { type: String, required: true },
        managementType: { type: String, default: 'Private Unaided' },
        isCustom: { type: Boolean, default: false },
        studentCount: { type: Number, default: 0 },
        teacherCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

UdiseSchoolSchema.index({ schoolName: 'text', fullAddress: 'text', city: 'text' });

export default mongoose.model<IUdiseSchool>('UdiseSchool', UdiseSchoolSchema);
