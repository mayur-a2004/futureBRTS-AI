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

import { fastApiCache } from './shared/middleware/fast_cache.middleware';

const app = express();

// ⚡ Ultra-Fast 0.001s RAM Cache for 400+ Users
app.use(fastApiCache);

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
import fs from 'fs';
app.use('/downloads', express.static(path.join(__dirname, '../../public/downloads')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 🔍 GOOGLEBOT & SEARCH ENGINE ROOT ASSETS HANDLERS
const frontendPublicPath = path.join(__dirname, '../../../frontend/public');
app.get('/favicon.ico', (req, res) => {
    const icoPath = path.join(frontendPublicPath, 'favicon.ico');
    if (fs.existsSync(icoPath)) res.type('image/x-icon').sendFile(icoPath);
    else res.status(404).end();
});
app.get('/favicon.png', (req, res) => {
    const pngPath = path.join(frontendPublicPath, 'favicon.png');
    if (fs.existsSync(pngPath)) res.type('image/png').sendFile(pngPath);
    else res.status(404).end();
});
app.get('/logo.png', (req, res) => {
    const logoPath = path.join(frontendPublicPath, 'logo.png');
    if (fs.existsSync(logoPath)) res.type('image/png').sendFile(logoPath);
    else res.status(404).end();
});
app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(frontendPublicPath, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) res.type('text/xml').sendFile(sitemapPath);
    else res.status(404).end();
});
app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(frontendPublicPath, 'robots.txt');
    if (fs.existsSync(robotsPath)) res.type('text/plain').sendFile(robotsPath);
    else res.status(404).end();
});
app.get('/llms.txt', (req, res) => {
    const llmsPath = path.join(frontendPublicPath, 'llms.txt');
    if (fs.existsSync(llmsPath)) res.type('text/plain').sendFile(llmsPath);
    else res.status(404).end();
});

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
app.use('/api/v1/minerva', minervaRoutes);
app.use('/api/future-education', minervaRoutes);
console.log('✅ Routes Mounted: /api/minerva, /api/v1/minerva & /api/future-education');

import examGeneratorRoutes from './modules/exam_generator/exam_generator.routes';
app.use('/api/exam', examGeneratorRoutes);
console.log('✅ Routes Mounted: /api/exam');

import tenantRoutes from './modules/tenant/tenant.routes';
app.use('/api/tenant', tenantRoutes);
app.use('/api/v1/tenant', tenantRoutes);
console.log('✅ Routes Mounted: /api/tenant & /api/v1/tenant');

