import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaLabCache extends Document {
    concept_key: string;
    subject: string;
    title: string;
    description: string;
    sketchfab_hint: string | null;
    three_js_config: any | null;
    youtube_query: string;
    mermaid_schema: string | null;
    voice_script: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const MinervaLabCacheSchema = new Schema({
    concept_key: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    sketchfab_hint: { type: String, default: null },
    three_js_config: { type: Schema.Types.Mixed, default: null },
    youtube_query: { type: String, default: '' },
    mermaid_schema: { type: String, default: null },
    voice_script: { type: String, default: null }
}, { timestamps: true });

const MinervaLabCache = mongoose.model<IMinervaLabCache>('MinervaLabCache', MinervaLabCacheSchema);
export default MinervaLabCache;
