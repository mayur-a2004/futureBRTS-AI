import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectVersion extends Document {
    projectId: mongoose.Types.ObjectId;
    version: number;
    zipPath: string;
    description?: string;
    changes?: string[];
    createdAt: Date;
}

const ProjectVersionSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    version: { type: Number, required: true },
    zipPath: { type: String, required: true },
    description: { type: String },
    changes: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

ProjectVersionSchema.index({ projectId: 1, version: 1 }, { unique: true });

export default mongoose.model<IProjectVersion>('ProjectVersion', ProjectVersionSchema);
