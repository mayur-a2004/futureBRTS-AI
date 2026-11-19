const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const nvidiaKey = process.env.NVIDIA_API_KEY;

async function findWorkingNvidiaModels() {
    try {
        console.log('Fetching NVIDIA models list...');
        const res = await axios.get('https://integrate.api.nvidia.com/v1/models', {
            headers: { 'Authorization': `Bearer ${nvidiaKey}` }
        });
        
        const allModels = (res.data?.data || []).map(m => m.id);
        console.log('Total NVIDIA models:', allModels.length);

        const candidates = allModels.filter(id => 
            id.includes('deepseek') || id.includes('llama') || id.includes('gemma') || id.includes('mistral') || id.includes('yi')
        );

        console.log('\nFound candidate models:', candidates);

        for (const model of candidates) {
            console.log(`\nTesting: ${model}...`);
            try {
                const chatRes = await axios.post(
                    'https://integrate.api.nvidia.com/v1/chat/completions',
                    {
                        messages: [{ role: 'user', content: 'Say Hello in 3 words' }],
                        model: model,
                        max_tokens: 30
                    },
                    {
                        headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
                        timeout: 10000
                    }
                );
                console.log(`🎉 SUCCESS with ${model}:`, chatRes.data?.choices?.[0]?.message?.content);
            } catch (err) {
                console.log(`❌ Failed with ${model}:`, err.response?.status, err.response?.data?.detail || err.message);
            }
        }
    } catch (e) {
        console.error('Error fetching models:', e.message);
    }
}

findWorkingNvidiaModels().then(() => process.exit(0));
