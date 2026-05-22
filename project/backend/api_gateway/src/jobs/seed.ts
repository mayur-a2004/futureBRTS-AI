// 👉 Ye file database me initial data seed karne ke liye hai
// 👉 Isme landing page aur auth UI content ka initial data hai

import mongoose from 'mongoose';
import LandingPage from '../modules/landing/landing.model';
import dotenv from 'dotenv';
dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/FutureBRTS');
        console.log("Connected to DB for seeding...");

        // 👉 1. Landing Page Seed
        const homePage = {
            page: 'home',
            hero: {
                title: "Architect Your Tomorrow",
                subtitle: "The world's first predictive intelligence engine for personal and professional roadmaps.",
                ctaText: "Start Building"
            },
            sections: [
                { type: 'hero', content: { badge: "V2.0 Live", placeholders: ["I want to become a Senior Architect", "Build a SaaS in 3 months"] } },
                {
                    type: 'howItWorks', content: {
                        title: "How It Works", subtitle: "Simple steps to success", steps: [
                            { step: "01", title: "Share Vision", desc: "Describe your goal in natural language.", icon: "Sparkles" },
                            { step: "02", title: "Strategic Analysis", desc: "Our engine maps the exact skill path.", icon: "Search" },
                            { step: "03", title: "Execute", desc: "Get daily actionable steps.", icon: "ArrowRight" }
                        ]
                    }
                }
            ],
            seo: {
                title: "FutureBRTS | AI Roadmaps",
                description: "Build your future with predictive intelligence.",
                keywords: ["roadmap", "career", "future", "ai"]
            }
        };

        // 👉 Clear old data to avoid index conflicts
        await LandingPage.collection.drop().catch(() => console.log("Collection didn't exist, skipping drop"));
        await LandingPage.create(homePage);
        console.log("✅ Landing home page seeded!");

        process.exit();
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
