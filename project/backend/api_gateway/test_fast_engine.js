const dotenv = require('dotenv');
dotenv.config();

const { getProviderResponse } = require('./dist/shared/services/openai.service');

async function testFast() {
    const start = Date.now();
    const result = await getProviderResponse([
        { role: 'system', content: 'You are an AI teacher. Give a fast 2 sentence explanation.' },
        { role: 'user', content: 'What is photosynthesis?' }
    ], { maxTokens: 150 });
    console.log("Time taken:", Date.now() - start, "ms");
    console.log("Result:", result.choices[0].message.content);
}

testFast().catch(console.error);
