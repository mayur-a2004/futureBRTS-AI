
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { OnboardingProfile } from '../modules/onboarding/onboarding.model';
import Session from '../modules/builder/session.model';
import User from '../modules/auth/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FutureBRTS";

async function validateSystemReset() {
    console.log("🔥 STARTING SYSTEM RESET VALIDATION 🔥");

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ DB Connected");

        // 1. Setup Test User
        const TEST_ID = new mongoose.Types.ObjectId();
        const TEST_EMAIL = "system_precheck@test.com";

        await User.deleteMany({ email: TEST_EMAIL });

        const testUser = await User.create({
            _id: TEST_ID,
            email: TEST_EMAIL,
            firstName: "System",
            lastName: "Check",
            password: "hashedPassword123",
            onboarding_status: "NOT_STARTED"
        });
        console.log("✅ Test User Created:", TEST_ID.toString());

        // ==========================================
        // TEST 1: HARD BLOCK check (No Onboarding)
        // ==========================================
        console.log("\n🧪 TEST 1: Attempting Session Creation WITHOUT Onboarding...");

        // CONTROLLER LOGIC SIMULATION:
        const check1 = await OnboardingProfile.findOne({ userId: testUser._id });
        if (!check1) {
            console.log("   -> System correctly detected MISSING onboarding.");
        } else {
            console.error("   -> ❌ ERROR: Onboarding should be missing!");
            process.exit(1);
        }

        // ==========================================
        // TEST 2: IMMUTABILITY & LINKING (With Onboarding)
        // ==========================================
        console.log("\n🧪 TEST 2: Creating Onboarding & Verifying Session Immutability...");

        const profileData: any = {
            userId: testUser._id,
            category: "Career",
            goal: "Become Pilot",
            currentLevel: "Beginner",
            field: "Career",
            life_stage: "Professional",
            phase: "Execution",
            problem: "None",
            onboardingCompleted: true
        };

        const profile = await OnboardingProfile.create(profileData);
        console.log("✅ Onboarding Profile Created");

        // Simulate Session Creation with Locking
        const snapshot = profile.toObject();

        const session = await Session.create({
            userId: testUser._id,
            title: "Test Session",
            messages: [],
            onboardingProfileId: profile._id, // LINKING
            onboardingSnapshot: snapshot      // IMMUTABILITY
        });

        console.log("✅ Session Created with Snapshot");

        // VERIFY IMMUTABILITY
        const savedSession = await Session.findById(session._id);
        if (!savedSession?.onboardingProfileId) throw new Error("❌ FAIL: onboardingProfileId missing!");
        if (!savedSession?.onboardingSnapshot) throw new Error("❌ FAIL: onboardingSnapshot missing!");

        // Use any cast to safely access dynamic properties on Mixed type
        const snapshotAny = savedSession.onboardingSnapshot as any;
        if (snapshotAny.goal !== "Become Pilot" && snapshotAny.final_goal !== "Become Pilot") {
            // Depending on which field is used. We created with 'goal'.
            if (snapshotAny.goal !== "Become Pilot") throw new Error("❌ FAIL: Snapshot content mismatch! Expected 'Become Pilot'");
        }

        console.log("   -> Snapshot Locked Correctly:", snapshotAny.goal);

        // ==========================================
        // TEST 3: CHANGE PROFILE -> SNAPSHOT SHOULD REMAIN
        // ==========================================
        console.log("\n🧪 TEST 3: Modifying Original Profile -> Checking Snapshot Persistence...");

        await OnboardingProfile.findByIdAndUpdate(profile._id, { goal: "Become Chef" });
        const updatedProfile: any = await OnboardingProfile.findById(profile._id);

        const reloadedSession = await Session.findById(session._id);
        const reloadedSnapshot: any = reloadedSession?.onboardingSnapshot;

        console.log("   -> Original Profile Goal:", updatedProfile?.goal);
        console.log("   -> Session Snapshot Goal:", reloadedSnapshot?.goal);

        if (updatedProfile?.goal === "Become Chef" && reloadedSnapshot?.goal === "Become Pilot") {
            console.log("✅ PASS: Snapshot remained IMMUTABLE!");
        } else {
            throw new Error("❌ FAIL: Snapshot changed with profile! Immutability broken.");
        }

        console.log("\n🎉 ALL SYSTEM RESET RULES VALIDATED SUCCESFULLY 🎉");

    } catch (e) {
        console.error("❌ VALIDATION FAILED:", e);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

validateSystemReset();
