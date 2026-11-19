// 🆔 Universal Student Passport (USID) Identity Resolution & Transfer Engine
import crypto from 'crypto';
import { getErpModels } from '../erp_integration/models/erp_schemas';

export class IdentityResolutionService {
  /**
   * Generates a unique USID string
   */
  public generateUsid(): string {
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `USID-IND-2026-${randomHex}`;
  }

  /**
   * Resolves or Creates a Universal Student Passport
   * Checks phone, primary email, or govt ID hash for seamless record matching
   */
  public async resolveOrLinkPassport(data: {
    fullName: string;
    primaryPhone: string;
    primaryEmail: string;
    dateOfBirth: string;
    tenantId: string;
    grade: string;
    section: string;
    govtId?: string;
  }) {
    try {
      const { UniversalStudentPassportModel } = getErpModels();

      const govtIdHash = data.govtId 
        ? crypto.createHash('sha256').update(data.govtId).digest('hex') 
        : undefined;

      // 1. Try to find existing passport
      let passport = await UniversalStudentPassportModel.findOne({
        $or: [
          ...(govtIdHash ? [{ govtIdHash }] : []),
          { primaryPhone: data.primaryPhone },
          { primaryEmail: data.primaryEmail }
        ]
      });

      if (passport) {
        // Record exists! Check if school changed (Transfer scenario)
        if (passport.activeTenantId && passport.activeTenantId !== data.tenantId) {
          console.log(`🔄 [IdentityResolution] Transfer detected for ${data.fullName}: ${passport.activeTenantId} -> ${data.tenantId}`);
          
          // Archive previous school log
          passport.historicalSchoolLogs.push({
            tenantId: passport.activeTenantId,
            schoolName: passport.activeTenantId,
            fromGrade: passport.activeGrade || 'N/A',
            toGrade: data.grade,
            joinedDate: new Date(),
            leftDate: new Date()
          });
        }

        // Update active school tenant context
        passport.activeTenantId = data.tenantId;
        passport.activeGrade = data.grade;
        passport.activeSection = data.section;
        await passport.save();

        return {
          success: true,
          usid: passport.usid,
          isNewRegistration: false,
          historicalLogsCount: passport.historicalSchoolLogs.length,
          aiMemoryVault: passport.aiLearningMemoryVault
        };
      }

      // 2. No existing passport found -> Create new Universal Passport!
      const newUsid = this.generateUsid();
      const newPassport = await UniversalStudentPassportModel.create({
        usid: newUsid,
        govtIdHash,
        primaryPhone: data.primaryPhone,
        primaryEmail: data.primaryEmail,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        activeTenantId: data.tenantId,
        activeGrade: data.grade,
        activeSection: data.section,
        historicalSchoolLogs: [{
          tenantId: data.tenantId,
          schoolName: data.tenantId,
          fromGrade: data.grade,
          toGrade: data.grade,
          joinedDate: new Date()
        }],
        aiLearningMemoryVault: {
          totalTutorHours: 0,
          masteredTopics: [],
          weakTopics: [],
          certificatesEarned: []
        }
      });

      console.log(`✨ [IdentityResolution] Created New Lifetime USID Passport: ${newUsid} for ${data.fullName}`);

      return {
        success: true,
        usid: newUsid,
        isNewRegistration: true,
        historicalLogsCount: 1,
        aiMemoryVault: newPassport.aiLearningMemoryVault
      };
    } catch (error: any) {
      console.error('❌ [IdentityResolution] Error resolving USID passport:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const identityResolutionService = new IdentityResolutionService();
