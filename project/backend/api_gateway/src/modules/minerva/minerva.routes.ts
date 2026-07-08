// Trigger reload 2
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
router.get('/session/:id/certificate', authMiddleware, minervaController.generateCertificate);

// ─── LEARNING (Node/Topic) ──────────────────────
router.post('/node/:id/learn', authMiddleware, minervaController.learnNode);
router.post('/node/:id/regenerate', authMiddleware, minervaController.regenerateNodeContent);
router.put('/node/:id/priority', authMiddleware, minervaController.updateNodePriority);

// ─── TASKS / HOMEWORK ──────────────────────────
router.post('/task/:id/submit', authMiddleware, minervaController.submitTask);
router.post('/task/custom', authMiddleware, upload.single('attachment'), minervaController.createCustomTask);
router.get('/homework/today', authMiddleware, minervaController.getTodayHomework);
router.get('/tasks/list', authMiddleware, minervaController.getTasks);
router.get('/review/due', authMiddleware, minervaController.getDueReviews);

// ─── E-BUILDER ─────────────────────────────────
router.post('/builder/generate', authMiddleware, minervaController.generateMaterial);
router.get('/builder/history', authMiddleware, minervaController.getMaterialHistory);

// ─── TRANSLATOR ──────────────────────────────
router.post('/translate', authMiddleware, minervaController.translateText);

// ─── EXAMS ─────────────────────────────────────
router.get('/exams', authMiddleware, minervaController.getExams);
router.post('/exam/generate', authMiddleware, minervaController.generateExam);
router.get('/exam/:id', authMiddleware, minervaController.getExam);
router.post('/exam/:id/submit', authMiddleware, minervaController.submitExam);
router.post('/exam/:id/appeal', authMiddleware, minervaController.appealExamQuestion);
router.get('/leaderboard', authMiddleware, minervaController.getLeaderboard);

// ─── VIRTUAL LAB ────────────────────────────────
router.get('/lab/youtube-search', authMiddleware, minervaController.labYoutubeSearch);
router.get('/lab/sketchfab-search', authMiddleware, minervaController.labSketchfabSearch);

// ─── PARENT VERIFICATION & PORTAL ────────────────
import { parentController } from './parent.controller';
router.put('/parent/details', authMiddleware, minervaController.updateParentDetails);
router.get('/parent/verify', minervaController.verifyParentEmail);
router.post('/parent/resend-verification', authMiddleware, minervaController.resendParentVerification);
router.get('/parent/report/:studentEmail', parentController.getStudentReport);

// ─── PYTHON CODE EXECUTION ───────────────────────
router.post('/lab/execute-python', authMiddleware, minervaController.executePythonCode);

// ─── QUIZ ARENA (Team Battle) ──────────────────────────────
import { battleController } from './battle.controller';
router.post('/battle/room', authMiddleware, battleController.createRoom);
router.post('/battle/room/join', authMiddleware, battleController.joinRoom);
router.post('/battle/room/leave', authMiddleware, battleController.leaveRoom);
router.get('/battle/active', authMiddleware, battleController.myActiveRoom);
router.get('/battle/room/:roomCode', authMiddleware, battleController.getRoom);
router.get('/battle/rooms', authMiddleware, battleController.listActiveRooms);
router.get('/battle/room/:roomCode/monitor', authMiddleware, battleController.monitorRoom);
router.get('/battle/daily-status', authMiddleware, battleController.getDailyChallengeStatus);
router.post('/battle/normalize-topic', authMiddleware, battleController.normalizeTopic);
router.get('/battle/teacher/rooms', authMiddleware, battleController.listTeacherRooms);
router.get('/battle/teacher/room/:roomCode/results', authMiddleware, battleController.classroomResults);
router.get('/battle/teacher/search-students', authMiddleware, battleController.searchStudents);


// ─── SCHOOL LEADERBOARD (Public + City-filtered) ───────────────────────────
router.get('/school/leaderboard', battleController.getSchoolLeaderboard); // Public — no auth needed
router.get('/school/cities', battleController.getCities);
router.get('/school/by-city', battleController.getSchoolsByCity);
router.get('/battle/my-stats', authMiddleware, battleController.getMyBattleStats);

export default router;
