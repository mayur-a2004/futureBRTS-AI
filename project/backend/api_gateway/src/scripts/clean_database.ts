import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for cleaning...');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collections.`);

        for (const col of collections) {
            const name = col.name;
            if (name === 'users') {
                // Keep only mayur@gmail.com and delete all other user profiles
                const res = await db.collection(name).deleteMany({ email: { $ne: 'mayur@gmail.com' } });
                console.log(`🧹 Cleaned 'users' collection: Deleted ${res.deletedCount} test accounts.`);
            } else if (name === 'systemsettings' || name === 'pricingplans' || name === 'paymentgateways') {
                // Delete seeded settings/pricing configs so they are freshly re-seeded by server reboot
                await db.collection(name).deleteMany({});
                console.log(`🧹 Cleared configuration collection '${name}' for dynamic re-seeding.`);
            } else {
                // Clear all chat sessions, history, roadmaps, exams, and visitor tracking logs
                const res = await db.collection(name).deleteMany({});
                console.log(`🧹 Wiped collection '${name}': Deleted ${res.deletedCount} items.`);
            }
        }

        console.log('✨ Database clean-up process completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to clean database:', err);
        process.exit(1);
    }
};

cleanDatabase();
