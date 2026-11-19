const axios = require('axios');

async function testMinervaChat() {
    for (const port of [3001, 7001]) {
        try {
            console.log(`\nTesting http://localhost:${port}/api/minerva/chat...`);
            const res = await axios.post(`http://localhost:${port}/api/minerva/chat`, {
                message: 'Explain Photosynthesis'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });

            console.log(`✅ Port ${port} Success! Status:`, res.status);
            console.log('Reply preview:', (res.data?.reply || '').substring(0, 150));
        } catch (err) {
            console.error(`❌ Port ${port} Failed:`, err.response?.status, err.response?.data || err.message);
        }
    }
}

testMinervaChat().then(() => process.exit(0));
