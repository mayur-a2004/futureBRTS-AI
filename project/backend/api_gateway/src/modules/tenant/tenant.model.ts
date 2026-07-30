import mongoose, { Schema, Document } from 'mongoose';

export type TenantOrgType = 
  | 'SINGLE_SCHOOL' 
  | 'SCHOOL_CHAIN_BRANCH' 
  | 'UNIVERSITY_HQ' 
  | 'AFFILIATED_COLLEGE' 
  | 'FRANCHISE_CENTER';

export type PlanType = 'PREPAID_WALLET' | 'MONTHLY_PER_STUDENT' | 'ENTERPRISE_FLAT';

export interface ITenantOrg extends Document {
  orgId: string;
  orgName: string;
  orgType: TenantOrgType;
  parentOrgId?: string | null;
  city?: string;
  state?: string;
  starRating?: number;
  contactEmail?: string;
  contactPhone?: string;
  apiKey: string;
  secretKeyHash: string;
  webhookUrl?: string;
  featureFlags: {
    aiTutor: boolean;
    visionHomework: boolean;
    studyRoadmaps: boolean;
    quizBattles: boolean;
    practiceExams: boolean;
    principalDossier: boolean;
    parentTeacherHub: boolean;
    futureEducationOS: boolean;
    futureBRTSBuilder: boolean;
  };
  billing: {
    planType: PlanType;
    walletBalanceINR: number;
    costPerQueryINR: number;
    monthlyRatePerStudentINR: number;
    useParentWallet: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantOrgSchema = new Schema<ITenantOrg>(
  {
    orgId: { type: String, required: true, unique: true, index: true },
    orgName: { type: String, required: true },
    orgType: { 
      type: String, 
      enum: ['SINGLE_SCHOOL', 'SCHOOL_CHAIN_BRANCH', 'UNIVERSITY_HQ', 'AFFILIATED_COLLEGE', 'FRANCHISE_CENTER', 'COACHING_INSTITUTE'],
      default: 'SINGLE_SCHOOL'
    },
    parentOrgId: { type: String, default: null, index: true },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    starRating: { type: Number, default: 5 },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    apiKey: { type: String, required: true, unique: true, index: true },
    secretKeyHash: { type: String, required: true },
    webhookUrl: { type: String, default: '' },
    featureFlags: {
      aiTutor: { type: Boolean, default: true },
      visionHomework: { type: Boolean, default: true },
      studyRoadmaps: { type: Boolean, default: true },
      quizBattles: { type: Boolean, default: true },
      practiceExams: { type: Boolean, default: true },
      principalDossier: { type: Boolean, default: true },
      parentTeacherHub: { type: Boolean, default: true },
      futureEducationOS: { type: Boolean, default: true },
      futureBRTSBuilder: { type: Boolean, default: true }
    },
    billing: {
      planType: { type: String, enum: ['PREPAID_WALLET', 'MONTHLY_PER_STUDENT', 'ENTERPRISE_FLAT'], default: 'PREPAID_WALLET' },
      walletBalanceINR: { type: Number, default: 1000 },
      costPerQueryINR: { type: Number, default: 0.5 },
      monthlyRatePerStudentINR: { type: Number, default: 49 },
      useParentWallet: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const TenantOrgModel = mongoose.model<ITenantOrg>('TenantOrg', TenantOrgSchema);
