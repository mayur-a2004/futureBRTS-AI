
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, 'project/backend/api_gateway/.env') });

async function testGroq() {
    const key = process.env.GROQ_API_KEY;
    console.log("Using Key:", key?.substring(0, 10) + "...");

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages: [{ role: 'user', content: 'Say hello in one word.' }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 10
            },
            {
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        console.log("Groq Response:", response.data.choices[0].message.content);
    } catch (e: any) {
        console.error("Groq Error:", e.response?.data || e.message);
    }
}

testGroq();
