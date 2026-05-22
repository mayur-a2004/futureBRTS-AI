const axios = require('axios');
require('dotenv').config();

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key ? (key.substring(0, 10) + "...") : "MISSING");

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Say hello in JSON format: {'msg': 'hello'}" }] }]
        });
        console.log("Response:", JSON.stringify(response.data.candidates[0].content.parts[0].text, null, 2));
    } catch (e) {
        if (e.response) {
            console.error("Error Response:", e.response.status, e.response.data);
        } else {
            console.error("Error Message:", e.message);
        }
    }
};

testGemini();
