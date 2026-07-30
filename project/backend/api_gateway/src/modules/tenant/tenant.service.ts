import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { TenantOrgModel, ITenantOrg } from './tenant.model';
import { TenantUserModel, ITenantUser } from './tenant_user.model';
import { TenantAnalyticsLogModel } from './tenant_analytics_log.model';

export interface ERPJWTPayload {
  tenantId: string;
  externalId: string;
  name: string;
  email?: string;
  grade?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export class TenantService {
  /**
   * Register a new B2B Tenant Organization (School, College, University HQ)
   */
  static async registerTenant(params: {
    orgId: string;
    orgName: string;
    orgType?: string;
    parentOrgId?: string;
    city?: string;
    state?: string;
    starRating?: number;
    contactEmail?: string;
    contactPhone?: string;
    webhookUrl?: string;
    secretKey?: string;
    featureFlags?: any;
  }): Promise<{ tenant: ITenantOrg; rawApiKey: string; rawSecretKey: string }> {
    const rawApiKey = `brts_live_${params.orgId}_${crypto.randomBytes(4).toString('hex')}`;
    const rawSecretKey = params.secretKey || `sk_sec_${crypto.randomBytes(16).toString('hex')}`;
    const secretKeyHash = crypto.createHash('sha256').update(rawSecretKey).digest('hex');

    const tenant = new TenantOrgModel({
      orgId: params.orgId,
      orgName: params.orgName,
      orgType: params.orgType || 'SINGLE_SCHOOL',
      parentOrgId: params.parentOrgId || null,
      city: params.city || 'Ahmedabad',
      state: params.state || 'Gujarat',
      starRating: params.starRating || 5,
      contactEmail: params.contactEmail || '',
      contactPhone: params.contactPhone || '',
      apiKey: rawApiKey,
      secretKeyHash,
      webhookUrl: params.webhookUrl || '',
      featureFlags: params.featureFlags || undefined
    });

    await tenant.save();
    return { tenant, rawApiKey, rawSecretKey };
  }

  /**
   * Update Tenant Feature Access Flags (ON/OFF Permissions per School)
   */
  static async updateFeatureFlags(orgId: string, featureFlags: any): Promise<any> {
    let tenant: any = await TenantOrgModel.findOne({ orgId });
    if (!tenant) {
      try {
        const result = await this.registerTenant({
          orgId,
          orgName: orgId.replace(/_/g, ' ').toUpperCase(),
          orgType: 'SINGLE_SCHOOL'
        });
        tenant = result.tenant;
      } catch (err) {
        console.warn('⚠️ Could not auto-create tenant in updateFeatureFlags:', err);
      }
    }

    if (!tenant) return null;

    tenant.featureFlags = {
      ...tenant.featureFlags,
      ...featureFlags
    };
    await tenant.save();
    return tenant;
  }

  /**
   * Verify HMAC-SHA256 JWT Token sent from third-party ERP system
   */
  static async verifyERPJWTToken(token: string, rawSecretKey: string): Promise<ERPJWTPayload> {
    try {
      const decoded = jwt.verify(token, rawSecretKey) as ERPJWTPayload;
      return decoded;
    } catch (err: any) {
      throw new Error(`Invalid or expired ERP JWT Token: ${err.message}`);
    }
  }

  /**
   * Fetch Tenant by Org ID
   */
  static async getTenantByOrgId(orgId: string): Promise<ITenantOrg | null> {
    return TenantOrgModel.findOne({ orgId });
  }

  /**
   * Check if a specific feature is enabled for a school tenant organization
   */
  static async checkFeaturePermission(orgId: string, featureKey: string): Promise<{ allowed: boolean; tenant?: ITenantOrg }> {
    const tenant = await TenantOrgModel.findOne({ orgId });
    if (!tenant) {
      // If tenant doesn't exist yet in DB, allow demo access
      return { allowed: true };
    }

    const flags: any = tenant.featureFlags || {};
    if (flags[featureKey] === false) {
      return { allowed: false, tenant };
    }
    return { allowed: true, tenant };
  }

  /**
   * Deduct wallet balance for prepaid query consumption
   */
  static async deductWalletBalance(orgId: string, queryCostINR: number = 0.5): Promise<boolean> {
    const tenant = await TenantOrgModel.findOne({ orgId });
    if (!tenant) return false;

    if (tenant.billing.planType === 'PREPAID_WALLET') {
      if (tenant.billing.walletBalanceINR < queryCostINR) {
        throw new Error(`Insufficient wallet balance for Tenant ${orgId}. Please top up.`);
      }
      tenant.billing.walletBalanceINR -= queryCostINR;
      await tenant.save();
    }
    return true;
  }

  /**
   * Fetch all registered B2B Tenants with sorting and auto-seeding
   */
  static async getAllTenants(): Promise<ITenantOrg[]> {
    let tenants = await TenantOrgModel.find({}).sort({ createdAt: -1 });
    if (tenants.length === 0) {
      // Auto-seed default B2B schools for immediate out-of-the-box demo
      try {
        await this.registerTenant({
          orgId: 'mount_carmel_school',
          orgName: 'Mount Carmel School, Ahmedabad',
          orgType: 'SINGLE_SCHOOL',
          webhookUrl: 'https://erp.mountcarmel.edu.in/api/v1/ai-webhook'
        });
        await this.registerTenant({
          orgId: 'dps_delhi_ncr',
          orgName: 'Delhi Public School (DPS Delhi-NCR)',
          orgType: 'MULTI_BRANCH_CHAIN',
          webhookUrl: 'https://erp.dpsdelhi.edu.in/api/v1/ai-webhook'
        });
        await this.registerTenant({
          orgId: 'silver_oak_university',
          orgName: 'Silver Oak University Partner Campus',
          orgType: 'UNIVERSITY_HQ',
          webhookUrl: 'https://erp.silveroakuni.ac.in/webhooks/future-brts'
        });
        tenants = await TenantOrgModel.find({}).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('⚠️ [Tenant Seed] Skipping initial seed:', err);
      }
    }
    return tenants;
  }

  /**
   * Update Wallet Balance or Billing Plan for a Tenant
   */
  static async updateWallet(orgId: string, walletBalanceINR: number, planType?: string): Promise<ITenantOrg | null> {
    const tenant = await TenantOrgModel.findOne({ orgId });
    if (!tenant) return null;

    tenant.billing.walletBalanceINR = walletBalanceINR;
    if (planType) {
      tenant.billing.planType = planType as any;
    }
    await tenant.save();
    return tenant;
  }

  /**
   * Update full School Profile details (Name, Location, Contact, Tier, Webhook, Rating)
   */
  static async updateTenantProfile(orgId: string, data: {
    orgName?: string;
    orgType?: string;
    city?: string;
    state?: string;
    starRating?: number;
    contactEmail?: string;
    contactPhone?: string;
    webhookUrl?: string;
  }): Promise<ITenantOrg | null> {
    const tenant: any = await TenantOrgModel.findOne({ orgId });
    if (!tenant) return null;

    if (data.orgName) tenant.orgName = data.orgName;
    if (data.orgType) tenant.orgType = data.orgType;
    if (data.city) tenant.city = data.city;
    if (data.state) tenant.state = data.state;
    if (data.starRating !== undefined) tenant.starRating = data.starRating;
    if (data.contactEmail !== undefined) tenant.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined) tenant.contactPhone = data.contactPhone;
    if (data.webhookUrl !== undefined) tenant.webhookUrl = data.webhookUrl;

    await tenant.save();
    return tenant;
  }

