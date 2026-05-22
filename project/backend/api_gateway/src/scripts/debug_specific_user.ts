
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { OnboardingProfile } from '../modules/onboarding/onboarding.model';
import User from '../modules/auth/user.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/FutureBRTS";
const TARGET_EMAIL = "integration_test_1767803977634@test.com";

async function debugUser() {
    try {
        await mongoose.connect(MONGO_URI);

        const user = await User.findOne({ email: TARGET_EMAIL });
        if (!user) {
            console.log("User not found!");
            return;
        }
        console.log(`User found: ${user._id}`);
        console.log(`User.onboardingCompleted: ${user.onboardingCompleted} (${typeof user.onboardingCompleted})`);

        const profiles = await OnboardingProfile.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log(`Found ${profiles.length} profiles.`);

        profiles.forEach((p: any, i) => {
            console.log(`[${i}] ID: ${p._id}`);
            console.log(`    onboardingCompleted: ${p.onboardingCompleted} (Type: ${typeof p.onboardingCompleted})`);
            console.log(`    CreatedAt: ${p.createdAt}`);
            console.log(`    UpdatedAt: ${p.updatedAt}`);
            // Check raw doc
            console.log(`    Raw:`, p.toObject ? p.toObject() : p);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

debugUser();
