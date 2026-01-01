import { Router } from 'express';
import { onboardingController } from './onboarding.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Protected Routes
router.post('/answer', authMiddleware, onboardingController.submitAnswer); // Legacy
router.get('/result', authMiddleware, onboardingController.getResults); // Legacy

router.post('/save-step', authMiddleware, onboardingController.saveStep);
router.get('/status', authMiddleware, onboardingController.getStatus);
router.post('/complete', authMiddleware, onboardingController.complete);

export default router;
