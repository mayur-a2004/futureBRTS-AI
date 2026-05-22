
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function checkKeys() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const settings = await mongoose.connection.db.collection('systemsettings').find({}).toArray();
        console.log('--- SYSTEM SETTINGS ---');
        console.log(JSON.stringify(settings, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkKeys();
