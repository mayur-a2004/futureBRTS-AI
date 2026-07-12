import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_URL = 'http://localhost:7001/api';

async function testChatDoubt() {
    let out = "🚀 RUNNING HIGH-FIDELITY STUDENT TUTOR CHAT INTEGRATION TEST...\n";

    try {
        // 1. Login
        out += "\n🔑 1. Logging in as mayur@gmail.com...\n";
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'mayur@gmail.com',
            password: '123'
        });
        const token = loginRes.data.token;
        out += "   ✅ Login successful.\n";

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Query 1: Emotional / Informal query
        out += "\n💬 2. Asking: 'mujhe kutch samajh ni aa raha hai, bahut anxiety ho rahi hai'\n";
        const chatRes = await axios.post(`${API_URL}/future-education/chat`, {
            message: "mujhe kutch samajh ni aa raha hai, bahut anxiety ho rahi hai"
        }, { headers });

        out += `   ✅ Reply: ${chatRes.data.reply}\n`;

        // 3. Query 2: Technical query (DSA)
        out += "\n💬 3. Asking: 'linked list kya hota hai simple term me dsa me samjhao'\n";
        const chatRes2 = await axios.post(`${API_URL}/future-education/chat`, {
            message: "linked list kya hota hai simple term me dsa me samjhao"
        }, { headers });

        out += `   ✅ Reply: ${chatRes2.data.reply}\n`;

        // 4. Query 3: Math function plot check
        out += "\n💬 4. Asking: 'sin wave simulation load karo maths me'\n";
        const chatRes3 = await axios.post(`${API_URL}/future-education/chat`, {
            message: "sin wave simulation load karo maths me"
        }, { headers });

        const labConfig = chatRes3.data.metadata?.lab_config;
        out += `   ✅ Lab Config: ${JSON.stringify(labConfig, null, 2)}\n`;

        fs.writeFileSync(path.join(__dirname, '../../test_chat_results.txt'), out);
        console.log('✅ Results written to test_chat_results.txt');
        process.exit(0);
    } catch (err: any) {
        out += `\n❌ TEST FAILED: ${err.message}\n`;
        if (err.response) {
            out += `   Response Status: ${err.response.status}\n`;
            out += `   Response Data: ${JSON.stringify(err.response.data, null, 2)}\n`;
        }
        fs.writeFileSync(path.join(__dirname, '../../test_chat_results.txt'), out);
        console.error(err);
        process.exit(1);
    }
}

testChatDoubt();
