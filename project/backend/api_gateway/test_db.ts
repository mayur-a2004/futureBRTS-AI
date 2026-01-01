
import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27017/futurebilder';

(async () => {
    try {
        console.log('Attempting to connect to MongoDB at', uri);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB');
        await mongoose.disconnect();
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB', err);
    }
})();
