export const LANDING_DATA = {
    seo: {
        title: "FutureBuilder - Build Your Future, Not Just Your Resume",
        description: "The intelligent career companion for students and professionals. Plan your path, bridge skill gaps, and build what matters with logic-driven insights.",
        keywords: "career planning, skill development, student roadmap, professional growth, AI career advisor, goal setting",
        ogTitle: "FutureBuilder | Strategic Career Design",
        ogDescription: "The intelligent career companion for students and professionals. Build what matters.",
        ogImage: "/og-image.png",
        twitterCard: "summary_large_image",
        canonicalUrl: "https://futurebuilder.io",
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FutureBuilder",
            "description": "Intelligent career design platform for students and professionals.",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All"
        }
    },
    header: {
        logo: {
            text: "FutureBuilder",
            initials: "FB"
        },
        links: [
            { label: "How it Works", href: "#how-it-works" },
            { label: "For Students", href: "#for-students" },
            { label: "For Professionals", href: "#for-professionals" },
            { label: "Pricing", href: "#pricing" }
        ],
        cta: {
            login: "Login",
            getStarted: "Get Started"
        }
    },
    hero: {
        badge: "The Future of Career Planning",
        headline: {
            main: "Build Your Future,",
            highlight: "Not Just Your Resume."
        },
        subheadline: "The intelligent career companion for students and professionals. Plan your path, bridge skill gaps, and build what matters.",
        placeholders: [
            "I'm in Class 10 and confused about Science",
            "I completed BBA, what should I do next?",
            "I want a tech job but don't know where to start",
            "How do I start a business while in college?",
            "Should I prepare for Govt exams or private jobs?"
        ],
        ctaText: "Start Building"
    },
    howItWorks: {
        title: "Strategic Career Design",
        subtitle: "How FutureBuilder Works in 3 Steps",
        steps: [
            {
                step: "01",
                title: "Map Your Intent",
                desc: "Start with any career thought. We use intelligence to decode where you are and where you want to go.",
                icon: "BrainCircuit"
            },
            {
                step: "02",
                title: "Personalized Roadmap",
                desc: "No generic advice. Get a step-by-step timeline covering subjects, projects, and target companies.",
                icon: "Compass"
            },
            {
                step: "03",
                title: "Execution Focus",
                desc: "We don't just plan. We guide you through building real skills and projects that actually matter.",
                icon: "Shield"
            }
        ]
    },
    whoItsFor: {
        title: "One platform,\nEvery milestone.",
        subtitle: "Logic-driven paths for every stage of life.",
        categories: [
            { label: "School Students", icon: "GraduationCap", color: "text-blue-400" },
            { label: "College Students", icon: "Users", color: "text-purple-400" },
            { label: "Graduates", icon: "Rocket", color: "text-cyan-400" },
            { label: "Job Seekers", icon: "Briefcase", color: "text-indigo-400" },
            { label: "Business Aspirants", icon: "Target", color: "text-rose-400" },
            { label: "Govt Aspirants", icon: "Shield", color: "text-amber-400" }
        ]
    },
    differentiation: {
        title: "Built on Logic,\nNot Motivation.",
        subtitle: "Career planning is data science, not just dreaming. We analyze your context to give you the most efficient route forward.",
        problem: {
            label: "The Problem",
            text: "Generic resumes, wasted time on useless certifications, and perpetual confusion about \"what next?\""
        },
        solution: {
            label: "The FB Solution",
            text: "Contextual insights, project-first learning, and a dynamic roadmap that evolves as you do."
        }
    },
    trust: {
        title: "Join the Future of Work",
        subtitle: "Trusted by learners and semi-professionals globally to navigate the complex world of modern careers.",
        brands: ["FUTURECORE", "TECHGEN", "SKILLFLOW", "LEADERSHIP"],
        ctaText: "Start My Journey"
    },
    footer: {
        branding: {
            text: "FutureBuilder",
            quote: "Empowering the next generation to plan, build, and lead with clarity."
        },
        sections: [
            {
                title: "Platform",
                links: [
                    { label: "Features", href: "#" },
                    { label: "Roadmap", href: "#" },
                    { label: "Career AI", href: "#" }
                ]
            },
            {
                title: "Company",
                links: [
                    { label: "About", href: "#" },
                    { label: "Privacy", href: "#" },
                    { label: "Terms", href: "#" }
                ]
            }
        ],
        newsletter: {
            title: "Stay Updated",
            placeholder: "Email",
            buttonText: "Join"
        },
        copyright: "© 2025 FutureBuilder. Engineered by Mayur Savaliya."
    },
    analytics: {
        events: {
            page_views: "page_view",
            click_events: "click_event",
            conversion_events: "conversion_event"
        },
        keyword_source: {
            landing: "landing_input",
            onboarding: "onboarding",
            chat: "chat"
        }
    }
};
