const axios = require('axios');
require('dotenv').config();

const testGroq = async () => {
    const key = "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";
    console.log("Using Key:", key.substring(0, 10) + "...");
    try {
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'hello' }],
            model: 'llama-3.3-70b-versatile'
        }, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        console.log("Success:", res.data.choices[0].message.content);
    } catch (e) {
        console.error("Failed Status:", e.response?.status);
        console.error("Failed Data:", JSON.stringify(e.response?.data));
        console.error("Error Message:", e.message);
    }
};

testGroq();
