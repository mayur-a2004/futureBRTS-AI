import express from 'express';
import { builderController } from './builder.controller';
import { summaryController } from './summary.controller';
import { authMiddleware, guestOrAuthMiddleware } from '../../shared/middleware/auth.middleware';
import { tokenGuard } from '../../shared/middleware/token.middleware';

const router = express.Router();

// Session Management
router.get('/dashboard', authMiddleware, builderController.getDashboardStats); // New
router.post('/session', guestOrAuthMiddleware, builderController.createSession);
router.get('/sessions', authMiddleware, builderController.getSessions);
router.get('/session/:id', guestOrAuthMiddleware, builderController.getSession);
router.delete('/session/:id', authMiddleware, builderController.deleteSession);
router.put('/session/:id/pin', authMiddleware, builderController.togglePinSession);

// Chat & Messaging
router.post('/session/:id/message', guestOrAuthMiddleware, builderController.addMessage);
router.post('/session/:id/message/stream', guestOrAuthMiddleware, builderController.addMessageStream);
router.post('/message/:messageId/feedback', authMiddleware, builderController.logMessageFeedback);
router.put('/session/:id', authMiddleware, builderController.renameSession);
router.get('/search-doc', builderController.searchDocLink);

// Summary & Intent
router.post('/summary/generate', authMiddleware, summaryController.generate);
router.post('/summary/confirm', authMiddleware, summaryController.confirm);

export default router;
