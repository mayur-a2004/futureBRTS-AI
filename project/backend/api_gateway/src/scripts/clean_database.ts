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
            if (name === 'users' || name === 'systemsettings' || name === 'pricingplans' || name === 'paymentgateways') {
                console.log(`🛡️ Preserving critical collection: '${name}' (no documents deleted).`);
            } else {
                // Clear all other collections (matches, exams, notes, tasks, etc.)
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
