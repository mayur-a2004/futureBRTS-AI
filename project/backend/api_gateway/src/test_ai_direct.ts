import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { getProviderResponse } from './shared/services/openai.service';
import { getAiKey } from './shared/utils/dynamicConfig';

const testAI = async () => {
    try {
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB:', dbUri);

        const activeGroqKey = await getAiKey('GROQ');
        const activeGeminiKey = await getAiKey('GEMINI');

        console.log('Active Groq Key:', activeGroqKey ? activeGroqKey.substring(0, 15) + '...' : 'NONE');
        console.log('Active Gemini Key:', activeGeminiKey ? activeGeminiKey.substring(0, 15) + '...' : 'NONE');

        console.log('--- CALLING GET PROVIDER RESPONSE ---');
        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hello in 5 words.' }
        ];

        const res = await getProviderResponse(messages, { jsonMode: false });
        console.log('AI Response:', JSON.stringify(res, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err: any) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

testAI();
