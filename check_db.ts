import mongoose from 'mongoose';
import Roadmap from './project/backend/api_gateway/src/modules/roadmap/roadmap.model';
import Task from './project/backend/api_gateway/src/modules/roadmap/task.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './project/backend/api_gateway/.env' });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
        console.log("Connected to DB");

        const targetId = "6968bf96414b89af96b85366";

        const roadmap = await Roadmap.findById(targetId);
        console.log("Roadmap Found:", roadmap ? roadmap.title : "Not Found");

        if (roadmap) {
            console.log("Roadmap Steps Count:", roadmap.steps?.length);
            const tasks = await Task.find({ roadmapId: roadmap._id });
            console.log("Tasks Found for this Roadmap:", tasks.length);
        } else {
            // Check if it's a Task ID
            const task = await Task.findById(targetId);
            console.log("Task Found:", task ? task.title : "Not Found");
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

checkDB();
