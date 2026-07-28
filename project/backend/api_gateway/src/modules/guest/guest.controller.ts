import { Request, Response } from 'express';
import { openaiService } from '../../shared/services/openai.service';

export const guestController = {
    chat: async (req: Request, res: Response) => {
        try {
            const { message, history, guestSessionId } = req.body;

            if (!message) {
                return res.status(400).json({ success: false, error: "Message is required" });
            }

            const cleanSessionId = guestSessionId || ('guest_ephemeral_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now());

            // Process response in isolated ephemeral guest context with ZERO global database persistence
            const response = await openaiService.generateResponse(
                { title: "Guest Ephemeral Session", lastMsg: "", id: cleanSessionId } as any,
                message,
                { mode: 'guest', sessionState: {}, userContext: { persona: 'PROFESSIONAL', isGuest: true, guestId: cleanSessionId } },
                history || []
            );

            res.json({ success: true, response });
        } catch (err: any) {
            console.error("Guest Chat Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
