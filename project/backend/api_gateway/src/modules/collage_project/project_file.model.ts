import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectFile extends Document {
    projectId: mongoose.Types.ObjectId;
    filePath: string;
    fileContent: string;
    module: string;
    createdAt: Date;
}

const ProjectFileSchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    filePath: { type: String, required: true },
    fileContent: { type: String, required: true },
    module: { type: String },
    createdAt: { type: Date, default: Date.now }
});

ProjectFileSchema.index({ projectId: 1, filePath: 1 }, { unique: true });
ProjectFileSchema.index({ projectId: 1, createdAt: -1 }); // Fixes Bug #3

export default mongoose.model<IProjectFile>('ProjectFile', ProjectFileSchema);
