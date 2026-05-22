import { Router } from 'express';
import { warRoomController } from './war_room.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/audit', authMiddleware, warRoomController.createAudit);
router.get('/audits', authMiddleware, warRoomController.getAudits);

export default router;
