import { Request, Response } from 'express';
import { TenantService } from './tenant.service';
import { WebhookDispatcherService } from './webhook_dispatcher.service';

export class TenantController {
  /**
   * Register a new B2B Organization (School, College, University)
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { orgId, orgName, orgType, parentOrgId, webhookUrl, secretKey } = req.body;
      if (!orgId || !orgName) {
        res.status(400).json({ error: 'orgId and orgName are required' });
        return;
      }

      const result = await TenantService.registerTenant({
        orgId,
        orgName,
        orgType,
        parentOrgId,
        webhookUrl,
        secretKey
      });

      res.status(201).json({
        success: true,
        message: 'B2B Tenant Organization onboarded successfully',
        tenant: {
          orgId: result.tenant.orgId,
          orgName: result.tenant.orgName,
          orgType: result.tenant.orgType,
          parentOrgId: result.tenant.parentOrgId,
          apiKey: result.rawApiKey,
          secretKey: result.rawSecretKey,
          webhookUrl: result.tenant.webhookUrl,
          billing: result.tenant.billing
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Verify an ERP JWT Token
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, secretKey } = req.body;
      if (!token || !secretKey) {
        res.status(400).json({ error: 'token and secretKey are required' });
        return;
      }

      const decoded = await TenantService.verifyERPJWTToken(token, secretKey);
      res.json({ success: true, valid: true, payload: decoded });
    } catch (err: any) {
      res.status(401).json({ success: false, valid: false, error: err.message });
    }
  }

  /**
   * Test Webhook Dispatcher
   */
  static async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { webhookUrl, event, tenantId, externalId, studentName, scoreObtained, maxScore } = req.body;
      const success = await WebhookDispatcherService.dispatchEvent(webhookUrl, {
        event: event || 'HOMEWORK_GRADED',
        tenantId: tenantId || 'test_tenant',
        externalId: externalId || 'STU-001',
        studentName: studentName || 'Test Student',
        scoreObtained: scoreObtained || 9.0,
        maxScore: maxScore || 10.0,
        gradedAt: new Date().toISOString()
      });

