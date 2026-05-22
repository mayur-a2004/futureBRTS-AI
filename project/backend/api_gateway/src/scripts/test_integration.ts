
import axios from 'axios';

const API_URL = 'http://localhost:7000/api';
const UNIQUE_SUFFIX = Date.now().toString();

const USER_DATA = {
    firstName: `Test`,
    lastName: `User_${UNIQUE_SUFFIX}`,
    email: `integration_test_${UNIQUE_SUFFIX}@test.com`,
    password: 'password123'
};

/*
    ONBOARDING PAYLOAD (Matches frontend Onboarding.tsx handleFinalSubmit logic)
*/
const ONBOARDING_PAYLOAD = {
    // Required fields based on validation script findings
    field: "Engineering",
    final_goal: "Senior Developer",
    future_interest: "AI Audit",
    life_stage: "Professional",
    phase: "Execution",
    problem: "Stuck in junior role",
    project_level: "Advanced",
    target_outcome: "Get Promoted",
    // Frontend sends these usually
    age: 25,
    gender: "Male"
};

async function runIntegrationTest() {
    console.log("🚀 STARTING INTEGRATION TEST (System Reset Verification)");

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${USER_DATA.email}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, USER_DATA);
        console.log("   ✅ Registered:", regRes.data.success);
        let token = regRes.data.token;

        // 2. Login (Double check)
        console.log(`\n2. Logging in...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: USER_DATA.email, password: USER_DATA.password });
        token = loginRes.data.token;
        console.log("   ✅ Logged In. Token length:", token.length);

        // 3. Complete Onboarding
        console.log(`\n3. Completing Onboarding...`);
        const completeRes = await axios.post(`${API_URL}/onboarding/complete`, ONBOARDING_PAYLOAD, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("   ✅ Completed:", completeRes.data.success);

        // 4. Create Session
        console.log(`\n4. Creating Session...`);
        const sessionRes = await axios.post(`${API_URL}/builder/session`, {
            title: "Integration Plan",
            initialPrompt: "I want to grow efficiently."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("   ✅ Session Created:", sessionRes.data.success);
        const sessionId = sessionRes.data.session._id;
        console.log("   ℹ️ Session ID:", sessionId);

        // 5. Send Message (Trigger AI & Snapshot Check)
        console.log(`\n5. Sending Message (Testing 'Data Truth')...`);
        const msgRes = await axios.post(`${API_URL}/builder/session/${sessionId}/message`, {
            content: "Generate my roadmap based on my profile."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("   ✅ Message Sent:", msgRes.data.success);

        const messages = msgRes.data.messages;
        const lastMsg = messages[messages.length - 1];

        console.log("\n💬 AI RESPONSE:");
        console.log("--------------------------------------------------");
        console.log(lastMsg.content);
        console.log("--------------------------------------------------");

        if (lastMsg.content.includes("Your onboarding is not completed yet")) {
            console.error("❌ FAILURE: AI blocked request despite onboarding completion!");
            process.exit(1);
        } else {
            console.log("✅ SUCCESS: AI responded (Snapshot Validation Passed).");
        }

    } catch (error: any) {
        console.error("❌ TEST FAILED:", error.message);
        if (error.code) console.error("   Code:", error.code);
        if (error.cause) console.error("   Cause:", error.cause);
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

runIntegrationTest();
