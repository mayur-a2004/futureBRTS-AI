import { Request, Response } from 'express';
import Roadmap from './roadmap.model';
import Task from './task.model';
import Session from '../builder/session.model';
import { openaiService } from '../../shared/services/openai.service';

export const roadmapController = {
    // Generate Roadmap from Session
    generateRoadmap: async (req: Request | any, res: Response) => {
        try {
            const { sessionId } = req.body;
            // Fetch validation
            const session = await Session.findById(sessionId);
            if (!session) return res.status(404).json({ error: "Session not found" });

            // AI GENERATION
            // Feed session messages to OpenAI and ask for JSON schema
            const contextSummary = `Goal: ${session.title}. Initial Plan: ${session.initialPrompt || ''}`;

            // Call the AI service
            const aiResult = await openaiService.generateRoadmapJSON(contextSummary);

            const steps = aiResult.steps || [];

            const roadmap = await Roadmap.create({
                userId: req.user.id,
                sessionId,
                title: session.title + " Roadmap",
                steps
            });

            res.status(201).json({ success: true, roadmap });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getRoadmaps: async (req: Request | any, res: Response) => {
        try {
            const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 });
            res.json({ success: true, roadmaps });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    convertToTasks: async (req: Request | any, res: Response) => {
        try {
            const { roadmapId } = req.body;
            const roadmap = await Roadmap.findById(roadmapId);
            if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

            const tasks = [];
            for (const step of roadmap.steps) {
                // Check if task already exists roughly
                const existing = await Task.findOne({ userId: req.user.id, title: step.title });
                if (!existing) {
                    const task = await Task.create({
                        userId: req.user.id,
                        // roadmapStepId: step._id, 
                        title: step.title,
                        status: 'todo'
                    });
                    tasks.push(task);
                }
            }

            res.json({ success: true, tasks, message: "Tasks created" });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getTasks: async (req: Request | any, res: Response) => {
        try {
            const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
            res.json({ success: true, tasks });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateTask: async (req: Request | any, res: Response) => {
        try {
            const { taskId, status } = req.body;
            const task = await Task.findOneAndUpdate(
                { _id: taskId, userId: req.user.id },
                { status },
                { new: true }
            );
            res.json({ success: true, task });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
