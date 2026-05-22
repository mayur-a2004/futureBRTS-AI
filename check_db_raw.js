const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'project/backend/api_gateway/.env') });

async function checkDB() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        console.log("Connecting to:", mongoUri);
        await mongoose.connect(mongoUri);
        console.log("Connected to DB");

        const targetId = "6968bf96414b89af96b85366";
        const db = mongoose.connection.db;

        // Try roadmaps
        const roadmap = await db.collection('roadmaps').findOne({ _id: new mongoose.Types.ObjectId(targetId) });
        console.log("Roadmap in 'roadmaps' collection:", roadmap ? roadmap.title : "Not Found");

        // Try tasks
        const task = await db.collection('tasks').findOne({ _id: new mongoose.Types.ObjectId(targetId) });
        console.log("Task in 'tasks' collection:", task ? task.title : "Not Found");

        // Try sessions
        const session = await db.collection('sessions').findOne({ _id: new mongoose.Types.ObjectId(targetId) });
        console.log("Session in 'sessions' collection:", session ? session.title : "Not Found");

        // List collections
        const collections = await db.listCollections().toArray();
        console.log("Collections in DB:", collections.map(c => c.name));

        if (roadmap) {
            const tasksCount = await db.collection('tasks').countDocuments({ roadmapId: roadmap._id });
            console.log("Tasks for this Roadmap ID:", tasksCount);
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkDB();
