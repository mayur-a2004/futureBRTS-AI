import mongoose, { Schema, Document } from 'mongoose';

export interface ITitanMemory extends Document {
    timestamp: Date;
    command: string;
    summary: string;
    metadata: any;
    fidelity: string;
}

const TitanMemorySchema: Schema = new Schema({
    timestamp: { type: Date, default: Date.now },
    command: { type: String, required: true },
    summary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    fidelity: { type: String, default: "Supreme_Legend" }
}, { collection: 'titan_memory' }); // Explicit collection name to match Python Worker

export default mongoose.model<ITitanMemory>('TitanMemory', TitanMemorySchema);
