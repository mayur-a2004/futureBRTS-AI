
export type QuestionType = 'single' | 'multiple' | 'text' | 'range' | 'info';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options?: string[];
    placeholder?: string;
    skipAllowed?: boolean;
}

export interface RoadmapStage {
    stage: string;
    description: string;
    timeline: string;
    status: 'completed' | 'current' | 'upcoming';
}

export interface StageData {
    label: string;
    questions: Question[];
    roadmap: RoadmapStage[];
    generateAdvice: (answers: Record<string, any>, originalPrompt: string) => {
        validation: string;
        explanation: string;
        direction?: string;
        nextSteps: string[];
    };
}

export const EDUCATION_DATA: Record<string, StageData> = {
    '🎓 Student': {
        label: '🎓 Student',
        questions: [
            { id: 'background', text: 'Education Background?', type: 'single', options: ['BCom', 'BBA', 'BCA', 'BA', 'BTech', 'Other'] },
            { id: 'goal', text: 'Primary Goal?', type: 'single', options: ['Job', 'Internship', 'CA', 'MBA', 'Govt exam'] },
            { id: 'level', text: 'Current Skill Level?', type: 'single', options: ['Beginner', 'Intermediate', 'Advanced'] },
            { id: 'time', text: 'Daily Time Commitment?', type: 'single', options: ['1-2 Hours', '3-5 Hours', '5+ Hours'] },
            { id: 'expectation', text: 'Output Expectation?', type: 'multiple', options: ['Roadmap', 'Projects', 'Notes', 'Exam prep'] }
        ],
        roadmap: [
            { stage: 'Skill Acquisition', description: 'Mastering the core fundamentals of your target path.', timeline: 'Weeks 1-4', status: 'current' },
            { stage: 'Project Building', description: 'Applying skills to real-world specialized projects.', timeline: 'Weeks 5-8', status: 'upcoming' },
            { stage: 'Optimization', description: 'Refining and polishing for industry readiness.', timeline: 'Weeks 9-12', status: 'upcoming' }
        ],
        generateAdvice: (ans, prompt) => ({
            validation: "You're in a critical phase of specialized building.",
            explanation: `For your goal to "${prompt}", leveraging your ${ans.background} background is the most logical path.`,
            direction: `As a ${ans.level} explorer, we'll design your roadmap for ${ans.goal} with a ${ans.time} daily protocol.`,
            nextSteps: [
                `Design a ${ans.background} specific specialized project`,
                `Identify top 3 target institutions for ${ans.goal}`,
                "Spend 30 minutes daily exploring industry trends"
            ]
        })
    },
    '📝 Exam': {
        label: '📝 Exam',
        questions: [
            { id: 'q1', text: 'Target exams?', type: 'multiple', options: ['UPSC', 'SSC/Railways', 'Banking', 'Defense', 'State Exams'] },
            { id: 'q2', text: 'Current mindset about preparation?', type: 'single', options: ['Fully Dedicated', 'Need Backup Plan', 'Starting Prep'] }
        ],
        roadmap: [
            { stage: 'Syllabus Scan', description: 'Deep dive into exam patterns and specific syllabus requirements.', timeline: 'Weeks 1-2', status: 'current' },
            { stage: 'Concept Depth', description: 'Clearing core conceptual blockers in key subjects.', timeline: 'Weeks 3-10', status: 'upcoming' },
            { stage: 'Battle Testing', description: 'Mock tests and iterative refinement.', timeline: 'Week 11+', status: 'upcoming' }
        ],
        generateAdvice: (ans, prompt) => ({
            validation: "Competitive exams require massive discipline and strategic depth.",
            explanation: `Your goal "${prompt}" through ${ans.q1?.join(', ') || 'exams'} requires a rigid, high-focus timeline.`,
            direction: `Since your mindset is "${ans.q2}", we'll build a roadmap that balances risk and reward.`,
            nextSteps: ["Solve 10 years of previous papers", "Create a rigid study protocol", "Identify a 'Plan B' skill"]
        })
    },
    '🏢 Business': {
        label: '🏢 Business',
        questions: [
            { id: 'q1', text: 'Current stage of your venture?', type: 'single', options: ['Pure Idea', 'MVP / Prototype', 'Early Revenue', 'Scaling'] },
            { id: 'q2', text: 'What is the biggest blocker right now?', type: 'single', options: ['Product/Tech', 'Marketing/Sales', 'Funding', 'Operations/Hiring'] }
        ],
        roadmap: [
            { stage: 'Problem Validation', description: 'Ensuring you are solving a high-value real-world problem.', timeline: 'Ongoing', status: 'current' },
            { stage: 'MVP Architecture', description: 'Building the leanest version of your solution.', timeline: 'Weeks 1-4', status: 'upcoming' },
            { stage: 'Growth Loop', description: 'Designing sustainable acquisition and retention hooks.', timeline: 'Weeks 5+', status: 'upcoming' }
        ],
        generateAdvice: (ans, prompt) => ({
            validation: "Building a company is the ultimate test of first-principles thinking.",
            explanation: `To achieve "${prompt}", focusing on ${ans.q2} at the ${ans.q1} stage is the most efficient move.`,
            direction: `We will prioritize validation and unit-economics in your roadmap.`,
            nextSteps: ["Talk to 10 potential customers", "Define your North Star metric", "Draft a lean execution plan"]
        })
    },
    '💼 Job Switcher': {
        label: '💼 Job Switcher',
        questions: [
            { id: 'q1', text: 'What is your current role?', type: 'text', placeholder: 'e.g. Teacher, Salesperson, Engineer...' },
            { id: 'q2', text: 'Target field for transition?', type: 'text', placeholder: 'e.g. Data Science, Product Mgmt, Design...' }
        ],
        roadmap: [
            { stage: 'Gap Analysis', description: 'Identifying transferrable skills and critical knowledge gaps.', timeline: 'Week 1', status: 'current' },
            { stage: 'Bridge Projects', description: 'Evidence of skill through specialized artifacts.', timeline: 'Weeks 2-6', status: 'upcoming' },
            { stage: 'Market Logic', description: 'Positioning yourself effectively in the target industry.', timeline: 'Week 7+', status: 'upcoming' }
        ],
        generateAdvice: (ans, prompt) => ({
            validation: "Transitioning careers is a brave, strategic pivot.",
            explanation: `Moving from ${ans.q1} to ${ans.q2} to solve "${prompt}" requires bridging your transferrable skills.`,
            direction: `We'll design a roadmap that minimizes transition risk while maximizing skill gain.`,
            nextSteps: ["Map 3 transferrable skills", "Complete one 'Career Bridge' project", "Connect with 5 people who switched"]
        })
    },
    '🚀 Startup / Founder': {
        label: '🚀 Startup / Founder',
        questions: [
            { id: 'q1', text: 'Founder Type?', type: 'single', options: ['Solo Founder', 'Technical Co-founder', 'Business/Growth'] },
            { id: 'q2', text: 'Main Focus?', type: 'multiple', options: ['Product Building', 'Fundraising', 'Customer Acquisition'] }
        ],
        roadmap: [
            { stage: 'Vision Alignment', description: 'Clarifying the 10x objective and execution strategy.', timeline: 'Week 1', status: 'current' },
            { stage: 'Sprint 0', description: 'Initial prototype and technical foundation.', timeline: 'Weeks 2-3', status: 'upcoming' },
            { stage: 'Market Entry', description: 'Initial outreach and feedback consolidation.', timeline: 'Week 4+', status: 'upcoming' }
        ],
        generateAdvice: (ans, prompt) => ({
            validation: "The founder journey requires 10x thinking and resilience.",
            explanation: `Your intent "${prompt}" as a ${ans.q1} will be focused on ${ans.q2?.join(' & ')}.`,
            direction: `We will build a high-velocity execution roadmap.`,
            nextSteps: ["Define your MVP scope", "Build a lead-gen funnel", "Network with relevant investors"]
        })
    }
};

export const ENTRY_OPTIONS = Object.keys(EDUCATION_DATA).map(key => ({
    id: key,
    label: EDUCATION_DATA[key].label
}));
