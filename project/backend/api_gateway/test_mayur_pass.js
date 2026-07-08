const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const uri = 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';
const secret = 'future_brts_neural_master_key_2025';

const schema = new mongoose.Schema({ email: String, passwordHash: String, firstName: String }, { strict: false });
const User = mongoose.model('User', schema, 'users');

async function run() {
    try {
        await mongoose.connect(uri);
        const user = await User.findOne({ email: 'mayur@gmail.com' });
        if (!user) {
            console.log("Mayur not found!");
            return;
        }
        
        const isMatch = await bcrypt.compare('password123', user.passwordHash);
        console.log("Does password123 match Mayur's hash?", isMatch);

        // Let's generate a valid token for Mayur to print out for testing
        const token = jwt.sign({ id: user._id.toString(), email: user.email }, secret, { expiresIn: '30d' });
        console.log("Valid JWT token for Mayur:", token);
        
        // Also let's check or create a test account test@test.com with password 'password123' if it doesn't exist
        let testUser = await User.findOne({ email: 'test@test.com' });
        if (!testUser) {
            const passwordHash = await bcrypt.hash('password123', 10);
            testUser = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@test.com',
                passwordHash,
                provider: 'local',
                onboardingCompleted: true,
                role: 'student',
                status: 'active',
                tokenBalance: 10000,
                isPremium: false,
                subscriptionTier: 'free'
            });
            console.log("Created test@test.com user successfully!");
        } else {
            console.log("test@test.com user already exists:", testUser._id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

run();
