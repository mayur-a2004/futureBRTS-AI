const http = require('http');

async function testLiveMinervaChat() {
    const postData = JSON.stringify({
        message: "WHAT IS INDIA ?",
        studentProfile: { grade_level: "class_10", board: "cbse" },
        chatHistory: []
    });

    const options = {
        hostname: 'localhost',
        port: 7001,
        path: '/api/v1/minerva/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log("Sending live test request to Minerva chat endpoint...");
    const startTime = Date.now();

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const duration = Date.now() - startTime;
            console.log(`\nResponse received in ${duration}ms (Status ${res.statusCode}):`);
            try {
                const parsed = JSON.parse(data);
                console.log("\n=== AI REPLY ===");
                console.log(parsed.data?.reply || parsed.reply || data);
                console.log("\n=== METADATA / SUGGESTIONS ===");
                console.log(JSON.stringify(parsed.data?.metadata || parsed.metadata, null, 2));
            } catch (e) {
                console.log(data);
            }
        });
    });

    req.on('error', (e) => {
        console.error("Request Error:", e.message);
    });

    req.write(postData);
    req.end();
}

testLiveMinervaChat();
