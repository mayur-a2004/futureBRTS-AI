// 👉 Ye file MongoDB database ke saath connection establish karti hai
// 👉 Mongoose library ka use karke hum clustering aur models connect karte hain
// 🛡️ RESILIENT DB LAYER: Auto-reconnect instead of crashing the server

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

    // Parse the connection URI to check if a database is specified.
    // If no database is specified, we default to 'fueture_db'.
    const connectionParts = uri.split('?')[0];
    const hostAndDb = connectionParts.split('://')[1] || '';
    const slashIndex = hostAndDb.indexOf('/');
    const dbPath = slashIndex !== -1 ? hostAndDb.substring(slashIndex + 1) : '';

    if (!dbPath.trim()) {
        const baseUrl = uri.includes('?') ? uri.split('?')[0] : uri;
        const options = uri.includes('?') ? `?${uri.split('?')[1]}` : '';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        uri = `${cleanBase}fueture_db${options}`;
    } else {
        // If there's a double-slash database name issue (like "futurebilder_tool/fueture_db" from previous logic), fix it
        if (dbPath.includes('/')) {
            const cleanDbName = dbPath.split('/')[0];
            uri = uri.replace(dbPath, cleanDbName);
        }
    }

    mongoose.set('strictQuery', false);

    // Auto-reconnect settings
    const mongooseOptions = {
        serverSelectionTimeoutMS: 10000, // 10s to find a server
        heartbeatFrequencyMS: 30000,     // Check connection every 30s
        maxPoolSize: 10,
        retryWrites: true,
    };

    // 🧠 Register DB event listeners ONCE
    if (!isConnected) {
        mongoose.connection.on('connected', () => {
            console.log('✅ [DB] MongoDB Connected:', uri);
            isConnected = true;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ [DB] MongoDB Disconnected. Attempting to reconnect...');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ [DB] MongoDB Reconnected Successfully.');
            isConnected = true;
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ [DB] MongoDB Connection Error:', err.message);
        });
    }

    // 🔄 Attempt connection with retry loop (does NOT crash server on failure)
    const tryConnect = async (attempt = 1) => {
        try {
            await mongoose.connect(uri, mongooseOptions);
            console.log('✅ MongoDB initial connection successful.');
        } catch (error: any) {
            const retryDelay = Math.min(5000 * attempt, 60000); // Backoff: 5s, 10s, 15s... max 60s
            console.error(`❌ [DB] MongoDB Connection Failed (Attempt ${attempt}): ${error.message}`);
            console.warn(`🔄 [DB] Retrying in ${retryDelay / 1000}s... (Server remains ACTIVE)`);
            setTimeout(() => tryConnect(attempt + 1), retryDelay);
        }
    };

    await tryConnect();
};
