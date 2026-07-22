import { Request, Response } from 'express';
import LiveExamRoom, { ILiveExamQuestion } from './models/live_exam.model';
import { logger } from '../../shared/utils/logger';
import { getProviderResponse } from '../../shared/services/openai.service';

const generateLiveExamQuestions = async (
    subject: string,
    standard: string,
    topic: string,
    board: string,
    totalQuestions: number,
    language: string = 'English'
): Promise<ILiveExamQuestion[]> => {
    const prompt = `You are an expert exam paper setter for Indian school & competitive education.
Board: ${board}
Class/Standard: ${standard}
Subject: ${subject}
Chapter/Topic: ${topic}
Total Questions: ${totalQuestions}
EXAM MEDIUM / LANGUAGE: ${language}

CRITICAL INSTRUCTION: You MUST write the ENTIRE question text, ALL 4 options (A, B, C, D), and the explanation strictly in the "${language}" language (for example, if ${language} is Gujarati write in Gujarati script, if Hindi write in Devanagari Hindi script, if English write in English).

Generate exactly ${totalQuestions} high-quality Multiple Choice Questions (MCQs) for this topic.
Respond ONLY with a raw JSON array. Do NOT use markdown code blocks or backticks.
Format:
[
  {
    "question_number": 1,
    "question": "Question text in ${language} here?",
    "options": ["Option A in ${language}", "Option B in ${language}", "Option C in ${language}", "Option D in ${language}"],
    "correctAnswer": 0,
    "marks": 1,
    "topic": "${topic}",
    "explanation": "Detailed solution explanation in ${language} here."
  }
]`;

    try {
        const messages = [
            { role: 'system', content: 'You generate accurate curriculum-aligned MCQ exam papers in JSON format.' },
            { role: 'user', content: prompt }
        ];
        const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.3, taskType: 'chat' });
        let text = res?.choices?.[0]?.message?.content || '[]';
        if (text.includes('```')) {
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
        
        if (Array.isArray(list) && list.length > 0) {
            return list.map((q: any, idx: number) => ({
                question_number: idx + 1,
                question: q.question || `Question ${idx + 1} on ${topic}`,
                options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                marks: q.marks || 1,
                topic: q.topic || topic,
                explanation: q.explanation || 'Refer to NCERT textbook concepts for detailed solution.'
            }));
        }
    } catch (err: any) {
        logger.error(`[LiveExamController] AI question generation error: ${err.message}`);
    }

    // Fallback questions if AI call fails
    return Array.from({ length: totalQuestions }).map((_, idx) => ({
        question_number: idx + 1,
        question: `Sample Question ${idx + 1}: Which concept best explains ${topic}?`,
        options: [`Fundamental Principle of ${topic}`, `Secondary Theorem`, `Applied Derivative`, `Static Variable`],
        correctAnswer: 0,
        marks: 1,
        topic,
        explanation: `Standard concept explanation for ${topic}.`
    }));
};

