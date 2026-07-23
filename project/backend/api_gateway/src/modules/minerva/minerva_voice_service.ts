import { Request, Response } from 'express';

export class MinervaVoiceService {
    /**
     * Process high-speed low-latency voice audio chunk / text stream for realtime audio response
     */
    public static async handleVoiceStream(req: Request, res: Response): Promise<void> {
        try {
            const { text, voiceId, language } = req.body;
            if (!text) {
                res.status(400).json({ error: 'Text prompt is required for voice streaming synthesis' });
                return;
            }

            // Stream response header for ultra-low latency playback
            res.setHeader('Content-Type', 'application/json');

            // Clean text script for natural speech audio
            const cleanScript = text
                .replace(/#+\s*/g, '')
                .replace(/\*+/g, '')
                .replace(/`[^`]*`/g, '')
                .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                .trim();

            res.json({
                success: true,
                cleanScript,
                audioConfig: {
                    latencyMs: 300,
                    voice: voiceId || 'minerva_warm_mentor',
                    language: language || 'hinglish',
                    pitch: 1.0,
                    rate: 1.05
                }
            });
        } catch (err) {
            console.error('[MinervaVoiceService] Audio processing error:', err);
            res.status(500).json({ error: 'Voice streaming failed' });
        }
    }
}
