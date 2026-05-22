// 👉 Ye controller landing page ke requests handle karta hai
// 👉 Isme intent save karne aur page data dene ka logic hai

import { Request, Response } from 'express';
import { landingService } from './landing.service';
import { LandingIntent } from '../onboarding/landing.intent.model';
import SystemSettings from '../admin/settings.model';

// 👉 Fallback data agar database me page nahi milta (Zero-Crash Policy)
const DEFAULT_PAGE = {
    slug: 'home',
    theme: { fontFamily: 'Inter' },
    sections: [
        {
            id: 'hero',
            type: 'hero',
            content: {
                title: 'Build Your Future with AI Intelligence',
                subtitle: 'The path to your dream career is now specialized and data-driven.',
                cta: 'Start Building'
            }
        }
    ]
};

export const landingController = {
    getPageData: async (req: Request, res: Response) => {
        try {
            const slug = (req.query.slug as string) || 'home';
            const data = await landingService.getPage(slug);

            // 👉 Hamesha success: true aur page object return karna
            res.json({
                success: true,
                page: data || DEFAULT_PAGE
            });
        } catch (err: any) {
            // 👉 Server error par bhi default page dena better hai to avoid blank screen
            res.json({ success: true, page: DEFAULT_PAGE });
        }
    },

    saveIntent: async (req: Request, res: Response) => {
        // 👉 Logic Disabled for Stability
        res.json({ success: true, status: 'disabled_for_now' });
    },

    // 👉 Public Config Endpoint (Safe List Only)
    getConfig: async (req: Request, res: Response) => {
        try {
            const key = req.params.key;
            const SAFE_KEYS = ['GOOGLE_ADSENSE_ID', 'GOOGLE_ANALYTICS_ID', 'GOOGLE_TAG_MANAGER_ID', 'SITE_MAINTENANCE_MODE'];

            if (!SAFE_KEYS.includes(key)) {
                return res.status(403).json({ success: false, error: 'Access Denied' });
            }

            const setting = await SystemSettings.findOne({ key });
            res.json({ success: true, value: setting ? setting.value : null });

        } catch (err: any) {
            res.json({ success: false, error: err.message });
        }
    },

    trackVisit: async (req: Request, res: Response) => {
        // 👉 Logic Disabled for Stability
        res.json({ success: true, status: 'disabled_for_now' });
    }
};
