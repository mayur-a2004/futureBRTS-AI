const http = require('http');

async function testBuilderChat() {
    const postData = JSON.stringify({
        content: "WHAT IS INDIA ?",
        guestSessionId: "guest_sess_12345"
    });

    const options = {
        hostname: 'localhost',
        port: 7001,
        path: '/api/builder/session/guest_sess_12345/message',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'x-guest-session-id': 'guest_sess_12345',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log("Sending test request to Builder Chat endpoint...");
    const startTime = Date.now();

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const duration = Date.now() - startTime;
            console.log(`\nResponse received in ${duration}ms (Status ${res.statusCode}):`);
            console.log(data);
        });
    });

    req.on('error', (e) => {
        console.error("Request Error:", e.message);
    });

    req.write(postData);
    req.end();
}

testBuilderChat();
