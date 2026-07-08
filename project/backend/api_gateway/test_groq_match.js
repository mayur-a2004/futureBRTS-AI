const axios = require('axios');
const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function testKey(keyName, keyVal) {
    console.log(`Testing key: ${keyName} = ${keyVal ? keyVal.substring(0, 15) : 'null'}...`);
    try {
        const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say hello in 3 words' }],
                max_tokens: 10
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keyVal}`
                },
                timeout: 5000
            }
        );
        console.log(`Success! Response:`, JSON.stringify(res.data.choices[0].message));
        return true;
    } catch (err) {
        console.log(`Failed! Error:`, err.response ? err.response.data : err.message);
        return false;
    }
}

async function run() {
    await mongoose.connect(mongoUri);
    const settings = await mongoose.connection.db.collection('systemsettings').find().toArray();
    const envKey = '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'; // from .env file
    
    console.log('\n--- 1. Testing key from .env file ---');
    await testKey('ENV_GROQ_KEY', envKey);
    
    for (const s of settings) {
        if (s.key === 'GROQ_API_KEY' || s.key === 'AI_GROQ_KEY') {
            console.log(`\n--- Testing ${s.key} from MongoDB ---`);
            await testKey(s.key, s.value);
        }
    }
    
    await mongoose.disconnect();
}
run();
