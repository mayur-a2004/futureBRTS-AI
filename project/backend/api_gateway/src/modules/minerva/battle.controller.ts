import { Request, Response } from 'express';
import ArenaRoom, { ARENA_MODE_SIZES, calculateTeamHP, IArenaQuestion, BASE_HP_PER_PLAYER } from './models/quiz_battle.model';
import { callGeminiAI, callGroqAI } from '../collage_project/multi_agent.service';
import { logger } from '../../shared/utils/logger';

// ─── Swarm AI Helper (Fallback mechanism) ───────────────────────────────────
const callSwarmAIHelper = async (prompt: string): Promise<string> => {
    try {
        const groqRes = await callGroqAI(prompt, "system");
        if (groqRes && groqRes.trim().length > 0) {
            return groqRes;
        }
    } catch (e: any) {
        logger.warn(`[Arena] Groq call failed, trying Gemini fallback: ${e.message}`);
    }
    return callGeminiAI(prompt);
};

// ─── Grade-Adaptive Question Generator ───────────────────────────────────────
const FALLBACK_QUESTIONS: Record<string, { q: string; opts: string[]; ans: number; exp: string }[]> = {
    'Physics': [
        { q: "What is the SI unit of electric current?", opts: ["Volt", "Ampere", "Ohm", "Watt"], ans: 1, exp: "Ampere is the standard unit used to measure electric current." },
        { q: "Which type of lens is used to correct myopia (short-sightedness)?", opts: ["Convex lens", "Concave lens", "Bifocal lens", "Cylindrical lens"], ans: 1, exp: "Concave lens diverges incoming light rays to focus them on the retina." },
        { q: "What is the speed of light in vacuum?", opts: ["3 x 10^8 m/s", "3 x 10^6 m/s", "1.5 x 10^8 m/s", "3 x 10^10 m/s"], ans: 0, exp: "The speed of light in vacuum is approximately 300,000 kilometers per second." },
        { q: "Which force keeps the planets orbiting around the Sun?", opts: ["Magnetic Force", "Frictional Force", "Gravitational Force", "Electrostatic Force"], ans: 2, exp: "Gravity is the attractive force that keeps celestial bodies in orbital paths." },
        { q: "What is the rate of change of velocity called?", opts: ["Speed", "Acceleration", "Displacement", "Momentum"], ans: 1, exp: "Acceleration measures how fast velocity changes over time." }
    ],
    'Chemistry': [
        { q: "What is the chemical formula of common table salt?", opts: ["KCl", "NaCl", "HCl", "NaOH"], ans: 1, exp: "Sodium chloride (NaCl) is the chemical name for common table salt." },
        { q: "Which gas is commonly known as laughing gas?", opts: ["Nitrous Oxide", "Carbon Dioxide", "Sulphur Dioxide", "Nitrogen Dioxide"], ans: 0, exp: "Nitrous Oxide (N2O) induces laughter and mild anesthesia." },
        { q: "What is the pH value of pure, neutral water?", opts: ["5", "7", "9", "14"], ans: 1, exp: "Pure water is neutral on the pH scale with a value of exactly 7." },
        { q: "Which element is the primary constituent of organic compounds?", opts: ["Oxygen", "Nitrogen", "Carbon", "Hydrogen"], ans: 2, exp: "Carbon easily forms covalent bonds with other elements to build organic life." },
        { q: "Which gas is released when a metal reacts with dilute acid?", opts: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Nitrogen"], ans: 2, exp: "Metals displace hydrogen from acids, releasing hydrogen gas." }
    ],
    'Biology': [
        { q: "Which organelle is called the powerhouse of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], ans: 2, exp: "Mitochondria convert glucose into usable energy in the form of ATP." },
        { q: "What is the green pigment in plants that absorbs light for photosynthesis?", opts: ["Carotene", "Xanthophyll", "Chlorophyll", "Melanin"], ans: 2, exp: "Chlorophyll absorbs red and blue light wavelengths to power photosynthesis." },
        { q: "How many chambers are there in a human heart?", opts: ["2", "3", "4", "5"], ans: 2, exp: "The human heart is composed of four chambers: two atria and two ventricles." },
        { q: "Which vitamin is synthesized in the skin when exposed to sunlight?", opts: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], ans: 3, exp: "Exposure to sunlight triggers chemical synthesis of Vitamin D in the skin." },
        { q: "What is the basic functional unit of the human kidney?", opts: ["Neuron", "Nephron", "Alveoli", "Nephridia"], ans: 1, exp: "Nephrons filter blood and produce urine in the kidneys." }
    ],
    'Geography': [
        { q: "Which is the largest delta in the world?", opts: ["Mississippi Delta", "Nile Delta", "Sundarbans Delta", "Amazon Delta"], ans: 2, exp: "The Sundarbans Delta formed by the Ganges and Brahmaputra rivers is the largest." },
        { q: "Which country is the largest producer of wheat in the world?", opts: ["India", "USA", "China", "Russia"], ans: 2, exp: "China produces the highest volume of wheat globally." },
        { q: "What is the boundary line between India and China called?", opts: ["Radcliffe Line", "McMahon Line", "Durand Line", "Line of Control"], ans: 1, exp: "The McMahon Line defines the boundary between northeast India and Tibet/China." },
        { q: "Which is the oldest fold mountain range in India?", opts: ["Himalayas", "Aravalli Range", "Satpura Range", "Vindhya Range"], ans: 1, exp: "The Aravalli Range is one of the oldest geological fold mountain ranges in the world." },
        { q: "Which soil is best suited for growing cotton in India?", opts: ["Alluvial Soil", "Red Soil", "Black Soil (Regur)", "Laterite Soil"], ans: 2, exp: "Black soil has high clay content and moisture retention, ideal for cotton." }
    ],
    'English': [
        { q: "Identify the noun in the sentence: 'The silent teacher smiled.'", opts: ["silent", "teacher", "smiled", "The"], ans: 1, exp: "'teacher' is the person (noun) in this sentence." },
        { q: "What is the synonym of the word 'Vast'?", opts: ["Huge", "Tiny", "Narrow", "Slow"], ans: 0, exp: "'Vast' means extremely large in area, size, or scope." },
        { q: "Which of the following is a conjunction?", opts: ["Because", "Quickly", "Beautiful", "Running"], ans: 0, exp: "'Because' is used to connect clauses or sentences together." },
        { q: "What is the antonym of the word 'Polite'?", opts: ["Impolite", "Unpolite", "Dispolite", "Nonpolite"], ans: 0, exp: "Impolite is the correct standard prefix antonym for polite." },
        { q: "Which sentence is grammatically correct?", opts: ["She do not like tea.", "She don't likes tea.", "She does not like tea.", "She doesn't liked tea."], ans: 2, exp: "Third-person singular 'she' takes the helping verb 'does not' plus base verb." }
    ]
};

const generateQuestionsForGrade = async (
    subject: string,
    grade: number,
    difficulty: string,
    totalRounds: number
): Promise<IArenaQuestion[]> => {
    const salt = Math.floor(Math.random() * 1000000);
    const prompt = `You are a CBSE/NCERT expert quiz master.
Generate exactly ${totalRounds} unique, diverse multiple-choice questions for:
- Subject: "${subject}"
- Class/Grade: ${grade}
- Difficulty: "${difficulty}"
- Strictly follow NCERT Class ${grade} syllabus
- Random Seed Key: ${salt} (Do not repeat questions or subtopics from previous runs, select random chapters/sections)

Respond ONLY with a valid raw JSON array. No markdown, no backticks.
Each object must have:
- "question": string
- "options": array of exactly 4 unique strings (randomly ordered)
- "correctAnswer": number (0-3 index of correct option in the options array)
- "explanation": string (1 sentence why this is the answer)
- "difficulty": "${difficulty}"

Example:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":2,"explanation":"...","difficulty":"Medium"}]`;

    try {
        let aiResponse = await callSwarmAIHelper(prompt);
        if (aiResponse.includes('```')) {
            aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const questions = JSON.parse(aiResponse);
        if (Array.isArray(questions) && questions.length >= totalRounds) {
            return questions.slice(0, totalRounds).map((q: any) => ({
                ...q,
                grade,
                subject
            }));
        }
        throw new Error('AI returned wrong number of questions');
    } catch (err: any) {
        logger.error(`[Arena] Grade ${grade} question gen failed: ${err.message}`);
        // Dynamic Fallback
        const list = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS['Geography'];
        return Array.from({ length: totalRounds }, (_, i) => {
            const item = list[i % list.length];
            return {
                question: `[Class ${grade} ${subject}] ${item.q}`,
                options: [...item.opts],
                correctAnswer: item.ans,
                grade,
                subject,
                explanation: item.exp,
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard'
            };
        });
    }
};

// ─── Controller ────────────────────────────────────────────────────────────────
export const battleController = {

    // Create a new arena room
    createRoom: async (req: Request, res: Response) => {
        try {
            const { mode, subject, topic, difficulty, totalRounds, aiDifficulty, grade } = req.body;
            const hostUser = (req as any).user;

            if (!mode || !subject) {
                return res.status(400).json({ success: false, message: 'mode and subject are required.' });
            }

            const sizes = ARENA_MODE_SIZES[mode];
            if (!sizes) {
                return res.status(400).json({ success: false, message: `Unknown mode: ${mode}` });
            }

            const [teamASize, teamBSize] = sizes;
            const rounds = totalRounds || 10;
            const diff = difficulty || 'Medium';
            const hostGrade = grade || hostUser.grade || 10;

            const teamAHp = calculateTeamHP(teamASize, teamBSize === 0 ? 1 : teamBSize);
            const teamBHp = mode === 'SOLO_VS_AI' ? teamAHp : calculateTeamHP(teamBSize, teamASize);

            const code = 'ARENA-' + Math.floor(100000 + Math.random() * 900000).toString();

            // Generate questions for host's grade
            const hostQuestions = await generateQuestionsForGrade(subject, hostGrade, diff, rounds);

            const playerQuestionsMap: Record<string, IArenaQuestion[]> = {
                [hostUser._id.toString()]: hostQuestions
            };

            // Track shared question sets by "teamLabel-grade" key
            const sharedSets: Record<string, IArenaQuestion[]> = {
                [`A-${hostGrade}`]: hostQuestions
            };

            const room = await ArenaRoom.create({
                roomCode: code,
                hostId: hostUser._id,
                status: 'WAITING',
                mode,
                teamASizeTarget: teamASize,
                teamBSizeTarget: teamBSize === 0 ? 1 : teamBSize,
                subject,
                topic,
                playerQuestions: playerQuestionsMap,
                sharedQuestionSets: sharedSets,
                players: [{
                    userId: hostUser._id,
                    firstName: hostUser.firstName,
                    grade: hostGrade,
                    team: 'A',
                    hp: BASE_HP_PER_PLAYER,
                    score: 0,
                    answersRecord: [],
                    powerups: { shield: true, doubleStrike: true, freeze: true, fiftyFifty: true },
                    powerupsUsed: [],
                    streakCount: 0,
                    hasFinished: false,
                    isConnected: true
                }],
                teamA: { label: 'A', hp: teamAHp, maxHp: teamAHp, playerIds: [hostUser._id] },
                teamB: { label: 'B', hp: teamBHp, maxHp: teamBHp, playerIds: [] },
                roundStates: [],
                currentRound: 0,
                totalRounds: rounds,
                aiDifficulty: mode === 'SOLO_VS_AI' ? (aiDifficulty || 'SCHOLAR') : undefined,
                aiTeam: mode === 'SOLO_VS_AI' ? 'B' : undefined,
                winnerId: null,
                winnerTeam: null
            });

            res.status(200).json({ success: true, room: room.toJSON() });
        } catch (err: any) {
            logger.error('[Arena] createRoom error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Get a single room (for joining via code)
    getRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const room = await ArenaRoom.findOne({ roomCode })
                .populate('players.userId', 'firstName lastName grade')
                .populate('hostId', 'firstName lastName');

            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found.' });
            }

            res.status(200).json({ success: true, room: room.toJSON() });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // List active WAITING rooms (lobby browser)
    listActiveRooms: async (req: Request, res: Response) => {
        try {
            const rooms = await ArenaRoom.find({ status: { $in: ['WAITING', 'LOBBY_READY'] } })
                .populate('hostId', 'firstName lastName grade')
                .sort({ createdAt: -1 })
                .limit(20);
            res.status(200).json({ success: true, rooms: rooms.map(r => r.toJSON()) });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Join a room by code (Team assignment)
    joinRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode, team } = req.body;  // team: 'A' | 'B'
            const joiningUser = (req as any).user;

            const room = await ArenaRoom.findOne({ roomCode });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found.' });
            }
            if (room.status === 'ACTIVE' || room.status === 'FINISHED') {
                return res.status(400).json({ success: false, message: 'Match already started or finished.' });
            }

            const alreadyJoined = room.players.some(
                (p: any) => p.userId.toString() === joiningUser._id.toString()
            );
            if (alreadyJoined) {
                return res.status(400).json({ success: false, message: 'Already in this room.' });
            }

            const targetTeam = team || 'B';
            const teamPlayers = room.players.filter((p: any) => p.team === targetTeam);
            const targetSize = targetTeam === 'A' ? room.teamASizeTarget : room.teamBSizeTarget;

            if (teamPlayers.length >= targetSize) {
                return res.status(400).json({ success: false, message: `Team ${targetTeam} is already full.` });
            }

            const joinerGrade = joiningUser.grade || 10;
            const diff = 'Medium';

            // Generate or reuse questions for this grade on this team
            const sharedKey = `${targetTeam}-${joinerGrade}`;
            let gradeQuestions = (room.sharedQuestionSets as any).get(sharedKey);

            if (!gradeQuestions || gradeQuestions.length === 0) {
                gradeQuestions = await generateQuestionsForGrade(room.subject, joinerGrade, diff, room.totalRounds);
                (room.sharedQuestionSets as any).set(sharedKey, gradeQuestions);
            }

            (room.playerQuestions as any).set(joiningUser._id.toString(), gradeQuestions);

            // Add player
            room.players.push({
                userId: joiningUser._id,
                firstName: joiningUser.firstName,
                grade: joinerGrade,
                team: targetTeam as 'A' | 'B',
                hp: BASE_HP_PER_PLAYER,
                score: 0,
                answersRecord: [],
                powerups: { shield: true, doubleStrike: true, freeze: true, fiftyFifty: true },
                powerupsUsed: [],
                streakCount: 0,
                hasFinished: false,
                isConnected: true
            } as any);

            if (targetTeam === 'A') {
                room.teamA.playerIds.push(joiningUser._id);
            } else {
                room.teamB.playerIds.push(joiningUser._id);
            }

            // Check if room is LOBBY_READY (all slots filled)
            const totalNeeded = room.teamASizeTarget + room.teamBSizeTarget;
            if (room.players.length >= totalNeeded) {
                room.status = 'LOBBY_READY';
            }

            await room.save();

            const updatedRoom = await ArenaRoom.findOne({ roomCode })
                .populate('players.userId', 'firstName lastName grade')
                .populate('hostId', 'firstName lastName');

            res.status(200).json({ success: true, room: updatedRoom ? updatedRoom.toJSON() : null });
        } catch (err: any) {
            logger.error('[Arena] joinRoom error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
