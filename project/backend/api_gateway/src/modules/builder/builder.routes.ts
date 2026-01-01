import express from 'express';
import { builderController } from './builder.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

// Session Management
router.post('/session', authMiddleware, builderController.createSession);
router.get('/sessions', authMiddleware, builderController.getSessions);
router.get('/session/:id', authMiddleware, builderController.getSession);

// Chat & Messaging
router.post('/session/:id/message', authMiddleware, builderController.addMessage);

export default router;
