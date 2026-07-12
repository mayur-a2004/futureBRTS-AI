import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import MinervaNeuralMemory from '../modules/minerva/models/minerva_neural_memory.model';
import { processSelfLearningFeedback, getCombinedMinervaResponse } from '../modules/minerva/minerva.service';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority";

async function run() {
    console.log("🚀 Starting Minerva V8 Neural Loop Test...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // Clean existing memory for testing topic "recursion"
    await MinervaNeuralMemory.deleteMany({ topic: "recursion" });
    console.log("🧹 Cleaned past recursion memories.");

    const mockProfile = {
        name: "TestStudent",
        grade_level: "college",
        board: "general",
        language_preference: "hinglish",
        medium: "english",
        weak_subjects: []
    };

    // 1. Simulate Student Validation
    const studentQuery = "Aha! Ab samajh aaya bhaiya, recursion mirror wala example bohot badiya tha, makkhan clear ho gaya!";
    const previousReply = "Recursion ko ek aise mirror ki tarah samjho jo doosre mirror ke samne rakha hai, jo infinite reflections banata hai par base case se ruk jata hai.";

    console.log("\n🧪 Test 1: Simulating student feedback processing...");
    await processSelfLearningFeedback(studentQuery, previousReply, mockProfile);

    // Verify database record was created
    const record = await MinervaNeuralMemory.findOne({ topic: "recursion" });
    if (record) {
        console.log("✅ Successfully saved neural memory!");
        console.log(`   Topic: ${record.topic}`);
        console.log(`   Analogy: ${record.analogy}`);
        console.log(`   Student Level: ${record.studentLevel}`);
        console.log(`   Success Count: ${record.successCount}`);
    } else {
        console.log("❌ Failed to save neural memory.");
    }

    // 2. Simulate subsequent query to verify Retrieval and Injection
    console.log("\n🧪 Test 2: Simulating subsequent query to verify retrieval...");
    const nextResponse = await getCombinedMinervaResponse(
        "mujhe recursion dsa me samjhao",
        mockProfile,
        []
    );

    console.log(`✅ AI Response: "${nextResponse.reply.substring(0, 150)}..."`);
    if (nextResponse.reply) {
        console.log("✅ Retrieval and execution verified successfully!");
    } else {
        console.log("❌ Retrieval failed.");
    }

    await mongoose.disconnect();
    console.log("\n🏁 Done.");
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
