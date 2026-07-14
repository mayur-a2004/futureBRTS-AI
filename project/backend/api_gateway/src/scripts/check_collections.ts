import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkCollections = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(`\nFound ${collections.length} collections:`);

        for (const col of collections) {
            const name = col.name;
            const count = await db.collection(name).countDocuments({});
            console.log(`- ${name}: ${count} documents`);
        }

        console.log('\n--- User Details ---');
        const users = await db.collection('users').find({}).toArray();
        for (const user of users) {
            console.log(`Email: ${user.email}`);
            console.log(`  onboarding_status: ${user.onboarding_status}`);
            console.log(`  onboardingCompleted: ${user.onboardingCompleted}`);
            console.log(`  xp: ${user.xp}, level: ${user.level}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkCollections();
