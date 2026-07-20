import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanMinervaStudyData = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for cleaning study data...');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed.');
        }

        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} total collections in database.`);

        // Collections to strictly PRESERVE (no user accounts, profiles, or system configs touched)
        const preserveCollections = [
            'users',
            'minervastudentprofiles',
            'minerva_student_profiles',
            'systemsettings',
            'pricingplans',
            'paymentgateways'
        ];

        // Collections specifically targeted for cleaning
        const targetStudyCollections = [
            'minervabuildermaterials',
            'minerva_builder_materials',
            'minervatasks',
            'minerva_tasks',
            'minervastudysessions',
            'minerva_study_sessions',
            'minervaknowledgenodes',
            'minerva_knowledge_nodes',
            'minervaexams',
            'minerva_exams',
            'arenarooms',
            'arena_rooms',
            'minervastudytimelogs',
            'minerva_study_time_logs',
            'minervachatmessages',
            'minerva_chat_messages',
            'minervachatsessions',
            'minerva_chat_sessions'
        ];

        let totalDeletedDocs = 0;

        for (const col of collections) {
            const name = col.name;
            const nameLower = name.toLowerCase();

            if (preserveCollections.includes(nameLower)) {
                console.log(`🛡️ PRESERVED: '${name}' (user accounts & system configs kept safe).`);
                continue;
            }

            // Wipe study data collections or targeted collections
            if (targetStudyCollections.includes(nameLower) || nameLower.includes('session') || nameLower.includes('task') || nameLower.includes('builder') || nameLower.includes('exam') || nameLower.includes('node') || nameLower.includes('arena') || nameLower.includes('chat')) {
                const res = await db.collection(name).deleteMany({});
                console.log(`🧹 CLEANED collection '${name}': Deleted ${res.deletedCount} items.`);
                totalDeletedDocs += res.deletedCount;
            } else {
                console.log(`ℹ️ SKIPPED collection '${name}'.`);
            }
        }

        console.log(`\n✨ Data clean-up process completed! Total ${totalDeletedDocs} study items deleted.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to clean database:', err);
        process.exit(1);
    }
};

cleanMinervaStudyData();
