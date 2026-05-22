const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/fueture_db');
        console.log('Connected to DB');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check if there are any errors logged in some collection?
        // Let's check experience
        const Experience = mongoose.connection.db.collection('experiences');
        const count = await Experience.countDocuments();
        console.log('Experiences count:', count);
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
