import { Request, Response } from 'express';
import { OnboardingProfile } from './onboarding.model';
import User from '../auth/user.model';

export const onboardingController = {
    // POST /onboarding/save-step
    async saveStep(req: any, res: Response) {
        try {
            const userId = req.user!.id;
            const data = req.body; // Partial update

            // Update user status
            await User.findByIdAndUpdate(userId, { onboarding_status: 'IN_PROGRESS' });

            // Upsert Context
            const profile = await OnboardingProfile.findOneAndUpdate(
                { userId },
                { userId, ...data },
                { new: true, upsert: true }
            );

            res.json({ success: true, profile });
        } catch (error) {
            console.error('Save Step Error:', error);
            res.status(500).json({ success: false, message: 'Failed to save step' });
        }
    },

    // GET /onboarding/status
    async getStatus(req: any, res: Response) {
        try {
            const userId = req.user!.id;

            const user = await User.findById(userId);
            const profile = await OnboardingProfile.findOne({ userId });

            res.json({
                success: true,
                status: user?.onboarding_status || 'NOT_STARTED',
                profile
            });
        } catch (error) {
            console.error('Get Status Error:', error);
            res.status(500).json({ success: false, message: 'Failed to get status' });
        }
    },

    // POST /onboarding/complete
    async complete(req: any, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                console.error("Complete Onboarding: No user in request");
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const userId = req.user.id;
            console.log(`[Onboarding] Completing for user: ${userId}`);

            // Mark User as DONE
            const updatedUser = await User.findByIdAndUpdate(userId, {
                onboarding_status: 'DONE',
                onboardingCompleted: true
            }, { new: true });

            if (!updatedUser) {
                console.error(`[Onboarding] User not found during completion: ${userId}`);
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            console.log(`[Onboarding] Success. User status: ${updatedUser.onboarding_status}`);

            res.json({ success: true, message: 'Onboarding completed' });
        } catch (error: any) {
            console.error('[Onboarding] Complete Error:', error);
            res.status(500).json({ success: false, message: 'Failed to complete', error: error.message, stack: error.stack });
        }
    },

    // Legacy Support
    async submitAnswer(req: any, res: Response) {
        return onboardingController.saveStep(req, res);
    },

    async getResults(req: any, res: Response) {
        return onboardingController.getStatus(req, res);
    }
};
