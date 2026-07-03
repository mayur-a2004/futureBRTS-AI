import { Request, Response } from 'express';
import QuizBattle from './models/quiz_battle.model';
import { callGeminiAI } from '../collage_project/multi_agent.service';
import { logger } from '../../shared/utils/logger';

const generateQuizQuestions = async (subject: string, difficulty: string): Promise<any[]> => {
    const prompt = `You are a professional quiz master. Generate exactly 5 challenging multiple-choice questions for the subject "${subject}" with difficulty "${difficulty}".
You must respond with ONLY a valid raw JSON array, without any markdown formatting or backticks. 
Each question object in the array must have the following exact keys:
- "question": string (the question text)
- "options": array of exactly 4 strings (options)
- "correctAnswer": number (index 0, 1, 2, or 3 of the correct option in the options array)

Example response format:
[
  {
    "question": "What is the unit of electric current?",
    "options": ["Volt", "Ampere", "Ohm", "Watt"],
    "correctAnswer": 1
  }
]`;

    try {
        let aiResponse = await callGeminiAI(prompt);
        // Clean backticks or markdown if AI outputs them
        if (aiResponse.includes('```')) {
            aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const questions = JSON.parse(aiResponse);
        if (Array.isArray(questions) && questions.length === 5) {
            return questions;
        }
        throw new Error("AI did not return exactly 5 questions or response was not an array");
    } catch (err: any) {
        logger.error('[QuizBattle] AI question generation failed, falling back to static questions:', err.message);
        // Fallback static questions
        return [
            {
                question: `Identify the fundamental concept of ${subject} (${difficulty})`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            },
            {
                question: `Which of the following is associated with ${subject}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1
            },
            {
                question: `What is the primary application of ${subject} in research?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 2
            },
            {
                question: `In modern ${subject}, which principle holds true?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 3
            },
            {
                question: `Evaluate the primary formula used in ${subject}.`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            }
        ];
    }
};

export const battleController = {
    createRoom: async (req: Request, res: Response) => {
        try {
            const { subject, difficulty } = req.body;
            const creatorId = (req as any).user?._id;

            if (!subject || !difficulty) {
                return res.status(400).json({ success: false, message: 'Subject and difficulty are required.' });
            }

            // Generate unique 6-character room code
            const code = 'BATTLE-' + Math.floor(100000 + Math.random() * 900000).toString();

            // Generate questions
            const questions = await generateQuizQuestions(subject, difficulty);

            const battle = await QuizBattle.create({
                roomCode: code,
                creatorId,
                status: 'WAITING',
                subject,
                difficulty,
                questions,
                creatorScore: 0,
                opponentScore: 0,
                currentQuestionIndex: 0
            });

            res.status(200).json({ success: true, battle });
        } catch (err: any) {
            logger.error('[QuizBattle] Create room error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const battle = await QuizBattle.findOne({ roomCode })
                .populate('creatorId', 'firstName lastName email')
                .populate('opponentId', 'firstName lastName email');

            if (!battle) {
                return res.status(404).json({ success: false, message: 'Quiz battle room not found.' });
            }

            res.status(200).json({ success: true, battle });
        } catch (err: any) {
            logger.error('[QuizBattle] Get room error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    listActiveRooms: async (req: Request, res: Response) => {
        try {
            const activeBattles = await QuizBattle.find({ status: 'WAITING' })
                .populate('creatorId', 'firstName lastName email')
                .limit(10);
            res.status(200).json({ success: true, battles: activeBattles });
        } catch (err: any) {
            logger.error('[QuizBattle] List rooms error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
