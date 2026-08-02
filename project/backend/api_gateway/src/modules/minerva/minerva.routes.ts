// Trigger reload 2
import express from 'express';
import { minervaController } from './minerva.controller';
import { authMiddleware, guestOrAuthMiddleware } from '../../shared/middleware/auth.middleware';

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
router.get('/student-digest', authMiddleware, minervaController.getStudentDigest);
router.post('/study-time/add', authMiddleware, minervaController.addStudyTime);

// ─── CHAT (Main entry point - Guest Allowed) ───
router.post('/chat', guestOrAuthMiddleware, minervaController.chat);
router.post('/chat/message/:messageId/feedback', authMiddleware, minervaController.logMessageFeedback);
router.get('/chat/history', authMiddleware, minervaController.getChatHistory);
router.get('/chat/sessions', authMiddleware, minervaController.getChatSessions);
router.post('/chat/session', authMiddleware, minervaController.createChatSession);
router.get('/chat/session/:id', authMiddleware, minervaController.getChatSessionMessages);
router.put('/chat/session/:id', authMiddleware, minervaController.renameChatSession);
router.delete('/chat/session/:id', authMiddleware, minervaController.deleteChatSession);
router.put('/chat/session/:id/pin', authMiddleware, minervaController.togglePinChatSession);
router.post('/upload', authMiddleware, upload.single('file'), minervaController.uploadFile);

// ─── SMART BOARD MONGO SESSIONS ───────────────
router.post('/smartboard/save', authMiddleware, minervaController.saveSmartBoardSession);
router.get('/smartboard/history', authMiddleware, minervaController.getSmartBoardSessions);

// ─── SESSIONS ──────────────────────────────────
router.get('/sessions', authMiddleware, minervaController.getSessions);
router.get('/session/:id', authMiddleware, minervaController.getSession);
router.delete('/session/:id', authMiddleware, minervaController.deleteSession);
router.get('/session/:id/certificate', authMiddleware, minervaController.generateCertificate);

// ─── LEARNING (Node/Topic) ──────────────────────
router.post('/node/:id/learn', authMiddleware, minervaController.learnNode);
router.post('/node/:id/regenerate', authMiddleware, minervaController.regenerateNodeContent);
router.put('/node/:id/priority', authMiddleware, minervaController.updateNodePriority);
router.post('/node/:id/viva/evaluate', authMiddleware, minervaController.evaluateVivaAnswer);

// ─── TASKS / HOMEWORK ──────────────────────────
router.post('/task/:id/submit', authMiddleware, minervaController.submitTask);
router.delete('/task/:id', authMiddleware, minervaController.deleteTask);
router.post('/task/custom', authMiddleware, upload.single('attachment'), minervaController.createCustomTask);
router.get('/homework/today', authMiddleware, minervaController.getTodayHomework);
router.get('/tasks/list', authMiddleware, minervaController.getTasks);
router.get('/review/due', authMiddleware, minervaController.getDueReviews);

// ─── E-BUILDER ─────────────────────────────────
router.post('/builder/generate', authMiddleware, minervaController.generateMaterial);
router.get('/builder/history', authMiddleware, minervaController.getMaterialHistory);
router.delete('/builder/material/:id', authMiddleware, minervaController.deleteBuilderMaterial);

// ─── TRANSLATOR ──────────────────────────────
router.post('/translate', authMiddleware, minervaController.translateText);

// ─── EXAMS ─────────────────────────────────────
router.get('/exams', authMiddleware, minervaController.getExams);
router.post('/exam/generate', authMiddleware, minervaController.generateExam);
router.get('/exam/:id', authMiddleware, minervaController.getExam);
router.delete('/exam/:id', authMiddleware, minervaController.deleteExam);
router.post('/exam/:id/submit', authMiddleware, minervaController.submitExam);
router.post('/exam/:id/appeal', authMiddleware, minervaController.appealExamQuestion);
router.post('/exam/:id/proctoring', authMiddleware, minervaController.reportProctoringViolation);
router.get('/leaderboard', authMiddleware, minervaController.getLeaderboard);

