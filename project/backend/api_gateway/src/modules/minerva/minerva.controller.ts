import { Request, Response } from 'express';
import MinervaStudentProfile from './models/minerva_student_profile.model';
import MinervaStudySession from './models/minerva_study_session.model';
import MinervaKnowledgeNode from './models/minerva_knowledge_node.model';
import MinervaTask from './models/minerva_task.model';
import MinervaExam from './models/minerva_exam.model';
import MinervaChatMessage from './models/minerva_chat_message.model';
import MinervaChatSession from './models/minerva_chat_session.model';
import {
    detectStudentIntent,
    getMinervaChat,
    generateRoadmap,
    generateTopicContent,
    gradeStudentAnswer,
    generateExamPaper,
    extractProfileFromChat,
    generateStudentStudyMaterial,
    translateContent,
    gradeExamWrittenAnswers,
} from './minerva.service';

// ─────────────────────────────────────────────────────────────────
// HELPER: get or create student profile
// ─────────────────────────────────────────────────────────────────
const getOrCreateProfile = async (userId: string) => {
    let profile = await MinervaStudentProfile.findOne({ userId });
    if (!profile) {
        profile = await MinervaStudentProfile.create({ userId });
    }
    return profile;
};

// ─────────────────────────────────────────────────────────────────
// HELPER: save chat message
// ─────────────────────────────────────────────────────────────────
const saveChatMessage = async (
    userId: string,
    role: 'student' | 'minerva',
    content: string,
    content_type: string = 'text',
    session_id: any = null,
    metadata: any = null,
    chat_session_id: any = null
) => {
    return await MinervaChatMessage.create({ userId, role, content, content_type, session_id, metadata, chat_session_id });
};

// ─────────────────────────────────────────────────────────────────
// HELPER: update session progress
// ─────────────────────────────────────────────────────────────────
const updateSessionProgress = async (sessionId: string) => {
    const total = await MinervaKnowledgeNode.countDocuments({ session_id: sessionId });
    const done = await MinervaKnowledgeNode.countDocuments({ session_id: sessionId, status: 'DONE' });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    await MinervaStudySession.findByIdAndUpdate(sessionId, {
        completed_nodes: done,
        total_nodes: total,
        progress_percent: pct,
        last_accessed: new Date(),
        exam_ready: pct >= 50,
    });
    return { total, done, pct };
};

// ─────────────────────────────────────────────────────────────────
// Generation Lock to prevent race condition/concurrent generation of node content
// ─────────────────────────────────────────────────────────────────
const generationLocks = new Map<string, Promise<any>>();

