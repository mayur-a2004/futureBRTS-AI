import { Router } from 'express';
import { OnboardingController } from './onboarding.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public routes for fetching cities & schools during registration
router.get('/cities', OnboardingController.getCities);
router.get('/schools', OnboardingController.getSchoolsByCity);

// Protected routes requiring user auth
router.use(authMiddleware);
router.get('/status', OnboardingController.getStatus);
router.post('/register-school', OnboardingController.registerCustomSchool);
router.post('/complete', OnboardingController.completeRegistration);

export default router;
