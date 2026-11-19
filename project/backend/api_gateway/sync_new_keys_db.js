const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function updateDbSettings() {
    await mongoose.connect(mongoUri);
    const collection = mongoose.connection.db.collection('systemsettings');

    // Use environment variables for API keys
    const groqKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
    const nvidiaKey = process.env.NVIDIA_API_KEY || 'YOUR_NVIDIA_API_KEY_HERE';

    await collection.updateOne({ key: 'AI_GROQ_KEY' }, { $set: { value: groqKey, updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'GROQ_API_KEY' }, { $set: { value: groqKey, updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'AI_NVIDIA_KEY' }, { $set: { value: nvidiaKey, updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'NVIDIA_API_KEY' }, { $set: { value: nvidiaKey, updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'AI_LIVE_PROVIDER' }, { $set: { value: 'groq', updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'AI_GROQ_ACTIVE' }, { $set: { value: true, updatedAt: new Date() } }, { upsert: true });
    await collection.updateOne({ key: 'AI_NVIDIA_ACTIVE' }, { $set: { value: true, updatedAt: new Date() } }, { upsert: true });

    console.log('✅ Updated MongoDB SystemSettings with new working Groq and NVIDIA keys!');
    await mongoose.disconnect();
}

updateDbSettings();
