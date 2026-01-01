import express from 'express';
import { roadmapController } from './roadmap.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

router.post('/generate', authMiddleware, roadmapController.generateRoadmap);
router.get('/', authMiddleware, roadmapController.getRoadmaps);

// Tasks
router.post('/convert-tasks', authMiddleware, roadmapController.convertToTasks);
router.get('/tasks', authMiddleware, roadmapController.getTasks);
router.put('/task', authMiddleware, roadmapController.updateTask);

export default router;
