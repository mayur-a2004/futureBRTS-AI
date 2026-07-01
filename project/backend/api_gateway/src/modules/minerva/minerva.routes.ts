import express from 'express';
import { minervaController } from './minerva.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Setup Multer for Minerva student uploads
const uploadDir = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ─── PROFILE ───────────────────────────────────
router.get('/profile', authMiddleware, minervaController.getProfile);
router.put('/profile', authMiddleware, minervaController.updateProfile);

// ─── DASHBOARD / STATS ─────────────────────────
router.get('/stats', authMiddleware, minervaController.getStats);

// ─── CHAT (Main entry point) ───────────────────
router.post('/chat', authMiddleware, minervaController.chat);
router.get('/chat/history', authMiddleware, minervaController.getChatHistory);
router.get('/chat/sessions', authMiddleware, minervaController.getChatSessions);
router.post('/chat/session', authMiddleware, minervaController.createChatSession);
router.get('/chat/session/:id', authMiddleware, minervaController.getChatSessionMessages);
router.put('/chat/session/:id', authMiddleware, minervaController.renameChatSession);
router.delete('/chat/session/:id', authMiddleware, minervaController.deleteChatSession);
router.put('/chat/session/:id/pin', authMiddleware, minervaController.togglePinChatSession);
router.post('/upload', authMiddleware, upload.single('file'), minervaController.uploadFile);

// ─── SESSIONS ──────────────────────────────────
router.get('/sessions', authMiddleware, minervaController.getSessions);
router.get('/session/:id', authMiddleware, minervaController.getSession);

// ─── LEARNING (Node/Topic) ──────────────────────
router.post('/node/:id/learn', authMiddleware, minervaController.learnNode);
router.put('/node/:id/priority', authMiddleware, minervaController.updateNodePriority);

// ─── TASKS / HOMEWORK ──────────────────────────
router.post('/task/:id/submit', authMiddleware, minervaController.submitTask);
router.get('/homework/today', authMiddleware, minervaController.getTodayHomework);
router.get('/tasks/list', authMiddleware, minervaController.getTasks);

// ─── E-BUILDER ─────────────────────────────────
router.post('/builder/generate', authMiddleware, minervaController.generateMaterial);

// ─── TRANSLATOR ──────────────────────────────
router.post('/translate', authMiddleware, minervaController.translateText);

// ─── EXAMS ─────────────────────────────────────
router.get('/exams', authMiddleware, minervaController.getExams);
router.post('/exam/generate', authMiddleware, minervaController.generateExam);
router.get('/exam/:id', authMiddleware, minervaController.getExam);
router.post('/exam/:id/submit', authMiddleware, minervaController.submitExam);

// ─── VIRTUAL LAB ────────────────────────────────
router.get('/lab/youtube-search', authMiddleware, minervaController.labYoutubeSearch);

export default router;