      res.json({ success, dispatchedTo: webhookUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Vision AI Homework Auto-Checker
   */
  static async gradeHomework(req: Request, res: Response): Promise<void> {
    try {
      const { imageUrl, subject, chapter, studentName, externalId, tenantId, webhookUrl } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'visionHomework');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: 'Vision AI Homework Auto-Grader' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      const { VisionHomeworkCheckerService } = require('../homework/vision_homework_checker.service');
      const result = await VisionHomeworkCheckerService.gradeNotebookImage({
        imageUrl,
        subject,
        chapter,
        studentName,
        externalId,
        tenantId: orgId,
        webhookUrl
      });
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * AI Tutor Interactive Chat Bot Endpoint (Permission Enforced)
   */
  static async aiTutorChat(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, studentId, externalId, studentName, tenantId, subject } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'aiTutor');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: 'AI Tutor Chat Bot' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      // Record Dynamic User Activity & Telemetry Analytics in MongoDB
      const userId = studentId || externalId || 'STU-10492';
      await TenantService.recordUserActivity(orgId, userId, studentName, 'STUDENT');
      await TenantService.logAnalyticsEvent({
        tenantOrgId: orgId,
        externalUserId: userId,
        featureName: 'aiTutor',
        aiModelUsed: 'gemini-1.5-pro',
        costINR: 0.50
      });

      res.json({
        success: true,
        tenantId: orgId,
        reply: `🤖 [Future AI Tutor] Hi ${studentName || 'Student'}! Regarding your question on ${subject || 'General Studies'}: "${prompt || 'Help me study'}", here is a structured step-by-step breakdown with key concept highlights.`,
        suggestedPracticeQuestions: [
          'Solve 3 practice questions on this topic',
          'Explain this concept in simple 5-year-old terms',
          'Generate a quick 5-minute revision summary'
        ],
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Syllabus & Study Roadmap Generator Endpoint (Permission Enforced)
   */
  static async generateRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const { subject, grade, board, targetExamDate, tenantId } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'studyRoadmaps');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: 'Syllabus & Study Roadmaps' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      res.json({
        success: true,
        tenantId: orgId,
        roadmap: {
          subject: subject || 'Mathematics',
          grade: grade || 'Class 10',
          board: board || 'CBSE Board 2026',
          targetExamDate: targetExamDate || '2026-03-15',
          totalModules: 4,
          modules: [
            { week: 1, topic: 'Algebra & Polynomials Mastery', status: 'IN_PROGRESS', scoreRequired: '90%' },
            { week: 2, topic: 'Trigonometric Identities & Applications', status: 'UPCOMING', scoreRequired: '85%' },
            { week: 3, topic: 'Coordinate Geometry & Linear Equations', status: 'UPCOMING', scoreRequired: '88%' },
            { week: 4, topic: 'Full Mock Board Exam & Weak Area Revision', status: 'UPCOMING', scoreRequired: '95%' }
          ]
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Teacher-to-Student Assignment Push API Endpoint (Permission Enforced)
   */
  static async pushAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { teacherName, assignmentTitle, subject, grade, dueDate, studentIds, tenantId } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'parentTeacherHub');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: 'Parent & Teacher Portal Access' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      res.json({
        success: true,
        tenantId: orgId,
        message: `✅ Assignment "${assignmentTitle}" successfully pushed to ${studentIds?.length || 35} students in ${grade || 'Class 10-A'} by Teacher ${teacherName || 'Mrs. Anjali Mehta'}.`,
        assignmentId: `ASSIGN-${Date.now()}`,
        dueDate: dueDate || '2026-08-05'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * 1v1 Student Quiz Battle Arena Endpoint (Permission Enforced)
   */
  static async quizBattle(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, subject, tenantId } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'quizBattles');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: '1v1 Student Quiz Battles' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      res.json({
        success: true,
        tenantId: orgId,
        matchId: `BATTLE-${Date.now()}`,
        status: 'MATCH_FOUND',
        opponent: { id: 'STU-992', name: 'Rohan Patel', school: 'DPS Delhi-NCR' },
        questionCount: 5,
        timeLimitPerQuestionSeconds: 15
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * 360° Principal Search Dossier (Permission Enforced)
   */
  static async principalDossier(req: Request, res: Response): Promise<void> {
    try {
      const studentId = (req.query.studentId as string) || 'STU-001';
      const studentName = req.query.name as string;
      const orgId = (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      // Check Feature Permission
      const perm = await TenantService.checkFeaturePermission(orgId, 'principalDossier');
      if (!perm.allowed) {
        res.status(403).json({
          success: false,
          error: `⛔ Feature Permission Denied: '360° Principal Search Dossier' is currently DISABLED for school organization '${orgId}'. Contact Admin to enable this module.`
        });
        return;
      }

      const { PrincipalSearchService } = require('../principal/principal_search.service');
      const dossier = await PrincipalSearchService.getStudentDossier(studentId, studentName);
      res.json({ success: true, dossier });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * List all registered B2B Tenants for Admin Panel
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await TenantService.getAllTenants();
      res.json({ success: true, tenants });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Update Tenant Wallet Balance
   */
  static async updateWallet(req: Request, res: Response): Promise<void> {
    try {
      const { orgId, walletBalanceINR, planType } = req.body;
      if (!orgId || walletBalanceINR === undefined) {
        res.status(400).json({ error: 'orgId and walletBalanceINR are required' });
        return;
      }

      const tenant = await TenantService.updateWallet(orgId, walletBalanceINR, planType);
      res.json({ success: true, tenant });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Update Tenant Feature Flags (ON/OFF Permissions per School)
   */
  static async updateFeatures(req: Request, res: Response): Promise<void> {
    try {
      const { orgId, featureFlags } = req.body;
      if (!orgId || !featureFlags) {
        res.status(400).json({ error: 'orgId and featureFlags are required' });
        return;
      }

      const tenant = await TenantService.updateFeatureFlags(orgId, featureFlags);
      res.json({ success: true, tenant });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Update Tenant School Profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { orgId, orgName, orgType, city, state, starRating, contactEmail, contactPhone, webhookUrl } = req.body;
      if (!orgId) {
        res.status(400).json({ error: 'orgId is required' });
        return;
      }

      const tenant = await TenantService.updateTenantProfile(orgId, {
        orgName, orgType, city, state, starRating, contactEmail, contactPhone, webhookUrl
      });
      res.json({ success: true, tenant });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Sync ERP Student & Teacher Database User Records into MongoDB
   */
  static async syncUsers(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, users } = req.body;
      const orgId = tenantId || (req.headers['x-tenant-org-id'] as string);
      if (!orgId || !users || !Array.isArray(users)) {
        res.status(400).json({ error: 'tenantId and users array are required' });
        return;
      }

      const result = await TenantService.syncTenantUsers(orgId, users);
      res.json({ success: true, tenantId: orgId, syncedCount: result.syncedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Get Telemetry Usage Analytics & Clicks Breakdown by Time Range (1d, 7d, 15d, 30d, all)
   */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const orgId = (req.query.orgId as string) || 'ALL';
      const timeRange = (req.query.timeRange as string) || '7d';
      const analytics = await TenantService.getTenantAnalytics(orgId, timeRange);
      res.json({ success: true, analytics });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Get connected Student & Teacher User records for a School Tenant
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      const users = await TenantService.getTenantUsers(orgId);
      res.json({ success: true, orgId, count: users.length, users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Delete B2B Tenant Organization
   */
  static async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      const success = await TenantService.deleteTenant(orgId);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}


