import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
    key: string;
    value: any;
    description?: string;
    updatedBy?: mongoose.Types.ObjectId;
    updatedAt: Date;
}

const SystemSettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'AI_PROVIDER', 'GROQ_API_KEY', 'MAINTENANCE_MODE'
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

export default (mongoose.models.SystemSettings as mongoose.Model<ISystemSettings>) || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
