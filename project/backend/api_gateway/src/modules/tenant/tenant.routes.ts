import { Router } from 'express';
import { TenantController } from './tenant.controller';

const router = Router();

router.post('/register', TenantController.register);
router.post('/verify-token', TenantController.verifyToken);
router.post('/test-webhook', TenantController.testWebhook);
router.post('/grade-homework', TenantController.gradeHomework);
router.post('/ai-tutor-chat', TenantController.aiTutorChat);
router.post('/generate-roadmap', TenantController.generateRoadmap);
router.post('/push-assignment', TenantController.pushAssignment);
router.post('/quiz-battle', TenantController.quizBattle);
router.get('/principal-dossier', TenantController.principalDossier);

// Admin School Management Routes
router.get('/all', TenantController.getAll);
router.get('/list', TenantController.getAll);
router.post('/update-wallet', TenantController.updateWallet);
router.post('/update-features', TenantController.updateFeatures);
router.post('/update-profile', TenantController.updateProfile);
router.post('/sync-users', TenantController.syncUsers);
router.get('/analytics', TenantController.getAnalytics);
router.get('/:orgId/users', TenantController.getUsers);
router.delete('/:orgId', TenantController.deleteTenant);

export default router;


