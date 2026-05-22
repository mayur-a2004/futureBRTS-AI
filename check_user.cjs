const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/fueture_db';

const schema = new mongoose.Schema({ email: String, status: String }, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function check() {
    try {
        await mongoose.connect(uri);
        const user = await User.findOne({ email: 'mayur@gmail.com' });
        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User NOT found: mayur@gmail.com');
            const total = await User.countDocuments();
            console.log('Total users:', total);
            const all = await User.find().limit(5).select('email');
            console.log('Sample emails:', all.map(u => u.email));
        }
    } finally {
        await mongoose.connection.close();
    }
}

check().catch(console.error);
