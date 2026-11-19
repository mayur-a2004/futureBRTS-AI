// 🎮 ERP Copilot API Controller & Route Handlers
import { Request, Response, Router } from 'express';
import { federatedQueryEngine } from './federated_query_engine';
import { cloudinaryService } from '../storage/cloudinary.service';
import { identityResolutionService } from '../identity/identity_resolution.service';

export const copilotRouter = Router();

/**
 * POST /api/v1/copilot/query
 * Execute dual-DB federated query for ERP AI Copilot
 */
copilotRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { prompt, tenantId, userRole, studentId } = req.body;

    const orgTenant = tenantId || req.headers['x-tenant-org-id'] || 'mount_carmel_school';
    const role = userRole || 'PRINCIPAL';

    const result = await federatedQueryEngine.executeQuery({
      userRole: role,
      tenantId: orgTenant as string,
      prompt: prompt || 'Show 360 dossier',
      studentId
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ [CopilotController] Query Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/copilot/signed-upload-token
 * Get Cloudinary direct signed upload URL for Copilot documents & homework scans
 */
copilotRouter.post('/signed-upload-token', async (req: Request, res: Response) => {
  try {
    const { tenantId, category } = req.body;
    const orgTenant = tenantId || 'mount_carmel_school';
    const uploadCategory = category || 'copilot_docs';

    const uploadPreset = cloudinaryService.generateSignedUploadPreset(orgTenant, uploadCategory);
    return res.status(200).json({ success: true, ...uploadPreset });
  } catch (error: any) {
    console.error('❌ [CopilotController] Signed Token Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/copilot/resolve-passport
 * Universal Lifetime Passport Resolution & Cross-School Transfer
 */
copilotRouter.post('/resolve-passport', async (req: Request, res: Response) => {
  try {
    const result = await identityResolutionService.resolveOrLinkPassport(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ [CopilotController] Passport Resolution Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});
