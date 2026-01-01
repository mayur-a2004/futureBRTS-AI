import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectBlueprint extends Document {
    title: string;
    field: string;
    degree: string;
    documents: string[];
    createdAt: Date;
}

const ProjectBlueprintSchema: Schema = new Schema({
    title: { type: String, required: true },
    field: { type: String, required: true },
    degree: { type: String, required: true },
    documents: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProjectBlueprint>('ProjectBlueprint', ProjectBlueprintSchema);
