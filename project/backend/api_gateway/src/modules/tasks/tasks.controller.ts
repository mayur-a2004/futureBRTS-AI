import { Request, Response } from 'express';
import Task from '../roadmap/task.model';
const Session = require('../builder/session.model').default;
const Roadmap = require('../roadmap/roadmap.model').default;
const { openaiService } = require('../../shared/services/openai.service');

const vivaThrottle = new Map<string, number>();

export const tasksController = {
    getTasks: async (req: Request | any, res: Response) => {
        try {
            const filter: any = { userId: req.user.id };
            if (req.query.roadmapId) filter.roadmapId = req.query.roadmapId;
            const tasks = await Task.find(filter).sort({ dayNumber: 1, createdAt: 1 });
            res.json({ success: true, tasks });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getTaskAnalytics: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const filter: any = { userId };
            if (req.query.roadmapId) filter.roadmapId = req.query.roadmapId;

            const tasks = await Task.find(filter);

            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'done').length;
            const pending = tasks.filter(t => t.status === 'todo').length;

            const todayTasks = tasks.filter(t => !t.isLocked && t.status !== 'done');

            res.json({
                success: true,
                analytics: {
                    total,
                    completed,
                    pending,
                    todayCount: todayTasks.length
                },
                todayTasks
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateTask: async (req: Request | any, res: Response) => {
        try {
            const { taskId, status } = req.body;
            const userId = req.user.id;

            const task = await Task.findOne({ _id: taskId, userId });
            if (!task) return res.status(404).json({ error: "Task not found" });

            // Logic: Cannot mark DONE if hierarchical VIVAs are pending
            if (status === 'done' && task.subTasks && task.subTasks.length > 0) {
                const someUnfinished = task.subTasks.some(st => st.executionLabs?.some(sm => !sm.isCompleted));
                if (someUnfinished) {
                    return res.status(400).json({
                        error: "Verification Required",
                        message: "Multiple small task VIVAs are pending. Complete all audits first."
                    });
                }
            }

            task.status = status;
            await task.save();

            // UNLOCK LOGIC:
            if (status === 'done') {
                const tasksForDay = await Task.find({
                    userId,
                    roadmapStepId: task.roadmapStepId,
                    dayNumber: task.dayNumber
                });

                const allCurrentDone = tasksForDay.every(t => t.status === 'done');

                if (allCurrentDone) {
                    await Task.updateMany(
                        {
                            userId,
                            roadmapStepId: task.roadmapStepId,
                            dayNumber: task.dayNumber + 1
                        },
                        { isLocked: false }
                    );
                }
            }

            res.json({ success: true, task });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    verifyTask: async (req: Request | any, res: Response) => {
        try {
            const { taskId, results, context } = req.body;
            const userId = req.user.id;

            // 🛡️ ANTI-SPAM THROTTLE: Limit VIVA/AI verification to once every 30s per user
            const now = Date.now();
            if ((vivaThrottle.get(userId) || 0) > now - 30 * 1000) {
                return res.status(429).json({ 
                    success: false, 
                    error: "System Cool-down", 
                    message: "Verification engine is cooling down. Please wait 30s before retry." 
                });
            }
            vivaThrottle.set(userId, now);

            const task = await Task.findOne({ _id: taskId, userId });
            if (!task) return res.status(404).json({ error: "Task not found" });

            // 🟢 PRIMARY FLOW: VIVA Evaluation (MCQ + Short Question)
            if (results && results.length > 0 && context) {
                const { isRootViva, subTaskIndex, smallTaskIndex } = context;

                // Delegate to the VerificationService
                const { verificationService } = require('../roadmap/verification.service');
                const evaluation = await verificationService.verifyVivaSubmission(userId, task, results, { subTaskIndex, smallTaskIndex, isRootViva });

                if (!evaluation.success && !evaluation.isPassed) {
                    // 🧠 LOG SKILL GAP ON FAILURE
                    try {
                        const SkillGap = require('../analytics/skill.gap.model').default;
                        // Detect specific concept gap (the short question usually identifies the core gap)
                        const gapSubject = evaluation.results.find((r: any) => !r.isCorrect)?.question || task.conceptMap?.[0] || 'Core Implementation';

                        await SkillGap.findOneAndUpdate(
                            { userId, skillName: gapSubject, status: 'detected' },
                            {
                                userId,
                                skillName: gapSubject,
                                gapIntensity: 85,
                                source: `Failed Mastery Audit: ${task.title}`,
                                remediationStep: evaluation.message,
                                status: 'detected'
                            },
                            { upsert: true }
                        );
                    } catch (sgErr) {
                        console.error("[SkillGap Failure Sync Error]", sgErr);
                    }

                    if (evaluation.score === 0 && evaluation.results.length === 0) {
                        return res.status(400).json({ error: evaluation.message });
                    }
                }

                // 📊 Store results for Admin/Analytics
                task.verification.results = evaluation.results.map((r: any) => ({
                    questionId: r.questionId || r.question || "unknown",
                    userAnswer: (results as any[]).find((ur: any) => ur.questionId === r.questionId)?.userAnswer || "",
                    isCorrect: r.isCorrect,
                    suggestion: r.correctSuggestion || r.suggestion || ""
                }));

                // ✅ SUCCESS PATH
                if (evaluation.isPassed) {
                    if (isRootViva) {
                        // Root Mission Passed -> Mark EVERYTHING as complete
                        task.status = 'done';
                        task.verification.isVerified = true;
                        task.subTasks = task.subTasks.map(st => ({ ...st, isCompleted: true }));

                        // 🧠 DYNAMIC SKILL GAP RESOLUTION
                        try {
                            const SkillGap = require('../analytics/skill.gap.model').default;
                            // Resolve gaps related to this task's concepts
                            if (task.conceptMap && task.conceptMap.length > 0) {
                                await SkillGap.updateMany(
                                    { userId, skillName: { $in: task.conceptMap }, status: 'detected' },
                                    { status: 'resolved' }
                                );
                            }
                        } catch (sgErr) {
                            console.error("[SkillGap Sync Error]", sgErr);
                        }

                    } else {
                        // Micro-lab Passed (Legacy Structure)
                        const smallTask = (task.subTasks as any)?.[subTaskIndex]?.executionLabs?.[smallTaskIndex];
                        if (smallTask) {
                            smallTask.isCompleted = true;
                            const allLabsDone = (task.subTasks[subTaskIndex] as any).executionLabs.every((lab: any) => lab.isCompleted);
                            if (allLabsDone) task.subTasks[subTaskIndex].isCompleted = true;
                            const allSubsDone = task.subTasks.every(st => st.isCompleted);
                            if (allSubsDone) {
                                task.status = 'done';
                                task.verification.isVerified = true;
                            }
                        }
                    }

                    // 🔓 UNLOCK NEXT DAY: If this task is done, unlock tasks for Day + 1
                    if (task.status === 'done') {
                        const tasksForDay = await Task.find({
                            userId,
                            roadmapStepId: task.roadmapStepId,
                            dayNumber: task.dayNumber
                        });
                        if (tasksForDay.every(t => t.status === 'done' || t._id.toString() === task._id.toString())) {
                            await Task.updateMany(
                                { userId, roadmapStepId: task.roadmapStepId, dayNumber: task.dayNumber + 1 },
                                { isLocked: false, status: 'todo' }
                            );
                            console.info(`🔓 [PROGRESS] Day ${task.dayNumber + 1} unlocked for User: ${userId}`);
                        }
                    }
                }

                await task.save();

                return res.json({
                    success: true,
                    isPassed: evaluation.isPassed,
                    score: evaluation.score,
                    results: evaluation.results,
                    message: evaluation.message,
                    taskStatus: task.status
                });
            }

            return res.status(400).json({ error: "Invalid verification request. Provide results[] and context." });

        } catch (err: any) {
            console.error("Verification Controller Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    translate: async (req: Request | any, res: Response) => {
        try {
            const { text, targetLanguage } = req.body;
            const translatedText = await openaiService.translateContent(text, targetLanguage);
            res.json({ success: true, translatedText });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    generateTasks: async (req: Request | any, res: Response) => {
        try {
            const { roadmapId } = req.body;
            const userId = req.user.id;

            let targetRoadmapId = roadmapId;

            if (!targetRoadmapId) {
                const latestRoadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });
                if (!latestRoadmap) {
                    return res.status(400).json({
                        success: false,
                        error: "No roadmap found.",
                        action: "GENERATE_ROADMAP_REQUIRED"
                    });
                }
                targetRoadmapId = latestRoadmap._id;
            }

            const { roadmapController } = require('../roadmap/roadmap.controller');
            req.body.roadmapId = targetRoadmapId;
            return await roadmapController.convertToTasks(req, res);

        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
