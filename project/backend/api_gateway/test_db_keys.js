const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function testKeys() {
    await mongoose.connect(mongoUri);
    const settings = await mongoose.connection.db.collection('systemsettings').find({}).toArray();
    
    let groqKey = '';
    let geminiKey = '';
    
    for (const s of settings) {
        if (s.key === 'GROQ_API_KEY') groqKey = s.value;
        if (s.key === 'AI_GROQ_KEY' && !groqKey) groqKey = s.value;
        if (s.key === 'GEMINI_API_KEY') geminiKey = s.value;
    }
    
    console.log("DB GROQ Key:", groqKey ? (groqKey.substring(0, 15) + "...") : "NOT FOUND");
    console.log("DB GEMINI Key:", geminiKey ? (geminiKey.substring(0, 15) + "...") : "NOT FOUND");
    
    if (groqKey) {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: 'Say hello' }],
                model: 'llama-3.3-70b-versatile'
            }, {
                headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                timeout: 10000
            });
            console.log("Groq Success! Response:", res.data.choices[0].message.content.trim());
        } catch (e) {
            console.error("Groq Failed:", e.response ? e.response.data : e.message);
        }
    }
    
    if (geminiKey) {
        try {
            // Try v1beta gemini-2.5-flash
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: "Say hello" }] }]
            }, { timeout: 10000 });
            console.log("Gemini Success! Response:", res.data.candidates[0].content.parts[0].text.trim());
        } catch (e) {
            console.error("Gemini Failed:", e.response ? e.response.data : e.message);
        }
    }
    
    await mongoose.disconnect();
}

testKeys();
