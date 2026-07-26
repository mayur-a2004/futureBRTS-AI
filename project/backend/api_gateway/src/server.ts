// 👉 Future BRTS main server file
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
import { seedService } from './shared/services/seed.service';

// 👉 Routes imports
import landingRoutes from './modules/landing/landing.routes';
import authRoutes from './modules/auth/auth.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import roadmapRoutes from './modules/roadmap/roadmap.routes';
import builderRoutes from './modules/builder/builder.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import economyRoutes from './modules/economy/economy.routes';
import uploadRoutes from './api/upload.routes'; // 👈 Import Upload Routes
import predictionRoutes from './modules/prediction/prediction.routes';
import collageProjectRoutes from './modules/collage_project/collage_project.routes';
import guestRoutes from './modules/guest/guest.routes';
import growthRoutes from './modules/growth/growth.routes';
import warRoomRoutes from './modules/war_room/war_room.routes';
import { tokenGuard } from './shared/middleware/token.middleware';
import minervaRoutes from './modules/minerva/minerva.routes';

import { globalLimiter, securityShield, hardenedHelmet } from './shared/middleware/security.shield';
import { layer7WafSentinel } from './shared/middleware/layer7_firewall.middleware';

dotenv.config();
console.log(`[Config] JWT_SECRET: ${process.env.JWT_SECRET ? 'SET (' + process.env.JWT_SECRET.substring(0, 3) + '...)' : 'MISSING'}`);
console.log(`[Config] MONGO_URI: ${process.env.MONGO_URI ? 'SET' : 'MISSING'}`);
console.log(`[Config] AI_MODE: ${process.env.AI_MODE}`);

const app = express();

// 👉 7-LAYER WEB APPLICATION FIREWALL SENTINEL (WAF)
app.use(hardenedHelmet); // L1: Headers & CSP
app.use(globalLimiter);   // L1: DDOS Protection / Rate Limiting
app.use(securityShield); // L2: Injection & Bot Protection
app.use(layer7WafSentinel); // L1-L7: Full WAF & Emergency Alert Sentinel (7859822561)

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());

