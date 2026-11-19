import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../modules/auth/user.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/future_brts';

async function restoreAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!');

    const adminEmail = 'admin@futurebrts.com';
    let admin = await User.findOne({ email: adminEmail });

    const passwordHash = await bcrypt.hash('admin123', 10);

    if (admin) {
      admin.role = 'admin';
      admin.status = 'active';
      admin.passwordHash = passwordHash;
      admin.onboardingCompleted = true;
      admin.onboarding_status = 'DONE';
      admin.tokenBalance = 1000000;
      await admin.save();
      console.log('✅ Admin account updated & restored successfully!');
    } else {
      admin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        provider: 'local',
        onboardingCompleted: true,
        onboarding_status: 'DONE',
        tokenBalance: 1000000,
        isPremium: true
      });
      console.log('✅ New Super Admin account created successfully!');
    }

    // Also check if any existing user wants admin rights
    console.log('\n--- Admin Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);
    console.log('-------------------------\n');

  } catch (err) {
    console.error('❌ Error restoring admin account:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB.');
    process.exit(0);
  }
}

restoreAdmin();
