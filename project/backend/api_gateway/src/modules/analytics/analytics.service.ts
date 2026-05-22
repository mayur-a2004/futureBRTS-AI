import { LandingIntent } from '../onboarding/landing.intent.model';
import LandingPage from '../landing/landing.model';
import StrategicAnalytic from './strategic.analytic.model';
import Feedback from './feedback.model';
import { logger } from '../../shared/utils/logger';

export const analyticsService = {
    // ... updateDailyHero ...

    // ❤️ LOG USER FEEDBACK
    logFeedback: async (data: {
        userId?: any,
        sessionId?: any,
        messageId: string,
        type: 'up' | 'down'
    }) => {
        try {
            await Feedback.create(data);
            logger.info(`Feedback ${data.type} logged for message ${data.messageId}`);
        } catch (err) {
            logger.error('Failed to log feedback', err);
        }
    },

    // 🧠 LOG STRATEGIC CHAT INTENT
    logChatTurn: async (data: {
        userId?: any,
        sessionId?: any,
        keywords: string[],
        intent: string,
        location?: { city?: string, region?: string, country?: string, ip?: string },
        device?: string
    }) => {
        try {
            await StrategicAnalytic.create({
                ...data,
                timestamp: new Date()
            });
            logger.info(`Strategic Analytic Logged for Session: ${data.sessionId}`);
        } catch (err) {
            logger.error('Failed to log chat turn analytic', err);
        }
    },

    // 📊 GET AGGREGATED INTELLIGENCE (For Admin)
    getIntelligenceData: async () => {
        try {
            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // 🏷️ Trending Keywords
            const keywordStats = await StrategicAnalytic.aggregate([
                { $match: { timestamp: { $gte: last30Days } } },
                { $unwind: "$keywords" },
                { $group: { _id: "$keywords", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]);

            // 📍 Location Stats
            const locationStats = await StrategicAnalytic.aggregate([
                { $group: { _id: "$location.city", count: { $sum: 1 }, country: { $first: "$location.country" } } },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]);

            // ❤️ Sentiment Stats
            const likes = await Feedback.countDocuments({ type: 'up' });
            const dislikes = await Feedback.countDocuments({ type: 'down' });

            // 💡 Intent Summary (Latest 10)
            const latestIntents = await StrategicAnalytic.find()
                .sort({ timestamp: -1 })
                .limit(10)
                .select('intent timestamp');

            return {
                keywords: keywordStats,
                locations: locationStats,
                intents: latestIntents,
                sentiment: { likes, dislikes }
            };
        } catch (err) {
            logger.error('Failed to fetch intelligence data', err);
            return null;
        }
    },

    updateDailyHero: async () => {
        // ... (existing logic)
        try {
            // 👉 Pichle 24 ghante ke intents nikalna
            const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const intents = await LandingIntent.find({ createdAt: { $gt: lastDay } });

            if (intents.length === 0) return;

            // 👉 Keywords aggregation (Word Frequency Count)
            const words = intents.flatMap(i => i.intentText.toLowerCase().split(/\s+/));
            const frequencyMap: Record<string, number> = {};
            words.forEach(word => {
                if(word.length > 3) { // Ignore small words like of, the, etc.
                    frequencyMap[word] = (frequencyMap[word] || 0) + 1;
                }
            });
            const primaryKeyword = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a])[0];

            // 👉 Subtitle updates mapping
            const cleanKeyword = primaryKeyword || 'tomorrow';
            const newSubtitle = `Empowering your journey in ${cleanKeyword}.`;
            await LandingPage.findOneAndUpdate({ page: 'home' }, { 'hero.subtitle': newSubtitle });

            logger.info('Daily landing hero updated based on intents');
        } catch (err) {
            logger.error('Failed to update daily hero', err);
        }
    }
};
