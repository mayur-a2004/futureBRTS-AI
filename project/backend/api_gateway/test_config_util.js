const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');
        
        // Import dynamic config helper
        const { getAiKey } = require('./dist/shared/utils/dynamicConfig');
        const groqKey = await getAiKey('GROQ');
        console.log('getAiKey("GROQ") returned:', groqKey ? groqKey.substring(0, 15) + '...' : 'null');
        
        // Test callGroqAI
        const { callGroqAI } = require('./dist/modules/collage_project/multi_agent.service');
        console.log('Testing callGroqAI...');
        const res = await callGroqAI('Say hi in 1 word', 'system');
        console.log('callGroqAI output:', res);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
