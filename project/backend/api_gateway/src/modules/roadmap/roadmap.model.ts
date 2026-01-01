import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    title: string;
    steps: {
        stepNumber: number;
        title: string;
        why: string;
        whatToDo: string;
        expectedOutcome: string;
        risk: string;
    }[];
    createdAt: Date;
}

const RoadmapSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    title: { type: String, default: 'My Roadmap' },
    steps: [{
        stepNumber: Number,
        title: String,
        why: String,
        whatToDo: String,
        expectedOutcome: String,
        risk: String
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
