import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectContextMemory extends Document {
    projectId: mongoose.Types.ObjectId;
    techStack: {
        frontend: string;
        backend: string;
        database: string;
        other?: string[];
    };
    modules: string[];
    entities: any[];
    apis: any[];
    fileStructure: string[];
    dependencies: string[];
    memoryJson: any; // Full state capture
    updatedAt: Date;
}

const ProjectContextMemorySchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true, unique: true },
    techStack: {
        frontend: String,
        backend: String,
        database: String,
        other: [String]
    },
    modules: [String],
    entities: [Schema.Types.Mixed],
    apis: [Schema.Types.Mixed],
    fileStructure: [String],
    dependencies: [String],
    memoryJson: { type: Schema.Types.Mixed },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProjectContextMemory>('ProjectContextMemory', ProjectContextMemorySchema);
