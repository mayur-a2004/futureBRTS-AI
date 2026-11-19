import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { getProviderResponse } from '../shared/services/openai.service';

async function testAiResponse() {
    console.log('Testing getProviderResponse with jsonMode: true...');
    const resJson = await getProviderResponse([
        { role: 'user', content: 'What is Quantum Physics?' }
    ], { jsonMode: true });

    console.log('\n--- JSON Response Output ---');
    console.log(resJson?.choices?.[0]?.message?.content);

    console.log('\nTesting getProviderResponse with jsonMode: false...');
    const resText = await getProviderResponse([
        { role: 'user', content: 'Explain Photosynthesis' }
    ], { jsonMode: false });

    console.log('\n--- Text Response Output ---');
    console.log(resText?.choices?.[0]?.message?.content);
}

testAiResponse().then(() => process.exit(0)).catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
