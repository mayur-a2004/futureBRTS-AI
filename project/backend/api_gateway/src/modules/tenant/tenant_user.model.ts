import mongoose, { Schema, Document } from 'mongoose';

export type TenantUserRole = 'STUDENT' | 'TEACHER' | 'PRINCIPAL' | 'PARENT';

export interface ITenantUser extends Document {
  tenantOrgId: string;
  externalId: string;
  name: string;
  email?: string;
  role: TenantUserRole;
  grade?: string;
  subject?: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  queriesUsed: number;
  lastActive: Date;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const TenantUserSchema = new Schema<ITenantUser>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    externalId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    role: { 
      type: String, 
      enum: ['STUDENT', 'TEACHER', 'PRINCIPAL', 'PARENT'], 
      default: 'STUDENT' 
    },
    grade: { type: String, default: '' },
    subject: { type: String, default: '' },
    assignedClasses: { type: [String], default: ['CLASS-10A', 'CLASS-11B'] },
    assignedSubjects: { type: [String], default: ['Mathematics', 'Science'] },
    queriesUsed: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

// Compound Index to ensure unique student per school org
TenantUserSchema.index({ tenantOrgId: 1, externalId: 1 }, { unique: true });

export const TenantUserModel = mongoose.model<ITenantUser>('TenantUser', TenantUserSchema);
