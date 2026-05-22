import mongoose, { Schema, Document } from 'mongoose';

export interface ICollageProject extends Document {
    userId: mongoose.Types.ObjectId;
    title?: string;
    category: 'STUDENT_8_12' | 'GRADUATION' | 'POST_GRAD_PHD' | 'BUSINESS_FREELANCE';
    field: string;
    subCategory?: string; // e.g. 'IT', 'BBA', 'Audit'
    type?: string; // 'Website', 'App', 'SaaS', 'Software' (For IT)
    technologyStack?: any;
    requirements: string;
    status: 'DRAFT' | 'MANIFESTING' | 'GENERATING' | 'AWAITING_APPROVAL' | 'DOCUMENTING' | 'BUILDING_CODE' | 'PACKAGING' | 'COMPLETED' | 'FAILED';
    currentStep?: string;
    blueprint?: any;
    psd?: any;
    exportRegistry?: Record<string, any>; // Deprecated
    symbolTable?: Record<string, any>;    // New Symbol Table Memory
    todoList?: any[];
    prototypeMode?: boolean; // STRICT FRONTEND ONLY MODE

    // Multi-Agent Architecture State
    aiEngineUsed?: {
        primary?: string; // e.g. 'OpenRouter'
        checker?: string; // e.g. 'Groq'
        diagrams?: string; // e.g. 'Kroki.io'
    };
    agentTracking?: {
        agent1_Planner?: { status: string, timeTakenMs?: number };
        agent2_BusinessAuditor?: { status: string, timeTakenMs?: number };
        agent3_Architect?: { status: string, timeTakenMs?: number };
        agent4_DBATester?: { status: string, timeTakenMs?: number };
        agent5_BackendDev?: { status: string, timeTakenMs?: number };
        agent6_SecurityCodeScanner?: { status: string, timeTakenMs?: number };
        agent7_FrontendDev?: { status: string, timeTakenMs?: number };
        agent8_IntegrationDevOps?: { status: string, timeTakenMs?: number };
        compiler?: { status: string, timeTakenMs?: number };
    };
    billingAndUsage?: {
        totalTokens?: number;
        estimatedCostUSD?: number;
    };
    paymentGatewayContext?: 'RAZORPAY_INDIA' | 'STRIPE_GLOBAL';

    artifacts?: {
        zipUrl?: string;
        documentUrl?: string; // PDF Report
        pitchDeckUrl?: string; // PPTX file
        architectureDiagramUrl?: string; // Kroki.io ERD Schema
        systemFlowDiagramUrl?: string; // Kroki.io System Flow
        wordUrl?: string; // DOCX file
        testReportUrl?: string; // PDF Test Cases
        vivaQuestions?: { question: string; answer: string }[];
        installationGuide?: string; // Deployment rules
    };
    logs?: string[];
    metadata?: any;

    // Academic Brain Fields
    tier?: string;
    level?: string;
    degree?: string;
    degree_short?: string;
    degree_full?: string;
    domain?: string;
    regulator?: string;
    specializations?: string[];
    output_type?: string;
    vision_summary?: string;

    createdAt: Date;
    updatedAt: Date;
}

const CollageProjectSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    category: {
        type: String,
        enum: ['STUDENT_8_12', 'GRADUATION', 'POST_GRAD_PHD', 'BUSINESS_FREELANCE'],
        required: true
    },
    field: { type: String, required: true },
    subCategory: { type: String },
    type: { type: String },
    technologyStack: { type: Schema.Types.Mixed, default: {} },
    requirements: { type: String, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'MANIFESTING', 'GENERATING', 'AWAITING_APPROVAL', 'DOCUMENTING', 'BUILDING_CODE', 'PACKAGING', 'COMPLETED', 'FAILED'],
        default: 'DRAFT'
    },
    currentStep: { type: String, default: 'INITIAL' },
    blueprint: { type: Schema.Types.Mixed },
    psd: { type: Schema.Types.Mixed },
    exportRegistry: { type: Schema.Types.Mixed },
    symbolTable: { type: Schema.Types.Mixed },
    todoList: { type: Schema.Types.Mixed, default: [] },
    prototypeMode: { type: Boolean, default: true },

    // Multi-Agent System Tracking
    aiEngineUsed: {
        primary: { type: String, default: 'OpenRouter' },
        checker: { type: String, default: 'Groq' },
        diagrams: { type: String, default: 'Kroki.io' },
    },
    agentTracking: {
        agent1_Planner: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent2_BusinessAuditor: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent3_Architect: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent4_DBATester: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent5_BackendDev: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent6_SecurityCodeScanner: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent7_FrontendDev: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        agent8_IntegrationDevOps: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number },
        compiler: { status: { type: String, default: 'PENDING' }, timeTakenMs: Number }
    },
    billingAndUsage: {
        totalTokens: { type: Number, default: 0 },
        estimatedCostUSD: { type: Number, default: 0 }
    },
    paymentGatewayContext: { type: String, enum: ['RAZORPAY_INDIA', 'STRIPE_GLOBAL'] },

    artifacts: {
        zipUrl: String,
        documentUrl: String,
        pitchDeckUrl: String,
        architectureDiagramUrl: String,
        systemFlowDiagramUrl: String,
        wordUrl: String,
        testReportUrl: String,
        vivaQuestions: [{
            question: String,
            answer: String
        }],
        installationGuide: String
    },
    logs: [String],
    metadata: { type: Schema.Types.Mixed },

    // Academic Brain Fields
    tier: { type: String },
    level: { type: String },
    degree: { type: String }, // Can be used as short or fallback
    degree_short: { type: String },
    degree_full: { type: String },
    domain: { type: String },
    regulator: { type: String },
    specializations: [String],
    output_type: { type: String },
    vision_summary: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICollageProject>('CollageProject', CollageProjectSchema);
