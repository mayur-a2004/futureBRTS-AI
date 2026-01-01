import { Request, Response } from 'express';
import Session from './session.model';
import User from '../auth/user.model';
import { openaiService } from '../../shared/services/openai.service';

export const builderController = {
    // 👉 Create a new chat session
    createSession: async (req: Request | any, res: Response) => {
        try {
            const userId = req.user.id;
            const { initialPrompt, title } = req.body;

            const session = await Session.create({
                userId,
                title: title || 'New Goal',
                initialPrompt,
                messages: []
            });

            // If there's an initial prompt, immediately add it and get specific AI response
            if (initialPrompt) {
                // Add User Message
                session.messages.push({
                    id: Date.now().toString(),
                    role: 'user',
                    content: initialPrompt,
                    timestamp: new Date()
                });

                // Generate AI Response
                const context = {
                    title: session.title,
                    lastMsg: initialPrompt
                };

                const aiResponse = await openaiService.generateResponse(context, initialPrompt);

                session.messages.push({
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                });

                await session.save();
            }

            res.status(201).json({ success: true, session });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👉 Get all sessions for history sidebar
    getSessions: async (req: Request | any, res: Response) => {
        try {
            const sessions = await Session.find({ userId: req.user.id }).sort({ updatedAt: -1 });
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
            const { content } = req.body;
            const sessionId = req.params.id;

            const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

            // 1. Add User Message
            const userMsgId = Date.now().toString();
            session.messages.push({
                id: userMsgId,
                role: 'user',
                content,
                timestamp: new Date()
            });

            // 2. Generate AI Response using Service
            // Rule 4: "AI receives only structured summaries, not full chat history." 
            // (Simulated here by passing only current msg + minimal context)
            const context = {
                title: session.title,
                lastMsg: content
            };

            const aiText = await openaiService.generateResponse(context, content);

            // Rule 1: "AI must never create or overwrite roadmaps." -> Checked in service or strictly handled via actions.
            // Rule 6: "If user asks for new roadmap, system must ask confirmation." -> Handled in service text.

            const aiMsgId = (Date.now() + 1).toString();
            session.messages.push({
                id: aiMsgId,
                role: 'assistant',
                content: aiText,
                timestamp: new Date()
            });

            session.updatedAt = new Date();
            await session.save();

            res.json({ success: true, messages: session.messages });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
