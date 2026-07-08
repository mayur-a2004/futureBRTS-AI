import { Request, Response } from 'express';
import ArenaRoom, { ARENA_MODE_SIZES, calculateTeamHP, IArenaQuestion, BASE_HP_PER_PLAYER } from './models/quiz_battle.model';
import User from '../auth/user.model';
import { callGeminiAI, callGroqAI } from '../collage_project/multi_agent.service';
import { logger } from '../../shared/utils/logger';
import { SocketService } from '../../services/socket.service';

// ─── Swarm AI Helper (Fallback mechanism) ───────────────────────────────────
const callSwarmAIHelper = async (prompt: string): Promise<string> => {
    try {
        const groqRes = await callGroqAI(prompt, "quiz_battle");
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
    ],
    'Science': [
        { q: "Which gas do plants absorb from the atmosphere during photosynthesis?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], ans: 1, exp: "Plants consume Carbon Dioxide (CO2) to prepare glucose via photosynthesis." },
        { q: "What are the three physical states of matter?", opts: ["Solid, Liquid, Gas", "Atom, Molecule, Compound", "Proton, Neutron, Electron", "Acid, Base, Salt"], ans: 0, exp: "Matter primarily exists in three distinct physical states: solid, liquid, and gas." },
        { q: "Which organelle is universally known as the powerhouse of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"], ans: 2, exp: "Mitochondria generate cellular energy in the form of ATP." },
        { q: "What force pulls falling objects towards the center of the Earth?", opts: ["Magnetic force", "Frictional force", "Gravitational force", "Centrifugal force"], ans: 2, exp: "Gravity is the attractive force exerted by the Earth on all physical objects." },
        { q: "Which vitamin is synthesized in the human body through sunlight exposure?", opts: ["Vitamin A", "Vitamin C", "Vitamin B12", "Vitamin D"], ans: 3, exp: "Sunlight triggers natural chemical synthesis of Vitamin D in the skin." }
    ],
    'Mathematics': [
        { q: "What is the area of a rectangle with length 5 cm and width 4 cm?", opts: ["9 sq cm", "20 sq cm", "18 sq cm", "10 sq cm"], ans: 1, exp: "Area of a rectangle equals length multiplied by width (5 * 4 = 20 sq cm)." },
        { q: "What is the smallest prime number?", opts: ["1", "2", "3", "0"], ans: 1, exp: "2 is the smallest prime number, and the only even prime number." },
        { q: "Evaluate the expression: 15 - 3 * 4", opts: ["48", "3", "12", "9"], ans: 1, exp: "By BODMAS precedence rules, multiplication (3 * 4 = 12) is computed before subtraction (15 - 12 = 3)." },
        { q: "What is the perimeter of a square with side length 6 cm?", opts: ["12 cm", "36 cm", "24 cm", "18 cm"], ans: 2, exp: "Perimeter of a square equals four times the side length (4 * 6 = 24 cm)." },
        { q: "What is the value of 1/2 + 1/4?", opts: ["2/6", "3/4", "1/6", "2/4"], ans: 1, exp: "Adding fractions: 1/2 + 1/4 = 2/4 + 1/4 = 3/4." }
    ]
};

