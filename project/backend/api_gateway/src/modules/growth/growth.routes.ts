import express from 'express';
import { growthController } from './growth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

// 📊 Skill Gap Analytics
router.get('/skill-gap', authMiddleware, growthController.getSkillGap);

export default router;
