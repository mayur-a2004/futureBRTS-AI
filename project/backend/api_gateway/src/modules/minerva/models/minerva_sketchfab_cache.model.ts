import mongoose, { Schema, Document } from 'mongoose';

export interface IMinervaSketchfabCache extends Document {
    query: string;               // Normalized query term
    english_concept: string;     // AI translated english concept
    is_3d_possible: boolean;     // Flag if topic can be mapped to a physical 3D model
    model_id: string | null;     // Sketchfab UID if match found
    name: string | null;         // Sketchfab model name
    viewer_url: string | null;   // Sketchfab viewerUrl
    thumbnail: string | null;    // Sketchfab thumbnail image URL
    validated: boolean;          // Flag confirming validation was completed
    createdAt: Date;
    updatedAt: Date;
}

const MinervaSketchfabCacheSchema = new Schema({
    query: { type: String, required: true, unique: true, index: true },
    english_concept: { type: String, default: '' },
    is_3d_possible: { type: Boolean, default: false },
    model_id: { type: String, default: null },
    name: { type: String, default: null },
    viewer_url: { type: String, default: null },
    thumbnail: { type: String, default: null },
    validated: { type: Boolean, default: false }
}, { timestamps: true });

const MinervaSketchfabCache = mongoose.model<IMinervaSketchfabCache>('MinervaSketchfabCache', MinervaSketchfabCacheSchema);
export default MinervaSketchfabCache;