// ─── Topic Normalizer ─────────────────────────────────────────────────────────
const normalizeTopicWithAI = async (rawTopic: string, subject: string, standard: string): Promise<string> => {
    try {
        const prompt = `You are a syllabus expert for Indian education boards.
Normalize this chapter/topic name typed by a student:
"${rawTopic}" (for ${subject}, Standard: ${standard})

Rules:
- Fix all spelling mistakes
- Use standard educational terminology
- Keep it concise (max 8 words)
- Return ONLY the corrected topic name, nothing else, no explanation
- Examples:
  "mataels and non matals" → "Metals and Non-Metals"
  "cell organels" → "Cell Organelles"
  "newtons laws of moton" → "Newton's Laws of Motion"
  "quadralic equations" → "Quadratic Equations"
  "fotosinthesis" → "Photosynthesis"
  "binary tree and bst" → "Binary Trees and BST"`;
        const result = await callSwarmAIHelper(prompt);
        const clean = result.trim().replace(/^["']|["']$/g, ''); // strip surrounding quotes if any
        return clean.length > 0 ? clean : rawTopic; // fallback if AI returned empty
    } catch {
        return rawTopic; // fallback to original if AI fails
    }
};

// ─── Prompt Builder ───────────────────────────────────────────────────────────
const buildQuizPrompt = (
    subject: string,
    standard: string,
    topic: string,
    board: string,
    difficulty: string,
    totalRounds: number,
    salt: number,
    semester?: string
): string => {
    const isHigherEd = ['undergrad', 'postgrad', 'doctoral', 'diploma_iti',
        'emerging_tech', 'health_sciences', 'law_policy', 'creative_media',
        'agriculture_env', 'aviation_maritime', 'finance_adv', 'education_teaching',
        'comp_exams', 'prof_certifications'].includes(standard);

    const isCompetitiveExam = ['comp_exams', 'JEE', 'NEET', 'GOVT_EXAM', 'BANKING'].includes(standard);

    if (isCompetitiveExam) {
        return `You are an expert quiz master for Indian competitive exams.
Exam / Level: ${subject} (e.g. UPSC, SSC, CA, IBPS, JEE, NEET)
Stage: ${semester || 'General'}
Topic: ${topic}
Difficulty: ${difficulty}
Random Variation Seed: ${salt}

Generate exactly ${totalRounds} exam-level MCQs strictly within the topic "${topic}".
Match the exact difficulty and pattern of ${subject} level exams.
Each question: 4 options, 1 correct answer, include explanation.
Respond ONLY with raw JSON array. No markdown, no backticks.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":2,"explanation":"...","difficulty":"${difficulty}"}]`;
    }

    if (isHigherEd) {
        const semLabel = semester ? `${semester.charAt(0).toUpperCase() + semester.slice(1)}` : 'General';
        return `You are an expert quiz master for Indian higher education.
Level: ${standard} (Undergraduate / Postgraduate / Diploma)
Course / Stream: ${subject}
Semester / Year / Level: ${semLabel}
Topic / Specialisation: ${topic}
Difficulty: ${difficulty}
Random Variation Seed: ${salt}

Generate exactly ${totalRounds} university-level MCQs strictly within the topic "${topic}".
Questions should be appropriate for ${semLabel} of ${subject}. Not school level.
Each question: 4 options, 1 correct answer, include explanation.
Respond ONLY with raw JSON array. No markdown, no backticks.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":2,"explanation":"...","difficulty":"${difficulty}"}]`;
    }

    // School boards (Class 5–12)
    const boardLabel = board === 'NCERT' ? 'CBSE/NCERT (standard national syllabus)' : board;
    const boardInstruction = (board && board !== 'NCERT' && board !== 'CBSE')
        ? `Frame questions using ${board} prescribed textbook's terminology, examples, and context where applicable.`
        : `Use standard NCERT/CBSE textbook terminology and examples.`;

    return `You are an expert quiz master for Indian school education.
Board: ${boardLabel}
Standard / Class: ${standard}
Subject: ${subject}
Chapter / Topic: ${topic}
Difficulty: ${difficulty}
Random Variation Seed: ${salt}

Generate exactly ${totalRounds} unique MCQs strictly within the chapter/topic "${topic}".
${boardInstruction}
Do NOT include questions from other chapters or topics.
Do NOT repeat question patterns (seed ensures variation every time).
Each question: exactly 4 options, 1 correct answer, include 1-sentence explanation.
Respond ONLY with raw JSON array. No markdown, no backticks.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":2,"explanation":"...","difficulty":"${difficulty}"}]`;
};

// ─── Dynamic Question Generator (Board + Topic + Semester Aware) ───────────
const generateDynamicQuestions = async (
    subject: string,
    standard: string,
    topic: string,
    board: string,
    difficulty: string,
    totalRounds: number,
    salt?: number,
    semester?: string
): Promise<IArenaQuestion[]> => {
    const useSalt = salt ?? Math.floor(Math.random() * 1000000);
    const prompt = buildQuizPrompt(subject, standard, topic, board, difficulty, totalRounds, useSalt, semester);

    try {
        let aiResponse = await callSwarmAIHelper(prompt);
        if (aiResponse.includes('```')) {
            aiResponse = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        }
        // Sometimes AI wraps in object
        if (aiResponse.trim().startsWith('{')) {
            const parsed = JSON.parse(aiResponse);
            const arr = parsed.questions || parsed.data || parsed.quiz || Object.values(parsed)[0];
            if (Array.isArray(arr)) aiResponse = JSON.stringify(arr);
        }
        const questions = JSON.parse(aiResponse);
        if (Array.isArray(questions) && questions.length >= totalRounds) {
            return questions.slice(0, totalRounds).map((q: any) => ({
                ...q,
                grade: standard,
                subject,
                board,
                topicRef: topic
            }));
        }
        throw new Error(`AI returned ${Array.isArray(questions) ? questions.length : 'invalid'} questions, expected ${totalRounds}`);
    } catch (err: any) {
        logger.error(`[Arena] Question gen failed for ${board}/${standard}/${subject}/${topic}: ${err.message}`);
        // Fallback to subject-generic questions with topic prefix
        const list = FALLBACK_QUESTIONS[subject] || FALLBACK_QUESTIONS['Geography'];
        return Array.from({ length: totalRounds }, (_, i) => {
            const item = list[i % list.length];
            return {
                question: `[${board} ${standard} – ${topic}] ${item.q}`,
                options: [...item.opts],
                correctAnswer: item.ans,
                grade: standard,
                subject,
                explanation: item.exp,
                difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
                board,
                topicRef: topic
            };
        });
    }
};

// ─── Legacy wrapper (keeps old callers working) ──────────────────────────────
const generateQuestionsForGrade = async (
    subject: string,
    grade: number,
    difficulty: string,
    totalRounds: number
): Promise<IArenaQuestion[]> => {
    return generateDynamicQuestions(subject, String(grade), subject, 'NCERT', difficulty, totalRounds);
};



// ─── Controller ────────────────────────────────────────────────────────────────
export const battleController = {

    // Get current active room for user
    myActiveRoom: async (req: Request, res: Response) => {
        try {
            const hostUser = (req as any).user;
            const userId = hostUser._id || hostUser.id;

            const room = await ArenaRoom.findOne({
                status: { $in: ['WAITING', 'LOBBY_READY', 'ACTIVE'] },
                'players.userId': userId
            })
            .populate('players.userId', 'firstName lastName grade')
            .populate('hostId', 'firstName lastName');

            if (!room) {
                return res.status(200).json({ success: true, room: null });
            }

            res.status(200).json({ success: true, room: room.toJSON() });
        } catch (err: any) {
            logger.error('[Arena] myActiveRoom error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // Create a new arena room
    createRoom: async (req: Request, res: Response) => {
        try {
            const {
                mode,
                subject,
                topic,
                difficulty,
                totalRounds,
                aiDifficulty,
                grade,
                isDaily,
                battleStyle,
                board,
                semester,
                roomType,
                invitedStudentIds
            } = req.body;
            const hostUser = (req as any).user;

            if (!mode || !subject) {
                return res.status(400).json({ success: false, message: 'mode and subject are required.' });
            }

            // Mandatory Validation: Topic & Board must be present and not empty
            if (!topic || !topic.trim()) {
                return res.status(400).json({ success: false, message: 'Topic/Chapter is required to start a battle!' });
            }
            if (!board || !board.trim()) {
                return res.status(400).json({ success: false, message: 'Exam Board is required!' });
            }

            const sizes = ARENA_MODE_SIZES[mode];
            if (!sizes) {
                return res.status(400).json({ success: false, message: `Unknown mode: ${mode}` });
            }

            // Daily challenge limit check
            const User = require('../auth/user.model').default;
            const fullUser = await User.findById(hostUser._id || hostUser.id);
            if (isDaily && fullUser?.lastDailyChallengePlayedAt) {
                const today = new Date().toDateString();
                const lastPlayed = new Date(fullUser.lastDailyChallengePlayedAt).toDateString();
                if (today === lastPlayed) {
                    return res.status(400).json({
                        success: false,
                        message: 'You have already completed today\'s Daily Challenge. Come back tomorrow!'
                    });
                }
            }

            const [teamASize, teamBSize] = sizes;
            const rounds = totalRounds || 10;
            const diff = difficulty || 'Medium';
            const hostGrade = grade || hostUser.grade || '10';

            const teamAHp = calculateTeamHP(teamASize, teamBSize === 0 ? 1 : teamBSize);
            const teamBHp = mode === 'SOLO_VS_AI' ? teamAHp : calculateTeamHP(teamBSize, teamASize);

            const prefix = roomType === 'TEACHER_ROOM' ? 'TEACH-' : (isDaily ? 'DAILY-' : 'ARENA-');
            const code = prefix + Math.floor(100000 + Math.random() * 900000).toString();

            // Run topic normalization via AI
            const normalized = await normalizeTopicWithAI(topic.trim(), subject, String(hostGrade));

            // Generate questions for host
            const hostQuestions = await generateDynamicQuestions(
                subject,
                String(hostGrade),
                normalized,
                board,
                diff,
                rounds,
                Math.floor(Math.random() * 1000000),
                semester || undefined
            );

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
                battleStyle: battleStyle || 'SPEED_RACE',
                currentTurn: 'A',
                teamASizeTarget: teamASize,
                teamBSizeTarget: teamBSize === 0 ? 1 : teamBSize,
                subject,
                standard: String(hostGrade),
                board: board,
                topic: normalized || topic.trim(),
                topicConcept: normalized || topic.trim(),
                topicRaw: topic.trim(),
                semester: semester || undefined,
                roomType: roomType || 'OPEN_ARENA',
                invitedStudentIds: invitedStudentIds || [],
                playerQuestions: playerQuestionsMap,
                sharedQuestionSets: sharedSets,
                players: [{
                    userId: hostUser._id,
                    firstName: hostUser.firstName,
                    grade: hostGrade,
                    board: board,
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
            const { roomCode, team, grade, board } = req.body;  // team: 'A' | 'B', grade: optional number, board: optional board override
            const joiningUser = (req as any).user;

            const room = await ArenaRoom.findOne({ roomCode });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found.' });
            }

            const alreadyJoined = room.players.some(
                (p: any) => p.userId.toString() === joiningUser._id.toString()
            );

            if (alreadyJoined) {
                if (room.status === 'FINISHED') {
                    return res.status(400).json({ success: false, message: 'Match already finished.' });
                }

                // Mark player as connected
                const player = room.players.find((p: any) => p.userId.toString() === joiningUser._id.toString());
                if (player) {
                    player.isConnected = true;
                }
                await room.save();

                const updatedRoom = await ArenaRoom.findOne({ roomCode })
                    .populate('players.userId', 'firstName lastName grade')
                    .populate('hostId', 'firstName lastName');

                return res.status(200).json({ success: true, room: updatedRoom ? updatedRoom.toJSON() : null, reconnected: true });
            }

            if (room.status === 'ACTIVE' || room.status === 'FINISHED') {
                return res.status(400).json({ success: false, message: 'Match already started or finished.' });
            }

            const targetTeam = team || 'B';
            const teamPlayers = room.players.filter((p: any) => p.team === targetTeam);
            const targetSize = targetTeam === 'A' ? room.teamASizeTarget : room.teamBSizeTarget;

            if (teamPlayers.length >= targetSize) {
                return res.status(400).json({ success: false, message: `Team ${targetTeam} is already full.` });
            }

            const joinerGrade = grade || joiningUser.grade || 10;
            const joinerBoard = board || joiningUser.board || 'NCERT';
            const diff = (room as any).difficulty || 'Medium';

            let gradeQuestions: IArenaQuestion[] = [];

            if (room.roomType === 'TEACHER_ROOM') {
                // In a teacher room, all students get the host's questions (teacher-defined board)
                const hostQuestions = (room.playerQuestions as any).get(room.hostId.toString());
                gradeQuestions = hostQuestions;

                if (!gradeQuestions || gradeQuestions.length === 0) {
                    const sharedKey = `shared-${room.board}`;
                    gradeQuestions = (room.sharedQuestionSets as any).get(sharedKey);
                    if (!gradeQuestions || gradeQuestions.length === 0) {
                        gradeQuestions = await generateDynamicQuestions(
                            room.subject,
                            String(room.standard),
                            room.topicConcept,
                            room.board,
                            diff,
                            room.totalRounds,
                            Math.floor(Math.random() * 1000000),
                            room.semester || undefined
                        );
                        (room.sharedQuestionSets as any).set(sharedKey, gradeQuestions);
                    }
                }
            } else {
                // In an open arena, generate individual board-specific questions for this player
                gradeQuestions = await generateDynamicQuestions(
                    room.subject,
                    String(joinerGrade),
                    room.topicConcept,
                    joinerBoard,
                    diff,
                    room.totalRounds,
                    Math.floor(Math.random() * 1000000),
                    room.semester || undefined
                );
            }

            (room.playerQuestions as any).set(joiningUser._id.toString(), gradeQuestions);

            // Add player
            room.players.push({
                userId: joiningUser._id,
                firstName: joiningUser.firstName,
                grade: joinerGrade,
                board: room.roomType === 'TEACHER_ROOM' ? room.board : joinerBoard, // Store relevant board
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
    },

    // ─── School Leaderboard (Public) ─────────────────────────────────────────
    getSchoolLeaderboard: async (req: Request, res: Response) => {
        try {
            const { city, period = 'all' } = req.query;
            const User = require('../auth/user.model').default;

            // Build date filter for weekly/monthly periods
            const dateFilter: any = {};
            if (period === 'weekly') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateFilter.createdAt = { $gte: weekAgo };
            } else if (period === 'monthly') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                dateFilter.createdAt = { $gte: monthAgo };
            }

            // Build city filter
            const matchFilter: any = { schoolName: { $exists: true, $ne: '' }, ...dateFilter };
            if (city) matchFilter.city = { $regex: city as string, $options: 'i' };

            // Aggregate XP per school
            const schools = await User.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: { schoolName: '$schoolName', city: '$city' },
                        totalXP: { $sum: '$xp' },
                        studentCount: { $sum: 1 },
                        totalBattles: { $sum: '$battleStats.totalBattles' },
                        totalWins: { $sum: '$battleStats.wins' },
                    }
                },
                { $sort: { totalXP: -1 } },
                { $limit: 50 },
                {
                    $project: {
                        _id: 0,
                        schoolName: '$_id.schoolName',
                        city: '$_id.city',
                        totalXP: 1,
                        studentCount: 1,
                        totalBattles: 1,
                        totalWins: 1,
                    }
                }
            ]);

            // Add rank
            const ranked = schools.map((s: any, i: number) => ({ ...s, rank: i + 1 }));
            res.status(200).json({ success: true, leaderboard: ranked, period, city: city || 'all' });
        } catch (err: any) {
            logger.error('[Arena] getSchoolLeaderboard error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── My Personal Battle Stats ─────────────────────────────────────────────
    getMyBattleStats: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId || (req as any).user?._id || (req as any).user?.id;

            // Find all finished rooms where the user was a player
            const rooms = await ArenaRoom.find({
                status: 'FINISHED',
                'players.userId': userId
            })
            .populate('players.userId', 'firstName lastName')
            .sort({ createdAt: -1 });

            let totalGames = 0;
            let wins = 0;
            let losses = 0;
            let draws = 0;

            const history = rooms.map(room => {
                totalGames++;
                
                // Find user's player record
                const myPlayer = room.players.find(p => p.userId && (p.userId as any)._id.toString() === userId.toString());
                const myTeam = myPlayer ? myPlayer.team : null;
                const myScore = myPlayer ? myPlayer.score : 0;

                // Determine if user won
                let isWinner = false;
                if (room.winnerTeam === 'DRAW') {
                    draws++;
                } else if (room.winnerTeam === myTeam) {
                    isWinner = true;
                    wins++;
                } else if (room.winnerId && room.winnerId.toString() === userId.toString()) {
                    isWinner = true;
                    wins++;
                } else {
                    losses++;
                }

                // Compile other participants
                const participants = room.players.map(p => {
                    const pUser = p.userId as any;
                    return {
                        name: pUser && pUser.firstName ? `${pUser.firstName} ${pUser.lastName || ''}` : p.firstName || 'Anonymous',
                        team: p.team,
                        score: p.score,
                        isSelf: pUser ? pUser._id.toString() === userId.toString() : false
                    };
                });

                return {
                    roomCode: room.roomCode,
                    subject: room.subject,
                    topic: room.topic || 'General Practice',
                    mode: room.mode,
                    battleStyle: room.battleStyle,
                    myTeam,
                    myScore,
                    winnerTeam: room.winnerTeam,
                    isWinner,
                    isDraw: room.winnerTeam === 'DRAW',
                    date: room.createdAt,
                    participants
                };
            });

            // Fetch User details for total XP
            const userDoc = await User.findById(userId).select('xp');
            const totalXp = userDoc ? (userDoc.xp || 0) : 0;

            res.status(200).json({
                success: true,
                stats: {
                    totalGames,
                    wins,
                    losses,
                    draws,
                    winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
                    totalXp
                },
                history
            });
        } catch (err: any) {
            logger.error('[Arena Stats] getMyBattleStats error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Teacher Room Monitor (Real-time student progress tracking) ───────────
    monitorRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const room = await ArenaRoom.findOne({ roomCode });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found.' });
            }

            const playersInfo = room.players.map((p: any) => {
                const total = p.answersRecord?.length || 0;
                const correct = p.answersRecord?.filter((a: any) => a.isCorrect).length || 0;
                const wrong = total - correct;
                
                // Calculate average response time
                const totalTime = p.answersRecord?.reduce((sum: number, a: any) => sum + (a.timeMs || 0), 0) || 0;
                const avgSpeed = total > 0 ? Math.round(totalTime / total) / 1000 : 0; // in seconds

                return {
                    userId: p.userId,
                    name: p.firstName,
                    grade: p.grade,
                    team: p.team,
                    score: p.score,
                    totalAnswers: total,
                    correctAnswers: correct,
                    wrongAnswers: wrong,
                    avgSpeedSeconds: avgSpeed,
                    needsAttention: wrong >= 3
                };
            });

            res.status(200).json({
                success: true,
                roomCode: room.roomCode,
                subject: room.subject,
                topic: room.topic,
                status: room.status,
                battleStyle: (room as any).battleStyle,
                currentTurn: (room as any).currentTurn,
                currentRound: room.currentRound,
                totalRounds: room.totalRounds,
                teamAHp: room.teamA.hp,
                teamBHp: room.teamB.hp,
                players: playersInfo
            });
        } catch (err: any) {
            logger.error('[Arena Monitor] Error monitoring room:', err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Daily Challenge Status Checker ─────────────────────────────────────
    getDailyChallengeStatus: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId || (req as any).user?._id;
            const User = require('../auth/user.model').default;
            const userDoc = await User.findById(userId);

            let alreadyPlayed = false;
            if (userDoc?.lastDailyChallengePlayedAt) {
                const today = new Date().toDateString();
                const lastPlayed = new Date(userDoc.lastDailyChallengePlayedAt).toDateString();
                if (today === lastPlayed) {
                    alreadyPlayed = true;
                }
            }

            const SUBJECTS_ROTATION = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Science', 'English', 'Social Studies'];
            const dayIndex = new Date().getDate() % SUBJECTS_ROTATION.length;
            const subject = SUBJECTS_ROTATION[dayIndex];

            res.status(200).json({
                success: true,
                alreadyPlayed,
                subject,
                difficulty: 'Medium',
                totalRounds: 10
            });
        } catch (err: any) {
            logger.error('[Daily Challenge] Error getting status:', err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Get Registered Schools by City ─────────────────────────────────────
    getSchoolsByCity: async (req: Request, res: Response) => {
        try {
            const { city } = req.query;
            if (!city) {
                return res.status(400).json({ success: false, message: 'City is required' });
            }
            const User = require('../auth/user.model').default;
            const schools = await User.distinct('schoolName', {
                city: { $regex: city as string, $options: 'i' },
                schoolName: { $exists: true, $ne: '' }
            });
            res.status(200).json({ success: true, schools });
        } catch (err: any) {
            logger.error('[Arena Schools] Error getting schools by city:', err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Get All Cities with Registered Users ─────────────────────────────────
    getCities: async (req: Request, res: Response) => {
        try {
            const User = require('../auth/user.model').default;
            const cities = await User.distinct('city', {
                city: { $exists: true, $ne: '' }
            });
            res.status(200).json({ success: true, cities });
        } catch (err: any) {
            logger.error('[Arena Cities] Error getting cities:', err.message);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Leave or Disband Battle Room Lobby ─────────────────────────────────────
    leaveRoom: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const userId = user._id || user.id;

            const room = await ArenaRoom.findOne({
                status: { $in: ['WAITING', 'LOBBY_READY', 'ACTIVE'] },
                'players.userId': userId
            });

            if (!room) {
                return res.status(200).json({ success: true, message: 'Not in any active room' });
            }

            // Handle active battle forfeit / leave
            if (room.status === 'ACTIVE') {
                const leavingPlayer = room.players.find((p: any) => (p.userId._id || p.userId).toString() === userId.toString());
                if (leavingPlayer) {
                    leavingPlayer.isConnected = false;
                }

                // Check if all players from one team disconnected/forfeited
                const teamAConnected = room.players.filter((p: any) => p.team === 'A' && (p as any).isConnected).length;
                const teamBConnected = room.players.filter((p: any) => p.team === 'B' && (p as any).isConnected).length;

                if (room.mode === 'SOLO_VS_AI') {
                    room.status = 'FINISHED';
                    room.winnerTeam = 'B' as any; // AI wins
                } else if (teamAConnected === 0 && teamBConnected > 0) {
                    room.status = 'FINISHED';
                    room.winnerTeam = 'B' as any;
                    if (SocketService) {
                        await SocketService._awardXP(room);
                    }
                } else if (teamBConnected === 0 && teamAConnected > 0) {
                    room.status = 'FINISHED';
                    room.winnerTeam = 'A' as any;
                    if (SocketService) {
                        await SocketService._awardXP(room);
                    }
                } else if (teamAConnected === 0 && teamBConnected === 0) {
                    room.status = 'FINISHED';
                    room.winnerTeam = 'DRAW' as any;
                }

                await room.save();

                if (SocketService) {
                    SocketService.emitToSession(room.roomCode, 'arena_forfeit', {
                        room: room.toJSON(),
                        forfeitedBy: userId,
                        forfeitedTeam: leavingPlayer?.team || 'A'
                    });
                }

                return res.status(200).json({ success: true, message: 'Forfeited battle successfully' });
            }

            const isHost = room.hostId.toString() === userId.toString();

            if (isHost) {
                room.status = 'FINISHED';
                room.winnerTeam = 'DRAW';
                await room.save();
                
                if (SocketService) {
                    SocketService.emitToSession(room.roomCode, 'arena_disbanded', { roomCode: room.roomCode });
                }
            } else {
                room.players = room.players.filter((p: any) => p.userId.toString() !== userId.toString()) as any;
                room.teamA.playerIds = room.teamA.playerIds.filter((id: any) => id.toString() !== userId.toString());
                room.teamB.playerIds = room.teamB.playerIds.filter((id: any) => id.toString() !== userId.toString());

                if (room.status === 'LOBBY_READY') {
                    room.status = 'WAITING';
                }

                await room.save();

                const updatedRoom = await ArenaRoom.findOne({ roomCode: room.roomCode })
                    .populate('players.userId', 'firstName lastName grade')
                    .populate('hostId', 'firstName lastName');

                if (SocketService && updatedRoom) {
                    SocketService.emitToSession(room.roomCode, 'arena_lobby_update', { room: updatedRoom.toJSON() });
                }
            }

            res.status(200).json({ success: true, message: isHost ? 'Room cancelled' : 'Left room successfully' });
        } catch (err: any) {
            logger.error('[Arena] leaveRoom error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Normalize Topic Endpoint ──────────────────────────────────────────
    normalizeTopic: async (req: Request, res: Response) => {
        try {
            const { topic, subject, standard } = req.body;
            if (!topic || !topic.trim()) {
                return res.status(400).json({ success: false, message: 'Topic is required.' });
            }
            const normalized = await normalizeTopicWithAI(topic.trim(), subject || 'General', standard || '10');
            res.status(200).json({ success: true, normalizedTopic: normalized });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Get Teacher Classroom Quiz Room Results ─────────────────────────────
    classroomResults: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const room = await ArenaRoom.findOne({ roomCode, roomType: 'TEACHER_ROOM' })
                .populate('players.userId', 'firstName lastName email grade board')
                .populate('hostId', 'firstName lastName');

            if (!room) {
                return res.status(404).json({ success: false, message: 'Classroom quiz room not found.' });
            }

            // Aggregate statistics
            const results = room.players.map((player: any) => {
                const totalQuestions = room.totalRounds;
                const correctCount = player.answersRecord.filter((a: any) => a.isCorrect).length;
                const wrongCount = player.answersRecord.filter((a: any) => !a.isCorrect && a.selectedOption !== null).length;
                const unansweredCount = totalQuestions - player.answersRecord.length;
                
                const avgTimeMs = player.answersRecord.length > 0
                    ? Math.round(player.answersRecord.reduce((acc: number, cur: any) => acc + cur.timeMs, 0) / player.answersRecord.length)
                    : 0;

                return {
                    userId: player.userId?._id,
                    name: `${player.userId?.firstName || player.firstName} ${player.userId?.lastName || ''}`.trim(),
                    email: player.userId?.email,
                    board: player.board,
                    grade: player.grade,
                    score: player.score,
                    correctCount,
                    wrongCount,
                    unansweredCount,
                    avgTimeSec: +(avgTimeMs / 1000).toFixed(1),
                    hasFinished: player.hasFinished
                };
            }).sort((a, b) => b.score - a.score);

            // Compute question-wise analysis (find hardest question)
            const questionStats: Record<number, { text: string; correct: number; total: number }> = {};
            
            // Populate questions text
            const hostQuestions = (room.playerQuestions as any).get(room.hostId.toString()) || [];
            hostQuestions.forEach((q: any, idx: number) => {
                questionStats[idx] = { text: q.question, correct: 0, total: 0 };
            });

            room.players.forEach((player: any) => {
                player.answersRecord.forEach((ans: any) => {
                    const qIdx = ans.questionId;
                    if (questionStats[qIdx]) {
                        questionStats[qIdx].total += 1;
                        if (ans.isCorrect) {
                            questionStats[qIdx].correct += 1;
                        }
                    }
                });
            });

            const questionAnalysis = Object.entries(questionStats).map(([idx, stats]) => ({
                questionIndex: +idx,
                questionText: stats.text,
                correctPercentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                totalAnswers: stats.total
            })).sort((a, b) => a.correctPercentage - b.correctPercentage); // lowest percentage (hardest) first

            res.status(200).json({
                success: true,
                roomInfo: {
                    roomCode: room.roomCode,
                    subject: room.subject,
                    topicConcept: room.topicConcept,
                    standard: room.standard,
                    difficulty: (room as any).difficulty || 'Medium',
                    createdAt: room.createdAt,
                    status: room.status
                },
                results,
                questionAnalysis
            });
        } catch (err: any) {
            logger.error('[Arena] classroomResults error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Get Classroom Quizzes for Teacher ───────────────────────────────────
    listTeacherRooms: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const userId = user._id || user.id;

            const rooms = await ArenaRoom.find({ hostId: userId, roomType: 'TEACHER_ROOM' })
                .populate('players.userId', 'firstName lastName')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, rooms });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ─── Search Students to Invite (Classroom Quiz) ──────────────────────────
    searchStudents: async (req: Request, res: Response) => {
        try {
            const { q, grade } = req.query;
            const filter: any = {};
            if (q) {
                filter.$or = [
                    { firstName: { $regex: q as string, $options: 'i' } },
                    { lastName: { $regex: q as string, $options: 'i' } },
                    { email: { $regex: q as string, $options: 'i' } }
                ];
            }
            if (grade) {
                filter.grade = grade;
            }
            const students = await User.find(filter)
                .select('_id firstName lastName email grade board')
                .limit(20);
            res.status(200).json({ success: true, students });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};


