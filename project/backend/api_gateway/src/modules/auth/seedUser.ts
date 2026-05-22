import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './user.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedUser = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'mayur@gmail.com';
        const password = '123'; // Simple password for testing
        const passwordHash = await bcrypt.hash(password, 10);

        await User.deleteMany({ email });

        await User.create({
            firstName: 'Mayur',
            lastName: 'Savaliya',
            email: email,
            passwordHash: passwordHash,
            provider: 'local',
            onboardingCompleted: true,
            role: 'admin',
            tokenBalance: 10000
        });

        console.log(`User ${email} created with password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUser();
