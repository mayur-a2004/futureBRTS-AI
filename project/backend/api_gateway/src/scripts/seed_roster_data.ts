import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function seedData() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const usersCol = mongoose.connection.collection('users');
  const tenantCol = mongoose.connection.collection('tenantusers');

  // 1. Seed Teacher: divyang kachhdiya
  const teacherEmail = 'divyang05@gmail.com';
  const teacherData = {
    firstName: 'divyang',
    lastName: 'kachhdiya',
    email: teacherEmail,
    role: 'TEACHER',
    userType: 'TEACHER',
    roleInSchool: 'TEACHER',
    isTeacher: true,
    schoolName: 'LDRP Institute of Technology & Research',
    school_name: 'LDRP Institute of Technology & Research',
    tenantOrgId: 'ldrp_institute_of_technology__research',
    assignedClasses: ['11 Commerce-A', '10-A'],
    assignedSubjects: ['Accountancy', 'Mathematics'],
    subject: 'Accountancy',
    teacherDetails: {
      schoolName: 'LDRP Institute of Technology & Research',
      assignedClasses: ['11 Commerce-A', '10-A'],
      assignedSubjects: ['Accountancy', 'Mathematics'],
      subject: 'Accountancy',
      assignedClassObjects: [
        { classId: '11 Commerce-A', standard: '11', stream: 'Commerce', section: 'A', subject: 'Accountancy' },
        { classId: '10-A', standard: '10', stream: '', section: 'A', subject: 'Mathematics' }
      ]
    },
    updatedAt: new Date()
  };

  await usersCol.updateOne(
    { email: teacherEmail },
    { $set: teacherData },
    { upsert: true }
  );
  console.log('✅ Teacher divyang kachhdiya updated/created in User collection');

  // 2. Seed Student: 21H058_MAYUR SAVALIYA
  const studentEmail = 'mayur@gmail.com';
  const studentData = {
    firstName: '21H058_MAYUR',
    lastName: 'SAVALIYA',
    email: studentEmail,
    role: 'STUDENT',
    isSchoolStudent: true,
    schoolName: 'LDRP Institute of Technology & Research',
    school_name: 'LDRP Institute of Technology & Research',
    tenantOrgId: 'ldrp_institute_of_technology__research',
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

  await usersCol.updateOne(
    { email: studentEmail },
    { $set: studentData },
    { upsert: true }
  );
  console.log('✅ Student Mayur Savaliya updated/created in User collection');

  // 3. Upsert TenantUserModel for Roster Instant Match
  const tenantStudentData = {
    externalId: (await usersCol.findOne({ email: studentEmail }))?._id.toString(),
    tenantOrgId: 'ldrp_institute_of_technology__research',
    name: '21H058_MAYUR SAVALIYA',
    email: studentEmail,
    role: 'STUDENT',
    isSchoolStudent: true,
    schoolName: 'LDRP Institute of Technology & Research',
    classId: '11 Commerce-A',
    grade: 'Class 11',
    section: 'A',
    stream: 'Commerce',
    rollNumber: '01',
    enrollmentNo: 'EN123-1212',
    board: 'GSEB',
    medium: 'Gujarati',
    status: 'ACTIVE',
    updatedAt: new Date()
  };

  await tenantCol.updateOne(
    { email: studentEmail },
    { $set: tenantStudentData },
    { upsert: true }
  );
  console.log('✅ TenantUserModel student roster sync created');

  await mongoose.disconnect();
  console.log('🎉 Seed Completed Successfully!');
}

seedData().catch(console.error);
