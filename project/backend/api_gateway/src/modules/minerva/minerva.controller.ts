import { Request, Response } from 'express';
import { getProviderResponse } from '../../shared/services/openai.service';
import MinervaStudentProfile from './models/minerva_student_profile.model';
import { OnboardingProfile } from '../onboarding/onboarding.model';
import MinervaStudySession from './models/minerva_study_session.model';
import MinervaKnowledgeNode from './models/minerva_knowledge_node.model';
import User from '../auth/user.model';
import { mailService } from '../../shared/services/mail.service';
import crypto from 'crypto';
import MinervaTask from './models/minerva_task.model';
import MinervaExam from './models/minerva_exam.model';
import MinervaChatMessage from './models/minerva_chat_message.model';
import MinervaChatSession from './models/minerva_chat_session.model';
import MinervaBuilderMaterial from './models/minerva_builder_material.model';
import MinervaStudyTimeLog from './models/minerva_study_time_log.model';
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
    generatePYQRoadmap,
    getCombinedMinervaResponse,
    appealExamGrading,
    validateAndResolveSketchfabModel,
    translateExamPaper,
    generateUniqueMixTasks,
    searchSketchfabModelsList,
    searchYoutubeVideosList,
} from './minerva.service';
import { analyticsService } from '../analytics/analytics.service';

// ─────────────────────────────────────────────────────────────────
// HELPER: Resolve real YouTube video ID from search query
// ─────────────────────────────────────────────────────────────────
const resolveYoutubeVideoId = async (searchQuery: string, excludeIds: Set<string> = new Set()): Promise<string | null> => {
    try {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const html = await response.text();
        
        // Match ytInitialData JSON
        const jsonRegex = /var ytInitialData = ({.*?});/;
        const match = html.match(jsonRegex);
        
        if (match && match[1]) {
            try {
                const data = JSON.parse(match[1]);
                const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
                
                if (contents && Array.isArray(contents)) {
                    for (const contentItem of contents) {
                        const video = contentItem.videoRenderer;
                        if (video && video.videoId) {
                            const videoId = video.videoId;
                            // Exclude Rickroll and previously picked videos
                            if (videoId !== 'dQw4w9WgXcQ' && !excludeIds.has(videoId)) {
                                return videoId;
                            }
                        }
                    }
                }
            } catch (_) {}
        }
        
        // Regex fallback: match specific videoId fields inside JSON strings in the HTML
        const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let m;
        while ((m = videoIdRegex.exec(html)) !== null) {
            const id = m[1];
            if (id !== 'dQw4w9WgXcQ' && !excludeIds.has(id)) {
                return id;
            }
        }
    } catch (e) {
        console.error("[YouTube Resolver Error]", e);
    }
    return null;
};

// ─────────────────────────────────────────────────────────────────
// HELPER: get or create student profile
// ─────────────────────────────────────────────────────────────────
const getOrCreateProfile = async (userId: string) => {
    let profile = await MinervaStudentProfile.findOne({ userId });
    if (!profile) {
        let education_type = 'college';
        let grade_level = 'undergraduate';
        let onboarding_done = false;

        try {
            const onboarding = await OnboardingProfile.findOne({ userId });
            if (onboarding) {
                const stage = onboarding.life_stage;
                if (stage === 'School (8-10)' || stage === 'High School (11-12)') {
                    education_type = 'school';
                    grade_level = stage === 'School (8-10)' ? 'class_10' : 'class_12';
                } else {
                    education_type = 'college';
                    onboarding_done = true; // Non-school users do not need school initialization modal
                }
            }
        } catch (err) {
            console.error("Failed to query onboarding profile in getOrCreateProfile:", err);
        }

        profile = await MinervaStudentProfile.create({ 
            userId, 
            education_type, 
            grade_level, 
            onboarding_done 
        });
    }
    return profile;
};

// ─────────────────────────────────────────────────────────────────
// HELPER: update study streak
// ─────────────────────────────────────────────────────────────────
const updateStreak = async (userId: any) => {
    try {
        const profile = await MinervaStudentProfile.findOne({ userId });
        if (!profile) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!profile.last_active) {
            profile.streak_days = 1;
            profile.last_active = new Date();
            await profile.save();
            return;
        }

        const lastActive = new Date(profile.last_active);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - lastActive.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            profile.streak_days = (profile.streak_days || 0) + 1;
            profile.last_active = new Date();
            await profile.save();
        } else if (diffDays > 1) {
            profile.streak_days = 1;
            profile.last_active = new Date();
            await profile.save();
        } else if (diffDays === 0) {
            // Already updated today, keep current streak but refresh timestamp
            profile.last_active = new Date();
            await profile.save();
        }
    } catch (err) {
        console.error('[updateStreak Error]', err);
    }
};

