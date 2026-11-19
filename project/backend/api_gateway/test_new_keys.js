const axios = require('axios');

async function testNewKeys() {
    // Use environment variables for API keys
    const groqKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
    const nvidiaKey = process.env.NVIDIA_API_KEY || 'YOUR_NVIDIA_API_KEY_HERE';

    console.log('Testing New Groq Key...');
    try {
        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            messages: [{ role: 'user', content: 'Say hello in 3 words' }],
            model: 'llama-3.3-70b-versatile'
        }, {
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ GROQ KEY WORKS! Response:', res.data.choices[0].message.content);
    } catch (e) {
        console.log('❌ GROQ KEY FAILED:', e.response ? JSON.stringify(e.response.data) : e.message);
    }

    console.log('\nTesting New NVIDIA Key...');
    try {
        const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
            messages: [{ role: 'user', content: 'Say hello in 3 words' }],
            model: 'nvidia/llama-3.1-nemotron-70b-instruct'
        }, {
            headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
            timeout: 10000
        });
        console.log('✅ NVIDIA KEY WORKS! Response:', res.data.choices[0].message.content);
    } catch (e) {
        console.log('❌ NVIDIA KEY FAILED:', e.response ? JSON.stringify(e.response.data) : e.message);
    }
}
testNewKeys();
