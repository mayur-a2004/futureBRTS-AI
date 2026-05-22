import { Request, Response, NextFunction } from 'express';
import User from '../../modules/auth/user.model';
import EconomyTransaction from '../../modules/economy/transaction.model';
import { logger } from '../utils/logger';

export const tokenGuard = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const now = new Date();

        // 0. Subscription Expiry Check
        if (user.isPremium && user.subscriptionExpiresAt && now > user.subscriptionExpiresAt) {
            user.isPremium = false;
            user.subscriptionTier = 'free';
            await user.save();

            await EconomyTransaction.create({
                userId: user._id,
                type: 'DAILY_REFRESH',
                amount: 0,
                description: `Subscription expired. Reverted to Basic tier.`
            });
        }

        // 1. Daily Refresh Logic
        // Bonus tokens remain (Math.max logic), but user gets daily fuel baseline every new day.
        const lastRefresh = new Date(user.lastTokenRefreshedAt || 0);
        const isNewDay = now.toDateString() !== lastRefresh.toDateString();

        if (isNewDay) {
            const dailyLimit = user.isPremium ? 5000 : 700;
            const previousBalance = user.tokenBalance;

            // recharge strictly to limit if below, else keep existing (bonus/remnant)
            user.tokenBalance = Math.max(user.tokenBalance, dailyLimit);
            user.lastTokenRefreshedAt = now;
            await user.save();

            if (user.tokenBalance > previousBalance) {
                await EconomyTransaction.create({
                    userId: user._id,
                    type: 'DAILY_REFRESH',
                    amount: user.tokenBalance - previousBalance,
                    description: `Daily energy recharge (${user.isPremium ? 'Elite' : 'Basic'}).`
                });
            }
        }

        // 2. Fetch Dynamic Cost from DB
        const SystemSettings = require('../../modules/admin/settings.model').default;
        const costSetting = await SystemSettings.findOne({ key: 'ACTION_TOKEN_COST' });
        const ACTION_COST = costSetting ? Number(costSetting.value) : 10;

        // 3. Token Check
        const SAFE_TEST_MODE = process.env.SAFE_TEST_MODE === 'true';

        if (user.tokenBalance < ACTION_COST && !SAFE_TEST_MODE) {
            return res.status(403).json({
                success: false,
                error: 'OUT_OF_TOKENS',
                isPremium: user.isPremium,
                message: 'Your energy limit has been reached.',
                suggestion: user.isPremium ? 'Please top up your elite wallet.' : 'Watch an ad or upgrade to Pro to continue.'
            });
        }

        // 4. Deduct Tokens
        if (!SAFE_TEST_MODE) {
            user.tokenBalance -= ACTION_COST;
            await user.save();

            // 📝 Log Consumption
            await EconomyTransaction.create({
                userId: user._id,
                type: 'TOKEN_CONSUMPTION',
                amount: -ACTION_COST,
                description: `AI Action: ${req.originalUrl}`,
                metadata: { actionType: req.originalUrl }
            });
        }

        next();
    } catch (err) {
        logger.error('Token Guard Error', err);
        next();
    }
};
