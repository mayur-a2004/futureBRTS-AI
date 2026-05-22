
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function checkSessions() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const sessions = await mongoose.connection.db.collection('sessions').find({}).sort({ updatedAt: -1 }).limit(1).toArray();
        console.log('--- RECENT SESSION ---');
        if (sessions.length > 0) {
            console.log(JSON.stringify(sessions[0].messages.slice(-2), null, 2));
        } else {
            console.log('No sessions found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSessions();
