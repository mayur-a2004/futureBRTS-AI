const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/fueture_db');
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({});
    if (!user) { console.log("No user"); process.exit(1); }
    
    const jwt = require('jsonwebtoken'); 
    const token = jwt.sign({ id: user._id.toString() }, 'dev_secret', { expiresIn: '15m' });
    
    const data = {
        title: 'Test Proj',
        requirements: 'Build a simple web app',
        category: 'GRADUATION', // Changed to GRADUATION
        field: 'Computer Science',
        type: 'Full Stack App',
        technologyStack: {} // Intentionally empty to test F6 validation
    };
    
    const res = await fetch('http://localhost:7001/api/collage-project/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    
    const text = await res.text();
    console.log("RESPONSE HTTP", res.status);
    console.log(text);
    process.exit(0);
}
run();
