import { Request, Response } from 'express';
import { OnboardingProfile } from './onboarding.model';
import User from '../auth/user.model';

export const onboardingController = {
    // POST /onboarding/save-step
    async saveStep(req: any, res: Response) {
        try {
            const userId = req.user!.id;
            const data = {
                field: req.body.field,
                life_stage: req.body.life_stage,
                final_goal: req.body.final_goal,
                phase: req.body.phase,
                problem: req.body.problem,
                project_level: req.body.project_level,
                target_outcome: req.body.target_outcome,
                future_interest: req.body.future_interest
            };
            // Rule: Onboarding is ONE TIME ONLY.
            const existingProfile = await OnboardingProfile.findOne({ userId });
            if (existingProfile && existingProfile.onboardingCompleted) {
                return res.json({ success: true, message: "Onboarding already completed. Ignoring update.", profile: existingProfile });
            }

            // Update user status
            await User.findByIdAndUpdate(userId, { onboarding_status: 'IN_PROGRESS' });

            // Clean data
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

            // Upsert Context
            const profile = await OnboardingProfile.findOneAndUpdate(
                { userId },
                { $set: cleanData },
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
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const {
                sessionId,
                field,
                final_goal,
                future_interest,
                life_stage,
                phase,
                problem,
                project_level,
                target_outcome,
            } = req.body;

            const userId = req.user.id;
            console.log(`[Onboarding] Completing for user: ${userId}`);

            // Build dynamic update object to avoid overwriting existing data with undefined
            const updateData: any = {
                onboardingCompleted: true,
                completedAt: new Date()
            };

            const fields = [
                'sessionId', 'field', 'final_goal', 'future_interest', 
                'life_stage', 'phase', 'problem', 'project_level', 'target_outcome'
            ];

            fields.forEach(f => {
                if (req.body[f] !== undefined) {
                    updateData[f] = req.body[f];
                }
            });

            // 1. Create/Update Onboarding Profile
            const profile = await OnboardingProfile.findOneAndUpdate(
                { userId },
                { $set: updateData },
                { new: true, upsert: true }
            );

            // 2. Mark User as DONE (Legacy flag)
            await User.findByIdAndUpdate(userId, {
                onboarding_status: 'DONE',
                onboardingCompleted: true
            });

            res.json({
                success: true,
                onboardingProfileId: profile._id,
                status: "saved"
            });

        } catch (error: any) {
            console.error('[Onboarding] Complete Error:', error);
            res.status(500).json({ success: false, message: 'Failed to complete', error: error.message });
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