// ─────────────────────────────────────────────────────────────────
// CONTROLLER EXPORTS
// ─────────────────────────────────────────────────────────────────
export const minervaController = {

    // ──────────────────────────────────────────
    // 1. MAIN CHAT — Student sends a message
    // POST /api/minerva/chat
    // ──────────────────────────────────────────
    chat: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { message, session_id, chat_session_id, deep_study } = req.body;

            if (!message?.trim()) {
                return res.status(400).json({ success: false, error: 'Message is required' });
            }

            // Get student profile
            const profile = await getOrCreateProfile(userId);

            // Determine active chat session ID
            let activeChatSessionId = chat_session_id;
            if (!activeChatSessionId) {
                const newSession = await MinervaChatSession.create({
                    userId,
                    title: 'New Chat'
                });
                activeChatSessionId = newSession._id;
            } else {
                await MinervaChatSession.findByIdAndUpdate(activeChatSessionId, { last_accessed: new Date() });
            }

            // Parse message if it's a file upload format
            let cleanDisplayContent = message;
            let fullExtractedText = '';
            let filename = '';
            let studentQuery = message;

            if (message.startsWith('[Uploaded File:')) {
                const fileMatch = message.match(/\[Uploaded File:\s*(.*?)\]/);
                if (fileMatch) filename = fileMatch[1];

                const queryMatch = message.match(/Student Query:\s*([\s\S]*)$/);
                if (queryMatch) studentQuery = queryMatch[1].trim();

                const textMatch = message.match(/Extracted Content:\s*"""\s*([\s\S]*?)\s*"""/);
                if (textMatch) fullExtractedText = textMatch[1].trim();

                cleanDisplayContent = `📁 ${filename}\n\n${studentQuery || 'Explain this uploaded study material.'}`;
            }

            // Update session title if it's 'New Chat' or empty
            const currentSession = await MinervaChatSession.findById(activeChatSessionId);
            if (currentSession && (currentSession.title === 'New Chat' || !currentSession.title)) {
                let newTitle = filename ? `File: ${filename}` : studentQuery;
                if (newTitle.length > 35) {
                    newTitle = newTitle.substring(0, 32) + '...';
                }
                await MinervaChatSession.findByIdAndUpdate(activeChatSessionId, { title: newTitle });
            }

            // Save student message (clean version)
            const savedStudentMsg = await saveChatMessage(
                userId,
                'student',
                cleanDisplayContent,
                'text',
                session_id,
                fullExtractedText ? { file_text: fullExtractedText, filename } : null,
                activeChatSessionId
            );

            // Get recent chat history for context (reconstructing full messages for LLM context)
            const rawChatHistory = await MinervaChatMessage.find({ userId, chat_session_id: activeChatSessionId })
                .sort({ createdAt: -1 }).limit(8).lean();
            rawChatHistory.reverse();

            const chatHistory = rawChatHistory.map((m: any) => {
                let content = m.content;
                if (m.metadata?.file_text) {
                    content = `[Uploaded File: ${m.metadata.filename}]\n\nExtracted Content:\n"""\n${m.metadata.file_text}\n"""\n\nStudent Query: ${content.replace(/📁.*?\n\n/, '')}`;
                }
                return { ...m, content };
            });

            // Detect intent using ONLY the student's text query (saves tokens, avoids rate limits)
            const intent = await detectStudentIntent(studentQuery, profile);

            let reply = '';
            let content_type = 'text';
            let metadata: any = null;

            // ── ROUTE BY INTENT ──
            const isRoadmapRequest = studentQuery.toLowerCase().includes('roadmap') || 
                                     studentQuery.toLowerCase().includes('syllabus') || 
                                     studentQuery.toLowerCase().includes('path') ||
                                     studentQuery.toLowerCase().includes('schedule') ||
                                     studentQuery.toLowerCase().includes('road map');

            if ((!deep_study || isRoadmapRequest) && (intent.intent === 'create_session' || intent.intent === 'learn_topic')) {
                // Auto-detect profile info and update
                if (intent.grade_level && !profile.onboarding_done) {
                    await MinervaStudentProfile.findByIdAndUpdate(profile._id, {
                        grade_level: intent.grade_level || profile.grade_level,
                        board: intent.board || profile.board,
                        education_type: intent.education_type || profile.education_type,
                        medium: intent.medium || profile.medium,
                        state: intent.state || profile.state,
                        onboarding_done: true,
                    });
                }

                // Determine target language based on intent, profile, or query
                let targetLang = 'english';
                if (intent.language === 'hi') {
                    // Check if Devanagari script is used
                    const hasDevanagari = /[\u0900-\u097F]/.test(studentQuery);
                    targetLang = hasDevanagari ? 'hindi' : 'hinglish';
                } else if (intent.language === 'mr') {
                    targetLang = 'marathi';
                } else if (intent.language === 'gu') {
                    targetLang = 'gujarati';
                } else if (intent.language === 'ta') {
                    targetLang = 'tamil';
                } else if (intent.language === 'te') {
                    targetLang = 'telugu';
                } else if (intent.language === 'kn') {
                    targetLang = 'kannada';
                } else if (intent.language === 'pa') {
                    targetLang = 'punjabi';
                } else if (profile.language_preference && profile.language_preference !== 'english') {
                    targetLang = profile.language_preference;
                }

                // Generate roadmap
                const subject = intent.subject || studentQuery;
                const board = intent.board || profile.board || 'cbse';
                const grade = intent.grade_level || profile.grade_level || 'class_10';

                // Truncate file content if passing to roadmap to keep it within safe token limits (e.g. max 15000 chars)
                const sourceContent = fullExtractedText ? fullExtractedText.substring(0, 15000) : undefined;
                const roadmapData = await generateRoadmap(subject, intent.topic || subject, grade, board, targetLang, sourceContent, targetLang);

                if (roadmapData && roadmapData.nodes?.length > 0) {
                    // Create session
                    const session = await MinervaStudySession.create({
                        userId,
                        title: roadmapData.title || `${subject} Study Session`,
                        subject,
                        board,
                        grade_level: grade,
                        education_type: intent.education_type || 'school',
                        medium: targetLang, // store target language as the medium of the session!
                        source_type: 'chat',
                        source_content: studentQuery,
                        detected_language: intent.language || 'hi',
                        detected_board: board,
                        detected_grade: grade,
                    });

                    // Create knowledge nodes
                    const nodeIds: any[] = [];
                    for (let i = 0; i < roadmapData.nodes.length; i++) {
                        const n = roadmapData.nodes[i];
                        const node = await MinervaKnowledgeNode.create({
                            session_id: session._id,
                            userId,
                            title: n.title,
                            chapter: n.chapter || '',
                            topic: n.topic || n.title,
                            subtopic: n.subtopic || '',
                            priority: n.priority || 'MEDIUM',
                            priority_reason: n.priority_reason || '',
                            board_relevance: n.board_relevance || '',
                            exam_weightage_percent: n.exam_weightage_percent || 0,
                            status: i === 0 ? 'UNLOCKED' : 'LOCKED',
                            order_index: n.order_index || i + 1,
                            key_points: n.key_points || [],
                            key_formulas: n.key_formulas || [],
                            estimated_time_minutes: n.estimated_time_minutes || 20,
                            difficulty: n.difficulty || 'intermediate',
                        });
                        nodeIds.push(node._id);
                    }

                    // Update session with nodes
                    await MinervaStudySession.findByIdAndUpdate(session._id, {
                        nodes: nodeIds,
                        total_nodes: nodeIds.length,
                    });

                    const originalReply = `✅ Tera roadmap ready hai! 🎓

**${roadmapData.title}** ke liye maine **${roadmapData.nodes.length} topics** create kiye hain — HIGH priority se start kar rahe hain.

Pehla topic **"${roadmapData.nodes[0]?.title}"** already unlock hai. Chalo padhe! 👇`;

                    if (targetLang === 'english') {
                        reply = `✅ Your roadmap is ready! 🎓

I have created **${roadmapData.nodes.length} topics** for **${roadmapData.title}** — starting with HIGH priority first.

The first topic **"${roadmapData.nodes[0]?.title}"** is already unlocked. Let's study! 👇`;
                    } else if (targetLang !== 'hinglish') {
                        // Translate default Hinglish success reply to the target language
                        reply = await translateContent(originalReply, targetLang);
                    } else {
                        reply = originalReply;
                    }

                    content_type = 'roadmap';
                    metadata = {
                        session_id: session._id,
                        session_title: session.title,
                        total_nodes: roadmapData.nodes.length,
                        board_pattern: roadmapData.board_pattern,
                        estimated_hours: roadmapData.estimated_hours,
                        first_node_title: roadmapData.nodes[0]?.title,
                    };
                } else {
                    // Fallback to chat
                    // If we have an uploaded file, we want to explain it. We pass the full message text (with file context)
                    const chatRes = await getMinervaChat(
                        fullExtractedText ? `[Uploaded File: ${filename}]\n\nExtracted Content:\n"""\n${fullExtractedText}\n"""\n\nStudent Query: ${studentQuery}` : studentQuery,
                        profile,
                        chatHistory,
                        undefined,
                        !!deep_study
                    );
                    reply = chatRes.reply;
                }

            } else if (intent.intent === 'get_homework') {
                // Return homework redirect info
                const today = new Date().toISOString().split('T')[0];
                const pendingHW = await MinervaTask.countDocuments({
                    userId,
                    is_homework: true,
                    submitted: false,
                    due_date: { $gte: new Date(today) },
                });
                reply = `📝 Tera aaj ka homework ready hai! Total **${pendingHW} questions** pending hain. Homework page pe ja ke complete karo!`;
                content_type = 'homework';
                metadata = { pending_count: pendingHW, redirect: '/future-education/homework' };

            } else if (intent.intent === 'generate_exam') {
                // Redirect to exam generator
                const sessions = await MinervaStudySession.find({ userId, exam_ready: true }).select('_id title');
                reply = `📋 Exam generate karta hun! ${sessions.length > 0 ? `Tera **${sessions[0].title}** exam ready hai.` : 'Pehle koi topic complete karo phir exam generate hoga.'}`;
                content_type = 'exam_ready';
                metadata = { sessions: sessions.slice(0, 3), redirect: '/future-education/exams' };

            } else {
                // General chat
                const chatRes = await getMinervaChat(
                    fullExtractedText ? `[Uploaded File: ${filename}]\n\nExtracted Content:\n"""\n${fullExtractedText}\n"""\n\nStudent Query: ${studentQuery}` : studentQuery,
                    profile,
                    chatHistory,
                    undefined,
                    !!deep_study
                );
                reply = chatRes.reply;
                content_type = chatRes.content_type;
                metadata = chatRes.metadata;
            }

            // Save Minerva reply
            const savedReply = await saveChatMessage(userId, 'minerva', reply, content_type, session_id, metadata, activeChatSessionId);

            return res.json({
                success: true,
                reply,
                content_type,
                metadata,
                message_id: savedReply._id,
                intent: intent.intent,
                chat_session_id: activeChatSessionId,
            });

        } catch (err: any) {
            console.error('[Minerva Chat Error]', err);
            return res.status(500).json({ success: false, error: 'AI teacher ka connection problem hai. Dobara try karo!' });
        }
    },

    // ──────────────────────────────────────────
    // 2. GET PROFILE
    // GET /api/minerva/profile
    // ──────────────────────────────────────────
    getProfile: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const profile = await getOrCreateProfile(userId);
            return res.json({ success: true, profile });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 3. UPDATE PROFILE
    // PUT /api/minerva/profile
    // ──────────────────────────────────────────
    updateProfile: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { grade_level, board, state, medium, language_preference, learning_style, daily_time_minutes, name } = req.body;

            const profile = await MinervaStudentProfile.findOneAndUpdate(
                { userId },
                { grade_level, board, state, medium, language_preference, learning_style, daily_time_minutes, name, onboarding_done: true },
                { new: true, upsert: true }
            );
            return res.json({ success: true, profile });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 4. GET ALL SESSIONS
    // GET /api/minerva/sessions
    // ──────────────────────────────────────────
    getSessions: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const sessions = await MinervaStudySession.find({ userId, status: { $ne: 'archived' } })
                .sort({ last_accessed: -1 })
                .select('title subject board grade_level progress_percent total_nodes completed_nodes status exam_ready last_accessed createdAt')
                .lean();
            return res.json({ success: true, sessions });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 5. GET SESSION DETAILS + NODES
    // GET /api/minerva/session/:id
    // ──────────────────────────────────────────
    getSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const session = await MinervaStudySession.findOne({ _id: id, userId }).lean();
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

            const nodes = await MinervaKnowledgeNode.find({ session_id: id })
                .sort({ order_index: 1 })
                .select('title chapter topic priority status order_index last_score passed difficulty estimated_time_minutes exam_weightage_percent priority_reason board_relevance key_points')
                .lean();

            await MinervaStudySession.findByIdAndUpdate(id, { last_accessed: new Date() });

            return res.json({ success: true, session, nodes });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 6. LEARN TOPIC — fetch/generate content
    // POST /api/minerva/node/:id/learn
    // ──────────────────────────────────────────
    learnNode: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            // If another request is currently generating for this node, wait for it
            if (generationLocks.has(id)) {
                await generationLocks.get(id);
                // Re-fetch the node after generation completes
                const freshNode = await MinervaKnowledgeNode.findOne({ _id: id, userId });
                if (freshNode && freshNode.explanation_detailed && freshNode.explanation_detailed.length > 100) {
                    const query = freshNode.micro_tasks && freshNode.micro_tasks.length > 0
                        ? { _id: { $in: freshNode.micro_tasks } }
                        : { node_id: id, task_type: 'micro_task' };
                    const tasks = await MinervaTask.find(query)
                        .select('type prompt options marks difficulty submitted passed ai_score').lean();
                    return res.json({
                        success: true,
                        node: freshNode,
                        tasks,
                        youtube_links: (freshNode as any).youtube_links || []
                    });
                }
            }

            const node = await MinervaKnowledgeNode.findOne({ _id: id, userId });
            if (!node) return res.status(404).json({ success: false, error: 'Topic not found' });
            if (node.status === 'LOCKED') {
                return res.status(403).json({ success: false, error: 'Pehle previous topic complete karo!' });
            }

            // If content already generated, return it
            if (node.explanation_detailed && node.explanation_detailed.length > 100) {
                const query = node.micro_tasks && node.micro_tasks.length > 0
                    ? { _id: { $in: node.micro_tasks } }
                    : { node_id: id, task_type: 'micro_task' };
                const rawTasks = await MinervaTask.find(query)
                    .select('type prompt options marks difficulty submitted passed ai_score').lean();
                
                // Deduplicate tasks based on prompt to handle existing duplicates
                const uniqueTasksMap = new Map();
                for (const t of rawTasks) {
                    if (!uniqueTasksMap.has(t.prompt)) {
                        uniqueTasksMap.set(t.prompt, t);
                    } else {
                        // Background self-healing database deletion for duplicate tasks
                        MinervaTask.deleteOne({ _id: (t as any)._id }).catch(err => console.error("Error deleting duplicate task:", err));
                    }
                }
                const tasks = Array.from(uniqueTasksMap.values());

                return res.json({ 
                    success: true, 
                    node, 
                    tasks,
                    youtube_links: (node as any).youtube_links || []
                });
            }

            // Create a promise for generation to act as a lock
            let resolveLock: any;
            const lockPromise = new Promise((resolve) => {
                resolveLock = resolve;
            });
            generationLocks.set(id, lockPromise);

            let updatedNode;
            let youtubeLinks;
            let content;
            let taskIds: any[] = [];

            try {
                // Generate content
                const profile = await getOrCreateProfile(userId);
                
                // Fetch the study session to retrieve the correct medium/language preference
                const session = await MinervaStudySession.findById(node.session_id);
                const sessionLanguage = session?.medium || session?.detected_language || profile.language_preference || 'hinglish';
                
                content = await generateTopicContent(node, profile, sessionLanguage);

                if (!content) {
                    resolveLock();
                    generationLocks.delete(id);
                    return res.status(500).json({ success: false, error: 'Content generate nahi hua. Dobara try karo.' });
                }

                // Save generated content
                updatedNode = await MinervaKnowledgeNode.findByIdAndUpdate(id, {
                    explanation_simple: content.explanation_simple || '',
                    explanation_detailed: content.explanation_detailed || '',
                    real_world_example: content.real_world_example || '',
                    key_points: content.key_points || node.key_points,
                    key_formulas: content.key_formulas || node.key_formulas,
                    status: 'IN_PROGRESS',
                }, { new: true });

                // Save micro tasks
                if (content.micro_tasks?.length > 0) {
                    for (const t of content.micro_tasks) {
                        // Check if duplicate task already exists
                        const existingTask = await MinervaTask.findOne({ node_id: id, prompt: t.prompt, task_type: 'micro_task' });
                        if (existingTask) {
                            taskIds.push(existingTask._id);
                            continue;
                        }
                        const task = await MinervaTask.create({
                            node_id: id,
                            session_id: node.session_id,
                            userId,
                            type: t.type,
                            task_type: 'micro_task',
                            prompt: t.prompt,
                            options: t.options || [],
                            correct_answer: t.correct_answer || '',
                            topic_title: node.title,
                            subject: node.topic,
                            marks: t.marks || 5,
                            difficulty: t.difficulty || 'medium',
                            is_homework: false,
                        });
                        taskIds.push(task._id);
                    }
                }

                // Save homework tasks
                if (content.homework_tasks?.length > 0) {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    for (const t of content.homework_tasks) {
                        // Check if duplicate homework already exists
                        const existingHw = await MinervaTask.findOne({ node_id: id, prompt: t.prompt, task_type: 'homework' });
                        if (existingHw) continue;
                        await MinervaTask.create({
                            node_id: id,
                            session_id: node.session_id,
                            userId,
                            type: t.type,
                            task_type: 'homework',
                            prompt: t.prompt,
                            correct_answer: t.correct_answer || '',
                            topic_title: node.title,
                            subject: node.topic,
                            marks: t.marks || 5,
                            difficulty: t.difficulty || 'medium',
                            is_homework: true,
                            due_date: tomorrow,
                            homework_date: tomorrow.toISOString().split('T')[0],
                        });
                    }
                }

                // Update node with task IDs
                await MinervaKnowledgeNode.findByIdAndUpdate(id, { micro_tasks: taskIds });

                // Build YouTube queries (return search queries, frontend will display)
                youtubeLinks = (content.youtube_queries || []).map((q: string) => ({
                    title: q,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
                    channel: 'YouTube',
                    language: profile.language_preference || 'hindi',
                }));

                await MinervaKnowledgeNode.findByIdAndUpdate(id, { youtube_links: youtubeLinks });

                resolveLock();
                generationLocks.delete(id);
            } catch (err) {
                resolveLock();
                generationLocks.delete(id);
                throw err;
            }

            // Fetch the created tasks
            const rawTasks = await MinervaTask.find({ _id: { $in: taskIds } })
                .select('type prompt options marks difficulty submitted passed ai_score').lean();

            // Deduplicate tasks based on prompt to handle existing duplicates
            const uniqueTasksMap = new Map();
            for (const t of rawTasks) {
                if (!uniqueTasksMap.has(t.prompt)) {
                    uniqueTasksMap.set(t.prompt, t);
                } else {
                    // Background self-healing database deletion for duplicate tasks
                    MinervaTask.deleteOne({ _id: (t as any)._id }).catch(err => console.error("Error deleting duplicate task:", err));
                }
            }
            const tasks = Array.from(uniqueTasksMap.values());

            return res.json({
                success: true,
                node: updatedNode,
                tasks,
                youtube_links: youtubeLinks,
                memory_trick: content.memory_trick,
                board_specific_note: content.board_specific_note,
            });

        } catch (err: any) {
            console.error('[Minerva Learn Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 7. SUBMIT TASK ANSWER
    // POST /api/minerva/task/:id/submit
    // ──────────────────────────────────────────
    submitTask: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { answer } = req.body;

            if (!answer?.trim()) {
                return res.status(400).json({ success: false, error: 'Answer is required' });
            }

            const task = await MinervaTask.findOne({ _id: id, userId });
            if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
            if (task.submitted) return res.json({ success: true, message: 'Already submitted', task });

            const profile = await getOrCreateProfile(userId);
            const gradingResult = await gradeStudentAnswer(task, answer, profile.language_preference || 'hinglish');

            const updatedTask = await MinervaTask.findByIdAndUpdate(id, {
                student_answer: answer,
                ai_score: gradingResult.score,
                ai_feedback: gradingResult.feedback,
                ai_correction: gradingResult.correction,
                passed: gradingResult.passed,
                submitted: true,
                submitted_at: new Date(),
            }, { new: true });

            const node = await MinervaKnowledgeNode.findById(task.node_id);

            // Check if student failed this specific task (immediate SRS spacing adjustment)
            if (node && (!gradingResult.passed || gradingResult.score < 60)) {
                const ease = node.sr_ease_factor || 2.5;
                const newEase = Math.max(1.3, ease - 0.2);
                await MinervaKnowledgeNode.findByIdAndUpdate(task.node_id, {
                    passed: false,
                    status: 'NEEDS_REVIEW',
                    sr_repetitions: 0,
                    sr_ease_factor: newEase,
                    sr_interval_days: 1,
                    sr_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Reschedule for tomorrow
                });
            }

            // Check if all micro tasks for this node are done
            if (node && !task.is_homework) {
                const query = node.micro_tasks && node.micro_tasks.length > 0
                    ? { _id: { $in: node.micro_tasks } }
                    : { node_id: task.node_id, task_type: 'micro_task' };
                const rawAllTasks = await MinervaTask.find(query);
                
                // Deduplicate
                const uniqueTasksMap = new Map();
                for (const t of rawAllTasks) {
                    if (!uniqueTasksMap.has(t.prompt)) {
                        uniqueTasksMap.set(t.prompt, t);
                    } else {
                        MinervaTask.deleteOne({ _id: t._id }).catch(err => console.error("Error deleting duplicate task:", err));
                    }
                }
                const allTasks = Array.from(uniqueTasksMap.values());
                
                const submittedTasks = allTasks.filter(t => t.submitted);
                if (submittedTasks.length === allTasks.length) {
                    const avgScore = submittedTasks.reduce((sum, t) => sum + t.ai_score, 0) / submittedTasks.length;
                    const passed = avgScore >= 60;

                    let reps = node.sr_repetitions || 0;
                    let ease = node.sr_ease_factor || 2.5;
                    let interval = node.sr_interval_days || 1;

                    if (passed) {
                        reps += 1;
                        if (reps === 1) {
                            interval = 1;
                        } else if (reps === 2) {
                            interval = 4;
                        } else {
                            interval = Math.round(interval * ease);
                        }
                        if (avgScore >= 80) {
                            ease = Math.min(3.0, ease + 0.1);
                        }
                    } else {
                        reps = 0;
                        interval = 1;
                        ease = Math.max(1.3, ease - 0.2);
                    }

                    const sr_due_date = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

                    await MinervaKnowledgeNode.findByIdAndUpdate(task.node_id, {
                        last_score: Math.round(avgScore),
                        attempts: (node.attempts || 0) + 1,
                        passed,
                        status: passed ? 'DONE' : 'NEEDS_REVIEW',
                        sr_repetitions: reps,
                        sr_ease_factor: ease,
                        sr_interval_days: interval,
                        sr_due_date,
                    });

                    // Unlock next node if passed
                    if (passed) {
                        const nextNode = await MinervaKnowledgeNode.findOne({
                            session_id: node.session_id,
                            order_index: node.order_index + 1,
                            status: 'LOCKED',
                        });
                        if (nextNode) {
                            await MinervaKnowledgeNode.findByIdAndUpdate(nextNode._id, { status: 'UNLOCKED' });
                        }
                        await updateSessionProgress(String(node.session_id));
                    }
                }
            }

            return res.json({
                success: true,
                task: updatedTask,
                score: gradingResult.score,
                feedback: gradingResult.feedback,
                correction: gradingResult.correction,
                passed: gradingResult.passed,
            });

        } catch (err: any) {
            console.error('[Minerva Task Submit Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 8. GET TODAY'S HOMEWORK
    // GET /api/minerva/homework/today
    // ──────────────────────────────────────────
    getTodayHomework: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const today = new Date().toISOString().split('T')[0];

            const tasks = await MinervaTask.find({
                userId,
                is_homework: true,
                homework_date: today,
            }).lean();

            const pending = tasks.filter(t => !t.submitted);
            const completed = tasks.filter(t => t.submitted);

            return res.json({
                success: true,
                date: today,
                total: tasks.length,
                pending_count: pending.length,
                completed_count: completed.length,
                pending_tasks: pending,
                completed_tasks: completed,
            });

        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 9. GENERATE EXAM
    // POST /api/minerva/exam/generate
    // ──────────────────────────────────────────
    generateExam: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { session_id, exam_type = 'chapter_test', total_marks = 50 } = req.body;

            if (!session_id) {
                return res.status(400).json({ success: false, error: 'session_id is required' });
            }

            const session = await MinervaStudySession.findOne({ _id: session_id, userId });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

            // Get nodes for exam
            const allNodes = await MinervaKnowledgeNode.find({ session_id }).lean();
            const weakNodes = allNodes.filter(n => n.status === 'DONE' && n.last_score < 70);
            const strongNodes = allNodes.filter(n => n.status === 'DONE' && n.last_score >= 70);
            const allDoneNodes = allNodes.filter(n => n.status === 'DONE');

            if (allDoneNodes.length === 0) {
                return res.status(400).json({ success: false, error: 'Pehle kuch topics complete karo phir exam generate hoga!' });
            }

            const examData = await generateExamPaper(
                session,
                weakNodes.length > 0 ? weakNodes : allDoneNodes,
                strongNodes,
                exam_type,
                total_marks,
                session.board,
                session.grade_level
            );

            if (!examData) {
                return res.status(500).json({ success: false, error: 'Exam generate nahi hua. Dobara try karo.' });
            }

            // Flatten questions from sections
            const allQuestions: any[] = [];
            (examData.sections || []).forEach((section: any) => {
                (section.questions || []).forEach((q: any) => {
                    allQuestions.push({ ...q, section: section.section_name });
                });
            });

            const exam = await MinervaExam.create({
                session_id,
                userId,
                title: `${session.subject} — ${exam_type.replace('_', ' ').toUpperCase()} Exam`,
                exam_type,
                board: session.board,
                grade_level: session.grade_level,
                subject: session.subject,
                total_marks,
                duration_minutes: examData.duration_minutes || 60,
                sections: examData.sections || [],
                questions: allQuestions,
            });

            return res.json({
                success: true,
                exam,
                message: `✅ ${allQuestions.length} questions ka exam ready hai! All the best! 🎯`,
            });

        } catch (err: any) {
            console.error('[Minerva Exam Generate Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 10. GET EXAM
    // GET /api/minerva/exam/:id
    // ──────────────────────────────────────────
    getExam: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const exam = await MinervaExam.findOne({ _id: id, userId }).lean();
            if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });
            return res.json({ success: true, exam });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 11. LIST EXAMS
    // GET /api/minerva/exams
    // ──────────────────────────────────────────
    getExams: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const exams = await MinervaExam.find({ userId })
                .sort({ createdAt: -1 })
                .select('title exam_type subject board total_marks status percentage grade submitted_at createdAt')
                .lean();
            return res.json({ success: true, exams });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 12. SUBMIT EXAM
    // POST /api/minerva/exam/:id/submit
    // ──────────────────────────────────────────
    submitExam: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { answers, time_taken_minutes } = req.body;

            const exam = await MinervaExam.findOne({ _id: id, userId });
            if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });
            if (exam.status === 'submitted') return res.json({ success: true, message: 'Already submitted', exam });

            const profile = await getOrCreateProfile(userId);
            const language = profile.language_preference || 'hinglish';

            // Gather all written answers to grade via AI in bulk
            const writtenQuestionsToGrade: any[] = [];
            for (const question of exam.questions) {
                const studentAnswer = answers[question.question_number] || '';
                if (question.type !== 'mcq') {
                    writtenQuestionsToGrade.push({
                        question_number: question.question_number,
                        question: question.question,
                        expected_answer: question.expected_answer || '',
                        student_answer: studentAnswer,
                        marks: question.marks,
                        topic: question.topic || '',
                    });
                }
            }

            // Grade written questions in bulk using the helper
            let aiGrades: Record<number, { obtained_marks: number; feedback: string; correction: string }> = {};
            if (writtenQuestionsToGrade.length > 0) {
                try {
                    aiGrades = await gradeExamWrittenAnswers(writtenQuestionsToGrade, language);
                } catch (gradeErr) {
                    console.error('[submitExam AI Grading failed, using fallback]', gradeErr);
                }
            }

            let totalObtained = 0;
            const gradedAnswers: any[] = [];
            const weak_areas: string[] = [];
            const strong_areas: string[] = [];

            for (const question of exam.questions) {
                const studentAnswer = answers[question.question_number] || '';
                let obtained = 0;
                let feedback = '';
                let correction = '';

                if (question.type === 'mcq' && question.expected_answer) {
                    const isCorrect = studentAnswer.trim().toLowerCase() === question.expected_answer.trim().toLowerCase();
                    obtained = isCorrect ? question.marks : 0;
                    feedback = isCorrect ? 'Correct Answer!' : `Incorrect. Expected: ${question.expected_answer}`;
                } else {
                    // Written answer
                    const aiGrade = aiGrades[question.question_number];
                    if (aiGrade) {
                        obtained = Math.min(question.marks, Math.max(0, Number(aiGrade.obtained_marks) || 0));
                        feedback = aiGrade.feedback || '';
                        correction = aiGrade.correction || '';
                    } else if (studentAnswer.trim().length > 10) {
                        // Fallback partial credit if AI call fails completely
                        obtained = Math.round(question.marks * 0.7);
                        feedback = 'Answer recorded (Self-graded fallback).';
                    } else {
                        obtained = 0;
                        feedback = 'Incorrect or empty answer.';
                    }
                }

                totalObtained += obtained;

                // Track weak vs strong areas based on score percentage
                const pct = question.marks > 0 ? (obtained / question.marks) * 100 : 0;
                if (question.topic) {
                    if (pct < 70) {
                        if (!weak_areas.includes(question.topic)) weak_areas.push(question.topic);
                    } else {
                        if (!strong_areas.includes(question.topic)) strong_areas.push(question.topic);
                    }
                }

                gradedAnswers.push({
                    question_number: question.question_number,
                    student_answer: studentAnswer,
                    obtained_marks: obtained,
                    total_marks: question.marks,
                    feedback,
                    correction,
                });
            }

            const percentage = Math.round((totalObtained / exam.total_marks) * 100);
            const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' :
                percentage >= 50 ? 'C' : percentage >= 35 ? 'D' : 'F';

            // Generate structured consolidated AI report
            const ai_report = `### Exam Evaluation Report
**Subject:** ${exam.subject}
**Score Obtained:** ${totalObtained} / ${exam.total_marks} (${percentage}%)
**Final Grade:** ${grade}

#### Topic Performance Summary:
- **Strong Topics:** ${strong_areas.length > 0 ? strong_areas.join(', ') : 'None'}
- **Topics Needing Improvement:** ${weak_areas.length > 0 ? weak_areas.join(', ') : 'None'}

#### Section Details:
${gradedAnswers.map(ans => {
    const q = exam.questions.find(qu => qu.question_number === ans.question_number);
    return `**Q${ans.question_number}.** ${q?.question}