import teacherPortalRoutes from './modules/tenant/teacher_portal.routes';
app.use('/api/v1/teacher-workspace', teacherPortalRoutes);
app.use('/api/auth/teacher', teacherPortalRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/onboarding', onboardingRoutes);
console.log('✅ Routes Mounted: /api/v1/onboarding & /api/onboarding');

// 🤖 EMBEDDABLE FUTURE AI ASSISTANT WEB SDK FOR SCHOOL ERP INTEGRATION
app.get('/sdk/future-ai.js', (req, res) => {
  res.type('application/javascript').send(`
(function() {
  console.log('🚀 [Future AI OS SDK] Initialized for School ERP');
  const scriptTag = document.currentScript;
  const tenantId = scriptTag?.getAttribute('data-tenant') || 'mount_carmel_school';
  const apiKey = scriptTag?.getAttribute('data-api-key') || 'fbrts_master_live_key_99x8273645';
  const gatewayUrl = scriptTag?.getAttribute('data-gateway') || 'http://localhost:7001';

  // Inject CSS Styles
  const style = document.createElement('style');
  style.innerHTML = \`
    #future-ai-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 60px; height: 60px; rounded-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #9333ea);
      border: 2px solid rgba(255,255,255,0.2); border-radius: 50%;
      box-shadow: 0 10px 25px rgba(79,70,229,0.5); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s ease; color: white; font-size: 26px;
    }
    #future-ai-widget-btn:hover { transform: scale(1.1); }
    #future-ai-chat-box {
      position: fixed; bottom: 95px; right: 24px; z-index: 999999;
      width: 380px; height: 520px; background: #09090b; color: white;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8); display: none;
      flex-direction: column; overflow: hidden; font-family: system-ui, sans-serif;
    }
    .fai-header {
      padding: 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .fai-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; font-size: 13px; }
    .fai-msg-user { align-self: flex-end; background: #4f46e5; padding: 10px 14px; border-radius: 16px 16px 2px 16px; max-width: 80%; }
    .fai-msg-ai { align-self: flex-start; background: rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 16px 16px 16px 2px; max-width: 85%; }
    .fai-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px; }
    .fai-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 10px 14px; border-radius: 12px; color: white; outline: none; font-size: 13px; }
    .fai-send { background: #4f46e5; border: none; padding: 10px 16px; border-radius: 12px; color: white; font-weight: bold; cursor: pointer; }
  \`;
  document.head.appendChild(style);

  // Inject HTML Elements
  const btn = document.createElement('div');
  btn.id = 'future-ai-widget-btn';
  btn.innerHTML = '🤖';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'future-ai-chat-box';
  box.innerHTML = \`
    <div class="fai-header">
      <strong style="font-size:14px; color:#a5b4fc;">🤖 Future AI Education Assistant</strong>
      <span id="fai-close" style="cursor:pointer; font-weight:bold; color:#a1a1aa;">✕</span>
    </div>
    <div class="fai-body" id="fai-body">
      <div class="fai-msg-ai">Hello! I am Future Education AI integrated into your School ERP. Ask me anything about syllabus, homework, or studies!</div>
    </div>
    <div class="fai-footer">
      <input type="text" id="fai-input" class="fai-input" placeholder="Type study question..." />
      <button id="fai-send" class="fai-send">Send</button>
    </div>
  \`;
  document.body.appendChild(box);

  // Event Listeners
  btn.onclick = () => { box.style.display = box.style.display === 'flex' ? 'none' : 'flex'; };
  document.getElementById('fai-close').onclick = () => { box.style.display = 'none'; };

  const sendMsg = async () => {
    const input = document.getElementById('fai-input');
    const txt = input.value.trim();
    if (!txt) return;
    input.value = '';

    const body = document.getElementById('fai-body');
    body.innerHTML += \`<div class="fai-msg-user">\${txt}</div>\`;
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch(\`\${gatewayUrl}/api/v1/tenant/ai-tutor-chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Org-ID': tenantId, 'X-API-Key': apiKey },
        body: JSON.stringify({ prompt: txt, tenantId: tenantId, studentName: 'ERP Student' })
      });
      const data = await res.json();
      if (data.success) {
        body.innerHTML += \`<div class="fai-msg-ai">\${data.reply}</div>\`;
      } else {
        body.innerHTML += \`<div class="fai-msg-ai" style="background:#881337; color:#fecdd3;">\${data.error || 'Permission Denied'}</div>\`;
      }
    } catch(err) {
      body.innerHTML += \`<div class="fai-msg-ai" style="background:#881337; color:#fecdd3;">Connection error to Future AI Gateway.</div>\`;
    }
    body.scrollTop = body.scrollHeight;
  };

  document.getElementById('fai-send').onclick = sendMsg;
  document.getElementById('fai-input').onkeypress = (e) => { if (e.key === 'Enter') sendMsg(); };
})();
  `);
});


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

// Public Guest Mode Chat Endpoint
app.post('/api/guest/chat', async (req, res) => {
    try {
        const { message, attachments, history, guestSessionId } = req.body;
        const userPrompt = message?.trim() || (attachments?.length ? 'Please analyze the attached files/media.' : '');
        if (!userPrompt) {
            res.status(400).json({ success: false, error: 'Message or attachment is required' });
            return;
        }

        let userContentParts: any[] = [{ type: 'text', text: userPrompt }];
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            for (const att of attachments) {
                const previewStr = att.preview || att.url;
                if (!previewStr || typeof previewStr !== 'string') continue;

                const match = previewStr.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                    const mimeType = match[1];
                    const base64Data = match[2];
                    if (mimeType.startsWith('image/')) {
                        userContentParts.push({
                            type: 'image_url',
                            image_url: { url: previewStr }
                        });
                    } else {
                        userContentParts.push({
                            type: 'file_attachment',
                            mime_type: mimeType,
                            name: att.name || 'attachment',
                            base64: base64Data
                        });
                    }
                } else if (previewStr.startsWith('http://') || previewStr.startsWith('https://')) {
                    userContentParts.push({
                        type: 'text',
                        text: `[Attached Link/Resource: ${att.name || 'Link'} (${previewStr})]`
                    });
                }
            }
        }
        const userContent = userContentParts.length === 1 ? userPrompt : userContentParts;

        const { getProviderResponse } = require('./shared/services/openai.service');
        const formattedMessages = [
            {
                role: 'system',
                content: `You are Future BRTS AI — an elite, 10X human senior tech co-founder & elder brother ('Bhai') for guest users.
Be super warm, intelligent, logical, and helpful.
If asked for code, output 90%+ accurate complete code.
If asked for news/videos/products, output YouTube links (e.g. [Watch Video](https://www.youtube.com/watch?v=...)), Amazon/Flipkart product pills, and verified domain sources.
EVERY response MUST end with ||SUGGESTIONS_JSON|| ["Action 1", "Action 2", "Action 3"].`
            },
            ...(Array.isArray(history) ? history.slice(-6).map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content
            })) : []),
            { role: 'user', content: userContent }
        ];

        const aiResult = await getProviderResponse(formattedMessages, { temperature: 0.7 });
        let replyText = aiResult?.choices?.[0]?.message?.content || "Hey! Future BRTS AI here. How can I help you build or learn today?";

        if (!replyText.includes('||SUGGESTIONS_JSON||')) {
            replyText += '\n\n||SUGGESTIONS_JSON|| ["Explore Education OS", "Build Fullstack App", "Ask Coding Doubt"]';
        }

        res.json({ success: true, response: replyText });
    } catch (err: any) {
        console.error('[Guest Chat API Error]', err);
        res.status(500).json({ success: false, error: 'Neural link busy. Please retry.' });
    }
});

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
