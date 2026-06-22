
const axios = require('axios');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ODJjZGNiMWMwYzRmZjNlZGRhNGViNCIsImVtYWlsIjoibWF5dXJAZ21haWwuY29tIiwiaWF0IjoxNzM5ODc0NzI1LCJleHAiOjE3NDA0Nzk1MjV9.q0YmI7q8Gz9NjbVLpuabEwJJWx066eHXxOkgoLdN';
const sessionId = '698de4f5904a52904db145d4';

async function sendMsg() {
    try {
        console.log("Sending message to backend...");
        const res = await axios.post(`http://localhost:7001/api/builder/session/${sessionId}/message`,
            { content: "hi backend test" },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

sendMsg();
