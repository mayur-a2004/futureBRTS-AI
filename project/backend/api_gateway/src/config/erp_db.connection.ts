// 🏫 Secondary Mongoose Connection Manager for B2B School ERP Database (futurebilder_erp)
import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let erpConnection: Connection | null = null;

export const connectErpDB = (): Connection => {
    if (erpConnection && erpConnection.readyState === 1) {
        return erpConnection;
    }

    const erpUri = process.env.ERP_MONGODB_URI || 
        'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_erp?retryWrites=true&w=majority';

    console.log('🔄 [ERP DB] Initializing secondary ERP Database Connection...');

    erpConnection = mongoose.createConnection(erpUri, {
        serverSelectionTimeoutMS: 15000,
        heartbeatFrequencyMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
    });

    erpConnection.on('connected', () => {
        console.log('✅ [ERP DB] Secondary ERP MongoDB Connected: futurebilder_erp');
    });

    erpConnection.on('disconnected', () => {
        console.warn('⚠️ [ERP DB] Secondary ERP MongoDB Disconnected. Retrying...');
    });

    erpConnection.on('error', (err) => {
        console.error('❌ [ERP DB] Secondary ERP Connection Error:', err.message);
    });

    return erpConnection;
};

export const getErpConnection = (): Connection => {
    if (!erpConnection) {
        return connectErpDB();
    }
    return erpConnection;
};
