import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI not found in env!");
    process.exit(1);
}

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB Atlas successfully.');
    
    // Find all sessions
    const sessions = await mongoose.connection.db.collection('minervastudysessions').find({}).sort({ createdAt: -1 }).toArray();
    console.log('Total sessions:', sessions.length);
    for (const sess of sessions) {
        console.log(`Session: ID=${sess._id} Subject="${sess.subject}" Board="${sess.board}" Grade="${sess.grade_level}" CreatedAt=${sess.createdAt}`);
        const nodes = await mongoose.connection.db.collection('minervaknowledgenodes').find({ session_id: sess._id }).toArray();
        console.log(`  Nodes (${nodes.length}):`);
        nodes.forEach(n => {
            console.log(`    - Node ID=${n._id} Title="${n.title}" hasConfig=${!!n.three_js_config}`);
            if (n.three_js_config) {
                console.log('      Config:', JSON.stringify(n.three_js_config, null, 2));
            }
        });
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
