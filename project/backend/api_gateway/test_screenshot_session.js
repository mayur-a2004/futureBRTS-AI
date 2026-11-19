const http = require('http');

async function testScreenshotSession() {
    const postData = JSON.stringify({
        content: "HLO",
        sessionId: "6aa114332c96e6babe75288c"
    });

    const options = {
        hostname: 'localhost',
        port: 7001,
        path: '/api/builder/session/6aa114332c96e6babe75288c/message',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log("Sending live stream test to session 6aa114332c96e6babe75288c...");
    const startTime = Date.now();

    const req = http.request(options, (res) => {
        let fullOutput = '';
        res.on('data', (chunk) => {
            const str = chunk.toString('utf8');
            fullOutput += str;
            process.stdout.write(str);
        });
        res.on('end', () => {
            const duration = Date.now() - startTime;
            console.log(`\n\nCompleted in ${duration}ms (Status ${res.statusCode})`);
        });
    });

    req.on('error', (e) => {
        console.error("Request Error:", e.message);
    });

    req.write(postData);
    req.end();
}

testScreenshotSession();