- *Your Answer:* ${ans.student_answer || '(No Answer Provided)'}
- *Marks Obtained:* ${ans.obtained_marks} / ${ans.total_marks}
- *Feedback:* ${ans.feedback}
${ans.correction ? `- *Ideal Correction:* ${ans.correction}` : ''}`;
}).join('\n\n')}`;

            const updatedExam = await MinervaExam.findByIdAndUpdate(id, {
                status: 'submitted',
                student_answers: gradedAnswers,
                total_obtained: totalObtained,
                percentage,
                grade,
                submitted_at: new Date(),
                time_taken_minutes: time_taken_minutes || 0,
                ai_report,
                weak_areas,
                strong_areas,
            }, { new: true });

            // Update profile stats and dynamic weak/strong subjects list
            const currentWeak = new Set(profile.weak_subjects || []);
            const currentStrong = new Set(profile.strong_subjects || []);

            // Process weak areas: add to weak, remove from strong
            for (const area of weak_areas) {
                currentWeak.add(area);
                currentStrong.delete(area);
            }
            // Process strong areas: add to strong, remove from weak (only if they are not still marked weak by another question in the same exam)
            for (const area of strong_areas) {
                if (!weak_areas.includes(area)) {
                    currentStrong.add(area);
                    currentWeak.delete(area);
                }
            }

            await MinervaStudentProfile.findOneAndUpdate({ userId }, {
                $inc: { total_exams_taken: 1 },
                $set: {
                    weak_subjects: Array.from(currentWeak),
                    strong_subjects: Array.from(currentStrong),
                }
            });

            return res.json({
                success: true,
                exam: updatedExam,
                score: totalObtained,
                total: exam.total_marks,
                percentage,
                grade,
                message: percentage >= 60
                    ? `🎉 Bahut accha! ${percentage}% score aaya. Grade: ${grade}`
                    : `📚 ${percentage}% aaya. Revision karo aur dobara try karo. Tu kar sakta hai!`,
            });

        } catch (err: any) {
            console.error('[Minerva Exam Submit Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 13. CHAT HISTORY
    // GET /api/minerva/chat/history
    // ──────────────────────────────────────────
    getChatHistory: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const limit = parseInt(req.query.limit as string) || 30;

            const messages = await MinervaChatMessage.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return res.json({ success: true, messages: messages.reverse() });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 14. STATS / DASHBOARD
    // GET /api/minerva/stats
    // ──────────────────────────────────────────
    getStats: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const profile = await getOrCreateProfile(userId);

            const totalSessions = await MinervaStudySession.countDocuments({ userId });
            const activeSessions = await MinervaStudySession.countDocuments({ userId, status: 'active' });
            const totalNodes = await MinervaKnowledgeNode.countDocuments({ userId });
            const doneNodes = await MinervaKnowledgeNode.countDocuments({ userId, status: 'DONE' });
            const totalExams = await MinervaExam.countDocuments({ userId });
            const pendingHW = await MinervaTask.countDocuments({ userId, is_homework: true, submitted: false });

            const today = new Date().toISOString().split('T')[0];
            const todayHW = await MinervaTask.countDocuments({ userId, is_homework: true, homework_date: today });

            return res.json({
                success: true,
                stats: {
                    streak_days: profile.streak_days,
                    total_sessions: totalSessions,
                    active_sessions: activeSessions,
                    total_topics: totalNodes,
                    completed_topics: doneNodes,
                    completion_percent: totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0,
                    total_exams: totalExams,
                    total_exams_taken: profile.total_exams_taken,
                    pending_homework: pendingHW,
                    today_homework: todayHW,
                    total_study_minutes: profile.total_study_minutes,
                },
                profile,
            });

        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 15. FILE UPLOAD & TEXT EXTRACTION (PDF / Photo OCR)
    // POST /api/minerva/upload
    // ──────────────────────────────────────────
    uploadFile: async (req: Request | any, res: Response) => {
        try {
            const fs = require('fs');
            const pdf = require('pdf-parse');
            const Tesseract = require('tesseract.js');

            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            }

            const filePath = req.file.path;
            const originalName = req.file.originalname;
            const ext = originalName.split('.').pop()?.toLowerCase();

            let extractedText = '';

            if (ext === 'pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const parsed = await pdf(dataBuffer);
                extractedText = parsed.text || '';
            } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
                // Fetch profile to get language preferences
                const userId = req.user?.id || req.user?._id;
                const profile = await getOrCreateProfile(userId);

                let ocrLang = 'eng';
                const profileLang = (profile?.language_preference || '').toLowerCase();
                const profileMedium = (profile?.medium || '').toLowerCase();

                if (profileLang === 'hindi' || profileLang === 'hinglish' || profileMedium === 'hindi' || profileMedium === 'hinglish') {
                    ocrLang = 'eng+hin';
                } else if (profileLang === 'marathi' || profileMedium === 'marathi') {
                    ocrLang = 'eng+mar';
                } else if (profileLang === 'gujarati' || profileMedium === 'gujarati') {
                    ocrLang = 'eng+guj';
                } else {
                    ocrLang = 'eng+hin'; // Default fallback for India
                }

                console.log(`[OCR] Running Tesseract for language(s): ${ocrLang}`);
                let result;
                try {
                    result = await Tesseract.recognize(filePath, ocrLang);
                } catch (ocrErr) {
                    console.error('[OCR] Dynamic Tesseract failed, falling back to eng:', ocrErr);
                    result = await Tesseract.recognize(filePath, 'eng');
                }
                extractedText = result?.data?.text || '';
            } else {
                try {
                    extractedText = fs.readFileSync(filePath, 'utf-8');
                } catch {
                    extractedText = `[Unable to extract text from file type: ${ext}]`;
                }
            }

            // Cleanup local file after extraction to save space
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('File cleanup error:', err);
            }

            return res.json({
                success: true,
                filename: originalName,
                extractedText: extractedText.trim(),
                message: 'File uploaded and parsed successfully'
            });

        } catch (err: any) {
            console.error('[Minerva File Upload Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 16. GET ALL CHAT SESSIONS
    // GET /api/future-education/chat/sessions
    // ──────────────────────────────────────────
    getChatSessions: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const sessions = await MinervaChatSession.find({ userId, status: 'active' })
                .sort({ isPinned: -1, last_accessed: -1 })
                .lean();
            return res.json({ success: true, sessions });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 17. CREATE CHAT SESSION
    // POST /api/future-education/chat/session
    // ──────────────────────────────────────────
    createChatSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { title = 'New Chat' } = req.body;
            const session = await MinervaChatSession.create({
                userId,
                title,
                status: 'active',
                last_accessed: new Date(),
            });
            return res.json({ success: true, session });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 18. GET MESSAGES FOR A CHAT SESSION
    // GET /api/future-education/chat/session/:id
    // ──────────────────────────────────────────
    getChatSessionMessages: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const session = await MinervaChatSession.findOne({ _id: id, userId });
            if (!session) {
                return res.status(404).json({ success: false, error: 'Chat session not found' });
            }

            const messages = await MinervaChatMessage.find({ userId, chat_session_id: id })
                .sort({ createdAt: 1 })
                .lean();

            await MinervaChatSession.findByIdAndUpdate(id, { last_accessed: new Date() });

            return res.json({ success: true, messages });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 19. RENAME CHAT SESSION
    // PUT /api/future-education/chat/session/:id
    // ──────────────────────────────────────────
    renameChatSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { title } = req.body;

            if (!title?.trim()) {
                return res.status(400).json({ success: false, error: 'Title is required' });
            }

            const session = await MinervaChatSession.findOneAndUpdate(
                { _id: id, userId },
                { title: title.trim() },
                { new: true }
            );

            if (!session) {
                return res.status(404).json({ success: false, error: 'Chat session not found' });
            }

            return res.json({ success: true, session });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 20. DELETE CHAT SESSION
    // DELETE /api/future-education/chat/session/:id
    // ──────────────────────────────────────────
    deleteChatSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const session = await MinervaChatSession.findOneAndDelete({ _id: id, userId });
            if (!session) {
                return res.status(404).json({ success: false, error: 'Chat session not found' });
            }

            // Delete all messages in the session
            await MinervaChatMessage.deleteMany({ userId, chat_session_id: id });

            return res.json({ success: true, message: 'Chat session deleted successfully' });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 21. TOGGLE PIN CHAT SESSION
    // PUT /api/future-education/chat/session/:id/pin
    // ──────────────────────────────────────────
    togglePinChatSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const session = await MinervaChatSession.findOne({ _id: id, userId });
            if (!session) {
                return res.status(404).json({ success: false, error: 'Chat session not found' });
            }

            const updatedSession = await MinervaChatSession.findByIdAndUpdate(
                id,
                { isPinned: !session.isPinned },
                { new: true }
            );

            return res.json({ success: true, session: updatedSession });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 22. GET STUDENT TASKS (Homework + self-study)
    // GET /api/future-education/tasks/list
    // ──────────────────────────────────────────
    getTasks: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const tasks = await MinervaTask.find({ userId })
                .sort({ createdAt: -1 })
                .lean();
            return res.json({ success: true, tasks });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 23. GENERATE STUDY MATERIAL (E-Builder)
    // POST /api/future-education/builder/generate
    // ──────────────────────────────────────────
    generateMaterial: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { session_id, type = 'summary', language = 'english' } = req.body;

            if (!session_id) {
                return res.status(400).json({ success: false, error: 'session_id is required' });
            }

            const session = await MinervaStudySession.findOne({ _id: session_id, userId });
            if (!session) {
                return res.status(404).json({ success: false, error: 'Course study session not found' });
            }

            const profile = await getOrCreateProfile(userId);
            const material = await generateStudentStudyMaterial(
                session.subject,
                session.title,
                type,
                language,
                profile.grade_level || 'class_10',
                profile.board || 'cbse'
            );

            return res.json({ success: true, material });
        } catch (err: any) {
            console.error('[Minerva E-Builder Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 24. TRANSLATE TEXT
    // POST /api/future-education/translate
    // ──────────────────────────────────────────
    translateText: async (req: Request | any, res: Response) => {
        try {
            const { text, targetLanguage = 'english' } = req.body;
            if (!text || !text.trim()) {
                return res.status(400).json({ success: false, error: 'text is required' });
            }
            const translatedText = await translateContent(text, targetLanguage);
            return res.json({ success: true, translated: translatedText });
        } catch (err: any) {
            console.error('[Minerva Translation Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },
};
