import { Request, Response } from 'express';
import { openaiService } from '../../shared/services/openai.service';

export const multimodalController = {
    processMultimodal: async (req: Request, res: Response) => {
        try {
            const { message, attachmentPath, attachmentMeta } = req.body;

            if (!message) {
                return res.status(400).json({ success: false, error: "Message is required" });
            }

            // Compatibility check and intent extraction
            const intent = await openaiService.extractIntent(message, attachmentPath, attachmentMeta);

            // Calling the updated generateResponse signature
            const response = await openaiService.generateResponse(
                { title: "Multimodal Session", lastMsg: "" },
                intent,
                { mode: 'multimodal', sessionState: {}, userContext: { persona: 'PROFESSIONAL' } },
                []
            );

            res.json({ success: true, response });
        } catch (err: any) {
            console.error("Multimodal Chat Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
