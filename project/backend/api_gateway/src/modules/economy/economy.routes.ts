import express from 'express';
import { economyController } from './economy.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

router.get('/status', authMiddleware, economyController.getWalletStatus);
router.post('/reward-ad', authMiddleware, economyController.rewardAdTokens);
router.post('/checkout', authMiddleware, economyController.createCheckout);
router.post('/verify', authMiddleware, economyController.verifyPayment);
router.get('/history', authMiddleware, economyController.getTransactionHistory);

export default router;
