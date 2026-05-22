
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { OnboardingProfile } from '../modules/onboarding/onboarding.model';
import User from '../modules/auth/user.model';
import Session from '../modules/builder/session.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FutureBRTS";

async function debugState() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ DB Connected");

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const u of users) {
            const user = u as any;
            console.log(`\nUser: ${user.email} (${user._id})`);
            console.log(`   User Status: ${user.onboarding_status}`);
            console.log(`   User.onboardingCompleted: ${user.onboardingCompleted}`);

            const profile = await OnboardingProfile.findOne({ userId: user._id }).sort({ createdAt: -1 });
            if (profile) {
                const p = profile as any;
                console.log(`   [Profile Found] ID: ${p._id}`);
                console.log(`   Profile.onboardingCompleted: ${p.onboardingCompleted} (Type: ${typeof p.onboardingCompleted})`);
                console.log(`   Profile.goal: ${p.goal}`);
                console.log(`   Profile.target_outcome: ${p.target_outcome}`);
                console.log(`   Profile.final_goal: ${p.final_goal}`);
            } else {
                console.log(`   [!! NO PROFILE FOUND !!]`);
            }

            const sessions = await Session.find({ userId: user._id });
            console.log(`   Sessions: ${sessions.length}`);
            for (const s of sessions) {
                const snap = (s as any).onboardingSnapshot;
                console.log(`      Session: ${s.title} (ID: ${s._id})`);
                console.log(`      Snapshot Present: ${!!snap}`);
                if (snap) {
                    console.log(`      Snapshot.goal: ${snap.goal}`);
                    console.log(`      Snapshot.target_outcome: ${snap.target_outcome}`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

debugState();
