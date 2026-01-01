// 👉 Daily landing page updater hub (Simple Stub for now)
// 👉 Isme logic pichle intents ko aggregate karke hero update karne ka hai

import { analyticsService } from '../modules/analytics/analytics.service';
import { logger } from '../shared/utils/logger';

export const initCronJobs = () => {
    // 👉 Feature Flag Check (Default: Disabled)
    if (process.env.ENABLE_LANDING_CRON !== 'true') {
        logger.info('Skipping Daily Landing Update Cron (Disabled via ENV)');
        return;
    }

    logger.info('Initializing Future-ready Cron Stubs...');

    // 👉 Har 24 ghante me ek baar update (Simple interval instead of node-cron)
    setInterval(async () => {
        logger.info('Running daily landing page update task...');
        await analyticsService.updateDailyHero();
    }, 24 * 60 * 60 * 1000);
};
