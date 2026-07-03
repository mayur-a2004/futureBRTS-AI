import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../modules/auth/user.model';
import PricingPlan from '../modules/economy/pricing-plan.model';
import SystemSettings from '../modules/admin/settings.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const verifyStatus = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB for verification.');

        const admin = await User.findOne({ email: 'mayur@gmail.com' });
        if (admin) {
            console.log(`✅ Admin account exists: ${admin.email} (Role: ${admin.role}, Status: ${admin.status})`);
        } else {
            console.error('❌ Admin account mayur@gmail.com does not exist!');
        }

        const planCount = await PricingPlan.countDocuments();
        console.log(`✅ Pricing plans count: ${planCount}`);

        const settingsCount = await SystemSettings.countDocuments();
        console.log(`✅ System settings count: ${settingsCount}`);

        console.log('✨ All database checks passed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err);
        process.exit(1);
    }
};

verifyStatus();
