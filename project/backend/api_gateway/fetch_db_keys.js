const mongoose = require('mongoose');
const axios = require('axios');

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function fetchAndTest() {
    await mongoose.connect(mongoUri);
    const settings = await mongoose.connection.db.collection('systemsettings').find({}).toArray();
    
    console.log("Found settings keys:");
    for (const s of settings) {
        if (s.key.includes('KEY')) {
            console.log(`Key name: ${s.key}, value length: ${s.value ? s.value.length : 0}`);
            if (s.value) {
                if (s.key.includes('GROQ')) {
                    await testGroq(s.value, s.key);
                } else if (s.key.includes('GEMINI')) {
                    await testGemini(s.value, s.key);
                } else if (s.key.includes('OPENROUTER')) {
                    await testOpenRouter(s.value, s.key);
                }
            }
        }
    }
    await mongoose.disconnect();
}

async function testGroq(key, name) {
    try {
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'hello' }],
            model: 'llama-3.3-70b-versatile'
        }, {
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log(`  ✅ GROQ KEY (${name}) IS VALID! Response:`, res.data.choices[0].message.content.trim());
    } catch (e) {
        console.log(`  ❌ GROQ KEY (${name}) IS INVALID:`, e.response ? e.response.status : e.message);
    }
}

async function testGemini(key, name) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "Say hello" }] }]
        }, { timeout: 10000 });
        console.log(`  ✅ GEMINI KEY (${name}) IS VALID! Response:`, res.data.candidates[0].content.parts[0].text.trim());
    } catch (e) {
        console.log(`  ❌ GEMINI KEY (${name}) IS INVALID:`, e.response ? e.response.status : e.message);
    }
}

async function testOpenRouter(key, name) {
    try {
        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            messages: [{ role: 'user', content: 'hello' }],
            model: 'meta-llama/llama-3.3-70b-instruct'
        }, {
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log(`  ✅ OPENROUTER KEY (${name}) IS VALID! Response:`, res.data.choices[0].message.content.trim());
    } catch (e) {
        console.log(`  ❌ OPENROUTER KEY (${name}) IS INVALID:`, e.response ? e.response.status : e.message);
    }
}

fetchAndTest();
