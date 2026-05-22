
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/Admin/.gemini/antigravity/futurebuilderlatest grok last/futurebuilderlatest/project/backend/api_gateway/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function listSettings() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const settings = await mongoose.connection.db.collection('systemsettings').find({}).toArray();
        console.log('JSON_BEGIN');
        console.log(JSON.stringify(settings, null, 2));
        console.log('JSON_END');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

listSettings();
