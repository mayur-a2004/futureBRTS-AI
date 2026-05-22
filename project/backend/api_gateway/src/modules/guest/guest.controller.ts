import { Request, Response } from 'express';
import { openaiService } from '../../shared/services/openai.service';

export const guestController = {
    chat: async (req: Request, res: Response) => {
        try {
            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({ success: false, error: "Message is required" });
            }

            // Call OpenAI service directly without session storage
            const response = await openaiService.generateResponse(
                { title: "Guest Session", lastMsg: "" },
                message,
                { mode: 'guest', sessionState: {}, userContext: { persona: 'PROFESSIONAL' } },
                history || []
            );

            res.json({ success: true, response });
        } catch (err: any) {
            console.error("Guest Chat Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
