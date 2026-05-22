import express from 'express';
import { adminController } from './admin.controller';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

// Apply Auth and Admin Middleware to ALL Admin Routes
router.use(authMiddleware);
router.use(adminMiddleware);

// 👥 User Management
router.get('/users', adminController.getAllUsers);
router.put('/user', adminController.updateUserStatus);

// ⚙️ System Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSetting);
router.post('/settings/batch', adminController.updateSettingBatch);

// 🗺️ Roadmap Management
router.get('/roadmaps', adminController.getAllRoadmaps);

// 🎯 Task Management
router.get('/tasks', adminController.getAllTasks);

// 📊 Tracking & Logs
router.get('/tracking', adminController.getTrackingLogs);

// 💳 Payment Gateway Management
router.get('/gateways', adminController.getGateways);
router.post('/gateways', adminController.updateGateway);

// 💳 Pricing Plans Management
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.updatePlan);

// 📊 Global Stats
router.get('/stats', adminController.getSystemStats);
router.get('/intelligence', adminController.getIntelligenceAnalytics);
router.post('/broadcast', adminController.sendBroadcast);

// 💳 Economy & Finance Hub
router.get('/transactions', adminController.getTransactions);
router.post('/inject-tokens', adminController.injectTokensGlobal);

// 🕵️ Traffic & Surveillance
router.get('/visitors', adminController.getVisitors);
router.post('/track-visitor', adminController.trackVisitor);

// 💬 Neural Chat Monitor
router.get('/chats', adminController.getChatLogs);

// 🏆 Project Registry
router.get('/projects', adminController.getAllCollageProjects);

// 🔍 Deep Inspection (New)
router.get('/user/:userId', adminController.getUserFullDetail);
router.get('/session/:sessionId/messages', adminController.getSessionMessages);
router.get('/seo-analytics', adminController.getSEOKeywordAnalytics);

// 🛡️ Advanced Config (New)
router.post('/settings/ai', adminController.updateAISettings);
router.post('/settings/payment-gateway', adminController.updatePaymentGatewayConfig);

// 🗺️🎯✅ Full Pipeline: Chat → Roadmap → Task → VIVA Verification
router.get('/pipeline', adminController.getChatRoadmapTaskOverview);

export default router;

