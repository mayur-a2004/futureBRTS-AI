const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function checkAll() {
    await mongoose.connect(mongoUri);
    const settings = await mongoose.connection.db.collection('systemsettings').find({}).toArray();
    console.log('=== ALL SETTINGS IN DB ===');
    settings.forEach(s => console.log(s.key, '=', s.value ? String(s.value).substring(0, 15) + '...' : 'EMPTY'));
    
    console.log('\n=== ENV KEYS ===');
    console.log('NVIDIA_API_KEY:', process.env.NVIDIA_API_KEY ? process.env.NVIDIA_API_KEY.substring(0, 15) + '...' : 'NONE');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : 'NONE');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 15) + '...' : 'NONE');
    console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 15) + '...' : 'NONE');

    // Test NVIDIA Key from ENV
    if (process.env.NVIDIA_API_KEY) {
        console.log('\nTesting NVIDIA Key from ENV...');
        try {
            const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
                messages: [{ role: 'user', content: 'hello' }],
                model: 'nvidia/llama-3.1-nemotron-70b-instruct'
            }, {
                headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 10000
            });
            console.log('✅ NVIDIA ENV KEY IS VALID! Response:', res.data.choices[0].message.content.substring(0, 50));
        } catch (e) {
            console.log('❌ NVIDIA ENV KEY FAILED:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    }

    // Test GROQ Key from ENV
    if (process.env.GROQ_API_KEY) {
        console.log('\nTesting GROQ Key from ENV...');
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: 'hello' }],
                model: 'llama-3.3-70b-versatile'
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 10000
            });
            console.log('✅ GROQ ENV KEY IS VALID! Response:', res.data.choices[0].message.content.substring(0, 50));
        } catch (e) {
            console.log('❌ GROQ ENV KEY FAILED:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    }

    // Test GEMINI Key from ENV
    if (process.env.GEMINI_API_KEY) {
        console.log('\nTesting GEMINI Key from ENV...');
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const res = await axios.post(url, { contents: [{ parts: [{ text: 'hello' }] }] }, { timeout: 10000 });
            console.log('✅ GEMINI ENV KEY IS VALID! Response:', res.data.candidates[0].content.parts[0].text.substring(0, 50));
        } catch (e) {
            console.log('❌ GEMINI ENV KEY FAILED:', e.response ? JSON.stringify(e.response.data) : e.message);
        }
    }

    await mongoose.disconnect();
}
checkAll();
