import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/Admin/.gemini/antigravity/futurebuilderlatest grok last/futurebuilderlatest/project/backend/api_gateway/.env' });

async function testKeys() {
    console.log("Checking keys...");
    console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "EXISTS" : "MISSING");
    console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "EXISTS" : "MISSING");

    try {
        console.log("Testing Groq...");
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'hi' }],
            model: 'llama-3.3-70b-versatile',
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        console.log("Groq Response:", response.data.choices[0].message.content);
    } catch (e: any) {
        console.error("Groq Error:", e.response?.data || e.message);
    }
}

testKeys();
