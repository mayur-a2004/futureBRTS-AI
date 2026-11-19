const axios = require('axios');

// Use environment variables for API keys
const groqKey = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';
const nvidiaKey = process.env.NVIDIA_API_KEY || 'YOUR_NVIDIA_API_KEY_HERE';

async function fetchGroqModels() {
    console.log('=== FETCHING GROQ AVAILABLE MODELS ===');
    try {
        const res = await axios.get('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${groqKey}` }
        });
        const modelIds = res.data.data.map(m => m.id);
        console.log('✅ GROQ AVAILABLE MODELS:', modelIds);
        return modelIds;
    } catch (e) {
        console.log('❌ Failed to fetch Groq models:', e.response ? e.response.data : e.message);
        return [];
    }
}

async function fetchNvidiaModels() {
    console.log('\n=== FETCHING NVIDIA AVAILABLE MODELS ===');
    try {
        const res = await axios.get('https://integrate.api.nvidia.com/v1/models', {
            headers: { 'Authorization': `Bearer ${nvidiaKey}` }
        });
        const modelIds = res.data.data.map(m => m.id);
        console.log('✅ NVIDIA AVAILABLE MODELS:', modelIds);
        return modelIds;
    } catch (e) {
        console.log('❌ Failed to fetch NVIDIA models:', e.response ? e.response.data : e.message);
        return [];
    }
}

async function run() {
    const groqModels = await fetchGroqModels();
    const nvidiaModels = await fetchNvidiaModels();

    if (groqModels.length > 0) {
        console.log('\nTesting first available Groq model:', groqModels[0]);
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [{ role: 'user', content: 'Say hello in 3 words' }],
                model: groqModels[0]
            }, {
                headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' }
            });
            console.log(`🎉 SUCCESS WITH GROQ MODEL ${groqModels[0]}:`, res.data.choices[0].message.content.trim());
        } catch (err) {
            console.log('Groq model test failed:', err.response?.data || err.message);
        }
    }

    if (nvidiaModels.length > 0) {
        console.log('\nTesting first available NVIDIA model:', nvidiaModels[0]);
        try {
            const res = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
                messages: [{ role: 'user', content: 'Say hello in 3 words' }],
                model: nvidiaModels[0]
            }, {
                headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' }
            });
            console.log(`🎉 SUCCESS WITH NVIDIA MODEL ${nvidiaModels[0]}:`, res.data.choices[0].message.content.trim());
        } catch (err) {
            console.log('NVIDIA model test failed:', err.response?.data || err.message);
        }
    }
}

run();
