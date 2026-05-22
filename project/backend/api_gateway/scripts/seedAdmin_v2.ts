import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/modules/auth/user.model';
import Roadmap from '../src/modules/roadmap/roadmap.model';
import Task from '../src/modules/roadmap/task.model';
import Session from '../src/modules/builder/session.model';
import TaskLog from '../src/modules/roadmap/task-log.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdminData = async () => {
    try {
        console.log("🚀 Initializing Genesis Core Data Seeding...");
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db');
        console.log("✅ Neural Link Established (MongoDB Connected)");

        // 1. Create Admin User
        const adminEmail = "admin@futurebrts.com";
        const existingAdmin = await User.findOne({ email: adminEmail });

        let adminId;
        if (!existingAdmin) {
            const admin = await User.create({
                firstName: "Supreme",
                lastName: "architect",
                email: adminEmail,
                passwordHash: "test_hash", // Ideally use bcrypt
                role: "admin",
                status: "active",
                tokenBalance: 999999,
                onboardingCompleted: true,
                onboarding_status: "DONE",
                provider: "local"
            });
            adminId = admin._id;
            console.log("✅ Admin Asset Provisioned.");
        } else {
            existingAdmin.role = "admin";
            await existingAdmin.save();
            adminId = existingAdmin._id;
            console.log("ℹ️ Admin Asset Already Exists. Permissions Verified.");
        }

        // 2. Create Dummy User
        const userEmail = "builder@example.com";
        const existingUser = await User.findOne({ email: userEmail });
        let userId;
        if (!existingUser) {
            const user = await User.create({
                firstName: "John",
                lastName: "Builder",
                email: userEmail,
                passwordHash: "test_hash",
                role: "user",
                status: "active",
                tokenBalance: 1000,
                onboardingCompleted: true,
                onboarding_status: "DONE",
                provider: "local"
            });
            userId = user._id;
            console.log("✅ Test User Provisioned.");
        } else {
            userId = existingUser._id;
        }

        // 3. Create Dummy Session & Roadmap
        const sessionCount = await Session.countDocuments();
        if (sessionCount === 0) {
            const session = await Session.create({
                userId,
                title: "Fullstack Architect Path",
                status: "completed",
                summary: "Learning path for modern fullstack development with Next.js and Node.js."
            });

            const roadmap = await Roadmap.create({
                userId,
                sessionId: session._id,
                title: "Mastering Next.js 15 & Genesis Backend",
                description: "Deep dive into reactive architecture and neural API design.",
                progress: 45,
                steps: [
                    { stepNumber: 1, title: "Foundation Layer", description: "Setup core environment", isLocked: false, state: 'UNLOCKED' },
                    { stepNumber: 2, title: "Neural Logic", description: "Implement AI routing", isLocked: true, state: 'LOCKED' }
                ]
            });

            // 4. Create Dummy Tasks
            await Task.create([
                {
                    userId,
                    roadmapId: roadmap._id,
                    roadmapStepId: roadmap.steps[0]._id,
                    title: "Initialize Backend Repository",
                    description: "Set up Express and Mongoose architecture.",
                    status: "done",
                    dayNumber: 1,
                    difficulty_level: 2,
                    isLocked: false,
                    verification: { required: false, isVerified: true }
                },
                {
                    userId,
                    roadmapId: roadmap._id,
                    roadmapStepId: roadmap.steps[0]._id,
                    title: "Implement Auth Shield",
                    description: "Develop JWT and Role-Based Guard.",
                    status: "doing",
                    dayNumber: 1,
                    difficulty_level: 4,
                    isLocked: false,
                    verification: {
                        required: true,
                        isVerified: false,
                        type: "VIVA_MCQ",
                        questions: [
                            { id: "q1", question: "What is JWT?", type: "mcq", options: ["A", "B"], correctAnswer: "A" }
                        ]
                    }
                }
            ]);

            // 5. Create Logs
            await TaskLog.create({
                userId,
                taskId: new mongoose.Types.ObjectId(),
                action: 'verified'
            });

            console.log("✅ Dummy Telemetry & Performance Units Synced.");
        }

        console.log("\n🚀 Genesis Command Center Ready for Deployment.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Link Failure:", err);
        process.exit(1);
    }
};

seedAdminData();
