
const axios = require('axios');
require('dotenv').config({ path: './project/backend/api_gateway/.env' });

async function testGroq() {
    try {
        console.log("Testing Groq...");
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "hi" }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Groq Success:", response.data.choices[0].message.content);
    } catch (err) {
        console.error("Groq Failed:", err.response ? err.response.data : err.message);
    }
}

async function testGemini() {
    try {
        console.log("Testing Gemini...");
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: "hi" }] }]
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );
        console.log("Gemini Success:", response.data.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error("Gemini Failed:", err.response ? err.response.data : err.message);
    }
}

async function run() {
    await testGroq();
    await testGemini();
}

run();
