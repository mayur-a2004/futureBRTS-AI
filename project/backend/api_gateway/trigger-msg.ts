
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const userId = '6982cdcb1c0c4ff3edda4eb4';
    const email = 'mayur@gmail.com';
    const sessionId = '69e3c5e0c43eaa34e76a7e93';

    console.log(`Generating token with secret: ${secret}`);
    const token = jwt.sign({ id: userId, email: email }, secret, { expiresIn: '1h' });
    
    console.log("Token length:", token.length);
    const url = `http://localhost:7001/api/builder/session/${sessionId}/message`;
    console.log(`Sending request to ${url}...`);

    try {
        const res = await axios.post(url, 
            { content: "Hello Future, testing the connection." },
            { 
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 60000 
            }
        );
        console.log("Response Status:", res.status);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));
    } catch (e: any) {
        console.error("Request Failed!");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("Error Message:", e.message);
        }
    }
}

runTest();
