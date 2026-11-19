const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function cleanDbKeys() {
    if (!MONGO_URI) {
        console.error('No MONGO_URI found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;

        if (db) {
            console.log('Clearing invalid/stale AI keys from systemsettings collection...');
            const result = await db.collection('systemsettings').deleteMany({
                key: { $in: [
                    'GROQ_API_KEY',
                    'AI_GROQ_KEY',
                    'GEMINI_API_KEY',
                    'AI_GEMINI_KEY',
                    'NVIDIA_API_KEY',
                    'AI_NVIDIA_KEY',
                    'OPENROUTER_API_KEY',
                    'AI_OPENROUTER_KEY'
                ] }
            });
            console.log(`Deleted ${result.deletedCount} stale AI key entries from DB.`);
        }
    } catch (err) {
        console.error('Error cleaning DB keys:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

cleanDbKeys();
