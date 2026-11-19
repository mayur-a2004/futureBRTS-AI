const { getProviderResponse } = require('./src/shared/services/openai.service');
const mongoose = require('mongoose');
require('dotenv').config();

async function testLiveAiInBackend() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Testing live getProviderResponse call in backend...');
    
    try {
        const result = await getProviderResponse([
            { role: 'user', content: 'What is photosynthesis? Explain in 2 sentences.' }
        ], { temperature: 0.7 });
        
        console.log('\n🎉 REAL AI RESPONSE GENERATED:');
        console.log(result.choices[0].message.content);
    } catch (e) {
        console.error('❌ Error testing getProviderResponse:', e);
    }
    
    await mongoose.disconnect();
}

testLiveAiInBackend();
