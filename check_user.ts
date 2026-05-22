import mongoose from 'mongoose';
import User from './project/backend/api_gateway/src/modules/auth/user.model';
import dotenv from 'dotenv';
dotenv.config({ path: './project/backend/api_gateway/.env' });

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
        const user = await User.findOne({ email: 'mayur@gmail.com' });
        if (user) {
            console.log('User found:', { email: user.email, role: user.role, status: user.status });
        } else {
            console.log('User NOT found: mayur@gmail.com');
            const total = await User.countDocuments();
            console.log('Total users in DB:', total);
            if (total > 0) {
                const someUser = await User.findOne();
                console.log('Sample user:', someUser?.email);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

checkUser();
