import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB...');

        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email: 'mayur@gmail.com' });
        if (user) {
            const userId = user._id;
            const res = await db.collection('tasks').deleteMany({
                userId,
                $or: [
                    { roadmapId: null },
                    { roadmapId: { $exists: false } }
                ]
            });
            console.log(`🧹 Successfully deleted ${res.deletedCount} manual tasks for user: mayur@gmail.com`);
        } else {
            console.log('❌ User mayur@gmail.com not found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
