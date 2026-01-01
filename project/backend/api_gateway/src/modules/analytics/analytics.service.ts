// 👉 Analytics service jo dynamic content generation handle karti hai
// 👉 Isme logic aggregated intents se keywords nikalne ka hai

import LandingIntent from './intent.model';
import LandingPage from '../landing/landing.model';
import { logger } from '../../shared/utils/logger';

export const analyticsService = {
    updateDailyHero: async () => {
        try {
            // 👉 Pichle 24 ghante ke intents nikalna
            const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const intents = await LandingIntent.find({ createdAt: { $gt: lastDay } });

            if (intents.length === 0) return;

            // 👉 Keywords aggregation (Dummy Logic)
            const combinedText = intents.map(i => i.text).join(' ');
            const primaryKeyword = combinedText.split(' ').sort((a, b) => b.length - a.length)[0];

            // 👉 Landing page update karna
            const newSubtitle = `Empowering your journey in ${primaryKeyword || 'tomorrow'}.`;
            await LandingPage.findOneAndUpdate({ page: 'home' }, { 'hero.subtitle': newSubtitle });

            logger.info('Daily landing hero updated based on intents');
        } catch (err) {
            logger.error('Failed to update daily hero', err);
        }
    }
};
