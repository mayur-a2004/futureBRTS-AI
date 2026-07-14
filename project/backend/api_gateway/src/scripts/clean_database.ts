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

        // 🔄 Reset onboarding and stats for all users
        const userRes = await db.collection('users').updateMany({}, {
            $set: {
                onboarding_status: 'NOT_STARTED',
                onboardingCompleted: false,
                xp: 0,
                level: 1,
                badges: [],
                battleStats: {
                    totalBattles: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    totalDamageDealt: 0,
                    longestStreak: 0
                },
                tokenBalance: 1000,
                isPremium: false,
                subscriptionTier: 'free',
                adConsumptionCount: 0
            }
        });
        console.log(`🔄 Reset onboarding and stats for ${userRes.modifiedCount} users.`);

        console.log('✨ Database clean-up process completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to clean database:', err);
        process.exit(1);
    }
};

cleanDatabase();