  /**
   * Sync ERP User accounts (students/teachers) from ERP Backend into MongoDB dynamically
   */
  static async syncTenantUsers(tenantOrgId: string, users: any[]): Promise<{ syncedCount: number }> {
    let syncedCount = 0;
    for (const u of users) {
      if (!u.externalId || !u.name) continue;
      await TenantUserModel.findOneAndUpdate(
        { tenantOrgId, externalId: u.externalId },
        {
          tenantOrgId,
          externalId: u.externalId,
          name: u.name,
          email: u.email || '',
          role: u.role || 'STUDENT',
          grade: u.grade || '',
          subject: u.subject || '',
          status: u.status || 'ACTIVE',
          $setOnInsert: { queriesUsed: 0 },
          lastActive: new Date()
        },
        { upsert: true, new: true }
      );
      syncedCount++;
    }
    return { syncedCount };
  }

  /**
   * Record user activity & increment queriesUsed in MongoDB dynamically whenever student/teacher hits AI
   */
  static async recordUserActivity(tenantOrgId: string, externalId: string, name?: string, role?: string): Promise<void> {
    try {
      await TenantUserModel.findOneAndUpdate(
        { tenantOrgId, externalId },
        {
          tenantOrgId,
          externalId,
          name: name || `Student ${externalId}`,
          role: role || 'STUDENT',
          $inc: { queriesUsed: 1 },
          lastActive: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('⚠️ Could not record user activity in MongoDB:', err);
    }
  }

  /**
   * Fetch connected student & teacher user accounts dynamically from MongoDB Database
   */
  static async getTenantUsers(orgId: string): Promise<ITenantUser[]> {
    let users = await TenantUserModel.find({ tenantOrgId: orgId }).sort({ updatedAt: -1 });

    // If no users recorded yet for this school org in MongoDB, auto-populate initial dynamic student records
    if (users.length === 0) {
      try {
        await this.syncTenantUsers(orgId, [
          { externalId: 'STU-10492', name: 'Aarav Sharma', role: 'STUDENT', grade: 'Class 10-A', email: 'aarav.s@school.edu.in', queriesUsed: 42, status: 'ACTIVE' },
          { externalId: 'STU-10493', name: 'Priya Patel', role: 'STUDENT', grade: 'Class 10-A', email: 'priya.p@school.edu.in', queriesUsed: 89, status: 'ACTIVE' },
          { externalId: 'TCH-901', name: 'Mrs. Anjali Mehta', role: 'TEACHER', subject: 'Mathematics', email: 'anjali.m@school.edu.in', status: 'ACTIVE' },
          { externalId: 'STU-10494', name: 'Rohan Verma', role: 'STUDENT', grade: 'Class 10-B', email: 'rohan.v@school.edu.in', queriesUsed: 19, status: 'ACTIVE' },
          { externalId: 'PRN-001', name: 'Dr. Ramesh Kumar', role: 'PRINCIPAL', email: 'principal@school.edu.in', status: 'ACTIVE' }
        ]);
        users = await TenantUserModel.find({ tenantOrgId: orgId }).sort({ updatedAt: -1 });
      } catch (err) {
        console.warn('⚠️ Could not auto-seed tenant users in DB:', err);
      }
    }
    return users;
  }

  /**
   * Log AI Telemetry Click & Model Event in MongoDB
   */
  static async logAnalyticsEvent(params: {
    tenantOrgId: string;
    externalUserId?: string;
    userRole?: string;
    featureName: string;
    aiModelUsed?: string;
    costINR?: number;
  }): Promise<void> {
    try {
      await TenantAnalyticsLogModel.create({
        tenantOrgId: params.tenantOrgId,
        externalUserId: params.externalUserId || 'ANONYMOUS',
        userRole: params.userRole || 'STUDENT',
        featureName: params.featureName,
        aiModelUsed: params.aiModelUsed || 'gpt-4o-vision',
        costINR: params.costINR || 0.50,
        timestamp: new Date()
      });
    } catch (err) {
      console.warn('⚠️ Could not log telemetry analytics event:', err);
    }
  }

  /**
   * Fetch Telemetry Usage Analytics & Clicks Breakdown by Time Range (1d, 7d, 15d, 30d, all)
   */
  static async getTenantAnalytics(orgId?: string, timeRange: string = '7d'): Promise<any> {
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === '1d') startDate.setDate(now.getDate() - 1);
    else if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
    else if (timeRange === '15d') startDate.setDate(now.getDate() - 15);
    else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
    else startDate = new Date(0); // All time

    const filter: any = { timestamp: { $gte: startDate } };
    if (orgId && orgId !== 'ALL') {
      filter.tenantOrgId = orgId;
    }

    const logs = await TenantAnalyticsLogModel.find(filter);

    // Calculate Feature Clicks Breakdown
    const featureMap: Record<string, number> = {};
    const modelMap: Record<string, number> = {};
    let totalHits = logs.length;
    let totalCostINR = 0;

    for (const log of logs) {
      featureMap[log.featureName] = (featureMap[log.featureName] || 0) + 1;
      modelMap[log.aiModelUsed] = (modelMap[log.aiModelUsed] || 0) + 1;
      totalCostINR += log.costINR || 0.50;
    }

    // Default High-Fidelity Data if logs are empty (for instant demo out-of-the-box UI charts)
    if (totalHits === 0) {
      totalHits = 1450;
      totalCostINR = 725.0;
      featureMap['visionHomework'] = 650;
      featureMap['aiTutor'] = 510;
      featureMap['studyRoadmaps'] = 180;
      featureMap['quizBattles'] = 110;

      modelMap['gpt-4o-vision'] = 650;
      modelMap['gemini-1.5-pro'] = 510;
      modelMap['minerva-custom-llm'] = 290;
    }

    const featureBreakdown = Object.keys(featureMap).map(key => ({
      feature: key,
      clicks: featureMap[key],
      percentage: Math.round((featureMap[key] / totalHits) * 100)
    })).sort((a, b) => b.clicks - a.clicks);

    const modelBreakdown = Object.keys(modelMap).map(key => ({
      model: key,
      hits: modelMap[key],
      percentage: Math.round((modelMap[key] / totalHits) * 100)
    })).sort((a, b) => b.hits - a.hits);

    return {
      orgId: orgId || 'ALL',
      timeRange,
      totalHits,
      totalCostINR: Math.round(totalCostINR * 100) / 100,
      featureBreakdown,
      modelBreakdown
    };
  }

  /**
   * Delete a B2B Tenant Organization
   */
  static async deleteTenant(orgId: string): Promise<boolean> {
    await TenantUserModel.deleteMany({ tenantOrgId: orgId });
    await TenantAnalyticsLogModel.deleteMany({ tenantOrgId: orgId });
    const res = await TenantOrgModel.deleteOne({ orgId });
    return res.deletedCount > 0;
  }
}

