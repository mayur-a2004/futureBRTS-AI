import mongoose from 'mongoose';
import { TeacherPortalService } from '../modules/tenant/teacher_portal.service';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function testRosterQueries() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for Service Tests');

  // 1. Test getClassStudentsRoster for Teacher divyang kachhdiya (Class 11 Commerce-A)
  console.log('\n--- TESTING getClassStudentsRoster with "11 Commerce-A" ---');
  const roster1 = await TeacherPortalService.getClassStudentsRoster(
    'ldrp_institute_of_technology__research',
    '11 Commerce-A',
    'LDRP Institute of Technology & Research'
  );
  console.log(`Roster1 Result Count: ${roster1.length}`);

  console.log('\n--- TESTING getClassStudentsRoster with "11-A" ---');
  const roster2 = await TeacherPortalService.getClassStudentsRoster(
    'ldrp_institute_of_technology__research',
    '11-A',
    'LDRP Institute of Technology & Research'
  );
  console.log(`Roster2 Result Count: ${roster2.length}`);
  console.log(JSON.stringify(roster2, null, 2));

  // 2. Test getStudentAssignedTeachers for Student Mayur Savaliya
  console.log('\n--- TESTING getStudentAssignedTeachers ---');
  const teachers = await TeacherPortalService.getStudentAssignedTeachers({
    schoolName: 'LDRP Institute of Technology & Research',
    standard: '11',
    section: 'A'
  });
  console.log(`Teachers Result Count: ${teachers.length}`);
  console.log(JSON.stringify(teachers, null, 2));

  await mongoose.disconnect();
}

testRosterQueries().catch(console.error);
