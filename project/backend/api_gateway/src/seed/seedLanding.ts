// 👉 Database seeding script for initial landing page and UI content
// 👉 Isme logic MongoDB me base data insert karne ka hai

import LandingPage from '../modules/landing/landing.model';
import { logger } from '../shared/utils/logger';

export const seedLandingData = async () => {
    try {
        const homePage = await LandingPage.findOne({ page: 'home' });
        if (!homePage) {
            await LandingPage.create({
                page: 'home',
                theme: { fontFamily: 'Inter' },
                hero: {
                    title: 'Architect Your Tomorrow',
                    subtitle: 'Directing your intelligence towards a specialized future.',
                    cta: 'Start Building',
                    placeholders: [
                        'I want to become a Senior Architect',
                        'Build a SaaS in 3 months',
                        'Transition to Data Science'
                    ]
                },
                sections: [
                    {
                        type: 'hero',
                        content: {
                            badge: 'V2.0 LIVE',
                            headline: { main: 'Architect Your', highlight: 'Tomorrow' },
                            subheadline: 'Directing your intelligence towards a specialized future.',
                            ctaText: 'Start Building',
                            placeholders: ['I want to become a Senior Architect', 'Build a SaaS in 3 months']
                        }
                    },
                    {
                        type: 'howItWorks',
                        content: {
                            title: 'The Process',
                            subtitle: 'How we build your roadmap',
                            steps: [
                                { step: '01', icon: 'Target', title: 'Capture Intent', desc: 'Tell us exactly what you want to achieve.' },
                                { step: '02', icon: 'Cpu', title: 'Analyze Gaps', desc: 'Our engine identifies specialized skill gaps.' },
                                { step: '03', icon: 'Map', title: 'Deploy Roadmap', desc: 'Get a step-by-step execution strategy.' }
                            ]
                        }
                    }
                ],
                seo: {
                    metaTitle: 'Future BRTS | Predictive Intelligence',
                    metaDescription: 'The worlds first specialized roadmap engine.',
                    keywords: ['future', 'career', 'intelligence']
                }
            });
            logger.info('Landing page seeded successfully');
        }
    } catch (err) {
        logger.error('Failed to seed landing data', err);
    }
};
