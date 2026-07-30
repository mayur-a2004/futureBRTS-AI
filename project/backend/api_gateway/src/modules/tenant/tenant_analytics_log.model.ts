import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantAnalyticsLog extends Document {
  tenantOrgId: string;
  externalUserId?: string;
  userRole?: string;
  featureName: string;
  aiModelUsed: string;
  costINR: number;
  tokensUsed?: number;
  latencyMs?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TenantAnalyticsLogSchema = new Schema<ITenantAnalyticsLog>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    externalUserId: { type: String, default: 'ANONYMOUS', index: true },
    userRole: { type: String, default: 'STUDENT' },
    featureName: { type: String, required: true, index: true },
    aiModelUsed: { type: String, required: true, index: true },
    costINR: { type: Number, default: 0.5 },
    tokensUsed: { type: Number, default: 250 },
    latencyMs: { type: Number, default: 320 },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Index for fast date-range and school telemetry filtering
TenantAnalyticsLogSchema.index({ tenantOrgId: 1, timestamp: -1 });
TenantAnalyticsLogSchema.index({ featureName: 1, timestamp: -1 });

export const TenantAnalyticsLogModel = mongoose.model<ITenantAnalyticsLog>('TenantAnalyticsLog', TenantAnalyticsLogSchema);