// ─────────────────────────────────────────────────────────────────
// HELPER: unlock student badges dynamically
// ─────────────────────────────────────────────────────────────────
const unlockBadge = async (userId: string, name: string, icon: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const hasBadge = user.badges?.some(b => b.name.toLowerCase() === name.toLowerCase());
        if (!hasBadge) {
            await User.findByIdAndUpdate(userId, {
                $push: { badges: { name, icon, unlockedAt: new Date() } }
            });
            console.log(`[Badge Unlocked] Awarded '${name}' to user ${userId}`);
        }
    } catch (err) {
        console.error('Error unlocking badge:', err);
    }
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

    // ❤️ Message Feedback Logic
    logMessageFeedback: async (req: Request | any, res: Response) => {
        try {
            const { type, sessionId } = req.body;
            const { messageId } = req.params;
            const userId = req.user?.id || req.user?._id;

            await analyticsService.logFeedback({
                userId,
                sessionId,
                messageId,
                type
            });

            res.json({ success: true, message: 'Feedback logged successfully' });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // PARENT DETAILS UPDATE
    // PUT /api/minerva/parent/details
    // ──────────────────────────────────────────
    updateParentDetails: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { parentEmail, parentPhone } = req.body;

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            const oldEmail = user.parentDetails?.parentEmail || "";
            const emailChanged = parentEmail?.trim().toLowerCase() !== oldEmail.trim().toLowerCase();

            user.parentDetails = {
                parentEmail: parentEmail?.trim().toLowerCase() || "",
                parentPhone: parentPhone?.trim() || "",
                parentEmailVerified: emailChanged ? false : (user.parentDetails?.parentEmailVerified || false),
                parentVerificationToken: emailChanged ? crypto.randomBytes(32).toString('hex') : (user.parentDetails?.parentVerificationToken || "")
            };

            await user.save();

            if (emailChanged && user.parentDetails.parentEmail) {
                const domain = req.get('host') || 'localhost:7001';
                const verificationLink = `${req.protocol}://${domain}/api/minerva/parent/verify?token=${user.parentDetails.parentVerificationToken}`;
                await mailService.sendParentVerification(
                    user.parentDetails.parentEmail,
                    `${user.firstName} ${user.lastName}`,
                    verificationLink
                );
            }

            return res.json({
                success: true,
                message: emailChanged ? 'Parent details updated. Verification email sent!' : 'Parent details updated successfully.',
                parentDetails: user.parentDetails
            });
        } catch (err: any) {
            console.error('[Minerva Parent Update Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // VERIFY PARENT EMAIL
    // GET /api/minerva/parent/verify
    // ──────────────────────────────────────────
    verifyParentEmail: async (req: Request | any, res: Response) => {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).send('<h2>Verification token is missing.</h2>');
            }

            const user = await User.findOne({ 'parentDetails.parentVerificationToken': token });
            if (!user) {
                return res.status(404).send('<h2>Invalid or expired verification token.</h2>');
            }

            user.parentDetails.parentEmailVerified = true;
            user.parentDetails.parentVerificationToken = "";
            await user.save();

            res.setHeader('Content-Type', 'text/html');
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Parent Verified - Future Education OS</title>
                    <style>
                        body { font-family: sans-serif; background-color: #030209; color: white; text-align: center; padding-top: 100px; }
                        .card { background-color: #0c0c0e; border: 1px solid #6366f1; border-radius: 12px; max-width: 500px; margin: auto; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
                        h1 { color: #6366f1; }
                        p { color: #94a3b8; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Email Verified Successfully! ✅</h1>
                        <p>Thank you. You have approved alerts for your child's progress. You will now receive automatic notifications for their test scores and homework submissions on Future Education OS.</p>
                    </div>
                </body>
                </html>
            `);
        } catch (err: any) {
            console.error('[Minerva Parent Verify Error]', err);
            return res.status(500).send(`<h2>Verification failed: ${err.message}</h2>`);
        }
    },

    // ──────────────────────────────────────────
    // RESEND PARENT VERIFICATION EMAIL
    // POST /api/minerva/parent/resend-verification
    // ──────────────────────────────────────────
    resendParentVerification: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const user = await User.findById(userId);

            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            if (!user.parentDetails?.parentEmail) {
                return res.status(400).json({ success: false, error: 'No parent email configured.' });
            }
            if (user.parentDetails.parentEmailVerified) {
                return res.status(400).json({ success: false, error: 'Parent email is already verified.' });
            }

            user.parentDetails.parentVerificationToken = crypto.randomBytes(32).toString('hex');
            await user.save();

            const domain = req.get('host') || 'localhost:7001';
            const verificationLink = `${req.protocol}://${domain}/api/minerva/parent/verify?token=${user.parentDetails.parentVerificationToken}`;
            await mailService.sendParentVerification(
                user.parentDetails.parentEmail,
                `${user.firstName} ${user.lastName}`,
                verificationLink
            );

            return res.json({ success: true, message: 'Verification email resent successfully.' });
        } catch (err: any) {
            console.error('[Minerva Parent Resend Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 1. MAIN CHAT — Student sends a message
    // POST /api/minerva/chat
    // ──────────────────────────────────────────
    chat: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            let { message, session_id, chat_session_id, deep_study, forceRoadmap, file_url, file_type, response_mode } = req.body;

            if (!message?.trim()) {
                return res.status(400).json({ success: false, error: 'Message is required' });
            }

            // ── CHATGPT-LIKE SLASH SHORTCUTS PARSER ──
            let forceLab = false;
            let forceTest = false;
            let forceCode = false;
            let forceExplain = false;

            const trimmedMsg = message.trim();
            if (trimmedMsg.startsWith('/')) {
                const parts = trimmedMsg.split(/\s+/);
                const cmd = parts[0].toLowerCase();
                const topicArg = parts.slice(1).join(' ').trim();

                if (topicArg) {
                    if (cmd === '/lab') {
                        message = `Open the virtual lab simulator for: ${topicArg}`;
                        forceLab = true;
                    } else if (cmd === '/test') {
                        message = `Generate a practice quiz / test with 3 MCQs on: ${topicArg}`;
                        forceTest = true;
                    } else if (cmd === '/code') {
                        message = `Open the computer coding sandbox lab for: ${topicArg}`;
                        forceCode = true;
                    } else if (cmd === '/explain') {
                        message = `Explain this topic in simple analogical details: ${topicArg}`;
                        forceExplain = true;
                    }
                }
            }

            // Update study streak
            updateStreak(userId).catch(err => console.error('Streak update failed:', err));

            // Get student profile
            const profile = await getOrCreateProfile(userId);

            // Determine active chat session ID & sanitize input to avoid CastErrors
            let activeChatSessionId = chat_session_id;
            if (activeChatSessionId && !/^[0-9a-fA-F]{24}$/.test(activeChatSessionId)) {
                activeChatSessionId = null;
            }

            let activeSessionId = session_id;
            if (activeSessionId && !/^[0-9a-fA-F]{24}$/.test(activeSessionId)) {
                activeSessionId = null;
            }

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

            // Analyze previous message for self-learning feedback loop
            try {
                const lastAssistantMsg = await MinervaChatMessage.findOne({ 
                    userId, 
                    chat_session_id: activeChatSessionId,
                    role: 'minerva'
                }).sort({ createdAt: -1 }).lean();

                if (lastAssistantMsg && studentQuery) {
                    const { processSelfLearningFeedback } = require('./minerva.service');
                    processSelfLearningFeedback(studentQuery, lastAssistantMsg.content, profile).catch((err: any) => {
                        console.error("Error in processSelfLearningFeedback:", err);
                    });
                }
            } catch (err) {
                console.error("Failed to fetch previous assistant message for self-learning:", err);
            }

            // Save student message (clean version)
            const savedStudentMsg = await saveChatMessage(
                userId,
                'student',
                cleanDisplayContent,
                'text',
                activeSessionId,
                {
                    file_text: fullExtractedText || undefined,
                    filename: filename || undefined,
                    file_url: file_url || undefined,
                    file_type: file_type || undefined
                },
                activeChatSessionId
            );

            // Get recent chat history for context (reconstructing full messages for LLM context)
            const rawChatHistory = await MinervaChatMessage.find({ userId, chat_session_id: activeChatSessionId })
                .sort({ createdAt: -1 }).limit(30).lean();
            rawChatHistory.reverse();

            const chatHistory = rawChatHistory.map((m: any) => {
                let content = m.content;
                if (m.metadata?.file_text) {
                    content = `[Uploaded File: ${m.metadata.filename}]\n\nExtracted Content:\n"""\n${m.metadata.file_text}\n"""\n\nStudent Query: ${content.replace(/📁.*?\n\n/, '')}`;
                }
                return { ...m, content };
            });

            // If image was uploaded, read it as base64 for vision analysis
            let imageBase64: string | null = null;
            let imageMimeType: string | null = null;
            if (file_url && file_type === 'image') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const uploadDir = path.join(__dirname, '../../../../../uploads');
                    const fname = file_url.replace('/uploads/', '');
                    const imgPath = path.join(uploadDir, fname);
                    if (fs.existsSync(imgPath)) {
                        imageBase64 = fs.readFileSync(imgPath).toString('base64');
                        const ext = fname.split('.').pop()?.toLowerCase();
                        imageMimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                    }
                } catch (imgErr) {
                    console.error('[Image read error for vision]', imgErr);
                }
            }

            // Get combined intent detection, response explanation, follow-up suggestions, and virtual lab config in 1 AI call
            const combinedRes = await getCombinedMinervaResponse(
                fullExtractedText ? `[Uploaded File: ${filename}]\n\nExtracted Content:\n"""\n${fullExtractedText}\n"""\n\nStudent Query: ${studentQuery}` : studentQuery,
                profile,
                chatHistory,
                !!deep_study,
                !!forceLab,
                imageBase64,
                imageMimeType,
                studentQuery,
                response_mode
            );

            const intent = combinedRes.intent;
            let reply = combinedRes.reply;
            let content_type = combinedRes.content_type;
            let metadata: any = combinedRes.metadata;

            // ── ROUTE BY INTENT ──
            const isRoadmapRequest = !!forceRoadmap ||
                                     studentQuery.toLowerCase().includes('roadmap') || 
                                     studentQuery.toLowerCase().includes('syllabus') || 
                                     studentQuery.toLowerCase().includes('path') ||
                                     studentQuery.toLowerCase().includes('schedule') ||
                                     studentQuery.toLowerCase().includes('road map');

            const isPYQRequest = filename.toLowerCase().includes('paper') ||
                                 filename.toLowerCase().includes('pyq') ||
                                 studentQuery.toLowerCase().includes('paper') ||
                                 studentQuery.toLowerCase().includes('pyq') ||
                                 studentQuery.toLowerCase().includes('last year') ||
                                 studentQuery.toLowerCase().includes('previous year') ||
                                 studentQuery.toLowerCase().includes('semester') ||
                                 studentQuery.toLowerCase().includes('sem ') ||
                                 studentQuery.toLowerCase().includes('prep');

            if ((isRoadmapRequest || isPYQRequest) && (intent.intent === 'create_session' || intent.intent === 'learn_topic' || isPYQRequest || !!forceRoadmap)) {
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
                
                let roadmapData;
                if (isPYQRequest && (fullExtractedText || studentQuery.length > 30)) {
                    const textToUse = fullExtractedText || studentQuery;
                    const paperName = filename || 'Exam Paper';
                    roadmapData = await generatePYQRoadmap(paperName, textToUse, studentQuery, grade, board, targetLang, targetLang);
                } else {
                    roadmapData = await generateRoadmap(subject, intent.topic || subject, grade, board, targetLang, sourceContent, targetLang);
                }

                if (roadmapData && roadmapData.nodes?.length > 0) {
                    // Create session
                    const session = await MinervaStudySession.create({
                        userId,
                        title: roadmapData.title || `${subject} Study Session`,
                        subject: roadmapData.subject || subject,
                        board,
                        grade_level: grade,
                        education_type: intent.education_type || 'school',
                        medium: targetLang, // store target language as the medium of the session!
                        source_type: isPYQRequest ? 'pdf' : 'chat',
                        source_content: fullExtractedText || studentQuery,
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
                    // Response is already populated by getCombinedMinervaResponse
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
                // Response is already populated by getCombinedMinervaResponse
            }

            // ── OVERRIDES FOR FORCED SLASH COMMANDS ──
            if (forceLab) {
                if (!metadata) metadata = {};
                const parsedTopic = studentQuery.replace('/lab', '').trim();
                metadata.lab_config = {
                    subject: 'physics', // default subject fallback
                    topic: parsedTopic,
                    grade_level: profile.grade_level || 'class_10',
                    board: profile.board || 'cbse',
                    sensitivity_level: 0,
                    content_layers: ['text', 'diagram', 'youtube', 'threejs', 'sketchfab'],
                    diagram_type: 'dynamic_mermaid',
                    mermaid_schema: `graph TD\n    A[${parsedTopic}] --> B[Structure Analysis]\n    B --> C[Run 2D Simulation]`,
                    three_js_config: {
                        type: 'wave_simulation',
                        title: parsedTopic + ' Interactive Simulator',
                        description: `Adjust variables below to see real-time graphical simulation of ${parsedTopic}.`,
                        controls: [
                            { name: 'amplitude', label: 'Amplitude (A)', min: 0.5, max: 4, step: 0.1, defaultValue: 2 },
                            { name: 'frequency', label: 'Frequency (f)', min: 0.2, max: 5, step: 0.1, defaultValue: 1.5 }
                        ]
                    },
                    sketchfab_hint: null,
                    youtube_query: parsedTopic + ' lesson concept',
                    voice_script: reply || 'Here is your requested virtual lab simulation.',
                    auto_open: true
                };
            }

            if (forceCode) {
                if (!metadata) metadata = {};
                const parsedTopic = studentQuery.replace('/code', '').trim();
                metadata.lab_config = {
                    subject: 'mathematics',
                    topic: parsedTopic + ' Coding',
                    grade_level: profile.grade_level || 'class_10',
                    board: profile.board || 'cbse',
                    sensitivity_level: 0,
                    content_layers: ['text', 'sandbox', 'sketchfab'],
                    diagram_type: null,
                    three_js_config: null,
                    sketchfab_hint: null,
                    youtube_query: '',
                    voice_script: 'Programming sandbox loaded. Edit the code and press Run to execute!',
                    auto_open: true,
                    sandbox_config: {
                        language: 'javascript',
                        default_code: `// Let's explore: ${parsedTopic}\nfunction analyze() {\n    console.log("Analyzing ${parsedTopic}...");\n}\nanalyze();`
                    }
                };
            }

            // Enrich lab_config if present in metadata to fit frontend schema
            if (metadata && metadata.lab_config) {
                const lab = metadata.lab_config;
                if (!lab.topic) {
                    lab.topic = intent.topic || studentQuery || 'general';
                }
                if (!lab.voice_script) {
                    lab.voice_script = reply;
                }
                if (lab.auto_open === undefined) {
                    lab.auto_open = true;
                }
                if (lab.simulation_config && !lab.three_js_config) {
                    lab.three_js_config = lab.simulation_config;
                }
                if (!lab.content_layers || lab.content_layers.length === 0) {
                    const layers = ['text'];
                    if (lab.mermaid_schema && lab.mermaid_schema.trim().length > 10) {
                        layers.push('diagram');
                    }
                    if (lab.youtube_query) {
                        layers.push('youtube');
                    }
                    if (lab.three_js_config) {
                        layers.push('threejs');
                    }
                    // Always include sketchfab — students can search any topic anytime
                    if (!layers.includes('sketchfab')) {
                        layers.push('sketchfab');
                    }
                    if (lab.simulation_config) {
                        layers.push('sandbox');
                    }
                    if (lab.interactive_config && lab.interactive_config.type) {
                        layers.push('interactive');
                    }
                    lab.content_layers = layers;
                } else {
                    if (lab.interactive_config && lab.interactive_config.type && !lab.content_layers.includes('interactive')) {
                        lab.content_layers.push('interactive');
                    }
                    // Always ensure sketchfab is present
                    if (!lab.content_layers.includes('sketchfab')) {
                        lab.content_layers.push('sketchfab');
                    }
                }
            }

            // Save Minerva reply
            const savedReply = await saveChatMessage(userId, 'minerva', reply, content_type, activeSessionId, metadata, activeChatSessionId);

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
            const { grade_level, board, state, medium, language_preference, learning_style, daily_time_minutes, name, school_name, mobile_number } = req.body;

            const profile = await MinervaStudentProfile.findOneAndUpdate(
                { userId },
                { grade_level, board, state, medium, language_preference, learning_style, daily_time_minutes, name, school_name, mobile_number, onboarding_done: true },
                { new: true, upsert: true }
            );

            // Sync with User document for Quiz Battle & School Leaderboard
            try {
                const User = require('../auth/user.model').default;
                let numericGrade = 10;
                if (grade_level) {
                    const match = grade_level.match(/\d+/);
                    if (match) numericGrade = parseInt(match[0]);
                }
                await User.findByIdAndUpdate(userId, {
                    schoolName: school_name || '',
                    city: state || '', // Fallback to empty string
                    grade: numericGrade
                });
            } catch (syncErr: any) {
                console.error('[Minerva Profile Sync] Error syncing User document:', syncErr.message);
            }


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

            // Update study streak
            updateStreak(userId).catch(err => console.error('Streak update failed:', err));

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
                
                // Trigger fresh question generation if node was failed (<60% score/NEEDS_REVIEW) OR if no tasks currently exist
                const isFailed = node.passed === false || node.status === 'NEEDS_REVIEW' || (node.last_score !== undefined && node.last_score < 60);
                
                if (isFailed || rawTasks.length === 0) {
                    console.log(`♻️ [learnNode] Automatically regenerating unique mix tasks for failed node: ${id}`);
                    
                    // Exclude old prompts to guarantee uniqueness
                    const excludePrompts = rawTasks.map(t => t.prompt);
                    
                    // Complete deletion of ALL previous micro-tasks associated with this node
                    await MinervaTask.deleteMany({
                        $or: [
                            { node_id: id },
                            { _id: { $in: node.micro_tasks || [] } }
                        ],
                        task_type: 'micro_task'
                    });

                    const profile = await getOrCreateProfile(userId);
                    const session = await MinervaStudySession.findById(node.session_id);
                    const sessionLanguage = session?.medium || session?.detected_language || profile.language_preference || 'hinglish';

                    const newTasksData = await generateUniqueMixTasks(node, profile, sessionLanguage, excludePrompts);
                    const taskIds: any[] = [];
                    for (const t of newTasksData) {
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
                            marks: t.marks || 2,
                            difficulty: t.difficulty || 'medium',
                            is_homework: false,
                        });
                        taskIds.push(task._id);
                    }

                    const updatedNode = await MinervaKnowledgeNode.findByIdAndUpdate(id, {
                        passed: null,
                        status: 'IN_PROGRESS',
                        micro_tasks: taskIds
                    }, { new: true });

                    const freshTasks = await MinervaTask.find({ _id: { $in: taskIds } })
                        .select('type prompt options marks difficulty submitted passed ai_score').lean();

                    return res.json({
                        success: true,
                        node: updatedNode,
                        tasks: freshTasks,
                        youtube_links: (node as any).youtube_links || []
                    });
                }

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

                // Build YouTube video links from AI-generated video objects with real resolved IDs (guaranteeing unique channels/videos)
                const rawYoutubeVideos = content.youtube_videos || content.youtube_queries || [];
                const defaultLang = profile.language_preference || 'hindi';
                const usedVideoIds = new Set<string>();
                youtubeLinks = [];

                for (const item of rawYoutubeVideos) {
                    if (typeof item === 'object' && (item.title || item.query)) {
                        const title = item.title || item.query;
                        const lang = item.lang || defaultLang;
                        const queryToSearch = item.query || `${title} ${lang} explanation`;
                        const resolvedId = await resolveYoutubeVideoId(queryToSearch, usedVideoIds);
                        if (resolvedId) usedVideoIds.add(resolvedId);

                        youtubeLinks.push({
                            title: title,
                            url: resolvedId 
                                ? `https://www.youtube.com/watch?v=${resolvedId}` 
                                : (item.url && !item.url.includes('REAL_') && !item.url.includes('dQw4w9WgXcQ') 
                                    ? item.url 
                                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(queryToSearch)}`),
                            channel: item.channel || 'YouTube',
                            lang: lang
                        });
                    } else {
                        const q = String(item);
                        const resolvedId = await resolveYoutubeVideoId(`${q} explanation`, usedVideoIds);
                        if (resolvedId) usedVideoIds.add(resolvedId);

                        youtubeLinks.push({
                            title: q,
                            url: resolvedId 
                                ? `https://www.youtube.com/watch?v=${resolvedId}` 
                                : `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
                            channel: 'YouTube',
                            lang: defaultLang
                        });
                    }
                }

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

            // Update study streak
            updateStreak(userId).catch(err => console.error('Streak update failed:', err));

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

            // Immediately update node score and failed status on any task submission
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
                    }
                }
                const allTasks = Array.from(uniqueTasksMap.values());
                const submittedTasks = allTasks.filter(t => t.submitted);
                
                if (submittedTasks.length > 0) {
                    const avgScore = submittedTasks.reduce((sum, t) => sum + t.ai_score, 0) / submittedTasks.length;
                    const isAllDone = submittedTasks.length === allTasks.length;
                    const passed = isAllDone && avgScore >= 60;

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
                    } else if (avgScore < 60) {
                        reps = 0;
                        interval = 1;
                        ease = Math.max(1.3, ease - 0.2);
                    }

                    const sr_due_date = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

                    await MinervaKnowledgeNode.findByIdAndUpdate(task.node_id, {
                        last_score: Math.round(avgScore),
                        attempts: (node.attempts || 0) + 1,
                        passed: passed ? true : (avgScore < 60 ? false : node.passed),
                        status: passed ? 'DONE' : (avgScore < 60 ? 'NEEDS_REVIEW' : node.status),
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

            let xpGained = Math.round(gradingResult.score * 3);
            let levelUp = false;
            const user = await User.findById(userId);
            if (user) {
                user.xp = (user.xp || 0) + xpGained;
                let nextLevelXp = (user.level || 1) * 1000;
                if (user.xp >= nextLevelXp) {
                    user.xp -= nextLevelXp;
                    user.level = (user.level || 1) + 1;
                    levelUp = true;
                    user.badges.push({
                        name: `Level ${user.level} Scholar`,
                        icon: '🎓',
                        unlockedAt: new Date()
                    });
                }
                await user.save();
            }

            if (user && user.parentDetails?.parentEmail && user.parentDetails.parentEmailVerified) {
                mailService.sendHomeworkAlert(
                    user.parentDetails.parentEmail,
                    `${user.firstName} ${user.lastName}`,
                    {
                        taskTitle: task.prompt || "Homework Task",
                        passed: gradingResult.passed,
                        feedback: gradingResult.feedback
                    }
                ).catch(err => console.error("Failed to send parent email alert:", err));
            }

            return res.json({
                success: true,
                task: updatedTask,
                score: gradingResult.score,
                feedback: gradingResult.feedback,
                correction: gradingResult.correction,
                passed: gradingResult.passed,
                xpGained,
                currentLevel: user ? user.level : 1,
                currentXp: user ? user.xp : 0,
                levelUp,
                parentDetails: user ? user.parentDetails : null
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
            const { session_id, exam_type = 'chapter_test', total_marks = 50, language } = req.body;

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

            const profile = await getOrCreateProfile(userId);

            let examData = await generateExamPaper(
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

            // Translate exam paper if target language is specified or stored in profile
            const targetLang = language || profile.language_preference || 'english';
            if (targetLang && targetLang.toLowerCase() !== 'english') {
                examData = await translateExamPaper(examData, targetLang);
            }

            // Flatten questions from sections and check for total marks mismatch
            const allQuestions: any[] = [];
            let currentTotal = 0;
            (examData.sections || []).forEach((section: any) => {
                let sectionSum = 0;
                (section.questions || []).forEach((q: any) => {
                    allQuestions.push({ ...q, section: section.section_name });
                    currentTotal += q.marks || 0;
                    sectionSum += q.marks || 0;
                });
                section.section_marks = sectionSum;
            });

            // If there's an arithmetic mismatch, correct the last question to ensure sum === total_marks
            if (allQuestions.length > 0 && currentTotal !== total_marks) {
                const diff = total_marks - currentTotal;
                
                // Adjust in flattened list
                allQuestions[allQuestions.length - 1].marks = Math.max(1, (allQuestions[allQuestions.length - 1].marks || 0) + diff);
                
                // Adjust inside nested sections structure to keep them synchronized
                for (let s = examData.sections.length - 1; s >= 0; s--) {
                    const section = examData.sections[s];
                    if (section.questions && section.questions.length > 0) {
                        const lastQ = section.questions[section.questions.length - 1];
                        lastQ.marks = Math.max(1, (lastQ.marks || 0) + diff);
                        
                        // Recalculate section_marks for that section
                        section.section_marks = section.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
                        break;
                    }
                }
            }

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
            const { answers, time_taken_minutes, tab_switches } = req.body;

            // Update study streak
            updateStreak(userId).catch(err => console.error('Streak update failed:', err));

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
                    const cleanExpected = question.expected_answer.trim().toLowerCase();
                    const cleanStudent = studentAnswer.trim().toLowerCase();
                    
                    // Determine index of expected and student choices to get option letters (A, B, C, D)
                    const expectedIdx = question.options?.findIndex((o: string) => o.trim().toLowerCase() === cleanExpected);
                    const selectedIdx = question.options?.findIndex((o: string) => o.trim().toLowerCase() === cleanStudent);
                    
                    const expectedLetter = expectedIdx !== -1 ? String.fromCharCode(65 + expectedIdx) : '';
                    const selectedLetter = selectedIdx !== -1 ? String.fromCharCode(65 + selectedIdx) : '';

                    const isCorrect = cleanStudent === cleanExpected ||
                                      (selectedLetter && selectedLetter.toLowerCase() === cleanExpected) ||
                                      (expectedLetter && expectedLetter.toLowerCase() === cleanStudent);

                    obtained = isCorrect ? question.marks : 0;

                    if (isCorrect) {
                        feedback = 'Correct Answer!';
                    } else {
                        const selectedText = selectedLetter ? `${selectedLetter}. ${studentAnswer}` : (studentAnswer || 'no option selected');
                        const expectedText = expectedLetter ? `${expectedLetter}. ${question.expected_answer}` : question.expected_answer;
                        feedback = `Incorrect. You selected "${selectedText}", but the correct answer is "${expectedText}".`;
                    }
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

            let cheatPenalty = 0;
            const switches = Number(tab_switches) || 0;
            if (switches === 1) {
                cheatPenalty = Math.round(totalObtained * 0.05);
            } else if (switches === 2) {
                cheatPenalty = Math.round(totalObtained * 0.15);
            } else if (switches >= 3) {
                cheatPenalty = Math.round(totalObtained * 0.30);
            }
            const finalObtained = Math.max(0, totalObtained - cheatPenalty);
            const percentage = Math.round((finalObtained / exam.total_marks) * 100);
            const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' :
                percentage >= 50 ? 'C' : percentage >= 35 ? 'D' : 'F';

            // Generate structured consolidated AI report
            let ai_report = `### Exam Evaluation Report
**Subject:** ${exam.subject}
**Score Obtained:** ${finalObtained} / ${exam.total_marks} (${percentage}%)
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
            if (switches > 0) {
                ai_report += `\n\n⚠️ **CHEATING DETECTION ALERT:** Student switched browser tabs ${switches} time(s) during this assessment. A cheating penalty of -${cheatPenalty} marks (${switches === 1 ? '5%' : switches === 2 ? '15%' : '30%'}) has been applied automatically to the total score.`;
            }

            const updatedExam = await MinervaExam.findByIdAndUpdate(id, {
                status: 'submitted',
                student_answers: gradedAnswers,
                total_obtained: finalObtained,
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

            let xpGained = percentage * 10;
            let levelUp = false;
            const user = await User.findById(userId);
            if (user) {
                user.xp = (user.xp || 0) + xpGained;
                let nextLevelXp = (user.level || 1) * 1000;
                if (user.xp >= nextLevelXp) {
                    user.xp -= nextLevelXp;
                    user.level = (user.level || 1) + 1;
                    levelUp = true;
                    user.badges.push({
                        name: `Level ${user.level} Scholar`,
                        icon: '🎓',
                        unlockedAt: new Date()
                    });
                }

                // Award First Grade badge for 90%+ score
                if (percentage >= 90) {
                    const hasFirstGrade = user.badges?.some(b => b.name === 'First Grade');
                    if (!hasFirstGrade) {
                        user.badges.push({
                            name: 'First Grade',
                            icon: '🥇',
                            unlockedAt: new Date()
                        });
                    }
                }

                await user.save();
            }

            if (user && user.parentDetails?.parentEmail && user.parentDetails.parentEmailVerified) {
                mailService.sendExamScorecard(
                    user.parentDetails.parentEmail,
                    `${user.firstName} ${user.lastName}`,
                    {
                        topic: exam.title || "Minerva Exam",
                        score: percentage,
                        feedback: ai_report,
                        correction: ""
                    }
                ).catch(err => console.error("Failed to send parent exam scorecard email:", err));
            }

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
                xpGained,
                currentLevel: user ? user.level : 1,
                currentXp: user ? user.xp : 0,
                levelUp,
                parentDetails: user ? user.parentDetails : null
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

            // Calculate actual average score of all exams submitted by the user
            const examsList = await MinervaExam.find({ userId, status: 'submitted' }).select('percentage').lean();
            let avgScore = 0;
            if (examsList.length > 0) {
                const totalScore = examsList.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
                avgScore = Math.round(totalScore / examsList.length);
            } else {
                avgScore = 85; // Fallback or baseline standard
            }

            // Fetch User for badges
            const user = await User.findById(userId).select('badges').lean();

            // Retrieve range parameter (hour | week | 15days | month | 6months | year)
            const range = (req.query.range as string) || 'week';
            let chartData: { name: string, minutes: number }[] = [];

            const now = new Date();
            let startDate = new Date();

            if (range === 'hour') {
                startDate.setMinutes(startDate.getMinutes() - 60);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const blocks = [0, 0, 0, 0, 0, 0]; // 6 blocks of 10 minutes
                logs.forEach(log => {
                    const diffMs = now.getTime() - new Date(log.createdAt).getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const blockIndex = Math.min(5, Math.floor((60 - diffMins) / 10));
                    if (blockIndex >= 0) {
                        blocks[blockIndex] += log.minutes;
                    }
                });

                chartData = [
                    { name: '50m ago', minutes: blocks[0] },
                    { name: '40m ago', minutes: blocks[1] },
                    { name: '30m ago', minutes: blocks[2] },
                    { name: '20m ago', minutes: blocks[3] },
                    { name: '10m ago', minutes: blocks[4] },
                    { name: 'Now', minutes: blocks[5] }
                ];
            } else if (range === '15days') {
                startDate.setDate(startDate.getDate() - 15);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const dailyMap: { [key: string]: number } = {};
                for (let i = 14; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    dailyMap[key] = 0;
                }

                logs.forEach(log => {
                    const key = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (dailyMap[key] !== undefined) {
                        dailyMap[key] += log.minutes;
                    }
                });

                chartData = Object.keys(dailyMap).map(key => ({
                    name: key,
                    minutes: dailyMap[key]
                }));
            } else if (range === 'month') {
                startDate.setDate(startDate.getDate() - 30);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const dailyMap: { [key: string]: number } = {};
                for (let i = 29; i >= 0; i -= 2) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    dailyMap[key] = 0;
                }

                logs.forEach(log => {
                    const dateObj = new Date(log.createdAt);
                    let closestKey = '';
                    let minDiff = Infinity;
                    Object.keys(dailyMap).forEach(keyStr => {
                        const keyDate = new Date(keyStr + `, ${now.getFullYear()}`);
                        const diff = Math.abs(dateObj.getTime() - keyDate.getTime());
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestKey = keyStr;
                        }
                    });
                    if (closestKey) {
                        dailyMap[closestKey] += log.minutes;
                    }
                });

                chartData = Object.keys(dailyMap).map(key => ({
                    name: key,
                    minutes: dailyMap[key]
                }));
            } else if (range === '6months') {
                startDate.setMonth(startDate.getMonth() - 6);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const monthlyMap: { [key: string]: number } = {};
                for (let i = 5; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const key = d.toLocaleDateString('en-US', { month: 'short' });
                    monthlyMap[key] = 0;
                }

                logs.forEach(log => {
                    const key = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short' });
                    if (monthlyMap[key] !== undefined) {
                        monthlyMap[key] += log.minutes;
                    }
                });

                chartData = Object.keys(monthlyMap).map(key => ({
                    name: key,
                    minutes: monthlyMap[key]
                }));
            } else if (range === 'year') {
                startDate.setMonth(startDate.getMonth() - 12);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const monthlyMap: { [key: string]: number } = {};
                for (let i = 11; i >= 0; i--) {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const key = d.toLocaleDateString('en-US', { month: 'short' });
                    monthlyMap[key] = 0;
                }

                logs.forEach(log => {
                    const key = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short' });
                    if (monthlyMap[key] !== undefined) {
                        monthlyMap[key] += log.minutes;
                    }
                });

                chartData = Object.keys(monthlyMap).map(key => ({
                    name: key,
                    minutes: monthlyMap[key]
                }));
            } else {
                startDate.setDate(startDate.getDate() - 7);
                const logs = await MinervaStudyTimeLog.find({
                    userId,
                    createdAt: { $gte: startDate }
                }).sort({ createdAt: 1 }).lean();

                const weeklyMap: { [key: string]: number } = {
                    'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
                };

                logs.forEach(log => {
                    const key = new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
                    if (weeklyMap[key] !== undefined) {
                        weeklyMap[key] += log.minutes;
                    }
                });

                chartData = Object.keys(weeklyMap).map(key => ({
                    name: key,
                    minutes: weeklyMap[key]
                }));
            }

            const totalMinutesInChart = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
            if (totalMinutesInChart === 0) {
                if (range === 'hour') {
                    chartData = [
                        { name: '50m ago', minutes: 0 },
                        { name: '40m ago', minutes: 0 },
                        { name: '30m ago', minutes: 0 },
                        { name: '20m ago', minutes: 0 },
                        { name: '10m ago', minutes: 0 },
                        { name: 'Now', minutes: 0 }
                    ];
                } else if (range === '15days') {
                    chartData = Array.from({ length: 15 }).map((_, idx) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (14 - idx));
                        return {
                            name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            minutes: [10, 15, 20, 5, 30, 25, 40, 15, 10, 35, 20, 15, 30, 25, 20][idx]
                        };
                    });
                } else if (range === 'month') {
                    chartData = Array.from({ length: 15 }).map((_, idx) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (28 - idx * 2));
                        return {
                            name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            minutes: [20, 35, 15, 40, 50, 30, 25, 45, 60, 35, 40, 55, 30, 45, 50][idx]
                        };
                    });
                } else if (range === '6months') {
                    chartData = Array.from({ length: 6 }).map((_, idx) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - (5 - idx));
                        return {
                            name: d.toLocaleDateString('en-US', { month: 'short' }),
                            minutes: [180, 240, 120, 350, 420, 290][idx]
                        };
                    });
                } else if (range === 'year') {
                    chartData = Array.from({ length: 12 }).map((_, idx) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - (11 - idx));
                        return {
                            name: d.toLocaleDateString('en-US', { month: 'short' }),
                            minutes: [350, 420, 290, 510, 600, 480, 320, 450, 580, 710, 640, 550][idx]
                        };
                    });
                } else {
                    chartData = [
                        { name: 'Mon', minutes: 15 },
                        { name: 'Tue', minutes: 25 },
                        { name: 'Wed', minutes: 10 },
                        { name: 'Thu', minutes: 45 },
                        { name: 'Fri', minutes: 30 },
                        { name: 'Sat', minutes: 15 },
                        { name: 'Sun', minutes: 20 }
                    ];
                }
            }

            return res.json({
                success: true,
                stats: {
                    streak_days: profile.streak_days,
                    study_streak: profile.streak_days, // Map both fields for safety
                    total_sessions: totalSessions,
                    active_sessions: activeSessions,
                    active_roadmaps: activeSessions,
                    total_topics: totalNodes,
                    completed_topics: doneNodes,
                    completion_percent: totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0,
                    total_exams: totalExams,
                    total_exams_taken: totalExams,
                    avg_exam_score: avgScore,
                    pending_homework: pendingHW,
                    today_homework: todayHW,
                    total_study_minutes: profile.total_study_minutes,
                    badges: user?.badges || [],
                    weeklyMinutes: chartData.map(c => c.minutes),
                    chartData
                },
                profile,
            });

        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ─── ADD STUDY TIME ──────────────────────────────
    addStudyTime: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const { minutes } = req.body;
            if (!minutes || typeof minutes !== 'number') {
                return res.status(400).json({ success: false, error: 'Invalid minutes value' });
            }

            const profile = await MinervaStudentProfile.findOne({ userId });
            if (!profile) {
                return res.status(404).json({ success: false, error: 'Student profile not found' });
            }

            profile.total_study_minutes = (profile.total_study_minutes || 0) + minutes;
            await profile.save();

            // Log study session with timestamp
            await MinervaStudyTimeLog.create({
                userId,
                minutes
            });

            // Award 5 XP per minute of studying
            const user = await User.findById(userId);
            if (user) {
                user.xp = (user.xp || 0) + (minutes * 5);
                const xpNeeded = (user.level || 1) * 1000;
                if (user.xp >= xpNeeded) {
                    user.xp -= xpNeeded;
                    user.level = (user.level || 1) + 1;
                }
                await user.save();
            }

            return res.json({
                success: true,
                total_study_minutes: profile.total_study_minutes,
                xp: user?.xp,
                level: user?.level
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

            // Keep images and PDFs to allow rendering in the frontend, clean up others
            const isPersisted = ext === 'pdf' || ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '');
            if (!isPersisted) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error('File cleanup error:', err);
                }
            }

            return res.json({
                success: true,
                filename: originalName,
                extractedText: extractedText.trim(),
                url: `/uploads/${req.file.filename}`,
                type: ext === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '') ? 'image' : 'other',
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

            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({ success: false, error: 'Invalid chat session ID format' });
            }

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

            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({ success: false, error: 'Invalid chat session ID format' });
            }

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

            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({ success: false, error: 'Invalid chat session ID format' });
            }

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

            if (!/^[0-9a-fA-F]{24}$/.test(id)) {
                return res.status(400).json({ success: false, error: 'Invalid chat session ID format' });
            }

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
    // 22b. CREATE CUSTOM STUDY TASK (Custom Homework)
    // POST /api/future-education/task/custom
    // ──────────────────────────────────────────
    createCustomTask: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { prompt, topic_title, subject, marks = 5, due_date, difficulty = 'medium' } = req.body;
            const file = req.file;

            if (!prompt?.trim()) {
                return res.status(400).json({ success: false, error: 'Homework prompt description is required' });
            }
            if (!topic_title?.trim()) {
                return res.status(400).json({ success: false, error: 'Topic title is required' });
            }
            if (!subject?.trim()) {
                return res.status(400).json({ success: false, error: 'Subject is required' });
            }

            const today = new Date().toISOString().split('T')[0];

            let attachmentName = '';
            let attachmentPath = '';
            let attachmentType = '';

            if (file) {
                attachmentName = file.originalname;
                attachmentPath = `/uploads/${file.filename}`;
                attachmentType = file.mimetype.startsWith('image/') ? 'image' : 'pdf';
            }

            const task = new MinervaTask({
                userId,
                type: 'text_answer',
                task_type: 'homework',
                prompt: prompt.trim(),
                topic_title: topic_title.trim(),
                subject: subject.trim(),
                marks: Number(marks),
                difficulty: difficulty.toLowerCase(),
                is_homework: true,
                due_date: due_date ? new Date(due_date) : null,
                homework_date: today,
                attachmentName,
                attachmentPath,
                attachmentType
            });

            await task.save();

            // Notify via Tutor Chat Discussion
            try {
                let activeChatSession = await MinervaChatSession.findOne({ userId }).sort({ updatedAt: -1 });
                if (!activeChatSession) {
                    activeChatSession = await MinervaChatSession.create({ userId, title: 'Study Discussion' });
                }
                const formattedDueDate = due_date ? new Date(due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date';
                const chatContent = `📚 **Naye Homework Task Setup!**\n\nEk naya study task assign kiya gaya hai:\n- **Topic:** ${topic_title.trim()}\n- **Subject:** ${subject.trim()}\n- **Task Details:** ${prompt.trim()}\n- **Due Date:** ${formattedDueDate}\n\nAaj ye work complete karke submit karna hai, updates ke liye track rakhein!`;
                
                await saveChatMessage(userId, 'minerva', chatContent, 'text', null, null, activeChatSession._id);
            } catch (chatErr) {
                console.error('[Homework Notification Error] Failed to send chat message:', chatErr);
            }

            return res.json({ success: true, task });
        } catch (err: any) {
            console.error('[Minerva Task Create Custom Error]', err);
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

            // Save generated material to user's history
            const docData: any = {
                session_id,
                userId,
                type,
                language,
                topic_title: session.title,
                subject: session.subject
            };

            if (type === 'flashcards') {
                docData.flashcards = material;
            } else {
                docData.materialText = material;
            }

            const savedDoc = await MinervaBuilderMaterial.create(docData);

            return res.json({ success: true, material, docId: savedDoc._id });
        } catch (err: any) {
            console.error('[Minerva E-Builder Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // 23b. GET STUDY MATERIALS HISTORY (E-Builder)
    // GET /api/future-education/builder/history
    // ──────────────────────────────────────────
    getMaterialHistory: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const history = await MinervaBuilderMaterial.find({ userId }).sort({ createdAt: -1 });
            return res.json({ success: true, history });
        } catch (err: any) {
            console.error('[Minerva E-Builder History Error]', err);
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

    // ──────────────────────────────────────────
    // 25. UPDATE NODE PRIORITY
    // PUT /api/future-education/node/:id/priority
    // ──────────────────────────────────────────
    updateNodePriority: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { priority } = req.body;

            if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
                return res.status(400).json({ success: false, error: 'Invalid priority value. Must be HIGH, MEDIUM, or LOW' });
            }

            const node = await MinervaKnowledgeNode.findOneAndUpdate(
                { _id: id, userId },
                { priority },
                { new: true }
            );

            if (!node) {
                return res.status(404).json({ success: false, error: 'Node not found' });
            }

            return res.json({ success: true, node });
        } catch (err: any) {
            console.error('[Minerva Update Node Priority Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ─── VIRTUAL LAB: YouTube Video Search ──────────────────────────────────
    labYoutubeSearch: async (req: Request, res: Response) => {
        try {
            const { query } = req.query as { query: string };
            if (!query) {
                return res.status(400).json({ success: false, error: 'query is required' });
            }

            const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

            if (YOUTUBE_API_KEY) {
                // Real YouTube Data API v3 search (broad search across all categories to fetch animations/3D visualization)
                const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&safeSearch=strict&maxResults=5&key=${YOUTUBE_API_KEY}`;
                
                const fetch = (await import('node-fetch')).default;
                const apiRes = await fetch(apiUrl);
                const data: any = await apiRes.json();

                if (data?.items?.length > 0) {
                    // Use the top relevance result directly for 100% accurate topic matching
                    const bestVideo = data.items[0];

                    return res.json({
                        success: true,
                        video_id: bestVideo?.id?.videoId,
                        title: bestVideo?.snippet?.title,
                        channel: bestVideo?.snippet?.channelTitle,
                        thumbnail: bestVideo?.snippet?.thumbnails?.high?.url,
                    });
                }
            }

            // Fallback: Scrape YouTube search page HTML to extract the first video ID
            try {
                const fetch = (await import('node-fetch')).default;
                const searchPageUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                const response = await fetch(searchPageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                });
                const html = await response.text();
                const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
                if (matches && matches[1]) {
                    const firstVideoId = matches[1];
                    return res.json({
                        success: true,
                        video_id: firstVideoId,
                        title: query,
                        channel: 'YouTube Video',
                        thumbnail: `https://img.youtube.com/vi/${firstVideoId}/hqdefault.jpg`,
                    });
                }
            } catch (scrapeErr) {
                console.error('[YouTube Scrape Fallback Error]', scrapeErr);
            }

            return res.json({
                success: true,
                video_id: null,
                search_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
                message: 'YouTube API key not configured and scrape fallback failed',
            });

        } catch (err: any) {
            console.error('[Minerva Lab YouTube Search Error]', err);
            return res.json({
                success: true,
                video_id: null,
                search_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(req.query.query as string || '')}`,
            });
        }
    },

    labSketchfabSearch: async (req: Request, res: Response) => {
        try {
            const { query } = req.query as { query: string };
            if (!query) {
                return res.status(400).json({ success: false, error: 'query is required' });
            }

            console.log(`🔍 [Sketchfab API Search Request] Query: "${query}"`);
            const resolved = await validateAndResolveSketchfabModel(query);

            if (resolved && resolved.model_id) {
                return res.json({
                    success: true,
                    model_id: resolved.model_id,
                    name: resolved.name,
                    viewer_url: resolved.viewer_url,
                    thumbnail: resolved.thumbnail
                });
            }

            return res.json({
                success: false,
                error: 'No Sketchfab models found or validated for the query'
            });

        } catch (err: any) {
            console.error('[Minerva Lab Sketchfab Search Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    labSketchfabSearchList: async (req: Request, res: Response) => {
        try {
            const { query } = req.query as { query: string };
            if (!query) {
                return res.status(400).json({ success: false, error: 'query is required' });
            }

            console.log(`🔍 [Sketchfab API Search List Request] Query: "${query}"`);
            const results = await searchSketchfabModelsList(query);

            return res.json({
                success: true,
                results: results.slice(0, 24)
            });

        } catch (err: any) {
            console.error('[Minerva Lab Sketchfab Search List Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    labYoutubeSearchList: async (req: Request, res: Response) => {
        try {
            const { query } = req.query as { query: string };
            if (!query) {
                return res.status(400).json({ success: false, error: 'query is required' });
            }

            console.log(`🔍 [YouTube API Search List Request] Query: "${query}"`);
            const results = await searchYoutubeVideosList(query);

            return res.json({
                success: true,
                results: results.slice(0, 8)
            });

        } catch (err: any) {
            console.error('[Minerva Lab YouTube Search List Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // EXECUTE PYTHON CODE
    // POST /api/minerva/lab/execute-python
    // ──────────────────────────────────────────
    executePythonCode: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ success: false, error: 'Code is required' });
            }

            if (userId) {
                unlockBadge(userId, 'Virtual Lab Champ', '🧪').catch(err => console.error('[Badge Unlock Error]', err));
            }

            const workerUrl = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';
            const nodeFetch = (await import('node-fetch')).default;
            const response = await nodeFetch(`${workerUrl}/execute-python`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data: any = await response.json();
            return res.json(data);
        } catch (err: any) {
            console.error('[Minerva Python Execution Bridge Error]', err);
            return res.status(500).json({ success: false, error: 'Python Sandbox Worker is offline.' });
        }
    },

    // ──────────────────────────────────────────
    // SPACED REPETITION: GET DUE REVIEWS
    // GET /api/future-education/review/due
    // ──────────────────────────────────────────
    getDueReviews: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const dueNodes = await MinervaKnowledgeNode.find({
                userId,
                sr_due_date: { $lte: new Date() },
                status: { $in: ['DONE', 'NEEDS_REVIEW'] }
            }).sort({ sr_due_date: 1 }).limit(10).lean();
            return res.json({ success: true, due_nodes: dueNodes });
        } catch (err: any) {
            console.error('[getDueReviews Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // REGENERATE TOPIC CONTENT
    // POST /api/future-education/node/:id/regenerate
    // ──────────────────────────────────────────
    regenerateNodeContent: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const node = await MinervaKnowledgeNode.findOne({ _id: id, userId });
            if (!node) return res.status(404).json({ success: false, error: 'Topic not found' });

            // Clear old micro-tasks for this node cleanly
            await MinervaTask.deleteMany({
                $or: [
                    { node_id: id },
                    { _id: { $in: node.micro_tasks || [] } }
                ],
                task_type: 'micro_task'
            });

            // Re-trigger content generation
            const profile = await getOrCreateProfile(userId);
            const session = await MinervaStudySession.findById(node.session_id);
            const sessionLanguage = session?.medium || session?.detected_language || profile.language_preference || 'hinglish';

            const content = await generateTopicContent(node, profile, sessionLanguage);
            if (!content) {
                return res.status(500).json({ success: false, error: 'Failed to regenerate content' });
            }

            const taskIds: any[] = [];
            // Save generated tasks
            if (content.micro_tasks?.length > 0) {
                for (const t of content.micro_tasks) {
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
                    await MinervaTask.create({
                        node_id: id,
                        session_id: node.session_id,
                        userId,
                        type: t.type,
                        task_type: 'homework',
                        prompt: t.prompt,
                        options: t.options || [],
                        correct_answer: t.correct_answer || '',
                        topic_title: node.title,
                        subject: node.topic,
                        marks: t.marks || 5,
                        difficulty: t.difficulty || 'medium',
                        is_homework: true,
                        homework_date: tomorrow.toISOString().split('T')[0],
                    });
                }
            }

            // Update node
            const updatedNode = await MinervaKnowledgeNode.findByIdAndUpdate(id, {
                explanation_simple: content.explanation_simple || '',
                explanation_detailed: content.explanation_detailed || '',
                real_world_example: content.real_world_example || '',
                key_points: content.key_points || node.key_points,
                key_formulas: content.key_formulas || node.key_formulas,
                micro_tasks: taskIds,
                passed: false,
                status: 'IN_PROGRESS',
                last_score: 0
            }, { new: true });

            return res.json({
                success: true,
                node: updatedNode,
                message: 'Content regenerated successfully.'
            });
        } catch (err: any) {
            console.error('[regenerateNodeContent Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // LEADERBOARD RANKINGS
    // GET /api/future-education/leaderboard
    // ──────────────────────────────────────────
    getLeaderboard: async (req: Request | any, res: Response) => {
        try {
            const users = await User.find({ status: 'active' })
                .sort({ level: -1, xp: -1 })
                .limit(10)
                .select('firstName lastName level xp badges')
                .lean();

            return res.json({ success: true, leaderboard: users });
        } catch (err: any) {
            console.error('[getLeaderboard Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ──────────────────────────────────────────
    // GENERATE PDF CERTIFICATE
    // GET /api/future-education/session/:id/certificate
    // ──────────────────────────────────────────
    generateCertificate: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;

            const session = await MinervaStudySession.findOne({ _id: id, userId });
            if (!session) return res.status(404).json({ success: false, error: 'Study session not found' });

            const total = await MinervaKnowledgeNode.countDocuments({ session_id: id });
            const done = await MinervaKnowledgeNode.countDocuments({ session_id: id, status: 'DONE' });

            if (total === 0 || done < total) {
                return res.status(400).json({ success: false, error: 'Pehle sabhi topics complete karo tabhi certificate milega!' });
            }

            const profile = await getOrCreateProfile(userId);
            const user = await User.findById(userId);
            const studentName = profile.name || (user ? `${user.firstName} ${user.lastName}` : 'Student');

            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ 
                layout: 'landscape', 
                size: 'A4',
                margin: 40,
                bufferPages: true 
            });

            const filename = `Certificate_${session.subject.replace(/\s+/g, '_')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            doc.pipe(res);

            // Draw border
            doc.rect(20, 20, 801.89, 555.28).lineWidth(5).strokeColor('#4f46e5').stroke();
            doc.rect(28, 28, 785.89, 539.28).lineWidth(2).strokeColor('#fbbf24').stroke();

            doc.moveDown(4);
            doc.font('Helvetica-Bold').fontSize(36).fillColor('#1e1b4b').text("CERTIFICATE OF COMPLETION", { align: 'center' });
            doc.moveDown(1.5);
            
            doc.font('Helvetica').fontSize(16).fillColor('#4b5563').text("This is proudly presented to", { align: 'center' });
            doc.moveDown(1.2);

            doc.font('Helvetica-Bold').fontSize(28).fillColor('#4f46e5').text(studentName.toUpperCase(), { align: 'center' });
            doc.moveDown(0.2);
            
            doc.moveTo(250, doc.y).lineTo(591.89, doc.y).lineWidth(1.5).strokeColor('#94a3b8').stroke();
            doc.moveDown(1.5);

            doc.font('Helvetica').fontSize(15).fillColor('#4b5563').text("for successfully mastering the curriculum of", { align: 'center' });
            doc.moveDown(1);

            doc.font('Helvetica-Bold').fontSize(22).fillColor('#1e1b4b').text(`"${session.title || session.subject}"`, { align: 'center' });
            doc.moveDown(0.5);
            doc.font('Helvetica-BoldOblique').fontSize(12).fillColor('#6b7280').text(`Subject: ${session.subject} | Board: ${session.board?.toUpperCase()}`, { align: 'center' });
            doc.moveDown(2.5);

            const yPos = doc.y;
            doc.font('Helvetica').fontSize(12).fillColor('#4b5563');
            
            doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 100, yPos, { align: 'left' });
            doc.moveTo(100, yPos + 18).lineTo(250, yPos + 18).lineWidth(1).strokeColor('#cbd5e1').stroke();
            
            doc.text("Future Education OS Verified", 591.89, yPos, { align: 'right' });
            doc.moveTo(541.89, yPos + 18).lineTo(741.89, yPos + 18).lineWidth(1).strokeColor('#cbd5e1').stroke();

            const verificationHash = crypto.createHash('md5').update(`${userId}_${id}`).digest('hex').substring(0, 10).toUpperCase();
            doc.fontSize(8).fillColor('#94a3b8').text(`Verify ID: FEOS-${verificationHash}`, 0, 520, { align: 'center' });

            doc.end();
        } catch (err: any) {
            console.error('[generateCertificate Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    appealExamQuestion: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { question_number, student_reason } = req.body;

            if (!question_number || !student_reason) {
                return res.status(400).json({ success: false, error: 'Question number and appeal reason are required.' });
            }

            const exam = await MinervaExam.findOne({ _id: id, userId });
            if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });

            // Find question metadata
            const questionMeta = exam.questions.find(q => q.question_number === Number(question_number));
            if (!questionMeta) return res.status(404).json({ success: false, error: 'Question not found in this exam.' });

            // Find student's current grading details
            const studentAns = exam.student_answers.find(ans => ans.question_number === Number(question_number));
            const currentMarks = studentAns ? studentAns.obtained_marks : 0;
            const studentAnswerText = studentAns ? studentAns.student_answer : '';

            // Check if appeal already exists
            const existingAppeal = exam.appeals?.find((a: any) => a.question_number === Number(question_number));
            if (existingAppeal) {
                return res.status(400).json({ success: false, error: 'An appeal has already been submitted for this question.' });
            }

            // Call AI appeal service
            const appealResult = await appealExamGrading(
                questionMeta.question,
                questionMeta.expected_answer || '',
                studentAnswerText,
                currentMarks,
                questionMeta.marks,
                student_reason
            );

            // Record appeal in exam document
            const newAppeal = {
                question_number: Number(question_number),
                student_reason,
                status: appealResult.approved ? 'approved' : 'rejected',
                ai_decision_feedback: appealResult.appeal_feedback,
                new_obtained_marks: appealResult.new_marks,
                reviewed_at: new Date()
            };

            // Update student's marks and feedback in student_answers
            let marksDifference = 0;
            const updatedAnswers = exam.student_answers.map((ans: any) => {
                if (ans.question_number === Number(question_number)) {
                    marksDifference = appealResult.new_marks - ans.obtained_marks;
                    return {
                        ...ans,
                        obtained_marks: appealResult.new_marks,
                        feedback: `[Appeal Approved] ${appealResult.appeal_feedback}`
                    };
                }
                return ans;
            });

            // Update exam score aggregates
            const newTotalObtained = exam.total_obtained + marksDifference;
            const newPercentage = Math.round((newTotalObtained / exam.total_marks) * 100);
            const newGrade = newPercentage >= 90 ? 'A+' : newPercentage >= 75 ? 'A' : newPercentage >= 60 ? 'B' :
                newPercentage >= 50 ? 'C' : newPercentage >= 35 ? 'D' : 'F';

            exam.student_answers = updatedAnswers;
            exam.total_obtained = newTotalObtained;
            exam.percentage = newPercentage;
            exam.grade = newGrade;
            if (!exam.appeals) exam.appeals = [];
            exam.appeals.push(newAppeal);

            // Update consolidated AI report to mention the approved appeal
            if (appealResult.approved) {
                exam.ai_report += `\n\n⚖️ **APPEAL APPROVED (Q${question_number}):** Marks increased to ${appealResult.new_marks}/${questionMeta.marks}. Decision: ${appealResult.appeal_feedback}`;
            } else {
                exam.ai_report += `\n\n⚖️ **APPEAL REJECTED (Q${question_number}):** Original marks maintained. Decision: ${appealResult.appeal_feedback}`;
            }

            await exam.save();

            // Award XP to user if score increased
            if (marksDifference > 0) {
                const xpGain = marksDifference * 20; // 20 XP per mark added
                const userObj = await User.findById(userId);
                if (userObj) {
                    userObj.xp = (userObj.xp || 0) + xpGain;
                    // Check level up
                    const currentLvl = userObj.level || 1;
                    const needed = currentLvl * 1000;
                    if (userObj.xp >= needed) {
                        userObj.level = currentLvl + 1;
                    }
                    await userObj.save();
                }
            }

            return res.json({
                success: true,
                message: appealResult.approved ? 'Appeal approved! Your grade has been updated.' : 'Appeal processed. Original marks maintained.',
                appeal: newAppeal,
                exam
            });
        } catch (err: any) {
            console.error('[AppealExamQuestion Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    evaluateVivaAnswer: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params; // knowledge node ID
            const { studentAnswer, currentQuestion, roundIndex = 0 } = req.body;

            const node = await MinervaKnowledgeNode.findOne({ _id: id, userId });
            if (!node) {
                return res.status(404).json({ success: false, error: 'Topic node not found' });
            }

            const messages = [
                {
                    role: 'system',
                    content: `You are an expert Socratic oral examiner. You are conducting a viva/oral exam on the topic: "${node.title}".
Topic Context:
${node.explanation_simple}

Evaluate the student's response to the question: "${currentQuestion}"
Student response: "${studentAnswer}"

Provide a JSON output matching this schema:
{
    "score": number (0 to 100, representing comprehension quality),
    "feedback": "constructive, encouraging feedback in friendly Indian English/Hinglish blend explaining what was correct and what can be improved",
    "passed": boolean (true if score >= 60),
    "nextQuestion": "next logical, slightly deeper question based on their answer. If roundIndex >= 2 or score < 60, set this to null",
    "finished": boolean (set to true if roundIndex >= 2 or score < 60)
}
Guidelines:
- Return ONLY valid JSON.
- Respond in simple Indian English / Hinglish blend (using simple Hinglish words like 'matlab', 'bilkul sahi', 'jaise ki', 'samjhe?', 'chalo') so the student feels comfortable.
- STRICT GRADING: If the student's answer is completely wrong, irrelevant, empty/nonsense, or they say 'don't know/no idea', give a score between 0 and 39, set passed to false, finished to true, and explain the correct concept clearly in Hinglish in the feedback so they learn.
- If the student's answer is partially correct but has gaps, give a score between 40 and 59, set passed to false, finished to true, and give guiding feedback.
- If the student's answer is correct, give score >= 60, set passed to true.`
                }
            ];

            const aiRes = await getProviderResponse(messages, { jsonMode: true, temperature: 0.5 });
            const text = aiRes?.choices?.[0]?.message?.content || '{}';
            
            let parsed: any = {};
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                parsed = {
                    score: 50,
                    feedback: "Answer recorded. Socratic verifier was offline, please try the next prompt.",
                    passed: true,
                    nextQuestion: roundIndex >= 2 ? null : `Tell me more about ${node.title}.`,
                    finished: roundIndex >= 2
                };
            }

            // If viva is finished and student passed (score >= 60), mark the node as DONE to advance
            if (parsed.finished && parsed.passed) {
                node.status = 'DONE';
                (node as any).completed_at = new Date();
                await node.save();
            }

            return res.json({ success: true, ...parsed });
        } catch (err: any) {
            console.error('[Minerva Viva Evaluate Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    reportProctoringViolation: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user?.id || req.user?._id;
            const { id } = req.params;
            const { event, details } = req.body;

            if (!event) {
                return res.status(400).json({ success: false, error: 'Proctoring event type is required.' });
            }

            const exam = await MinervaExam.findOne({ _id: id, userId });
            if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });

            if (!exam.proctoringLogs) exam.proctoringLogs = [];
            
            const logEntry = {
                event,
                timestamp: new Date(),
                details: details || ''
            };
            exam.proctoringLogs.push(logEntry);

            if (event.toLowerCase().includes('tab') || event.toLowerCase().includes('blur') || event.toLowerCase().includes('exit') || event.toLowerCase().includes('visibility')) {
                exam.tabOutCount = (exam.tabOutCount || 0) + 1;
            } else if (event.toLowerCase().includes('copy') || event.toLowerCase().includes('paste') || event.toLowerCase().includes('clipboard')) {
                exam.copyCount = (exam.copyCount || 0) + 1;
            }

            await exam.save();

            try {
                const SocketServiceImport = await import('../../services/socket.service');
                const SocketService = SocketServiceImport.SocketService;
                const io = (SocketService as any).io;
                if (io) {
                    io.emit('proctoring_alert', {
                        examId: exam._id,
                        examTitle: exam.title,
                        userId,
                        user: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Student',
                        event,
                        details,
                        tabOutCount: exam.tabOutCount,
                        copyCount: exam.copyCount,
                        timestamp: new Date()
                    });
                }
            } catch (err) {
                console.error('[Socket Proctoring Emission Error]', err);
            }

            return res.json({
                success: true,
                message: 'Proctoring violation logged.',
                tabOutCount: exam.tabOutCount,
                copyCount: exam.copyCount
            });
        } catch (err: any) {
            console.error('[reportProctoringViolation Error]', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    // ─── DELETION CONTROLLERS ──────────────────────────────────────
    deleteSession: async (req: any, res: Response) => {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const session = await MinervaStudySession.findOneAndDelete({ _id: id, userId });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
            
            await MinervaKnowledgeNode.deleteMany({ session_id: id });
            await MinervaTask.deleteMany({ session_id: id });
            return res.json({ success: true, message: 'Roadmap course deleted successfully' });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    deleteTask: async (req: any, res: Response) => {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const task = await MinervaTask.findOneAndDelete({ _id: id, userId });
            if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
            return res.json({ success: true, message: 'Task deleted successfully' });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    deleteBuilderMaterial: async (req: any, res: Response) => {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const mat = await MinervaBuilderMaterial.findOneAndDelete({ _id: id, userId });
            if (!mat) return res.status(404).json({ success: false, error: 'Material not found' });
            return res.json({ success: true, message: 'Material deleted successfully' });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },

    deleteExam: async (req: any, res: Response) => {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const exam = await MinervaExam.findOneAndDelete({ _id: id, userId });
            if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });
            return res.json({ success: true, message: 'Exam deleted successfully' });
        } catch (err: any) {
            return res.status(500).json({ success: false, error: err.message });
        }
    },
};
