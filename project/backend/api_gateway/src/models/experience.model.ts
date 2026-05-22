import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['ROADMAP_COMPLETION', 'TASK_EFFICIENCY', 'ANALYSIS_ACCURACY', 'PATTERN'], required: true },
    context: { type: mongoose.Schema.Types.Mixed }, // The input data
    outcome: { type: mongoose.Schema.Types.Mixed }, // The result/user feedback
    learningSignal: { type: Number, default: 1 }, // Strength of the signal
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast retrieval of patterns
ExperienceSchema.index({ type: 1, timestamp: -1 });

export default mongoose.model('Experience', ExperienceSchema);
