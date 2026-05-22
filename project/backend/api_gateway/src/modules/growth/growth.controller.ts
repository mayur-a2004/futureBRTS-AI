import { Request, Response } from 'express';
import { OnboardingProfile } from '../onboarding/onboarding.model';
import SkillGap from '../analytics/skill.gap.model';
import { openaiService } from '../../shared/services/openai.service';
import { logger } from '../../shared/utils/logger';

export const growthController = {
    // 📊 Analyze Skill Gap Dynamics
    getSkillGap: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const profile = await OnboardingProfile.findOne({ userId });

            // 🔎 1. Analyze Roadmap Tasks for Progress
            const Roadmap = require('../roadmap/roadmap.model').default;
            const Task = require('../roadmap/task.model').default;
            const activeRoadmap = await Roadmap.findOne({ userId }).sort({ createdAt: -1 });

            if (!activeRoadmap) {
                return res.json({ success: true, data: { readinessScore: 0, competencyMap: [], message: "No active roadmap to analyze." } });
            }

            const allTasks = await Task.find({ userId, roadmapId: activeRoadmap._id });
            const completedTasks = allTasks.filter(t => t.status === 'done');

            // 🧬 2. Build Competency Map from Concept Map data
            const masterConceptStats: Record<string, { total: number; done: number }> = {};

            allTasks.forEach(task => {
                const concepts = task.conceptMap || [];
                concepts.forEach((c: string) => {
                    if (!masterConceptStats[c]) masterConceptStats[c] = { total: 0, done: 0 };
                    masterConceptStats[c].total += 1;
                    if (task.status === 'done') masterConceptStats[c].done += 1;
                });
            });

            const competencyMap = Object.entries(masterConceptStats).map(([subject, stats]) => ({
                subject,
                current: Math.round((stats.done / stats.total) * 100),
                target: 95,
                fullMark: 100
            })).slice(0, 8); // Limit to top 8 for UI clarity

            // ⚠️ 3. Detect Real Gaps from SkillGap Model
            const detectedGaps = await SkillGap.find({ userId, status: 'detected' }).limit(5);
            const priorityActions = detectedGaps.map(gap => ({
                name: gap.skillName,
                current: 0, // Failed VIVA means start over
                required: 80,
                status: "critical",
                priority: gap.gapIntensity > 70 ? "High" : "Medium",
                remediation: gap.remediationStep || "Review Concept & Retry VIVA"
            }));

            // 📈 4. Calculate Overall Readiness
            const totalConcepts = Object.values(masterConceptStats).length;
            const completedConcepts = Object.values(masterConceptStats).filter(s => s.done === s.total && s.total > 0).length;
            const readinessScore = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;

            const analysisData = {
                targetRole: profile?.final_goal || "Professional Developer",
                readinessScore: readinessScore,
                competencyMap: competencyMap.length > 0 ? competencyMap : [
                    { subject: 'Strategy', current: 10, target: 100, fullMark: 100 }
                ],
                priorityActions: priorityActions.length > 0 ? priorityActions : [
                    { name: "Project Completion", current: readinessScore, required: 100, status: "pending", priority: "High", remediation: "Execute more tasks to reveal gaps." }
                ],
                recommendations: [
                    { platform: "Neural Core", title: `${activeRoadmap.title} Mastery`, duration: "Path Active", icon: "🧠", link: "/tasks" },
                    { platform: "Success Lab", title: "Industrial Portfolio Prep", duration: "10h", icon: "🏗️", link: "#" }
                ]
            };

            res.json({ success: true, data: analysisData });
        } catch (err) {
            logger.error('Skill Gap Analysis Failed', err);
            res.status(500).json({ success: false, message: "Engine Failure" });
        }
    }
};
