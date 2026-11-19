const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkAvailableModels() {
    // 1. Check NVIDIA models
    if (process.env.NVIDIA_API_KEY) {
        try {
            console.log('Fetching NVIDIA models...');
            const res = await axios.get('https://integrate.api.nvidia.com/v1/models', {
                headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` }
            });
            console.log('NVIDIA Models count:', res.data?.data?.length);
            const modelIds = (res.data?.data || []).map(m => m.id).slice(0, 15);
            console.log('Sample NVIDIA Model IDs:', modelIds);
        } catch (e) {
            console.error('NVIDIA models fetch failed:', e.response?.status, e.response?.data || e.message);
        }
    }

    // 2. Check Groq models
    if (process.env.GROQ_API_KEY) {
        try {
            console.log('\nFetching Groq models...');
            const res = await axios.get('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
            });
            console.log('Groq Models:', res.data?.data?.map(m => m.id));
        } catch (e) {
            console.error('Groq models fetch failed:', e.response?.status, e.response?.data || e.message);
        }
    }
}

checkAvailableModels().then(() => process.exit(0));
