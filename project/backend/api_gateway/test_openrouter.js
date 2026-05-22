const axios = require('axios');
require('dotenv').config();

const testOpenRouter = async () => {
    const key = process.env.OPENROUTER_API_KEY;
    console.log("Using Key:", key ? (key.substring(0, 10) + "...") : "MISSING");

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            messages: [{ role: 'user', content: 'Say hello in JSON format: {"msg": "hello"}' }],
            model: 'meta-llama/llama-3.3-70b-instruct'
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

testOpenRouter();
