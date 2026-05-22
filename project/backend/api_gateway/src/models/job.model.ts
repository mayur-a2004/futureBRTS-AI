import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const jobSchema = new Schema({
    job_id: { type: String, default: uuidv4, unique: true },
    session_id: { type: String, required: true },
    command: { type: String },
    file_path: { type: String, required: true },
    original_name: { type: String },
    file_type: { type: String }, // NEW
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    // Direct Result Storage (Cache/Preview)
    extracted_text: { type: String }, // NEW
    result: { type: Schema.Types.Mixed }, // NEW
    confidence: { type: Number }, // NEW

    result_ref: { type: String },
    error_message: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const JobModel = model('conversation_asset', jobSchema);
