
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Note: We need to point to the correct .env file
dotenv.config({ path: 'c:/Users/Admin/.gemini/antigravity/futurebuilderlatest grok last/futurebuilderlatest/project/backend/api_gateway/.env' });

// We need to mock some things if possible, or just require the service
// But since the service imports models, we need a DB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function testAI() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Dynamically import the service
        // We might need to register the models first
        require('../modules/admin/settings.model').default;
        const { openaiService } = require('./openai.service');

        console.log('--- TESTING AI RESPONSE ---');
        const start = Date.now();
        const response = await openaiService.generateResponse(
            { title: 'Test Session', lastMsg: 'Hello' },
            'Hello, represent yourself as Future BRTS.',
            { mode: 'execution', sessionState: {}, userContext: { firstName: 'Tester' } },
            []
        );
        const end = Date.now();

        console.log('AI Response:', response);
        console.log(`Took ${end - start}ms`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Test Failed:', err);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
        process.exit(1);
    }
}

testAI();
