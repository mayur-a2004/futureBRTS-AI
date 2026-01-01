import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from './src/models/Setting';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/futurebilder');
        console.log("Connected to Mongo for Seeding...");

        const settings = [
            { key: 'feature_payments', value: true, description: 'Enable payments module' },
            { key: 'ui.header', value: { title: "Futurebilder", icon: "" }, description: 'Header config' }
        ];

        for (const s of settings) {
            await Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true });
            console.log(`Seeded: ${s.key}`);
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
