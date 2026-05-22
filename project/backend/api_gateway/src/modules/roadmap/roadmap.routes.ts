// import express from 'express';
// import { roadmapController } from './roadmap.controller';
// import { authMiddleware } from '../../shared/middleware/auth.middleware';
// import { tokenGuard } from '../../shared/middleware/token.middleware';

// const router = express.Router();

// router.post('/generate', authMiddleware, tokenGuard, roadmapController.generateRoadmap);
// router.get('/', authMiddleware, roadmapController.getRoadmaps);

// // Tasks Logic - Converted from roadmap
// router.post('/convert-tasks', authMiddleware, tokenGuard, roadmapController.convertToTasks);

// export default router;
import express from 'express';
import { roadmapController } from './roadmap.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { tokenGuard } from '../../shared/middleware/token.middleware';

const router = express.Router();

router.post('/generate', authMiddleware, tokenGuard, roadmapController.generateRoadmap);
router.get('/', authMiddleware, roadmapController.getRoadmaps);

// Tasks Logic - Converted from roadmap
router.post('/convert-tasks', authMiddleware, tokenGuard, roadmapController.convertToTasks);

export default router;