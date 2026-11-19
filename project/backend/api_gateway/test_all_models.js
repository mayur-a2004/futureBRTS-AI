const axios = require('axios');

// Use environment variables for API keys
const groqKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const nvidiaKey = process.env.NVIDIA_API_KEY || 'YOUR_NVIDIA_API_KEY_HERE';

async function testGroqModels() {
    console.log('=== TESTING GROQ MODELS ===');
    const models = [
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'llama-3.2-3b-preview',
        'llama3-70b-8192',
        'llama3-8b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it'
    ];
    for (const m of models) {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: 'Say hello in 3 words' }],
                model: m
            }, {
                headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                timeout: 8000
            });
            console.log(`✅ GROQ Model "${m}" WORKS! Output:`, res.data.choices[0].message.content.trim());
        } catch (e) {
            console.log(`❌ GROQ Model "${m}" failed:`, e.response ? e.response.data?.error?.message || e.response.status : e.message);
        }
    }
}

async function testNvidiaModels() {
    console.log('\n=== TESTING NVIDIA MODELS ===');
    const models = [
        'meta/llama-3.3-70b-instruct',
        'nvidia/llama-3.1-nemotron-70b-instruct',
        'deepseek-ai/deepseek-r1',
        'google/gemma-2-27b-it',
        'meta/llama-3.1-70b-instruct',
        'meta/llama3-70b-instruct'
    ];
    for (const m of models) {
        try {
            const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
                messages: [{ role: 'user', content: 'Say hello in 3 words' }],
                model: m
            }, {
                headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
                timeout: 8000
            });
            console.log(`✅ NVIDIA Model "${m}" WORKS! Output:`, res.data.choices[0].message.content.trim());
        } catch (e) {
            console.log(`❌ NVIDIA Model "${m}" failed:`, e.response ? e.response.data?.detail || e.response.data?.title || e.response.status : e.message);
        }
    }
}

async function run() {
    await testGroqModels();
    await testNvidiaModels();
}
run();
