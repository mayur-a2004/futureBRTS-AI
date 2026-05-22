import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', tasksController.getTasks);
router.get('/analytics', tasksController.getTaskAnalytics);
router.post('/generate', tasksController.generateTasks);
router.put('/', tasksController.updateTask);
router.post('/verify', tasksController.verifyTask); // Accepts { taskId, submission? }
router.post('/translate', tasksController.translate); // Accepts { text, targetLanguage }

export default router;