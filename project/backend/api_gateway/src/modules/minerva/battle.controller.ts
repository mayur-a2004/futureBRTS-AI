import { Request, Response } from 'express';
import ArenaRoom, { ARENA_MODE_SIZES, calculateTeamHP, IArenaQuestion, BASE_HP_PER_PLAYER } from './models/quiz_battle.model';
import User from '../auth/user.model';
import { callGeminiAI, callGroqAI } from '../collage_project/multi_agent.service';
import { logger } from '../../shared/utils/logger';
import { SocketService } from '../../services/socket.service';
import { getProviderResponse } from '../../shared/services/openai.service';

// ─── Swarm AI Helper (Multi-Provider Sequential Retries) ───────────────────
const callSwarmAIHelper = async (prompt: string): Promise<string> => {
    const messages = [
        {
            role: 'system',
            content: `You are an expert quiz master. You generate highly accurate, curriculum-aligned multiple-choice questions matching syllabus guidelines. Output strictly valid JSON array. No markdown, no code block backticks.`
        },
        { role: 'user', content: prompt }
    ];
    
    // getProviderResponse automatically retries sequentially: Groq -> Nvidia -> Gemini -> OpenRouter
    const res = await getProviderResponse(messages, { jsonMode: true, maxTokens: 4000, temperature: 0.3, taskType: 'chat' });
    const content = res?.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error("All AI providers failed to return content.");
    }
    return content;
};

