import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolTenant extends Document {
  city: string;
  schoolName: string;
  tenantOrgId: string;
  board?: string;
  isCustom?: boolean;
  addedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolTenantSchema = new Schema<ISchoolTenant>(
  {
    city: { type: String, required: true, index: true },
    schoolName: { type: String, required: true },
    tenantOrgId: { type: String, required: true, unique: true, index: true },
    board: { type: String, default: 'CBSE' },
    isCustom: { type: Boolean, default: false },
    addedByUserId: { type: String, default: '' }
  },
  { timestamps: true }
);

SchoolTenantSchema.index({ city: 1, schoolName: 1 }, { unique: true });

export const SchoolTenantModel = mongoose.model<ISchoolTenant>('SchoolTenant', SchoolTenantSchema);
