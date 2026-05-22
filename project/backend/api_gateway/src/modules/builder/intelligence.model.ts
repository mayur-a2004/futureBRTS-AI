import mongoose, { Schema, Document } from 'mongoose';

export interface IIntelligenceNode extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    source: string; // 'bing' | 'brave' | 'alibaba' | 'web_scrape'
    url?: string;
    rawContent: string;
    refinedContent: {
        summary: string;
        technicalStack?: string[];
        seoScore?: number;
        marketGaps?: string[];
        keywords?: string[];
    };
    metadata: {
        engine: string;
        timestamp: Date;
        confidence: number;
    };
    category: 'business' | 'technical' | 'market' | 'general';
    tags: string[];
    isUsedInTraining: boolean;
}

const IntelligenceNodeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    source: { type: String, required: true },
    url: { type: String },
    rawContent: { type: String },
    refinedContent: {
        summary: { type: String },
        technicalStack: [{ type: String }],
        seoScore: { type: Number },
        marketGaps: [{ type: String }],
        keywords: [{ type: String }]
    },
    metadata: {
        engine: { type: String },
        timestamp: { type: Date, default: Date.now },
        confidence: { type: Number, default: 0 }
    },
    category: { type: String, enum: ['business', 'technical', 'market', 'general'], default: 'general' },
    tags: [{ type: String }],
    isUsedInTraining: { type: Boolean, default: false }
}, { timestamps: true });

// Index for fast searching (Neural Retrieval)
IntelligenceNodeSchema.index({ tags: 'text', 'refinedContent.summary': 'text' });
IntelligenceNodeSchema.index({ userId: 1, sessionId: 1 });

export default mongoose.model<IIntelligenceNode>('IntelligenceNode', IntelligenceNodeSchema);
