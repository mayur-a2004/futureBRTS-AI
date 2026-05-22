const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017/fueture_db';

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('fueture_db');
        const users = db.collection('users');
        const user = await users.findOne({ email: 'mayur@gmail.com' });
        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User NOT found: mayur@gmail.com');
            const all = await users.find().limit(5).toArray();
            console.log('Total users:', await users.countDocuments());
            console.log('Sample emails:', all.map(u => u.email));
        }
    } finally {
        await client.close();
    }
}

check().catch(console.error);
