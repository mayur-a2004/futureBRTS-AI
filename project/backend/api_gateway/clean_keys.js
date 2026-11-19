const mongoose = require('mongoose');
const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function cleanDbKeys() {
    await mongoose.connect(mongoUri);
    const res = await mongoose.connection.db.collection('systemsettings').deleteMany({
        key: { $in: ['AI_GROQ_KEY', 'AI_OPENROUTER_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'AI_NVIDIA_KEY', 'NVIDIA_API_KEY', 'GEMINI_API_KEY', 'AI_GEMINI_KEY'] }
    });
    console.log('Cleared invalid DB key overrides count:', res.deletedCount);
    await mongoose.disconnect();
}
cleanDbKeys();
