import { Router } from 'express';
import { predictionController } from './prediction.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/generate', authMiddleware, predictionController.generatePrediction);
router.get('/history', authMiddleware, predictionController.getHistory);

export default router;
