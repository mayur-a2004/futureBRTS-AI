
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/Admin/.gemini/antigravity/futurebuilderlatest grok last/futurebuilderlatest/project/backend/api_gateway/.env' });

const API_URL = 'http://127.0.0.1:7000/api';

async function testAddMessage() {
    try {
        console.log('--- Logging in ---');
        // We need a user. Let's try to login or use a known one.
        // For simplicity, let's assume we can get a token from the DB for the first user.
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGO_URI);
        const user = await mongoose.connection.db.collection('users').findOne({});
        console.log('User found:', user.email);

        // Generate a token or take one from the user object if exists (unlikely to have a fresh one)
        // Better: let's use a debug bypass if available or just generate one.
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret');

        const session = await mongoose.connection.db.collection('sessions').findOne({ userId: user._id });
        if (!session) {
            console.log('No session found for user');
            return;
        }
        console.log('Session found:', session._id);

        console.log('--- Sending Message ---');
        const start = Date.now();
        const res = await axios.post(`${API_URL}/builder/session/${session._id}/message`, {
            content: "Hello, can you hear me?"
        }, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 60000
        });
        const end = Date.now();

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));
        console.log(`Took ${end - start}ms`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
}

testAddMessage();