// ─── Topic cleaner (extracts plain topic from stringified JSON or cleans brackets) ─
const cleanTopic = (topic: string): string => {
    if (!topic) return '';
    let str = topic.trim();
    // If it is stringified JSON array/object, extract the actual values
    if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
        try {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed)) {
                const first = parsed[0];
                if (first && typeof first === 'object') {
                    // e.g. [{"html": "HTML"}]
                    str = Object.values(first)[0] as string;
                } else if (typeof first === 'string') {
                    str = first;
                }
            } else if (parsed && typeof parsed === 'object') {
                // e.g. {"html": "HTML"}
                str = Object.values(parsed)[0] as string;
            }
        } catch {
            // ignore and fallback
        }
    }
    // If it is still wrapped in quotes or brackets, strip them
    str = str.replace(/[\[\]{}"]/g, '').trim();
    return str;
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
Do NOT repeat question patterns. The Random Variation Seed is ${salt}; use it to generate completely fresh, non-repetitive questions.
Ensure high diversity in question styles: generate a mix of conceptual queries, application-based scenario questions, case studies, and image-based/diagram-based descriptive MCQs where relevant.
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
    const useSalt = salt ?? (Date.now() + Math.floor(Math.random() * 1000000));
    // Always sanitize topic before building the prompt (strips JSON artifacts)
    const safeTopic = cleanTopic(topic) || topic;
    const prompt = buildQuizPrompt(subject, standard, safeTopic, board, difficulty, totalRounds, useSalt, semester);

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
        if (Array.isArray(questions) && questions.length > 0) {
            const paddedQuestions = [];
            for (let i = 0; i < totalRounds; i++) {
                paddedQuestions.push(questions[i % questions.length]);
            }
            return paddedQuestions.map((q: any) => ({
                ...q,
                grade: standard,
                subject,
                board,
                topicRef: topic
            }));
        }
        throw new Error(`AI returned ${Array.isArray(questions) ? 'empty' : 'invalid'} response`);
    } catch (err: any) {
        const cleanTopicStr = cleanTopic(topic) || topic;
        logger.warn(`[Arena] Question generation failed for ${board}/${standard}/${subject}/${cleanTopicStr}, using curricular fallback: ${err.message}`);
        
        // Curricular fallback questions mapping
        const fallbackCatalog: Record<string, any[]> = {
            'Accountancy': [
                { question: "Which of the following is an asset?", options: ["Accounts Payable", "Cash", "Capital", "Salary Expense"], correctAnswer: 1, difficulty: "Easy", explanation: "Cash is a resource owned by the business that has economic value." },
                { question: "What is the basic accounting equation?", options: ["Assets = Liabilities - Capital", "Assets = Liabilities + Capital", "Liabilities = Assets + Capital", "Capital = Assets + Liabilities"], correctAnswer: 1, difficulty: "Easy", explanation: "The fundamental accounting equation is Assets = Liabilities + Owner's Equity (Capital)." },
                { question: "Which account increases with a debit entry?", options: ["Accounts Payable", "Cash", "Service Revenue", "Owner's Capital"], correctAnswer: 1, difficulty: "Medium", explanation: "Asset accounts (like Cash) and Expense accounts increase with a debit." },
                { question: "What is double-entry bookkeeping?", options: ["Recording transactions twice", "Having two accountants check the books", "Every transaction affects at least two accounts with equal debits and credits", "Maintaining two separate sets of books"], correctAnswer: 2, difficulty: "Medium", explanation: "Double-entry bookkeeping requires that every financial transaction has equal and opposite debit and credit entries." },
                { question: "The process of transferring journal entries to ledger accounts is called:", options: ["Journalizing", "Posting", "Balancing", "Analyzing"], correctAnswer: 1, difficulty: "Easy", explanation: "Posting refers to transferring entries from the journal to the ledger." },
                { question: "Which financial statement shows a company's financial position at a specific point in time?", options: ["Income Statement", "Statement of Cash Flows", "Balance Sheet", "Retained Earnings Statement"], correctAnswer: 2, difficulty: "Medium", explanation: "The Balance Sheet reports assets, liabilities, and equity as of a specific date." },
                { question: "Revenue is recognized when it is earned, not when cash is received. This is known as:", options: ["Cash Basis Accounting", "Accrual Basis Accounting", "Matching Principle", "Going Concern Assumption"], correctAnswer: 1, difficulty: "Hard", explanation: "Accrual basis accounting records revenue when earned and expenses when incurred, regardless of cash flow." },
                { question: "Which of the following is a liability?", options: ["Accounts Receivable", "Prepaid Insurance", "Unearned Revenue", "Equipment"], correctAnswer: 2, difficulty: "Hard", explanation: "Unearned revenue represents an obligation to perform services in the future, making it a liability." },
                { question: "Goodwill is classified as which type of asset?", options: ["Current Asset", "Tangible Asset", "Intangible Asset", "Contra-Asset"], correctAnswer: 2, difficulty: "Medium", explanation: "Goodwill is an intangible asset that arises when a buyer acquires an existing business." },
                { question: "What is the primary purpose of a Trial Balance?", options: ["To calculate net profit", "To verify that total debits equal total credits", "To prepare tax returns", "To list all cash transactions"], correctAnswer: 1, difficulty: "Easy", explanation: "A trial balance checks the mathematical accuracy of the double-entry system." }
            ],
            'Economics': [
                { question: "What is the fundamental problem of economics?", options: ["Inflation", "Scarcity", "Unemployment", "Poverty"], correctAnswer: 1, difficulty: "Easy", explanation: "Scarcity of resources relative to unlimited human wants is the core economic problem." },
                { question: "According to the Law of Demand, what happens when price increases?", options: ["Demand increases", "Quantity demanded decreases", "Quantity demanded increases", "Demand decreases"], correctAnswer: 1, difficulty: "Easy", explanation: "There is an inverse relationship between price and quantity demanded." },
                { question: "What is opportunity cost?", options: ["The monetary cost of a choice", "The value of the next best alternative forgone", "The cost of starting a business", "Sunk costs"], correctAnswer: 1, difficulty: "Medium", explanation: "Opportunity cost is the value of what you give up when making a decision." },
                { question: "GDP stands for:", options: ["Gross Domestic Product", "General Demand Product", "Government Debt Percentage", "Growth Development Plan"], correctAnswer: 0, difficulty: "Easy", explanation: "Gross Domestic Product measures the total value of goods and services produced within a country." },
                { question: "A market structure with a single seller is called a:", options: ["Monopolistic Competition", "Oligopoly", "Monopoly", "Perfect Competition"], correctAnswer: 2, difficulty: "Easy", explanation: "A monopoly exists when there is only one provider of a good or service." },
                { question: "Inflation refers to a general increase in:", options: ["Unemployment", "Interest rates", "Prices", "Taxation"], correctAnswer: 2, difficulty: "Easy", explanation: "Inflation is the rate at which the general level of prices for goods and services is rising." },
                { question: "Which of the following is a tool of monetary policy?", options: ["Government spending", "Open market operations", "Income tax rates", "Corporate subsidies"], correctAnswer: 1, difficulty: "Hard", explanation: "Monetary policy is controlled by the central bank using tools like open market operations and interest rates." },
                { question: "When the price elasticity of demand is greater than 1, demand is:", options: ["Inelastic", "Elastic", "Unit elastic", "Perfectly inelastic"], correctAnswer: 1, difficulty: "Medium", explanation: "An elasticity greater than 1 means quantity demanded is highly responsive to price changes." }
            ],
            'Science': [
                { question: "What gas do plants primarily absorb during photosynthesis?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctAnswer: 1, difficulty: "Easy", explanation: "Plants absorb carbon dioxide to produce glucose and release oxygen." },
                { question: "What is the chemical symbol for gold?", options: ["Ag", "Fe", "Au", "Pb"], correctAnswer: 2, difficulty: "Easy", explanation: "Au is derived from the Latin word 'aurum'." },
                { question: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"], correctAnswer: 2, difficulty: "Easy", explanation: "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP)." },
                { question: "What is the acceleration due to gravity on Earth's surface?", options: ["9.8 m/s²", "8.5 m/s²", "10.5 m/s²", "7.2 m/s²"], correctAnswer: 0, difficulty: "Easy", explanation: "Standard gravity on Earth is approximately 9.80665 m/s²." }
            ],
            'Business Studies': [
                { question: "Who is known as the father of Scientific Management?", options: ["Henry Fayol", "F.W. Taylor", "Max Weber", "Peter Drucker"], correctAnswer: 1, difficulty: "Easy", explanation: "F.W. Taylor developed the principles of scientific management." },
                { question: "Which function of management involves grouping activities to achieve goals?", options: ["Planning", "Organizing", "Staffing", "Directing"], correctAnswer: 1, difficulty: "Easy", explanation: "Organizing is the process of defining and grouping activities." }
            ]
        };

        const subjectKey = Object.keys(fallbackCatalog).find(k => k.toLowerCase() === subject.toLowerCase()) || 'Science';
        const rawList = fallbackCatalog[subjectKey] || fallbackCatalog['Science'];
        
        const paddedQuestions = [];
        for (let i = 0; i < totalRounds; i++) {
            paddedQuestions.push(rawList[i % rawList.length]);
        }

        return paddedQuestions.map((q: any) => ({
            ...q,
            grade: standard,
            subject,
            board,
            topicRef: topic
        }));
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

            // ─── Clean & validate topic (strip any JSON artifacts) ───────────────
            const cleanedTopic = cleanTopic(topic);
            if (!cleanedTopic) {
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

            // Run topic normalization via AI (always on the cleaned, plain-text topic)
            const normalizedRaw = await normalizeTopicWithAI(cleanedTopic, subject, String(hostGrade));
            const normalized = cleanTopic(normalizedRaw) || cleanedTopic;

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
                topic: normalized,
                topicConcept: normalized,
                topicRaw: cleanedTopic,
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
            const { roomCode, team, grade, board, subject, topic, joinMode } = req.body;  // team: 'A' | 'B', grade/board/subject/topic: optional overrides
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
            // Custom overrides: joiner can specify their own subject & topic in 'CUSTOM' mode
            const joinerSubject = (joinMode === 'CUSTOM' && subject) ? subject : room.subject;
            const joinerTopic = (joinMode === 'CUSTOM' && topic && topic.trim()) ? topic.trim() : (room.topicConcept || room.topic);
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
                // In an open arena: if joiner is in SAME mode AND shares host's grade/board/subject/topic, reuse host questions
                const hostQuestions = (room.playerQuestions as any).get(room.hostId.toString());
                const sameAsHost = 
                    joinMode !== 'CUSTOM' &&
                    hostQuestions && 
                    hostQuestions.length > 0 && 
                    String(joinerGrade) === String(room.standard) && 
                    joinerBoard === room.board &&
                    joinerSubject === room.subject &&
                    joinerTopic === (room.topicConcept || room.topic);

                if (sameAsHost) {
                    gradeQuestions = hostQuestions;
                } else {
                    // Generate personalized questions based on joiner's chosen settings
                    logger.info(`[Arena] Generating custom questions for ${joiningUser.firstName}: ${joinerSubject}/${joinerTopic}/${joinerBoard}/${joinerGrade}`);
                    gradeQuestions = await generateDynamicQuestions(
                        joinerSubject,
                        String(joinerGrade),
                        joinerTopic,
                        joinerBoard,
                        diff,
                        room.totalRounds,
                        Math.floor(Math.random() * 1000000),
                        room.semester || undefined
                    );
                }
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
            const cleaned = cleanTopic(topic);
            if (!cleaned) {
                return res.status(400).json({ success: false, message: 'Topic is required.' });
            }
            const normalizedRaw = await normalizeTopicWithAI(cleaned, subject || 'General', standard || '10');
            const normalizedTopic = cleanTopic(normalizedRaw) || cleaned;
            res.status(200).json({ success: true, normalizedTopic });
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
    },

    // ─── TEACHER FORCE STOP QUIZ ─────────────────────────────────────────────
    stopRoom: async (req: Request, res: Response) => {
        try {
            const { roomCode } = req.params;
            const teacher = (req as any).user;

            const room = await ArenaRoom.findOne({ roomCode });
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found.' });
            }
            if (room.hostId.toString() !== (teacher._id || teacher.id).toString()) {
                return res.status(403).json({ success: false, message: 'Only the host teacher can stop this quiz.' });
            }
            if (room.status === 'CANCELLED' || room.status === 'FINISHED') {
                return res.status(400).json({ success: false, message: 'Room is already closed.' });
            }

            // Cancel the room
            room.status = 'CANCELLED' as any;
            await room.save();

            // Broadcast via Socket.io to all players so they get kicked out in real-time
            const { SocketService } = require('../../services/socket.service');
            SocketService.emitToSession(roomCode, 'arena_teacher_stopped', {
                roomCode,
                message: 'Quiz has been stopped by the teacher.',
                stoppedAt: new Date().toISOString()
            });

            logger.info(`[Arena] Teacher stopped room: ${roomCode} by ${teacher._id || teacher.id}`);
            res.status(200).json({ success: true, message: 'Quiz stopped and all students have been removed.' });
        } catch (err: any) {
            logger.error('[Arena] stopRoom error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};





