import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kanjiyaparas2002_db_user:B7s6IUNngw5AVfAS@cluster0.1hl7shv.mongodb.net/futurebilder_tool?retryWrites=true&w=majority';

async function clearTeacherData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        // 1. Purge Teacher Assignments
        const assignmentsRes = await db.collection('teacherassignments').deleteMany({});
        console.log(`Cleared ${assignmentsRes.deletedCount} teacher assignments.`);

        // 2. Purge Homework Submissions
        const submissionsRes = await db.collection('homeworksubmissions').deleteMany({});
        console.log(`Cleared ${submissionsRes.deletedCount} homework submissions.`);

        // 3. Purge Timetables & Schedules
        const timetablesRes = await db.collection('timetableschedules').deleteMany({});
        console.log(`Cleared ${timetablesRes.deletedCount} timetable schedules.`);

        // 4. Purge Attendance Records
        const attendanceRes = await db.collection('attendancerecords').deleteMany({});
        console.log(`Cleared ${attendanceRes.deletedCount} attendance records.`);

        // 5. Purge Exam Papers & Live Rooms
        const examPapersRes = await db.collection('teacherexampapers').deleteMany({});
        console.log(`Cleared ${examPapersRes.deletedCount} teacher exam papers.`);

        const liveRoomsRes = await db.collection('liveexamrooms').deleteMany({});
        console.log(`Cleared ${liveRoomsRes.deletedCount} live exam rooms.`);

        // 6. Purge School Calendar Events
        const calendarRes = await db.collection('schoolcalendarevents').deleteMany({});
        console.log(`Cleared ${calendarRes.deletedCount} school calendar events.`);

        // 7. Reset Teacher Accounts in Users Collection
        const teacherUsersRes = await db.collection('users').deleteMany({ role: 'teacher' });
        console.log(`Cleared ${teacherUsersRes.deletedCount} teacher user accounts.`);

        console.log('\n✅ ALL TEACHER DATA WIPED CLEAN! Starting 100% fresh from 0.');
        process.exit(0);
    } catch (err) {
        console.error('Error clearing teacher data:', err);
        process.exit(1);
    }
}

clearTeacherData();
