import mongoose, { Schema, Document } from 'mongoose';

export interface IFileRegistry extends Document {
    projectId: mongoose.Types.ObjectId;
    filePath: string;
    status: 'pending' | 'generating' | 'reviewing' | 'completed' | 'error';
    exports: string[];      // Array of exported functions/classes/types
    imports: string[];      // Array of required dependencies/files
    dependsOn: string[];    // Topological sort dependencies
    errorMessage?: string;  // Error if status is 'error'
    createdAt: Date;
    updatedAt: Date;
}

const FileRegistrySchema: Schema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'CollageProject', required: true },
    filePath: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'generating', 'reviewing', 'completed', 'error'],
        default: 'pending'
    },
    exports: [{ type: String }],
    imports: [{ type: String }],
    dependsOn: [{ type: String }],
    errorMessage: { type: String }
}, {
    timestamps: true
});

FileRegistrySchema.index({ projectId: 1, filePath: 1 }, { unique: true });
FileRegistrySchema.index({ projectId: 1, status: 1 });

export default mongoose.model<IFileRegistry>('FileRegistry', FileRegistrySchema);