// ─── VIRTUAL LAB (Guest Allowed) ────────────────
router.get('/lab/youtube-search', guestOrAuthMiddleware, minervaController.labYoutubeSearch);
router.get('/lab/youtube-search-list', guestOrAuthMiddleware, minervaController.labYoutubeSearchList);
router.get('/lab/sketchfab-search', guestOrAuthMiddleware, minervaController.labSketchfabSearch);
router.get('/lab/sketchfab-search-list', guestOrAuthMiddleware, minervaController.labSketchfabSearchList);

// ─── PARENT VERIFICATION & PORTAL ────────────────
import { parentController } from './parent.controller';
router.put('/parent/details', authMiddleware, minervaController.updateParentDetails);
router.get('/parent/verify', minervaController.verifyParentEmail);
router.post('/parent/resend-verification', authMiddleware, minervaController.resendParentVerification);
router.get('/parent/report/:studentEmail', parentController.getStudentReport);

// ─── PYTHON CODE EXECUTION (Guest Allowed) ───────
router.post('/lab/execute-python', guestOrAuthMiddleware, minervaController.executePythonCode);

// ─── QUIZ ARENA (Team Battle) ──────────────────────────────
import { battleController } from './battle.controller';
router.post('/battle/room', authMiddleware, battleController.createRoom);
router.post('/battle/room/join', authMiddleware, battleController.joinRoom);
router.post('/battle/room/leave', authMiddleware, battleController.leaveRoom);
router.post('/battle/room/:roomCode/switch-team', authMiddleware, battleController.switchTeam);
router.get('/battle/active', authMiddleware, battleController.myActiveRoom);
router.get('/battle/room/:roomCode', authMiddleware, battleController.getRoom);
router.get('/battle/rooms', authMiddleware, battleController.listActiveRooms);
router.get('/battle/room/:roomCode/monitor', authMiddleware, battleController.monitorRoom);
router.get('/battle/daily-status', authMiddleware, battleController.getDailyChallengeStatus);
router.post('/battle/normalize-topic', battleController.normalizeTopic);
router.get('/battle/teacher/rooms', authMiddleware, battleController.listTeacherRooms);
router.get('/battle/teacher/room/:roomCode/results', authMiddleware, battleController.classroomResults);
router.get('/battle/teacher/search-students', authMiddleware, battleController.searchStudents);
router.post('/battle/teacher/room/:roomCode/stop', authMiddleware, battleController.stopRoom);


// ─── SCHOOL LEADERBOARD (Public + City-filtered) ───────────────────────────
router.get('/school/leaderboard', battleController.getSchoolLeaderboard); // Public — no auth needed
router.get('/school/cities', battleController.getCities);
router.get('/school/by-city', battleController.getSchoolsByCity);
router.get('/battle/my-stats', authMiddleware, battleController.getMyBattleStats);

// ─── LIVE GROUP EXAM ARENA ───────────────────────────────────
import { liveExamController } from './live_exam.controller';
router.post('/live-exam/room', authMiddleware, liveExamController.createRoom);
router.post('/live-exam/room/:roomCode/join', authMiddleware, liveExamController.joinRoom);
router.get('/live-exam/room/:roomCode', authMiddleware, liveExamController.getRoom);
router.post('/live-exam/room/:roomCode/start', authMiddleware, liveExamController.startExam);
router.post('/live-exam/room/:roomCode/submit', authMiddleware, liveExamController.submitExam);
router.post('/live-exam/room/:roomCode/end', authMiddleware, liveExamController.endExam);
// ─── MARKET-DOMINANT ADVANCED FEATURES ───────────────────────
import { MinervaVoiceService } from './minerva_voice_service';
import { StudentKnowledgeGraphService } from './student_knowledge_graph.service';
import { SpacedRepetitionEngine } from './spaced_repetition_engine';

router.post('/voice/stream', authMiddleware, MinervaVoiceService.handleVoiceStream);
router.get('/knowledge-graph/memory', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const memory = await StudentKnowledgeGraphService.getStudentMemoryContext(userId);
        res.json({ success: true, memory });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch knowledge memory' });
    }
});
router.get('/spaced-repetition/due-reviews', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const dueReviews = await SpacedRepetitionEngine.getDueReviews(userId);
        res.json({ success: true, dueReviews });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch due reviews' });
    }
});

export default router;
// Touched for rebuild
