import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { getCombinedMinervaResponse } from '../modules/minerva/minerva.service';
import User from '../modules/auth/user.model';
import MinervaStudentProfile from '../modules/minerva/models/minerva_student_profile.model';

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
        const user = await User.findOne();
        if (!user) {
            console.error("No user found in database! Please ensure at least one user exists.");
            return;
        }
        
        let profile = await MinervaStudentProfile.findOne({ userId: user._id });
        if (!profile) {
            console.log("No profile found, creating a mock one...");
            profile = new MinervaStudentProfile({
                userId: user._id,
                grade_level: 'class_10',
                board: 'cbse',
                medium: 'hindi',
                onboarding_status: 'COMPLETED'
            });
        }
        
        const topics = [
            "Ohm's Law samjhao",
            "Acid-Base Titration laboratory process",
            "y = sin(x) ka curve kya hota hai math me"
        ];

        for (const topic of topics) {
            console.log(`\n======================================================`);
            console.log(`TESTING TOPIC: "${topic}"`);
            console.log(`======================================================`);
            const result = await getCombinedMinervaResponse(topic, profile, []);
            console.log(`Intent detected: ${result?.intent?.intent}`);
            console.log(`Subject detected: ${result?.metadata?.lab_config?.subject}`);
            console.log(`Interactive Config:`, JSON.stringify(result?.metadata?.lab_config?.interactive_config, null, 2));
            console.log(`Content Layers:`, JSON.stringify(result?.metadata?.lab_config?.content_layers, null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
