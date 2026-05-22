import { Request, Response } from 'express';
import Session from './session.model';
import User from '../auth/user.model';
import { OnboardingProfile } from '../onboarding/onboarding.model';
import { openaiService } from '../../shared/services/openai.service';
import Roadmap from '../roadmap/roadmap.model';
import Task from '../roadmap/task.model';
import { LandingIntent } from '../onboarding/landing.intent.model';
import { pythonService } from '../../shared/services/python.service';
import { analyticsService } from '../analytics/analytics.service';
import IntelligenceNode from './intelligence.model';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import CollageProject from '../collage_project/collage_project.model';

export const builderController = {
    // ❤️ Message Feedback Logic
    logMessageFeedback: async (req: Request | any, res: Response) => {
        try {
            const { type, sessionId } = req.body;
            const { messageId } = req.params;
            const userId = req.user.id;

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

    // 👉 Create a new chat session
    createSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const { title, initialPrompt } = req.body;
            let landingIntentId = req.body.landingIntentId;

            if (initialPrompt && !landingIntentId) {
                const newIntent = await LandingIntent.create({
                    userId,
                    intentText: initialPrompt,
                    source: 'landing_page_direct',
                    processed: false
                });
                landingIntentId = newIntent._id;
            }

            let onboarding: any = await OnboardingProfile.findOne({ userId }).sort({ createdAt: -1 });
            // MED-2 FIX: Do NOT create a silent fake profile. 
            // We just let `onboardingProfileId` be null, or use a partial if needed.
            if (onboarding) {
                // Intentionally left empty to prevent silent fake DB writes.
            }

            const session = await Session.create({
                userId,
                title: title || 'New Chat',
                messages: [],
                landingIntentId: landingIntentId || null,
                initialPrompt: initialPrompt || null,
                onboardingProfileId: onboarding ? onboarding._id : null
            });

            const user = await User.findById(userId).select('tokenBalance');
            res.status(201).json({ success: true, session, tokenBalance: user?.tokenBalance });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Get all sessions
    getSessions: async (req: Request | any, res: Response) => {
        try {
            const filter: any = { userId: req.user.id };
            if (req.query.hasRoadmap === 'true') filter.hasRoadmap = true;
            if (req.query.hasTasks === 'true') filter.hasTasks = true;

            const sessions = await Session.find(filter).sort({ isPinned: -1, updatedAt: -1 });
            res.json({ success: true, sessions });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Get single session details
    getSession: async (req: Request | any, res: Response) => {
        try {
            const session = await Session.findOne({ _id: req.params.id, userId: req.user.id });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
            res.json({ success: true, session });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Add message (User -> AI)
    addMessage: async (req: Request | any, res: Response) => {
        try {
            const { content, attachments } = req.body;
            const sessionId = req.params.id;
            const userId = req.user.id;

            let projectField = 'Industrial Project';
            let projectFormat = 'Full Stack App';
            let projectStack = 'Selected Industrial Stack';
            let projectVision = 'A high-impact industrial solution';
            let projectCategory = 'Graduation';

            const session = await Session.findOne({ _id: sessionId, userId });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

            const user = await User.findById(userId);
            const userName = user?.firstName || 'Futurist';

            let onboarding = await OnboardingProfile.findOne({ userId }).sort({ createdAt: -1 });
            // MED-2 FIX: Do NOT create a silent fake profile here either.
            if (!onboarding) {
                onboarding = {
                    life_stage: 'Unset',
                    field: 'Unset',
                    final_goal: 'Unset',
                    onboardingCompleted: false
                } as any;
            }

            const processedAttachments: any[] = [];
            let attachmentContext = "";
            const storageDir = path.join(__dirname, '../../../../storage/files');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            if (attachments && Array.isArray(attachments)) {
                for (const file of attachments) {
                    try {
                        const fileId = crypto.randomUUID();
                        const extension = file.name.split('.').pop() || 'bin';
                        const fileName = `${fileId}.${extension}`;
                        const filePath = path.join(storageDir, fileName);

                        let bufferData = '';
                        if (file.preview && typeof file.preview === 'string' && file.preview.includes('base64,')) {
                            bufferData = file.preview.split('base64,')[1];
                        } else {
                            bufferData = file.preview || '';
                        }

                        if (bufferData) {
                            fs.writeFileSync(filePath, Buffer.from(bufferData, 'base64'));
                            const analysis = await pythonService.processAttachment(filePath, file.type, file.name, content);

                            let status = 'uploaded';
                            if (analysis.status === 'SUCCESS') {
                                status = 'processed';
                                const summary = analysis.summary || "Processed successfully.";
                                const fullText = analysis.extracted_text || "";
                                attachmentContext += `\n\n--- FILE ANALYSIS (${file.name}) ---\nSummary: ${summary}\nExtracted Content (Snippet): ${fullText.substring(0, 2000)}\n-----------------------------------\n`;
                            } else {
                                status = 'failed';
                                attachmentContext += `\n\n[System]: Failed to process file ${file.name}. Reason: ${analysis.reason}`;
                            }

                            processedAttachments.push({
                                file_id: fileId,
                                type: file.type.split('/')[0],
                                original_name: file.name,
                                storage_path: filePath,
                                mime_type: file.type,
                                status: status,
                                preview: undefined // MED-8 FIX: Never write full base64 strings to DB (16MB BSON limit bypass)
                            });
                        }
                    } catch (e: any) {
                        console.error("Failed to save/process attachment", e);
                        attachmentContext += `\n[System]: Error uploading ${file.name}: ${e.message}`;
                    }
                }
            }

            const userMsgId = crypto.randomUUID(); // MED-3 FIX: Use UUID instead of Date.now() for unique msg IDs
            let finalContent = content;
            if (attachmentContext && attachmentContext.length > 5) {
                finalContent += `\n\n[SYSTEM: ATTACHMENT PROCESSED]\n${attachmentContext}`;
            }

            // Command Interception
            const lowerContent = content.toLowerCase();
            if ((lowerContent.includes("create") || lowerContent.includes("generate")) && (lowerContent.includes("pdf") || lowerContent.includes("document"))) {
                try {
                    const workerUrl = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';
                    const workerRes = await axios.post(`${workerUrl}/execute`, {
                        job_id: crypto.randomUUID(),
                        prompt: content,
                        command: content
                    }, { timeout: 60000 });

                    if (workerRes.data && workerRes.data.status === 'completed') {
                        const result = workerRes.data.result;
                        finalContent += `\n\n[SYSTEM: GENERATION SUCCESS]\nGenerated File: ${result.file_path}\nDownload Link: ${result.download_url}\nINSTRUCTION: Present the download_url to the user.`;
                    }
                } catch (genErr: any) {
                    console.error("[Builder] Generation Dispatch Failed:", genErr.message);
                }
            }

            (session.messages as any).push({
                id: userMsgId,
                role: 'user',
                content: finalContent,
                timestamp: new Date(),
                attachments: processedAttachments
            });
            await session.save();

            // Collage Project Detection
            let isCollageProjectBuild = false;
            let isTitanPlanRequest = false;
            let collageProjectContext = '';
            let metadataSource = content;


            const lowerC = content.toLowerCase();
            const buildTriggerTerms = ['start industrial build mission', 'build mission', 'build project', 'collage_project_start', '🚀', 'titan build'];
            const planTriggerTerms = ['titan_plan_request', 'blueprint phase', 'planning phase', '🔱'];

            if (planTriggerTerms.some(term => lowerC.includes(term))) {
                isTitanPlanRequest = true;
            } else if (buildTriggerTerms.some(term => lowerC.includes(term))) {
                isCollageProjectBuild = true;
                const history = session.messages as any[];
                // Look for previous plan request in history to extract project details
                const planMsg = [...history].reverse().find(m => m.role === 'user' && (m.content.includes('🔱') || m.content.includes('TITAN_PLAN_REQUEST')));
                if (planMsg) {
                    metadataSource = planMsg.content;
                }
            }

            if (isTitanPlanRequest || isCollageProjectBuild) {
                const lines = metadataSource.split('\n').filter((l: string) => l.trim());
                const getVal = (key: string) => {
                    const line = lines.find(l => l.toLowerCase().includes(key.toLowerCase()));
                    return line ? line.split(':').slice(1).join(':').trim() || '' : '';
                };

                projectField = getVal('Field/Degree') || projectField;
                projectFormat = getVal('Format') || projectFormat;
                projectStack = getVal('Stack') || projectStack;
                projectVision = getVal('Vision') || projectVision;
                projectCategory = getVal('Category') || projectCategory;

                session.title = `🔱 ${projectFormat}: ${projectField.split(' ').slice(0, 4).join(' ')}`;
                await session.save();

                if (isTitanPlanRequest) {
                    collageProjectContext = `
[🏛️ TITAN ARCHITECT: BLUEPRINT PHASE]

MISSION SPECIFICATIONS:
- Field/Degree: ${projectField}
- Format: ${projectFormat}
- Stack: ${projectStack}
- Vision: ${projectVision}
- Category: ${projectCategory}

DELIVERABLES:
1. **Executive Summary**: Core value proposition.
2. **Technical Stack Finalization**: Deep dive into the chosen tools.
3. **Core Modules Architecture**: Description of the industrial engine.
4. **Data Strategy**: Intelligence flow and neural mapping.
5. **Success Metrics**: KPI for industrial validation.

[TERMINATE WITH]: 🚀 **TITAN BLUEPRINT ANALYZED. READY FOR BUILD MISSION.** 🚀

||SUGGESTIONS_JSON|| ["🚀 START INDUSTRIAL BUILD MISSION", "Modify Technical Stack", "Clarify Core Requirements"]
`;
                } else if (isCollageProjectBuild) {
                    collageProjectContext = `
[🔱 TITAN SUPREME BUSINESS ARCHITECT — DEPLOYED 🔱]

You are the Supreme Business & Technical Architect. Your mission is to engineer a 100% commercial-grade, multi-platform business ecosystem. This is NOT a demo; it is a launch-ready business asset.

=== MANDATORY MISSION TAGS ===
TITAN_CATEGORY: ${projectCategory}
TITAN_FIELD: ${projectField}
TITAN_FORMAT: ${projectFormat}
TITAN_STACK: ${projectStack}
TITAN_VISION: ${projectVision}

## 🏗️ 1. THE SUPREME BUSINESS DOSSIER (MINIMUM 4500 WORDS)
Provide a massive, professional business-technical dossier. Every section must be industry-expert level.
**STRICT RULES:**
- NO ASTERISKS (*). USE DASHES (-).
- NO PLACEHOLDERS. NO SUMMARIES.
- PROVIDE DEEP TECHNICAL ORCHESTRATION LOGIC.

1. Executive Summary, 2. Market Analysis (Industrial Context), 3. Problem Solution Mapping, 4. Strategic Objectives, 5. Scalability Roadmap, 6. Technical Architecture (End-to-End), 7. System Specs (PC/Tablet/Mobile), 8. UI/UX Blueprint (Premium 3D & Glassmorphism Aesthetics), 9. API Orchestration Layer, 10. Database Schema (Industrial 3rd Normal Form), 11. Security & Encryption Standard (AES/JWT), 12. Authentication Logic, 13. Data Flow Strategy, 14. Module Logic (Admin, User, Analytics), 15. Implementation Blueprint, 16. Source Code Strategy, 17. QA & Testing Framework, 18. Validation Results, 19. Visual Identity & Logo Branding, 20. Commercial Future Scope, 21. Business Continuity Plan, 22. Expert References (IEEE/ISO Standards).

## 📁 2. BUSINESS ECOSYSTEM (REAL PRODUCTION CODE)
You MUST provide the full-stack logic. Generate massive, professional code blocks. 

[TITAN_MODULE_DATABASE]
// Production-grade DB models with complex relationships, validation hooks, and indexing for ${projectVision}.
[/TITAN_MODULE_DATABASE]

[TITAN_MODULE_AUTH]
// Advanced Business Auth: JWT Refresh/Access tokens, Bcrypt, Session Guard, and MFA logic.
[/TITAN_MODULE_AUTH]

[TITAN_MODULE_SERVER]
// Industrial Express Server: Error handling middlewares, Rate limiting, Logging (Winston), and Route aggregation.
[/TITAN_MODULE_SERVER]

[TITAN_MODULE_ROUTES]
// At least 20 professional API endpoints covering complex business logic for ${projectField}.
[/TITAN_MODULE_ROUTES]

[TITAN_UI_MAIN]
// PREMIUM 3D BUSINESS DASHBOARD: 
// - Fully Responsive (PC, Laptop, Tablet, Mobile)
// - Glassmorphism & High-Fidelity 3D Gradient Aesthetics
// - Framer Motion Animations & Lucide Icons
// - Complex State Management (Redux/Context)
[/TITAN_UI_MAIN]

[TITAN_UI_API_LINK]
// Centralized Axios Instance with Interceptors, Global Loading state, and Error handling.
[/TITAN_UI_API_LINK]

## 🎓 3. STRATEGIC VIVA (FOR COMMERCIAL PITCH)
Provide 15 complex technical questions and high-level enterprise answers.

||SUGGESTIONS_JSON|| ["Finalize Business Logic", "Scale Infrastructure", "Deploy Global UI", "Run Security Audit"]
`;
                }
            }

            let neuralMemory = "";
            try {
                const keyTerms = (content || "").split(' ').filter((w: string) => w.length > 4).slice(0, 5);
                if (keyTerms.length > 0) {
                    const localNodes = await IntelligenceNode.find({
                        userId,
                        $or: [
                            { tags: { $in: keyTerms } },
                            { 'refinedContent.keywords': { $in: keyTerms } }
                        ]
                    }).limit(5).sort({ createdAt: -1 });

                    if (localNodes.length > 0) {
                        neuralMemory = "\n\n[SUPREME NEURAL MEMORY (LOCAL TRUTH)]:\n" +
                            localNodes.map((n: any) => `- ${n.source}: ${n.refinedContent?.summary || n.rawContent.substring(0, 200)}`).join('\n');
                    }
                }
            } catch (e) {
                console.error("[Builder] Neural Memory Retrieval Failed", e);
            }

            const userContext = {
                education: onboarding.life_stage,
                domain: onboarding.field,
                goal: onboarding.final_goal,
                life_stage: onboarding.life_stage,
                problem: onboarding.problem,
                onboardingCompleted: onboarding.onboardingCompleted,
                attachmentAnalysis: attachmentContext,
                neuralMemory: neuralMemory,
                name: userName
            };

            const sessionState = session.sessionState || { mode: 'execution' };
            const enrichedContent = ((isCollageProjectBuild || isTitanPlanRequest) && collageProjectContext) ? collageProjectContext : finalContent;
            const aiMode = (isCollageProjectBuild || isTitanPlanRequest) ? 'collage_project' : (sessionState.mode || 'execution');

            console.log(`[Builder] Calling AI | Mode: ${aiMode} | Session: ${sessionId}`);
            const aiText = await openaiService.generateResponse(
                { title: session.title, lastMsg: content },
                enrichedContent,
                { mode: aiMode, sessionState, userContext },
                session.messages.slice(0, -1)
            );

            let cleanedAiText = aiText;
            let projectDownloads: any = null;

            // Command Execution Layer
            try {
                const cleanJson = (aiText || "").trim().replace(/```json/g, '').replace(/```/g, '');
                if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
                    const commandObj = JSON.parse(cleanJson);
                    if (commandObj.task && commandObj.action) {
                        const workerUrl = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';
                        const workerRes = await axios.post(`${workerUrl}/execute`, {
                            job_id: `cmd-${Date.now()}`,
                            command: JSON.stringify(commandObj),
                            prompt: content,
                            metadata: { ...commandObj.params, task: commandObj.task, action: commandObj.action }
                        }, { timeout: 120000 });

                        if (workerRes.data && workerRes.data.status === 'completed') {
                            const resultMeta = workerRes.data.result || {};
                            if (resultMeta.download_url) {
                                cleanedAiText = `✅ **Task Completed: ${commandObj.task}**\n\n📂 **[Download File](${resultMeta.download_url})**`;
                            } else {
                                cleanedAiText = workerRes.data.extracted_text || "✅ Task Completed successfully.";
                            }
                        }
                    }
                }
            } catch (err) {
                // Not a command or parsing failed
            }

            // Metadata Extraction (Summary & Suggestions)
            let summary = "";
            let suggestions: string[] = [];
            const summaryMatch = (aiText || "").match(/\[SUMMARY\]:\s*([\s\S]*?)(?=\[|\|\|SUGGESTIONS_JSON\|\||$)/i);
            if (summaryMatch) {
                summary = summaryMatch[1].trim();
                cleanedAiText = cleanedAiText.replace(summaryMatch[0], "").trim();
            }

            const jsonSuggestionsMatch = (aiText || "").match(/\|\|SUGGESTIONS_JSON\|\|\s*(\[.*\])/i);
            if (jsonSuggestionsMatch) {
                try {
                    suggestions = JSON.parse(jsonSuggestionsMatch[1]);
                    cleanedAiText = cleanedAiText.replace(jsonSuggestionsMatch[0], "").trim();
                } catch (e) {
                    console.error("Failed to parse Suggestions JSON", e);
                }
            } else {
                const legacySuggestionsMatch = (aiText || "").match(/\[SUGGESTIONS\]:(.*?)(?=\[|$)/i);
                if (legacySuggestionsMatch) {
                    suggestions = legacySuggestionsMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
                    cleanedAiText = cleanedAiText.replace(legacySuggestionsMatch[0], "").trim();
                }
            }

            cleanedAiText = (cleanedAiText || "").replace(/\[RANK\]:[\s\S]*?(\n|$)/gi, "").trim();

            // Build Mission Logic
            let downloadMarkdown = '';
            let assistantAttachments: any[] = [];
            if (isCollageProjectBuild) {
                try {
                    console.log("[Builder] 🚀 Initiating Titan Build Mission with Metadata Harvesting...");
                    const workerUrl = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';

                    const getTag = (key: string) => {
                        const regex = new RegExp(`${key}:\\s*(.*)`, 'i');
                        const match = (aiText || "").match(regex);
                        return match ? match[1].trim() : '';
                    };

                    const buildRes = await axios.post(`${workerUrl}/execute`, {
                        job_id: `proj-${Date.now()}`,
                        command: JSON.stringify({
                            task: 'collage_project',
                            action: 'build',
                            params: {
                                project_name: getTag('TITAN_VISION').substring(0, 100) || 'Industrial Project',
                                category: getTag('TITAN_CATEGORY') || projectCategory,
                                field: getTag('TITAN_FIELD') || projectField,
                                project_type: getTag('TITAN_FORMAT') || projectFormat,
                                tech_stack: getTag('TITAN_STACK') || projectStack,
                                vision: getTag('TITAN_VISION') || projectVision,
                                ai_content: aiText,
                                branding: { logo: true, mockup: true }
                            }
                        }),
                        prompt: content
                    }, { timeout: 180000 });

                    if (buildRes.data && buildRes.data.status === 'completed') {
                        const resData = buildRes.data.result || {};
                        const artifacts = resData.artifacts || {};

                        // Map artifacts to internal file structure
                        const projectFiles = {
                            zip: artifacts.zipUrl || '#',
                            docx: artifacts.docUrl || '#',
                            pdf: artifacts.pdfUrl || '#',
                            ppt: artifacts.pptUrl || '#'
                        };

                        cleanedAiText = `
# 🔱 TITAN MISSION COMPLETE: BUSINESS-READY ARCHITECTURE 
> **Mission ID:** ${buildRes.data.job_id || 'PROJ-CORE-V5'}
> **Vision:** ${getTag('TITAN_VISION') || projectVision}

### 📂 Your Industrial Deliverables
The Neural Engine has synthesized your end-to-end business ecosystem. All files follow the **80-Page Supreme High-Fidelity Standard**.

| Artifact | File Type | Status |
| :--- | :--- | :--- |
| **Complete Source Code** | 📦 ZIP Archive | [Download](${projectFiles.zip}) |
| **Technical Dossier** | 📄 Word Doc | [Download](${projectFiles.docx}) |
| **Industrial Package** | 📕 PDF Pack | [Download](${projectFiles.pdf}) |
| **Strategic Presentation** | 📊 PPT Slides | [Download](${projectFiles.ppt}) |

---
**Mission Notes:** 
- The codebase is architected for **Commercial Scalability**.
- UI features **Premium 3D Aesthetics** and is 100% Mobile/Tablet/PC responsive.
- Backend implements a **3-Tier Industrial Security Layer**.
`;

                        const logoUrl = resData.assets?.logo;
                        const uiUrl = resData.assets?.mockup;
                        if (logoUrl) assistantAttachments.push({ type: 'image', url: logoUrl, name: 'Project Branding' });
                        if (uiUrl) assistantAttachments.push({ type: 'image', url: uiUrl, name: 'Premium UI Mockup' });

                        // Synchronize with global response structure
                        projectDownloads = {
                            word: { url: projectFiles.docx },
                            pdf: { url: projectFiles.pdf },
                            ppt: { url: projectFiles.ppt },
                            zip: { url: projectFiles.zip }
                        };
                    }
                } catch (err: any) {
                    console.error(`[Builder] ❌ Build Mission failed: `, err.message);
                    cleanedAiText = `\n\n> ⚠️ **Titan Alert:** Generation error: ${err.message}. Please retry.`;
                }
            }

            (session.messages as any).push({
                id: crypto.randomUUID(), // MED-3 FIX: UUID instead of +1
                role: 'assistant',
                content: cleanedAiText + downloadMarkdown,
                timestamp: new Date(),
                summary: summary || undefined,
                suggestions: suggestions.length > 0 ? suggestions : undefined,
                projectFiles: projectDownloads || undefined,
                attachments: assistantAttachments.length > 0 ? assistantAttachments : undefined
            });

            if (session.title === 'New Chat' || session.title === 'Untitled' || !session.title) {
                // Strict Rule: Extract first 15 words for the title directly from raw chat input
                const rawText = req.body.content || "";
                // Use simply splitting by space to preserve user's language (Hindi, emojis, etc.)
                const words = rawText.trim().split(/\s+/).filter(Boolean);
                let newTitle = words.slice(0, 15).join(' ');
                if (words.length > 15) newTitle += '...';

                if (newTitle) {
                    session.title = newTitle;
                }
            }

            session.updatedAt = new Date();
            await session.save();

            const updatedUser = await User.findById(userId).select('tokenBalance');
            res.json({
                success: true,
                messages: session.messages,
                title: session.title,
                tokenBalance: updatedUser?.tokenBalance,
                projectFiles: projectDownloads || undefined
            });
        } catch (err: any) {
            console.error("[Builder] Critical Error in addMessage:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Rename Session
    renameSession: async (req: Request | any, res: Response) => {
        try {
            const { title } = req.body;
            const session = await Session.findOneAndUpdate(
                { _id: req.params.id, userId: req.user.id },
                { title },
                { new: true }
            );
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
            res.json({ success: true, session });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Delete Session
    deleteSession: async (req: Request | any, res: Response) => {
        try {
            const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
            res.json({ success: true, message: 'Session deleted successfully' });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Pin / Unpin Session
    togglePinSession: async (req: Request | any, res: Response) => {
        try {
            const session = await Session.findOne({ _id: req.params.id, userId: req.user.id });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
            session.isPinned = !session.isPinned;
            await session.save();
            res.json({ success: true, isPinned: session.isPinned });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Get Dashboard Stats
    getDashboardStats: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const totalSessions = await Session.countDocuments({ userId });
            const recentSessions = await Session.find({ userId }).sort({ updatedAt: -1 }).limit(3).select('title updatedAt hasRoadmap hasTasks');
            const latestRoadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 }).select('title progress steps');

            const pendingTasks = await Task.find({
                userId,
                status: { $in: ['pending', 'in-progress'] }
            }).sort({ dayNumber: 1 }).limit(3).select('title status dayNumber');

            const completedTaskCount = await Task.countDocuments({ userId, status: 'completed' });
            const activeRoadmapCount = await Session.countDocuments({ userId, hasRoadmap: true });

            const totalProjects = await CollageProject.countDocuments({ userId });
            const recentProjects = await CollageProject.find({ userId }).sort({ updatedAt: -1 }).limit(2).select('title status field updatedAt');

            res.json({
                success: true,
                stats: {
                    totalSessions,
                    activeRoadmaps: activeRoadmapCount,
                    completedTasks: completedTaskCount,
                    totalProjects,
                    recentSessions,
                    recentProjects,
                    latestRoadmap: latestRoadmap ? {
                        title: latestRoadmap.title,
                        progress: latestRoadmap.progress || 0,
                        totalSteps: latestRoadmap.steps?.length || 0
                    } : null,
                    pendingTasks
                }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
