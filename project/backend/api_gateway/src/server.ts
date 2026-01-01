// 👉 FutureBuilder main server file
// 👉 Isme saare modules, routes aur global middlewares connect kiye gaye hain

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './shared/error/error.handler';
import { logger } from './shared/utils/logger';
import { initCronJobs } from './jobs/dailyLandingUpdate.cron';
import { seedLandingData } from './seed/seedLanding';

// 👉 Routes imports
import landingRoutes from './modules/landing/landing.routes';
import authRoutes from './modules/auth/auth.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import roadmapRoutes from './modules/roadmap/roadmap.routes';
import builderRoutes from './modules/builder/builder.routes';

dotenv.config();

const app = express();

// 👉 Basic security and parsing middlewares
app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // For easier dev, restrict in prod
}));

// 👉 Routes mapping
app.use('/api/landing', landingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/roadmap', roadmapRoutes);

// 👉 Global error handler
app.use(errorHandler);

// 👉 Server startup logic
const startServer = async () => {
    try {
        await connectDB();
        // await seedLandingData();
        initCronJobs();

        const PORT = process.env.PORT || 7000;
        app.listen(PORT, () => {
            logger.info(`🚀 FutureBuilder API started on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server', err);
        process.exit(1);
    }
};

startServer();
