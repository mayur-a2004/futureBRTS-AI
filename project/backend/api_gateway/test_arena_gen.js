const axios = require('axios');
const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

const prompt = `You are a CBSE/NCERT expert quiz master.
Generate exactly 10 multiple-choice questions for:
- Subject: "Geography"
- Class/Grade: 10
- Difficulty: "Medium"
- Strictly follow NCERT Class 10 syllabus

Respond ONLY with a valid raw JSON array. No markdown, no backticks.
Each object must have:
- "question": string
- "options": array of exactly 4 unique strings (randomly ordered)
- "correctAnswer": number (0-3 index of correct option in the options array)
- "explanation": string (1 sentence why this is the answer)
- "difficulty": "Medium"

Example:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":2,"explanation":"...","difficulty":"Medium"}]`;

async function run() {
    try {
        await mongoose.connect(mongoUri);
        const settings = await mongoose.connection.db.collection('systemsettings').find().toArray();
        let key = null;
        for (const s of settings) {
            if (s.key === 'AI_GROQ_KEY') {
                key = s.value;
                break;
            }
        }
        if (!key) {
            console.log('Key AI_GROQ_KEY not found in DB!');
            await mongoose.disconnect();
            return;
        }

        console.log('Testing Arena Question Gen Prompt with DB key:', key.substring(0, 15) + '...');
        const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                timeout: 10000
            }
        );
        
        const content = res.data.choices[0].message.content;
        console.log('Raw Output length:', content.length);
        console.log('First 500 chars:\n', content.substring(0, 500));
        
        let cleaned = content;
        if (cleaned.includes('```')) {
            cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const parsed = JSON.parse(cleaned);
        console.log('Parsed successfully! Array size:', parsed.length);
        console.log('Sample question options:', parsed[0].options);
    } catch (err) {
        console.log('Error:', err.response ? err.response.data : err.message);
    } finally {
        await mongoose.disconnect();
    }
}
run();
