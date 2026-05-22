const mongoose = require('mongoose');
require('dotenv').config();

const Schema = mongoose.Schema;
const SettingsSchema = new Schema({
    key: String,
    value: String
}, { collection: 'settings' });

const Settings = mongoose.model('Settings', SettingsSchema);

const checkSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
        console.log("Connected to MongoDB");

        const settings = await Settings.find({});
        console.log("All Settings Keys:", settings.map(s => s.key));

        const groq = settings.find(s => s.key === 'GROQ_API_KEY' || s.key === 'AI_GROQ_KEY');
        if (groq) {
            console.log("Found GROQ Key in DB:", groq.value ? (groq.value.substring(0, 10) + "...") : "EMPTY");
        } else {
            console.log("No GROQ Key in DB");
        }

    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkSettings();
