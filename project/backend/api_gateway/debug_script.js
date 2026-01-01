// using native fetch

// Assuming Node 18+ for native fetch. If not, I'll need to check.
// package.json says "@types/node": "^20.19.26", so likely Node 20+. Native fetch is available.

const API_URL = 'http://localhost:7000/api';

async function run() {
    const email = `debug_${Date.now()}@example.com`;
    console.log(`Creating user: ${email}`);

    // 1. Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName: 'Debug',
            lastName: 'User',
            email: email,
            password: 'password123'
        })
    });

    const regData = await regRes.json();
    console.log('Register Response:', JSON.stringify(regData, null, 2));

    if (!regData.success) {
        // If register failed, try login (maybe user exists)
        console.log("Registration failed, trying login...");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);

        if (loginData.success) {
            regData.token = loginData.token;
        } else {
            console.error("Login also failed.");
            return;
        }
    }

    const token = regData.token;
    if (!token) {
        console.error("No token received");
        return;
    }

    console.log("Got Token:", token);

    // 2. Call Complete Onboarding
    console.log("Calling Complete Onboarding...");
    const completeRes = await fetch(`${API_URL}/onboarding/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
    });

    const completeData = await completeRes.json();
    console.log('Complete Onboarding Response:', JSON.stringify(completeData, null, 2));

    console.log('Status Code:', completeRes.status);
}

run().catch(console.error);
