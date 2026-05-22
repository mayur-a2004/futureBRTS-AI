const axios = require('axios');
require('dotenv').config();

const testGroq = async () => {
    const key = process.env.GROQ_API_KEY || process.env.AI_GROQ_KEY;
    console.log("Using Key:", key ? (key.substring(0, 10) + "...") : "MISSING");

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'Say hello in JSON format: {"msg": "hello"}' }],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        }, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("Response:", response.data.choices[0].message.content);
    } catch (e) {
        if (e.response) {
            console.error("Error Response:", e.response.status, e.response.data);
        } else {
            console.error("Error Message:", e.message);
        }
    }
};

testGroq();
