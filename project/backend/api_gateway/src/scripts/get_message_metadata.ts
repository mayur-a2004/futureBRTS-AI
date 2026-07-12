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
    
    // Find the latest message in this chat session containing lab_config
    const messages = await mongoose.connection.db.collection('minervachatmessages')
        .find({ chat_session_id: new mongoose.Types.ObjectId('6a533a24abf9dea179c2d0fa') })
        .sort({ createdAt: -1 })
        .toArray();
        
    console.log('Total messages in session:', messages.length);
    const labMessage = messages.find(m => m.metadata?.lab_config);
    if (labMessage) {
        console.log('Found message with lab_config. ID:', labMessage._id);
        console.log('lab_config:', JSON.stringify(labMessage.metadata.lab_config, null, 2));
    } else {
        console.log('No message with lab_config found.');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
