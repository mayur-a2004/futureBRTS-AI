const axios = require('axios');

const testGroq = async () => {
    const key = "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";
    console.log("Using Key:", key.substring(0, 10) + "...");

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
