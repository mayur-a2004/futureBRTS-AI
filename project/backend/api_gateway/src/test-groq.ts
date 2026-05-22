import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const testGroq = async () => {
    const key = process.env.GROQ_API_KEY;
    console.log("Using Key:", key?.substring(0, 10) + "...");
    try {
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'hello' }],
            model: 'llama-3.3-70b-versatile'
        }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        console.log("Success:", res.data.choices[0].message.content);
    } catch (e) {
        console.error("Failed:", e.response?.data || e.message);
    }
};

testGroq();
