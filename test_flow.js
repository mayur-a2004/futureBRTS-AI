
const axios = require('axios');

async function testFlow() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('http://localhost:7001/api/auth/login', {
            email: 'mayur@gmail.com',
            password: 'password123' // Guessing standard test password
        });

        const token = loginRes.data.token;
        console.log("Logged in. Token received.");

        console.log("Creating session...");
        const sessionRes = await axios.post('http://localhost:7001/api/builder/session',
            { initialPrompt: "test", title: "Test Session" },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const sessionId = sessionRes.data.session._id;
        console.log("Session created:", sessionId);

        console.log("Sending message...");
        const msgRes = await axios.post(`http://localhost:7001/api/builder/session/${sessionId}/message`,
            { content: "hi backend test" },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log("Message Response:", JSON.stringify(msgRes.data, null, 2));

    } catch (e) {
        console.error("Test Flow Failed:", e.response?.data || e.message);
    }
}

testFlow();
