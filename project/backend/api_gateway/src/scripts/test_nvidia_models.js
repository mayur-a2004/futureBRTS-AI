const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const nvidiaKey = process.env.NVIDIA_API_KEY;

async function testNvidiaModels() {
    console.log('Testing NVIDIA Key:', nvidiaKey ? `${nvidiaKey.substring(0, 15)}...` : 'MISSING');
    
    const modelsToTest = [
        'meta/llama-3.3-70b-instruct',
        'meta/llama-3.2-3b-instruct',
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'mistralai/mistral-7b-instruct-v0.3'
    ];

    for (const model of modelsToTest) {
        console.log(`\nTesting model: ${model}...`);
        try {
            const res = await axios.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                {
                    messages: [{ role: 'user', content: 'Say hello in 5 words' }],
                    model: model,
                    max_tokens: 50
                },
                {
                    headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            console.log(`✅ SUCCESS with ${model}:`, res.data?.choices?.[0]?.message?.content);
        } catch (err) {
            console.error(`❌ FAILED with ${model}:`, err.response?.status, JSON.stringify(err.response?.data || err.message));
        }
    }
}

testNvidiaModels().then(() => process.exit(0));
