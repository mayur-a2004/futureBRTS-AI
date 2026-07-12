import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../modules/auth/user.model';
import MinervaStudentProfile from '../modules/minerva/models/minerva_student_profile.model';
import MinervaStudySession from '../modules/minerva/models/minerva_study_session.model';
import MinervaKnowledgeNode from '../modules/minerva/models/minerva_knowledge_node.model';
import MinervaTask from '../modules/minerva/models/minerva_task.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fueture_db";
const TEST_EMAIL = "test@test.com";

async function seed() {
    try {
        console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);

        let user = await User.findOne({ email: TEST_EMAIL });
        if (!user) {
            console.log("test@test.com user not found. Creating it...");
            const passwordHash = await bcrypt.hash('password123', 10);
            user = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: TEST_EMAIL,
                passwordHash: passwordHash,
                provider: 'local',
                onboardingCompleted: true,
                role: 'user',
                status: 'active',
                tokenBalance: 1000
            });
            console.log("Created test@test.com user.");
        }

        const userId = user._id.toString();
        console.log(`Found test user: ${userId}`);

        // Update user to have some XP, level 3, and onboardingCompleted
        user.xp = 450;
        user.level = 3;
        user.role = 'user';
        user.onboardingCompleted = true;
        user.onboarding_status = 'DONE';
        // Add a badge to verify the dynamically loaded badges
        user.badges = [
            { name: 'Level 1 Scholar', icon: '🎓', unlockedAt: new Date() }
        ];
        await user.save();
        console.log("Updated test User details.");

        // Ensure MinervaStudentProfile exists
        let profile = await MinervaStudentProfile.findOne({ userId });
        if (!profile) {
            profile = await MinervaStudentProfile.create({
                userId,
                name: "Mayur Test Student",
                education_type: "school",
                grade_level: "class_10",
                board: "cbse",
                language_preference: "hinglish",
                streak_days: 3,
                last_active: new Date(Date.now() - 24 * 3600 * 1000), // Active yesterday
                strong_subjects: ["Physics", "Chemistry"],
                weak_subjects: ["Mathematics"],
                total_study_minutes: 120
            });
            console.log("Created student profile.");
        } else {
            profile.streak_days = 3;
            profile.last_active = new Date(Date.now() - 24 * 3600 * 1000);
            profile.strong_subjects = ["Physics", "Chemistry"];
            profile.weak_subjects = ["Mathematics"];
            await profile.save();
            console.log("Updated existing student profile.");
        }

        // Clean existing sessions & nodes for test user to prevent pollution
        await MinervaStudySession.deleteMany({ userId });
        await MinervaKnowledgeNode.deleteMany({ userId });

        // 1. Create a 100% completed Session (for Certificate verification)
        const completedSession = await MinervaStudySession.create({
            userId,
            subject: "Physics",
            board: "cbse",
            grade_level: "class_10",
            medium: "hinglish",
            title: "Light: Reflection & Refraction",
            description: "Master reflection, spherical mirrors, and refraction rules.",
            status: "active",
            progress_percent: 100,
            exam_ready: true
        });
        console.log(`Created completed session: ${completedSession._id}`);

        // Create knowledge nodes for completedSession
        const node1 = await MinervaKnowledgeNode.create({
            session_id: completedSession._id,
            userId,
            title: "Spherical Mirrors & Reflection",
            topic: "Physics",
            chapter: "Light",
            status: "DONE",
            priority: "HIGH",
            order_index: 1,
            estimated_time_minutes: 15,
            explanation_simple: "Spherical mirror is a mirror with a curved reflecting surface. E.g., Concave and Convex mirrors.",
            explanation_detailed: "Detailed reflection laws, focal length calculations, and ray diagrams.",
            key_points: ["Concave mirrors converge light.", "Convex mirrors diverge light."],
            sr_due_date: new Date(Date.now() - 48 * 3600 * 1000) // Due 2 days ago (SRS review item)
        });

        const node2 = await MinervaKnowledgeNode.create({
            session_id: completedSession._id,
            userId,
            title: "Refractive Index & Snell's Law",
            topic: "Physics",
            chapter: "Light",
            status: "DONE",
            priority: "MEDIUM",
            order_index: 2,
            estimated_time_minutes: 20,
            explanation_simple: "Refractive index measures how much light bends when entering a medium.",
            explanation_detailed: "Snell's Law formula details: n1 * sin(theta1) = n2 * sin(theta2).",
            key_points: ["Bending depends on density.", "Snell's Law determines angle of refraction."],
            sr_due_date: new Date(Date.now() + 24 * 3600 * 1000) // Future due date (Not due yet)
        });

        // 2. Create an In-Progress Session
        const inProgressSession = await MinervaStudySession.create({
            userId,
            subject: "Chemistry",
            board: "cbse",
            grade_level: "class_10",
            medium: "hinglish",
            title: "Chemical Reactions & Equations",
            description: "Understand chemical equations and types of reactions.",
            status: "active",
            progress_percent: 50,
            exam_ready: false
        });
        console.log(`Created in-progress session: ${inProgressSession._id}`);

        await MinervaKnowledgeNode.create({
            session_id: inProgressSession._id,
            userId,
            title: "Types of Chemical Reactions",
            topic: "Chemistry",
            chapter: "Chemical Reactions",
            status: "DONE",
            priority: "HIGH",
            order_index: 1,
            estimated_time_minutes: 15,
            explanation_simple: "Combination, Decomposition, Displacement, and Double Displacement reactions.",
            sr_due_date: new Date(Date.now() - 1000) // Due right now! (SRS review item)
        });

        await MinervaKnowledgeNode.create({
            session_id: inProgressSession._id,
            userId,
            title: "Balancing Chemical Equations",
            topic: "Chemistry",
            chapter: "Chemical Reactions",
            status: "IN_PROGRESS",
            priority: "HIGH",
            order_index: 2,
            estimated_time_minutes: 25,
            explanation_simple: "Hit and trial method to make the number of atoms of each element equal on both sides.",
            sr_due_date: new Date(Date.now() + 5 * 24 * 3600 * 1000)
        });

        console.log("Successfully seeded test education state for test@test.com!");
    } catch (e) {
        console.error("Seeding error:", e);
    } finally {
        await mongoose.connection.close();
    }
}

seed();
