import { Request, Response } from 'express';
import ChatSummary from './summary.model';
import Session from './session.model';
import { openaiService } from '../../shared/services/openai.service';

export const summaryController = {
    generate: async (req: any, res: Response) => {
        try {
            const { sessionId } = req.body;
            const userId = req.user.id;

            // 1. Fetch Session History
            const session = await Session.findById(sessionId);
            if (!session) return res.status(404).json({ error: "Session not found" });

            // 2. Generate Summary via AI
            const summaryData = await openaiService.generateSummary(session.messages);

            // 3. Save Summary
            const startSummary = await ChatSummary.findOneAndUpdate(
                { sessionId },
                {
                    sessionId,
                    userId,
                    summaryText: summaryData.summaryText,
                    keySignals: summaryData.keySignals,
                    approved: false // Requires confirmation
                },
                { upsert: true, new: true }
            );

            res.json({ success: true, summary: startSummary });

        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    confirm: async (req: any, res: Response) => {
        try {
            const { sessionId } = req.body;
            const updated = await ChatSummary.findOneAndUpdate(
                { sessionId },
                { approved: true },
                { new: true }
            );
            res.json({ success: true, summary: updated });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
