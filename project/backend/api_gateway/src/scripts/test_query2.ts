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
        const user = await User.findOne({ email: 'mayur@gmail.com' });
        if (!user) {
            console.error("User not found!");
            return;
        }
        
        let profile = await MinervaStudentProfile.findOne({ userId: user._id });
        
        console.log("Calling getCombinedMinervaResponse...");
        const result = await getCombinedMinervaResponse(
            "linked list kya hota hai simple term me dsa me samjhao",
            profile,
            []
        );
        
        console.log("Chat Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
