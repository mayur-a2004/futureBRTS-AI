import { Request, Response } from 'express';
import Roadmap from './roadmap.model';
import Task from './task.model';
import Session from '../builder/session.model';
import ChatSummary from '../builder/summary.model';
import { openaiService } from '../../shared/services/openai.service';
import User from '../auth/user.model';
import { OnboardingProfile } from '../onboarding/onboarding.model';
import axios from 'axios';
import { EconomyService } from '../economy/economy.service';

export const roadmapController = {
    // Generate Roadmap from Session (Summary Driven)
    generateRoadmap: async (req: Request | any, res: Response) => {
        try {
            const { sessionId } = req.body;
            const userId = req.user.id;

            // --- TOKEN CHARGE: ROADMAP ---
            const charge = await EconomyService.chargeUser(userId, 'TOKEN_COST_ROADMAP', 'Neural Roadmap Generation');
            if (!charge.success) {
                return res.status(402).json({ success: false, error: charge.error });
            }

            // 0. 🛡️ EVOLUTION & STALE CHECK
            const session = await Session.findById(sessionId);
            if (!session) return res.status(404).json({ error: "Session not found" });

            const existingRoadmap = await Roadmap.findOne({ sessionId, userId });
            const isEvolveRequest = req.body.evolve === true;

            // Intelligence Check: Has the chat evolved since the last roadmap?
            const isChatStale = existingRoadmap && session.updatedAt > existingRoadmap.updatedAt;

            if (existingRoadmap && !isEvolveRequest && !isChatStale) {
                console.info(`⚡ Neural Cache Hit: Roadmap exists and chat is stable. Returning existing blueprint.`);
                const updatedUser = await User.findById(userId).select('tokenBalance');
                return res.status(200).json({
                    success: true,
                    roadmap: existingRoadmap,
                    tokenBalance: updatedUser?.tokenBalance
                });
            }

            // 1. Dynamic Summary Analysis (Freshness Protocol)
            let summary = await ChatSummary.findOne({ sessionId });
            // MED-3 FIX: Use createdAt since ChatSummary has no updatedAt natively
            const isSummaryStale = summary && session.updatedAt > (summary as any).createdAt;

            if (!summary || isSummaryStale || isEvolveRequest) {
                console.info("⚡ [Neural Sync] Re-analyzing chat history for fresh context...");
                const summaryData = await openaiService.generateSummary(session.messages);
                summary = await ChatSummary.findOneAndUpdate(
                    { sessionId },
                    {
                        sessionId,
                        userId,
                        summaryText: summaryData.summaryText,
                        keySignals: {
                            ...summaryData.keySignals,
                            main_topic: summaryData.main_topic,
                            sub_topics: summaryData.sub_topics,
                            intended_stack: summaryData.intended_stack,
                            user_vibe: summaryData.user_vibe
                        },
                        approved: true
                    },
                    { upsert: true, new: true }
                );
            }

            // 2. Generate Roadmap (NEURAL ARCHITECTURE ENGINE - PYTHON Authoritative)
            const messagesToProcess = session.messages.length > 20
                ? session.messages.slice(-20)
                : session.messages;

            const historyText = messagesToProcess.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n---\n');
            const signals = (summary.keySignals as any) || {};
            const persona = signals.persona || 'PROFESSIONAL';

            // 🧠 INTELLIGENCE BLUEPRINT (The "Source of Truth")
            const intelligenceBlueprint = `
                ### INTELLIGENCE BLUEPRINT (DO NOT DEVIATE):
                MAIN GOAL: ${signals.main_topic || 'Adaptive Learning'}
                CORE PILLARS (SUB-TOPICS): ${signals.sub_topics?.join(' -> ') || 'Basics, Implementation, Advanced'}
                TECH STACK: ${signals.intended_stack || 'Standard Stack'}
                USER VIBE: ${signals.user_vibe || 'FRIENDLY'}
            `;

            const contextString = `
                ${intelligenceBlueprint}

                ### MANDATORY CONTEXT (LATEST HISTORY):
                ${historyText}

                ### ANALYTICAL SUMMARY:
                ${summary.summaryText}
            `;

            console.info("⚡ Routing to Neural Architecture Engine (Python)...");

            let steps = [];
            let roadmapTitle = signals.main_topic || "Strategic Roadmap " + new Date().toLocaleDateString();
            let roadmapDescription = "";
            let neuralScore = 0;
            let deepData: any = null;

            // 🧠 SMART EVOLUTION: Use the existing roadmap we already fetched at L29
            const previousRoadmap = existingRoadmap;
            const evolutionContext = previousRoadmap ? JSON.stringify(previousRoadmap.steps) : null;

            console.info(`⚡ STARTING ROADMAP GEN: Session ${sessionId}, User ${userId} [Evolution Mode: ${!!existingRoadmap}]`);
            try {
                const WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';

                // CALLING THE PYTHON AUTHORITY
                console.info("⚡ Dispatching to Python Worker...");
                const workerRes = await axios.post(`${WORKER_URL}/execute`, {
                    job_id: `roadmap-${Date.now()}`,
                    command: "generate deep roadmap",
                    prompt: contextString,
                    session_id: sessionId,
                    metadata: { existing_roadmap: evolutionContext }
                }, { timeout: 180000 }); // 🛡️ 3m Alpha Timeout for deep roadmaps

                if (workerRes.data && workerRes.data.status === 'completed' && workerRes.data.result) {
                    deepData = workerRes.data.result;
                    steps = deepData.steps || [];
                    roadmapTitle = deepData.title || roadmapTitle;
                    roadmapDescription = deepData.description || roadmapDescription;
                    neuralScore = deepData.neural_verification?.accuracy_score || 0;
                } else {
                    throw new Error(workerRes.data.error || "Neural Engine Timeout");
                }
            } catch (workerErr: any) {
                console.error("Neural Engine Failed, attempting lightweight AI fallback...", workerErr.message);

                // 🧠 ADAPTIVE HEALING: Fetch detected skill gaps to inject into the evolved roadmap
                let gapContext = "None";
                try {
                    const SkillGap = require('../analytics/skill.gap.model').default;
                    const detectedGaps = await SkillGap.find({ userId, status: 'detected' });
                    gapContext = detectedGaps.map((g: any) => `${g.skillName} (Intensity: ${g.gapIntensity}%)`).join(', ') || "None";
                } catch (e) { console.warn("SkillGaps not available"); }

                const evolutionContextString = `${contextString}\n\n[DETECTED SKILL GAPS TO HEAL]: ${gapContext}`;

                // Last Resort Fallback
                const aiResult = await openaiService.generateRoadmapJSON(evolutionContextString, previousRoadmap, persona);
                steps = aiResult.steps || [];
                roadmapTitle = aiResult.title || roadmapTitle;
                roadmapDescription = aiResult.description || roadmapDescription;
            }

            // 3. Apply Locking & Resilient Mapping (Unlocked by default)
            const finalSteps = steps.map((step: any, index: number) => {
                // Handle naming variations from different AI providers
                const mSteps = step.microSteps || step.smallTopics || [];
                return {
                    ...step,
                    isLocked: false,
                    microSteps: mSteps.map((ms: any) => ({
                        title: ms.title,
                        what: ms.what || ms.description || ms.detailedContext || '',
                        why: ms.why || '',
                        how: ms.how || '',
                        who: ms.who || '',
                        difficulty_level: ms.difficulty_level || 1,
                        timeEstimate: ms.timeEstimate || ms.suggestedTime || '40 mins',
                        youtubeLink: ms.youtubeLink || '',
                        isCompleted: false,
                        innerTopics: (ms.innerTopics || []).map((it: any) => ({
                            title: it.title,
                            what: it.what || it.description || ''
                        }))
                    }))
                };
            });

            // --- SAVE LOGIC ---
            let roadmap: any;
            if (existingRoadmap && isEvolveRequest) {
                console.info(`🧬 [Evolution] Adapting Roadmap: ${existingRoadmap._id}`);
                existingRoadmap.title = roadmapTitle;
                existingRoadmap.description = roadmapDescription;
                existingRoadmap.steps = finalSteps.map((s: any, idx: number) => ({
                    ...s,
                    stepNumber: idx + 1,
                    isLocked: false,
                    state: 'UNLOCKED'
                }));
                existingRoadmap.neuralScore = neuralScore || 85;
                roadmap = await existingRoadmap.save();
            } else {
                roadmap = await Roadmap.create({
                    userId,
                    sessionId,
                    title: roadmapTitle,
                    description: roadmapDescription,
                    steps: finalSteps.map((s: any, idx: number) => ({
                        ...s,
                        stepNumber: idx + 1,
                        isLocked: false,
                        state: 'UNLOCKED'
                    })),
                    neuralScore: neuralScore || 90,
                    status: 'active'
                });
            }

            // --- EXPERIENCE LOGIC ---
            try {
                // HIGH-4 FIX: Ensure path is valid or gracefully degrade without console warnings 
                const Experience = require('../builder/experience.model').default;
                if(Experience) {
                    await Experience.create({
                        userId,
                        type: 'ROADMAP_COMPLETION',
                        context: { title: roadmapTitle, stepsCount: finalSteps.length },
                        outcome: { status: 'created' },
                        learningSignal: 1.0
                    });
                }
            } catch (e) { /* silent degradation if experience model is unneeded */ }

            if (steps.length > 0) {
                session.hasRoadmap = true;
                session.activeRoadmapId = roadmap._id;
                if (!session.sessionState) {
                    session.sessionState = { mode: 'execution', questionsRemaining: 0, isRoadmapGenerated: true };
                } else {
                    session.sessionState.isRoadmapGenerated = true;
                    session.sessionState.mode = 'execution';
                }
                await session.save();
            }

            const updatedUser = await User.findById(userId).select('tokenBalance');
            res.status(201).json({
                success: true,
                roadmap,
                tokenBalance: updatedUser?.tokenBalance
            });
        } catch (err: any) {
            console.error("Roadmap Generation Error:", err);
            
            // CRIT-2 FIX: Refund token on crash to protect user
            try {
                await User.findByIdAndUpdate(req.user.id, { $inc: { tokenBalance: 100 } });
                console.log(`[Economy] Refunded 100 tokens to user ${req.user.id} due to Neural Engine failure.`);
            } catch(e) {}
            
            res.status(500).json({ success: false, error: "Neural Engine failed to generate mapping. Token Refunded." });
        }
    },

    getRoadmaps: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });

            const enrichedRoadmaps = (await Promise.all(roadmaps.map(async (r: any) => {
                if (!r.steps || r.steps.length === 0) return null;
                const totalTasks = await Task.countDocuments({ roadmapId: r._id });
                const completedTasks = await Task.countDocuments({ roadmapId: r._id, status: 'done' });
                const activeSession = r.sessionId ? await Session.findById(r.sessionId).select('title') : null;

                return {
                    ...r.toObject(),
                    stats: {
                        totalTasks,
                        completed: completedTasks,
                        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                    },
                    sessionTitle: activeSession?.title || 'Unknown Session'
                };
            }))).filter(r => r !== null);

            res.json({ success: true, roadmaps: enrichedRoadmaps });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Convert Roadmap to Tasks (Day-based Logic)
    convertToTasks: async (req: Request | any, res: Response) => {
        try {
            const { roadmapId } = req.body;
            const userId = req.user.id;

            // --- TOKEN CHARGE: TASK EXTRAPOLATION ---
            const charge = await EconomyService.chargeUser(userId, 'TOKEN_COST_TASK', 'Strategic Task Extrapolation');
            if (!charge.success) {
                return res.status(402).json({ success: false, error: charge.error });
            }

            const roadmap = await Roadmap.findById(roadmapId);
            if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

            if (roadmap.sessionId) {
                await Session.findByIdAndUpdate(roadmap.sessionId, { hasTasks: true });
            }

            const profile = await OnboardingProfile.findOne({ userId });
            let userType = 'JOB_SWITCHER';
            if (profile) {
                const f = (profile.field || '').toLowerCase();
                const s = (profile.life_stage || '').toLowerCase();
                if (f.includes('school') || f.includes('student') || s.includes('student')) userType = 'STUDENT';
                else if (f.includes('business') || f.includes('founder')) userType = 'BUSINESS';
            }

            let chatSummary = "";
            let roadmapTitle = roadmap.title || "";
            let intelligenceBlueprint = "";

            const summaryDoc = await ChatSummary.findOne({ sessionId: roadmap.sessionId }).sort({ createdAt: -1 });
            if (summaryDoc) {
                chatSummary = summaryDoc.summaryText;
                const signals = (summaryDoc.keySignals as any) || {};
                intelligenceBlueprint = `
                    MAIN GOAL: ${signals.main_topic || roadmap.title}
                    CORE PILLARS: ${signals.sub_topics?.join(' -> ') || 'Basics, Implementation, Advanced'}
                    TECH STACK: ${signals.intended_stack || 'Standard'}
                    USER VIBE: ${signals.user_vibe || 'FRIENDLY'}
                `;
            }

            const allCreatedTasks = [];
            const steps = roadmap.steps as any[];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const isLastStep = i === steps.length - 1;
                const existingTasks = await Task.find({ userId, roadmapStepId: step._id });
                
                // CRIT-3 FIX: Skip AI execution if tasks ALREADY exist to prevent duplication
                if (existingTasks.length > 0) {
                     allCreatedTasks.push(...existingTasks);
                     continue; 
                }
                
                const existingSummary = existingTasks.map(t => t.title).join(', ');
                const stepPhase = step.phase || "FOUNDATION";

                try {
                    const taskContextString = `
                        ### MISSION BLUEPRINT:
                        ${intelligenceBlueprint}

                        ### CURRENT ROADMAP STEP:
                        TITLE: ${step.title}
                        PHASE: ${step.phase}
                        WHAT: ${step.what || step.description || ''}
                        STRATEGY (HOW): ${step.how || ''}
                        MISSION WHY: ${step.why || ''}
                        ${isLastStep ? '🚨 FINAL HURDLE: This is the LAST step. Make the tasks extremely comprehensive and project-based to prove 100% mastery.' : ''}

                        ${step.microSteps?.length > 0 ? `
                        ### SPECIFIC MICRO-MODULES TO EXPAND:
                        ${step.microSteps.map((ms: any) => `- ${ms.title}: ${ms.what || ms.description || ''} (Difficulty: ${ms.difficulty_level}, Time: ${ms.timeEstimate})`).join('\n')}
                        ` : `
                        ### NOTE: No existing micro-steps found. 
                        Please intelligently expand the Title "${step.title}" and the Description "${step.description || ''}" into a set of 3-5 microscopic tasks for this session.
                        `}
                    `;

                    const generatedTasksData = await openaiService.generateTasksJSON(
                        taskContextString,
                        userType,
                        roadmapTitle,
                        chatSummary,
                        step.phase,
                        existingSummary
                    );

                    const generatedTasks = generatedTasksData.tasks || [];
                    const newlyCreated = await Promise.all(generatedTasks.map(async (t: any) => {
                        const shouldLock = step.isLocked || t.dayNumber > 1;
                        let finalResources = t.learningResources || [];

                        // 🎬 YouTube & Study Asset Consolidation
                        const stepMicroMatch = step.microSteps?.find((ms: any) => ms.title.includes(t.title) || t.title.includes(ms.title));

                        if (stepMicroMatch && stepMicroMatch.youtubeLink && stepMicroMatch.youtubeLink.includes('watch?v=')) {
                            // PRIORITIZE DIRECT AI LINK
                            finalResources.push({
                                type: 'youtube',
                                title: `${t.title} — Expert Tutorial`,
                                url: stepMicroMatch.youtubeLink
                            });
                        }

                        // Add Study Links (W3Schools, GFG, etc.)
                        if (stepMicroMatch && stepMicroMatch.studyLinks) {
                            stepMicroMatch.studyLinks.forEach((sl: any) => {
                                finalResources.push({
                                    type: 'article',
                                    title: `${sl.site} — Official Lesson`,
                                    url: sl.url
                                });
                            });
                        }

                        // If no direct link, try Worker, then fallback
                        if (finalResources.length === 0) {
                            try {
                                const WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';
                                const ytRes = await axios.post(`${WORKER_URL}/execute`, {
                                    job_id: `yt-sync-${Date.now()}`,
                                    command: "discover_assets",
                                    metadata: { topic: t.title, context: `${roadmapTitle} ${step.title}` }
                                }, { timeout: 15000 });

                                if (ytRes.data?.result?.assets?.length > 0) {
                                    finalResources = ytRes.data.result.assets.map((a: any) => ({
                                        type: 'youtube', title: a.title, url: a.url,
                                        metadata: { is_direct_match: true }
                                    }));
                                    console.info(`[YT] ✅ ${finalResources.length} assets found for: ${t.title}`);
                                } else {
                                    throw new Error('No assets returned');
                                }
                            } catch (ytErr) {
                                // ℹ️ Fallback: YouTube search URL (always works, user can choose)
                                const searchQuery = encodeURIComponent(`${t.title} ${roadmapTitle} tutorial`);
                                finalResources.push({
                                    type: 'youtube',
                                    title: `${t.title} — YouTube Search`,
                                    url: `https://www.youtube.com/results?search_query=${searchQuery}`,
                                    metadata: { is_direct_match: false, is_search: true }
                                });
                                console.warn(`[YT] Worker unavailable, using search URL for: ${t.title}`);
                            }
                        }

                        // Mapping to updated Task Model with Execution Labs and Level derivation
                        let taskLevel = 1;
                        if (stepPhase === 'Legend') taskLevel = 3;
                        else if (stepPhase === 'High') taskLevel = 2;

                        // 🛡️ STRATEGIC LOCKING: Only Day 1 of the very first Step is unlocked.
                        const isFirstStep = step._id.toString() === roadmap.steps[0]._id.toString();
                        const shouldBeLocked = !isFirstStep || t.dayNumber > 1;

                        return await Task.create({
                            userId, roadmapId: roadmap._id, roadmapStepId: step._id,
                            title: t.title,
                            level: taskLevel,
                            description: t.description,
                            what: t.what || step.what || '',
                            why: t.why || step.why || '',
                            how: t.how || step.how || '',
                            who: t.who || step.who || '',
                            conceptMap: t.conceptMap || [],
                            siliconValleyWisdom: t.siliconValleyWisdom || '',
                            viva: t.viva || null,
                            objective: t.objective || "Achieve mission mastery.",
                            input: t.input || "Project Brief",
                            output: t.output || "Feature Deployment",
                            validationRule: t.validationRule || "Concept Mastery",
                            detailedGuidance: t.description,
                            learningResources: finalResources,
                            subTasks: (t.subTasks || []).map((sub: any) => ({
                                title: sub.title,
                                description: sub.description || '',
                                isCompleted: false
                            })),
                            verification: { isVerified: false, results: [] },
                            dayNumber: t.dayNumber || 1,
                            status: shouldBeLocked ? 'locked' : 'todo',
                            isLocked: shouldBeLocked
                        });
                    }));

                    allCreatedTasks.push(...existingTasks, ...newlyCreated);
                } catch (stepErr: any) {
                    // ❌ Log step errors so we can debug them
                    console.error(`[Task Generation] Step "${step.title}" failed:`, stepErr.message);
                }
            }

            res.json({
                success: true,
                message: "Neural Synchronization Successful.",
                count: allCreatedTasks.length
            });
        } catch (error: any) {
            console.error("Task Conversion Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
};
