import User from '../auth/user.model';
import EconomyTransaction from './transaction.model';

export class EconomyService {
    /**
     * Charges a user a specific token amount based on action type.
     * Maps to system settings if available.
     */
    static async chargeUser(userId: string, actionType: string, description: string = 'AI Action') {
        try {
            const user = await User.findById(userId);
            if (!user) return { success: false, error: 'User not found' };

            // Fetch cost from settings or use defaults
            const SystemSettings = require('../admin/settings.model').default;
            const costSetting = await SystemSettings.findOne({ key: actionType });

            let cost = 50; // Default fallback for roadmap/tasks
            if (costSetting) {
                cost = Number(costSetting.value);
            } else {
                // Hardcoded defaults for critical actions if settings missing
                if (actionType === 'TOKEN_COST_ROADMAP') cost = 100;
                if (actionType === 'TOKEN_COST_TASK') cost = 25;
            }

            if (user.tokenBalance < cost) {
                return {
                    success: false,
                    error: 'Insufficient tokens. Please recharge your wallet.'
                };
            }

            user.tokenBalance -= cost;
            await user.save();

            // Log Transaction
            await EconomyTransaction.create({
                userId: user._id,
                type: 'TOKEN_CONSUMPTION',
                amount: -cost,
                description,
                metadata: { actionType }
            });

            return { success: true, newBalance: user.tokenBalance };
        } catch (error: any) {
            console.error("Economy Charge Error:", error);
            return { success: false, error: error.message };
        }
    }
}
