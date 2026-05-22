import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
    userId: mongoose.Types.ObjectId;
    topic: string;
    forecast: string[];
    accuracy: number;
    latency: number;
    timestamp: Date;
}

const PredictionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    summary: [{ type: String }],
    forecast: [{ type: String }],
    forecast_data: [{ year: String, salary: Number }],
    accuracy: { type: Number, default: 0.95 },
    latency: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IPrediction>('Prediction', PredictionSchema);