export const liveExamController = {
    // ─── Create Live Exam Room ───────────────────────────────────────────────
    createRoom: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const {
                mode = 'PEER_GROUP',
                standard = '10',
                board = 'CBSE',
                subject = 'Science',
                topic = 'General',
                totalQuestions = 10,
                durationMinutes = 15,
                language = 'English',
                title
            } = req.body;

            const roomCode = 'LIVE-' + Math.floor(1000 + Math.random() * 9000);
            const questions = await generateLiveExamQuestions(subject, standard, topic, board, Number(totalQuestions) || 10, language);

            const room = new LiveExamRoom({
                roomCode,
                hostId: user._id,
                hostName: user.firstName || 'Teacher/Host',
                mode,
                status: 'WAITING',
                title: title || `${subject}: ${topic} Live Assessment (${language})`,
                standard,
                board,
                subject,
                topic,
                language,
                totalQuestions: questions.length,
                totalMarks: questions.length,
                durationMinutes: Number(durationMinutes) || 15,
                questions,
                participants: [{
                    userId: user._id,
                    firstName: user.firstName || 'Host Student',
                    grade: standard,
                    board,
                    answers: {},
                    score: 0,
                    percentage: 0,
                    rank: 0,
                    timeTakenSeconds: 0
                }]
            });

            await room.save();
            return res.json({ success: true, room });
        } catch (err: any) {
            logger.error('[LiveExamController] createRoom error:', err);
            return res.status(500).json({ success: false, message: err.message || 'Failed to create live exam room' });
        }
    },

    // ─── Join Live Exam Room ────────────────────────────────────────────────
    joinRoom: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const { roomCode } = req.params;

            const room = await LiveExamRoom.findOne({ roomCode: roomCode.toUpperCase() });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Live Exam Room not found' });
            }

            const existing = room.participants.find(p => p.userId.toString() === user._id.toString());
            if (!existing) {
                room.participants.push({
                    userId: user._id,
                    firstName: user.firstName || 'Student',
                    grade: user.grade || room.standard,
                    board: user.board || room.board,
                    answers: {},
                    score: 0,
                    percentage: 0,
                    rank: 0,
                    timeTakenSeconds: 0
                });
                await room.save();
            }

            return res.json({ success: true, room });
        } catch (err: any) {
            logger.error('[LiveExamController] joinRoom error:', err);
            return res.status(500).json({ success: false, message: err.message || 'Failed to join live exam room' });
        }
    },

    // ─── Get Room Details ──────────────────────────────────────────────────
    getRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const room = await LiveExamRoom.findOne({ roomCode: roomCode.toUpperCase() });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }
            return res.json({ success: true, room });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Start Live Exam ───────────────────────────────────────────────────
    startExam: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const { roomCode } = req.params;

            const room = await LiveExamRoom.findOne({ roomCode: roomCode.toUpperCase() });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            if (room.hostId.toString() !== user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Only host can launch the exam' });
            }

            room.status = 'ACTIVE';
            room.startedAt = new Date();
            await room.save();

            return res.json({ success: true, room });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Submit Live Exam Answers ──────────────────────────────────────────
    submitExam: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const { roomCode } = req.params;
            const { answers = {}, timeTakenSeconds = 0 } = req.body;

            const room = await LiveExamRoom.findOne({ roomCode: roomCode.toUpperCase() });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            const pIdx = room.participants.findIndex(p => p.userId.toString() === user._id.toString());
            if (pIdx === -1) {
                return res.status(400).json({ success: false, message: 'Participant not in room' });
            }

            // Calculate Score
            let score = 0;
            room.questions.forEach((q, idx) => {
                const userAns = answers[idx] ?? answers[String(idx)];
                if (typeof userAns === 'number' && userAns === q.correctAnswer) {
                    score += q.marks || 1;
                }
            });

            const percentage = Math.round((score / (room.totalMarks || 1)) * 100);

            room.participants[pIdx].answers = answers;
            room.participants[pIdx].submittedAt = new Date();
            room.participants[pIdx].score = score;
            room.participants[pIdx].percentage = percentage;
            room.participants[pIdx].timeTakenSeconds = timeTakenSeconds;

            // Recalculate Ranks for all participants who submitted
            const sorted = [...room.participants]
                .sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds);

            sorted.forEach((p, idx) => {
                const origIdx = room.participants.findIndex(x => x.userId.toString() === p.userId.toString());
                if (origIdx !== -1) {
                    room.participants[origIdx].rank = idx + 1;
                }
            });

            room.markModified('participants');
            await room.save();

            const updatedParticipant = room.participants[pIdx];
            return res.json({ success: true, room, result: updatedParticipant });
        } catch (err: any) {
            logger.error('[LiveExamController] submitExam error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Get User Live Exam History (Candidate or Host) ───────────────────
    getUserHistory: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const rooms = await LiveExamRoom.find({
                $or: [
                    { hostId: user._id },
                    { 'participants.userId': user._id }
                ]
            }).sort({ createdAt: -1 }).limit(50);

            return res.json({ success: true, rooms });
        } catch (err: any) {
            logger.error('[LiveExamController] getUserHistory error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }
};
