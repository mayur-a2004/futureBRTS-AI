import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getProviderResponse } from './shared/services/openai.service';

dotenv.config();

const testAI = async () => {
    try {
        const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB:', dbUri);

        console.log('--- CALLING GET PROVIDER RESPONSE WITH ROUTING ---');
        const messages = [
            { role: 'system', content: 'You are an expert personal teacher. If the student asks in Hinglish, Gujarati, or any mix, understand it deeply and explain the scientific terms beautifully in simple terms with everyday analogies.' },
            { role: 'user', content: 'dhamani and raday atle su thay ?' }
        ];

        // Call the normal helper without forcing provider to test default routing
        const res = await getProviderResponse(messages, { jsonMode: false });
        console.log('AI Response (Routed):', JSON.stringify(res?.choices?.[0]?.message?.content, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err: any) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

testAI();
