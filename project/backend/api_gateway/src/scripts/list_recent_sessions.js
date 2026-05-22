
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/Admin/.gemini/antigravity/futurebuilderlatest grok last/futurebuilderlatest/project/backend/api_gateway/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function listRecentSessions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const sessions = await mongoose.connection.db.collection('sessions').find({}).sort({ updatedAt: -1 }).limit(5).toArray();
        console.log('--- RECENT SESSIONS ---');
        sessions.forEach(s => {
            console.log(`ID: ${s._id} | Title: ${s.title} | Msgs: ${s.messages ? s.messages.length : 0} | Updated: ${s.updatedAt}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listRecentSessions();
