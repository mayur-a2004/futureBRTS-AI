import { Request, Response } from 'express';
import WarRoomAudit from './war_room.model';
import axios from 'axios';
import { openaiService } from '../../shared/services/openai.service';

export const warRoomController = {
    createAudit: async (req: Request | any, res: Response) => {
        try {
            const { url } = req.body;
            const userId = req.user.id;

            const audit = new WarRoomAudit({
                userId,
                url,
                status: 'PENDING'
            });

            await audit.save();

            // Background processing
            warRoomController.processAudit(audit._id);

            res.json({ success: true, audit });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getAudits: async (req: Request | any, res: Response) => {
        try {
            const audits = await WarRoomAudit.find({ userId: req.user.id }).sort({ createdAt: -1 });
            res.json({ success: true, audits });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    processAudit: async (auditId: any) => {
        try {
            const audit = await WarRoomAudit.findById(auditId);
            if (!audit) return;

            // 1. Scraping & Research via Python Worker
            const workerUrl = `${process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000'}/execute`;
            const researchRes = await axios.post(workerUrl, {
                job_id: `war-room-${audit._id}`,
                command: `research: ${audit.url}`,
                metadata: { url: audit.url }
            });

            const rawNodes = researchRes.data?.intelligence_nodes || [];
            const researchSummary = researchRes.data?.extracted_text || "";

            // 2. Strategic Analysis via AI (TITAN MASTER POWER MODE)
            const analysisPrompt = [
                {
                    role: 'system',
                    content: `You are a Strategic Business Commander & Data Scientist. 
                    YOUR MISSION: Execute a 100% industrial-grade analysis using ML, AI, and Game Theory.
                    Do NOT provide generic 300-word summaries. Provide DEEP technical intelligence.
                    
                    PILLARS TO ANALYZE (STRICT):
                    1. SEO GROWTH ENGINE: Forensic breakdown of rankings and signals.
                    2. SCALING STRATEGY: ROI patterns and market expansion logic.
                    3. KPI DELIVERY ENGINE: Hard-metric estimation (CTR, ROI, CTO).
                    4. NICHE DOMINANCE: Competitor risk vs category mastery.
                    5. AI TREND PULSE: SOTA model usage and technological leverage.
                    6. TECH ARCHITECTURE: Implementation quality and scale potential.

                    OUTPUT SCHEMA (STRICT JSON):
                    {
                        "score": number,
                        "pillars": {
                            "seo": { "score": number, "details": "string", "keywords": ["string"] },
                            "scaling": { "score": number, "details": "string", "trajectory": "string" },
                            "kpi": { "score": number, "details": "string", "roi_est": "string" },
                            "niche": { "score": number, "details": "string", "risk": "string" },
                            "ai_pulse": { "score": number, "details": "string", "sota_usage": "string" },
                            "tech": { "score": number, "details": "string", "stack_health": "string" }
                        },
                        "marketing_insights": {
                            "spend_est": "string",
                            "peak_times": "string",
                            "hashtags": ["string"],
                            "platforms": ["string"]
                        },
                        "competitors": [
                            { "name": "string", "gap": "Specific weakness", "attack_vector": "How to beat them" }
                        ],
                        "strategy": "A 100% master-level 5-step concrete execution plan."
                    }`
                },
                { role: 'user', content: `Forensic Dataset for ${audit.url}:\nRAW INTELLIGENCE: ${JSON.stringify(rawNodes)}\nCONTEXT: ${researchSummary}` }
            ];

            const { getProviderResponse } = require('../../shared/services/openai.service');
            const data = await getProviderResponse(analysisPrompt, { jsonMode: true });

            const content = data?.choices?.[0]?.message?.content || data?.message || data?.output;
            if (!content) throw new Error("AI Strategic Brain failed to respond.");

            const parsed = typeof content === 'string' ? JSON.parse(content) : content;

            // Capture all "Master Power" data
            audit.score = parsed.score;
            audit.pillars = parsed.pillars || {};
            audit.marketing_insights = parsed.marketing_insights || {};
            audit.competitors = parsed.competitors || [];
            audit.strategy = parsed.strategy || "";
            audit.status = 'COMPLETED';

            await audit.save();

        } catch (e: any) {
            console.error("War Room Audit Failed:", e.message);
            await WarRoomAudit.findByIdAndUpdate(auditId, { status: 'FAILED' });
        }
    }
};
