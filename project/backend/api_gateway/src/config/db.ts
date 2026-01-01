// 👉 Ye file MongoDB database ke saath connection establish karti hai
// 👉 Mongoose library ka use karke hum clustering aur models connect karte hain

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/futurebilder';
    // Fix for Node >= 17 using IPv6 for localhost by default
    if (uri.includes('localhost')) {
        uri = uri.replace('localhost', '127.0.0.1');
    }
    try {
        await mongoose.connect(uri, {});
        console.log('MongoDB Connected:', uri);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
