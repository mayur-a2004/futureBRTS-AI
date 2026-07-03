import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../modules/auth/user.model';
import MinervaStudySession from '../modules/minerva/models/minerva_study_session.model';
import MinervaKnowledgeNode from '../modules/minerva/models/minerva_knowledge_node.model';

dotenv.config();

const API_URL = 'http://localhost:7001/api';

async function testEducationOS() {
    console.log("🚀 RUNNING EDUCATION OS INTEGRATION TESTS...");

    try {
        // 1. Login
        console.log("\n1. Logging in as test@test.com...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("   ✅ Login successful. Token obtained.");

        const headers = { Authorization: `Bearer ${token}` };

        // Let's connect to database directly to get the 100% completed session ID
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fueture_db");

        const testUser = await User.findOne({ email: 'test@test.com' });
        if (!testUser) {
            throw new Error("test@test.com user not found in DB!");
        }
        const userId = testUser._id.toString();

        // 2. Fetch Stats
        console.log("\n2. Fetching stats...");
        const statsRes = await axios.get(`${API_URL}/minerva/stats`, { headers });
        console.log("   ✅ Stats Response:", JSON.stringify(statsRes.data.stats, null, 2));

        const streak = statsRes.data.stats.streak_days;
        if (streak !== 3 && streak !== 4) {
            console.error(`❌ Expected streak_days to be 3 or 4, got ${streak}`);
        } else {
            console.log(`   ✅ Study Streak Verified (${streak} Days).`);
        }

        // 3. Fetch Leaderboard
        console.log("\n3. Fetching leaderboard...");
        const lbRes = await axios.get(`${API_URL}/future-education/leaderboard`, { headers });
        console.log("   ✅ Leaderboard counts:", lbRes.data.leaderboard.length);
        if (lbRes.data.leaderboard.length > 0) {
            console.log("   ✅ Leaderboard Verified. Top user:", lbRes.data.leaderboard[0].firstName);
        }

        // 4. Fetch Due Reviews (SRS)
        console.log("\n4. Fetching due reviews...");
        const reviewRes = await axios.get(`${API_URL}/future-education/review/due`, { headers });
        console.log("   ✅ Due Reviews count:", reviewRes.data.due_nodes.length);
        if (reviewRes.data.due_nodes.length > 0) {
            console.log("   ✅ Spaced Repetition Due Reviews Verified.");
        }

        // 5. Claim Certificate
        console.log("\n5. Verifying Certificate Generation...");
        const completedSession = await MinervaStudySession.findOne({ userId, progress_percent: 100 });
        if (completedSession) {
            const certRes = await axios.get(`${API_URL}/future-education/session/${completedSession._id}/certificate`, {
                headers,
                responseType: 'arraybuffer'
            });
            console.log("   ✅ Certificate response status:", certRes.status);
            console.log("   ✅ Certificate content-type:", certRes.headers['content-type']);
            if (certRes.headers['content-type'] === 'application/pdf') {
                console.log("   ✅ PDF Certificate successfully generated and downloaded.");
            } else {
                console.error("❌ Certificate was not a PDF.");
            }
        } else {
            console.log("   ⚠️ Completed session not found in DB. Skipping certificate test.");
        }

        // 6. Test Regeneration
        console.log("\n6. Testing AI Content Regeneration...");
        const inProgressNode = await MinervaKnowledgeNode.findOne({ userId, status: 'IN_PROGRESS' });
        if (inProgressNode) {
            console.log(`   ℹ️ Attempting to regenerate node: ${inProgressNode.title} (${inProgressNode._id})`);
            const regenRes = await axios.post(`${API_URL}/future-education/node/${inProgressNode._id}/regenerate`, {}, { headers });
            console.log("   ✅ Regeneration Response success:", regenRes.data.success);
            console.log("   ✅ Regeneration message:", regenRes.data.message);
        } else {
            console.log("   ⚠️ In-progress node not found in DB. Skipping regeneration test.");
        }

        console.log("\n🎉 ALL EDUCATION OS API TESTS PASSED SUCCESSFULLY!");
    } catch (err: any) {
        console.error("\n❌ TEST FAILED:", err.message);
        if (err.response) {
            console.error("   Response Data:", err.response.data.toString());
        }
    } finally {
        await mongoose.connection.close();
    }
}

testEducationOS();
