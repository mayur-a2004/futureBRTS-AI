import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import mongoose from 'mongoose';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || '';

async function testKeys() {
    console.log('=== TESTING AI KEYS FROM .ENV ===');
    console.log('NVIDIA_API_KEY:', process.env.NVIDIA_API_KEY ? `${process.env.NVIDIA_API_KEY.substring(0, 10)}...` : 'MISSING');
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 10)}...` : 'MISSING');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'MISSING');
    console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 10)}...` : 'MISSING');

    // 1. Test NVIDIA NIM
    if (process.env.NVIDIA_API_KEY) {
        console.log('\n--- 1. Testing NVIDIA NIM ---');
        try {
            const res = await axios.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                {
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'meta/llama-3.1-8b-instruct',
                    max_tokens: 50
                },
                {
                    headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            console.log('✅ NVIDIA NIM Success:', res.data?.choices?.[0]?.message?.content);
        } catch (err: any) {
            console.error('❌ NVIDIA NIM Failed:', err.response?.status, err.response?.data || err.message);
        }
    }

    // 2. Test Groq
    if (process.env.GROQ_API_KEY) {
        console.log('\n--- 2. Testing Groq ---');
        try {
            const res = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 50
                },
                {
                    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            console.log('✅ Groq Success:', res.data?.choices?.[0]?.message?.content);
        } catch (err: any) {
            console.error('❌ Groq Failed:', err.response?.status, err.response?.data || err.message);
        }
    }

    // 3. Test Gemini
    if (process.env.GEMINI_API_KEY) {
        console.log('\n--- 3. Testing Gemini ---');
        try {
            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
                },
                { timeout: 15000 }
            );
            console.log('✅ Gemini Success:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
        } catch (err: any) {
            console.error('❌ Gemini Failed:', err.response?.status, err.response?.data || err.message);
        }
    }

    // 4. Test OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        console.log('\n--- 4. Testing OpenRouter ---');
        try {
            const res = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    messages: [{ role: 'user', content: 'Hello' }],
                    model: 'google/gemini-2.5-flash',
                    max_tokens: 50
                },
                {
                    headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            console.log('✅ OpenRouter Success:', res.data?.choices?.[0]?.message?.content);
        } catch (err: any) {
            console.error('❌ OpenRouter Failed:', err.response?.status, err.response?.data || err.message);
        }
    }

    // 5. Connect DB to inspect SystemSettings
    if (MONGO_URI) {
        console.log('\n--- 5. Inspecting MongoDB SystemSettings ---');
        try {
            await mongoose.connect(MONGO_URI);
            const db = mongoose.connection.db;
            if (db) {
                const settings = await db.collection('systemsettings').find({}).toArray();
                console.log('Found SystemSettings count:', settings.length);
                settings.forEach(s => {
                    if (s.key.includes('KEY') || s.key.includes('PROVIDER') || s.key.includes('AI')) {
                        console.log(`Setting [${s.key}]:`, typeof s.value === 'string' ? `${s.value.substring(0, 15)}...` : s.value);
                    }
                });
            }
        } catch (err: any) {
            console.error('❌ DB Connection error:', err.message);
        } finally {
            await mongoose.disconnect();
        }
    }
}

testKeys().then(() => process.exit(0));
