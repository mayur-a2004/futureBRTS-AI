import mongoose, { Schema, Document } from 'mongoose';

export interface ISmartBoardStep {
    stepNumber: number;
    title: string;
    explanation: string;
    latexOrFormula: string;
    visualType?: 'equation' | 'flowchart' | 'geometry' | 'diagram' | 'table';
    shapes?: Array<{
        type: 'box' | 'circle' | 'arrow' | 'triangle' | 'grid' | 'flow_node';
        label?: string;
        from?: string;
        to?: string;
    }>;
}

export interface IMinervaSmartBoardSession extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    subject?: string;
    steps: ISmartBoardStep[];
    customStrokes?: string;
    studentNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SmartBoardStepSchema = new Schema({
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    explanation: { type: String, required: true },
    latexOrFormula: { type: String, required: true },
    visualType: { type: String, default: 'equation' },
    shapes: [{
        type: { type: String, enum: ['box', 'circle', 'arrow', 'triangle', 'grid', 'flow_node'] },
        label: { type: String },
        from: { type: String },
        to: { type: String }
    }]
}, { _id: false });

const MinervaSmartBoardSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'General' },
    steps: [SmartBoardStepSchema],
    customStrokes: { type: String, default: '' },
    studentNotes: { type: String, default: '' },
}, { timestamps: true });

MinervaSmartBoardSessionSchema.index({ userId: 1, createdAt: -1 });

const MinervaSmartBoardSession = mongoose.model<IMinervaSmartBoardSession>(
    'MinervaSmartBoardSession', 
    MinervaSmartBoardSessionSchema
);

export default MinervaSmartBoardSession;
