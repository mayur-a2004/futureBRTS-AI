import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function fixAllUserRecords() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for fixing user records');

  const usersCol = mongoose.connection.collection('users');
  const tenantCol = mongoose.connection.collection('tenantusers');

  const schoolName = 'LDRP Institute of Technology & Research';
  const tenantOrgId = 'ldrp_institute_of_technology__research';

  // 1. Update ALL teacher accounts matching divyang or teacher role
  const teacherFilter = {
    $or: [
      { email: /divyang/i },
      { firstName: /divyang/i },
      { role: { $in: ['TEACHER', 'teacher'] } }
    ]
  };

  const teacherUpdate = {
    firstName: 'divyang',
    lastName: 'kachhdiya',
    role: 'TEACHER',
    userType: 'TEACHER',
    roleInSchool: 'TEACHER',
    isTeacher: true,
    schoolName: schoolName,
    school_name: schoolName,
    school: schoolName,
    tenantOrgId: tenantOrgId,
    assignedClasses: ['11 Commerce-A', '10-A', '11-A'],
    assignedSubjects: ['Accountancy', 'Mathematics'],
    subject: 'Accountancy',
    teacherDetails: {
      schoolName: schoolName,
      assignedClasses: ['11 Commerce-A', '10-A', '11-A'],
      assignedSubjects: ['Accountancy', 'Mathematics'],
      subject: 'Accountancy',
      assignedClassObjects: [
        { classId: '11 Commerce-A', standard: '11', stream: 'Commerce', section: 'A', subject: 'Accountancy' },
        { classId: '11-A', standard: '11', stream: 'Commerce', section: 'A', subject: 'Accountancy' },
        { classId: '10-A', standard: '10', stream: '', section: 'A', subject: 'Mathematics' }
      ]
    },
    updatedAt: new Date()
  };

  const teacherRes = await usersCol.updateMany(teacherFilter, { $set: teacherUpdate });
  console.log(`Updated ${teacherRes.modifiedCount} teacher documents in Users collection`);

  // Also ensure divyang06@gmail.com and divyang05@gmail.com exist
  await usersCol.updateOne(
    { email: 'divyang06@gmail.com' },
    { $set: { email: 'divyang06@gmail.com', ...teacherUpdate } },
    { upsert: true }
  );

  // 2. Update ALL student accounts matching Mayur/savaliya/savaliyamayur42@gmail.com
  const studentFilter = {
    $or: [
      { email: /savaliya/i },
      { email: /mayur/i },
      { firstName: /mayur/i },
      { lastName: /savaliya/i }
    ]
  };

  const studentUpdate = {
    role: 'user',
    userType: 'STUDENT',
    isSchoolStudent: true,
    schoolName: schoolName,
    school_name: schoolName,
    school: schoolName,
    tenantOrgId: tenantOrgId,
    standard: '11',
    stream: 'Commerce',
    section: 'A',
    classId: '11 Commerce-A',
    rollNumber: '01',
    enrollmentNo: 'EN123-1212',
    board: 'GSEB',
    medium: 'Gujarati',
    updatedAt: new Date()
  };

  const studentRes = await usersCol.updateMany(studentFilter, { $set: studentUpdate });
  console.log(`Updated ${studentRes.modifiedCount} student documents in Users collection`);

  // 3. Upsert TenantUserModel for all students
  const studentUsers = await usersCol.find(studentFilter).toArray();
  for (const s of studentUsers) {
    const tenantStudentData = {
      externalId: s._id.toString(),
      tenantOrgId: tenantOrgId,
      name: `${s.firstName || 'MAYUR'} ${s.lastName || 'SAVALIYA'}`.trim(),
      email: s.email,
      role: 'STUDENT',
      isSchoolStudent: true,
      schoolName: schoolName,
      classId: '11 Commerce-A',
      grade: 'Class 11',
      section: 'A',
      stream: 'Commerce',
      rollNumber: s.rollNumber || '01',
      enrollmentNo: s.enrollmentNo || 'EN123-1212',
      board: 'GSEB',
      medium: 'Gujarati',
      status: 'ACTIVE',
      updatedAt: new Date()
    };

    await tenantCol.updateOne(
      { email: s.email },
      { $set: tenantStudentData },
      { upsert: true }
    );
    console.log(`Synced TenantUserModel for ${s.email}`);
  }

  await mongoose.disconnect();
  console.log('🎉 Fix completed successfully!');
}

fixAllUserRecords().catch(console.error);
