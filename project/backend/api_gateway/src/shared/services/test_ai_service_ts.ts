
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Fix for dynamic requirements in openai.service
(global as any).SystemSettings = require('../../modules/admin/settings.model').default;

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { openaiService } from './openai.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function testAI() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

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
    } catch (err: any) {
        console.error('Test Failed:', err.message);
        if (err.response) {
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
}

testAI();