// Serve static compiled assets like ZIP and PDF
import path from 'path';
app.use('/downloads', express.static(path.join(__dirname, '../../public/downloads')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 👉 GLOBAL REQUEST LOGGER (Enhanced)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// 👉 Routes mapping
app.use('/api/landing', landingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/economy', economyRoutes);
app.use('/api/prediction', predictionRoutes);
console.log('✅ Routes Mounted: /api/prediction');

app.use('/api/collage-project', collageProjectRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/war-room', warRoomRoutes);
console.log('✅ Routes Mounted: /api/war-room');

// 🎓 MINERVA & FUTURE EDUCATION OS MODULE
app.use('/api/minerva', minervaRoutes);
app.use('/api/future-education', minervaRoutes);
console.log('✅ Routes Mounted: /api/minerva & /api/future-education');

import examGeneratorRoutes from './modules/exam_generator/exam_generator.routes';
app.use('/api/exam', examGeneratorRoutes);
console.log('✅ Routes Mounted: /api/exam');

import adminRoutes from './modules/admin/admin.routes';
app.use('/api/admin', adminRoutes);
import jobsRoutes from './api/jobs.routes';

app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobsRoutes);

// 🔍 DYNAMIC SEO, ROBOTS.TXT, SITEMAP.XML, LLMS.TXT & AI CRAWLER ENDPOINTS
import SystemSettings from './modules/admin/settings.model';
import ContactInquiry from './modules/minerva/models/contact_inquiry.model';

app.get('/robots.txt', async (req, res) => {
    try {
        const setting = await SystemSettings.findOne({ key: 'SEO_ROBOTS_TXT' });
        if (setting && setting.value) {
            res.type('text/plain').send(setting.value);
            return;
        }
    } catch (e) {}

    const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Slurp
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexBot
Allow: /

User-agent: GrokBot
Allow: /

Sitemap: https://futurebrts.com/sitemap.xml`;
    res.type('text/plain').send(defaultRobots);
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        const setting = await SystemSettings.findOne({ key: 'SEO_SITEMAP_XML' });
        if (setting && setting.value) {
            res.type('application/xml').send(setting.value);
            return;
        }
    } catch (e) {}

    const pages = ['', 'features', 'pricing', 'about', 'services', 'how-it-works', 'careers-public', 'contact', 'guest-chat', 'future-education'];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>https://futurebrts.com/${p}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.type('application/xml').send(sitemap);
});

// LLM AI Crawlers Standard Format (ChatGPT, Gemini, Grok, Claude, Perplexity)
const renderLLMsTxt = async (req: express.Request, res: express.Response) => {
    try {
        const setting = await SystemSettings.findOne({ key: 'SEO_LLMS_TXT' });
        if (setting && setting.value) {
            res.type('text/plain').send(setting.value);
            return;
        }
    } catch (e) {}

    const defaultLLMs = `# Future BRTS - Neural Career Architect & AI Education OS
> The world's most advanced AI-powered career roadmap builder, full-stack app generator, and virtual science lab ecosystem.

## Key Features & Platform Capabilities
- **Future Education OS (Minerva AI Tutor)**: Interactive 3D molecular models, virtual physics/chemistry labs, board exam roadmaps (Class 1-12 & Higher Ed College Degrees).
- **E-Builder Workshop**: Natural language full-stack web app, database schema, and route generator.
- **Smart Touch Whiteboard**: Auto-handwritten math/physics step derivation with 2-way touch canvas.
- **Official Board Alignment**: 34+ Central & State Boards (CBSE, GSEB, UPMSP, BSEB, Maharashtra Board) in 14+ Indian languages.

## Canonical URLs
- Home: https://futurebrts.com/
- Features: https://futurebrts.com/features
- Education OS: https://futurebrts.com/future-education
- Roadmaps: https://futurebrts.com/future-education/roadmaps
- Pricing & Pro: https://futurebrts.com/pricing
- Contact: https://futurebrts.com/contact
`;
    res.type('text/plain').send(defaultLLMs);
};

app.get('/llms.txt', renderLLMsTxt);
app.get('/llms-full.txt', renderLLMsTxt);
app.get('/.well-known/llms.txt', renderLLMsTxt);

// Public Contact Form Submission Endpoint
app.post('/api/public/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
            return;
        }
        const inquiry = await ContactInquiry.create({ name, email, phone, subject, message, status: 'UNREAD' });
        res.json({ success: true, message: 'Inquiry submitted successfully! Our team will contact you shortly.', inquiryId: inquiry._id });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Admin Inquiries Endpoint
app.get('/api/admin/inquiries', async (req, res) => {
    try {
        const inquiries = await ContactInquiry.find().sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, inquiries });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.patch('/api/admin/inquiries/:id', async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const updated = await ContactInquiry.findByIdAndUpdate(req.params.id, { status, admin_notes }, { new: true });
        res.json({ success: true, inquiry: updated });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 👉 Global error handler
app.use(errorHandler);

// 👉 Server startup logic
import { createServer } from 'http';
import { SocketService } from './services/socket.service';

const startServer = async () => {
    try {
        // 🛡️ DB Connection is non-blocking now: server starts even if MongoDB is down
        connectDB(); // Fire-and-forget with internal retry loop

        // Seed data only if DB is available (wrapped to prevent startup block)
        try {
            await seedService.seedInitialData();
        } catch (seedErr: any) {
            console.warn('⚠️ [Seed] Skipping seed data — DB not ready yet:', seedErr.message);
        }

        initCronJobs();
        const { initSrsCronJobs } = require('./jobs/srsReminder.cron');
        initSrsCronJobs();

        const PORT = Number(process.env.PORT) || 7001;

        // Boost: Create HTTP Server for Socket Support
        const httpServer = createServer(app);
        SocketService.init(httpServer);

        // 🛡️ HTTP SERVER ERROR RECOVERY
        httpServer.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is BUSY. Backend will auto-retry in 5s...`);
                setTimeout(() => {
                    httpServer.close();
                    httpServer.listen(PORT, '0.0.0.0');
                }, 5000);
            } else {
                logger.error('🚨 [HTTP] Unexpected Server Error:', err);
            }
        });

        httpServer.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 Future BRTS API started on port ${PORT} (IPv4 Only)`);
            logger.info(`⚡ Socket Service Initialized`);

            // --- NEURAL POST-BOOT ORCHESTRATION ---
            // Slightly delayed to ensure port is stable and DB buffering is ready
            setTimeout(() => {
                try {
                    const { initOpenAIService } = require('./shared/services/openai.service');
                    initOpenAIService();

                    const { InnovationSystem } = require('./services/innovation.system');
                    InnovationSystem.startHeartbeat();
                    logger.info('🧠 High-Fidelity Background Systems Active.');
                } catch (err) {
                    logger.error('Background System Initialization Failed (Post-Boot)', err);
                }
            }, 2000);
        });

        // 🛡️ SUPREME STABILITY LAYER: Global Process Listeners
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('CRITICAL: Unhandled Promise Rejection', { reason });
        });

        process.on('uncaughtException', (err) => {
            logger.error('CRITICAL: Uncaught Exception Detected', err);
            // If it's a critical error not caught by express or our logic, we log it.
            // In dev mode with ts-node-dev, we might NOT want to exit to keep the watcher alive.
            if (process.env.NODE_ENV !== 'development') {
                setTimeout(() => process.exit(1), 2000);
            }
        });

    } catch (err: any) {
        logger.error('STABILITY ALERT: Fatal Startup Error', err);
        // Wait and exit so ts-node-dev can try again
        setTimeout(() => process.exit(1), 5000);
    }
};

startServer();
