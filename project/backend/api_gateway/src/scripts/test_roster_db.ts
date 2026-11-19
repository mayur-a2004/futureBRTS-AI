import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fueture_db';

async function testQuery() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const usersCol = mongoose.connection.collection('users');
  const tenantCol = mongoose.connection.collection('tenantusers');

  const allUsers = await usersCol.find({}).toArray();
  console.log(`=== ALL USERS IN USERS COLLECTION (Total: ${allUsers.length}) ===`);
  allUsers.forEach(u => {
    console.log(`- ${u._id} | ${u.email} | ${u.firstName} ${u.lastName} | role=${u.role} | school=${u.schoolName || u.school_name || u.school} | std=${u.standard} | sec=${u.section} | stream=${u.stream} | classId=${u.classId}`);
    if (u.teacherDetails) {
      console.log(`  teacherDetails:`, JSON.stringify(u.teacherDetails));
    }
  });

  const allTenantUsers = await tenantCol.find({}).toArray();
  console.log(`\n=== ALL TENANT USERS (Total: ${allTenantUsers.length}) ===`);
  allTenantUsers.forEach(tu => {
    console.log(`- ${tu._id} | externalId=${tu.externalId} | name=${tu.name} | email=${tu.email} | role=${tu.role} | school=${tu.schoolName} | grade=${tu.grade} | sec=${tu.section} | classId=${tu.classId} | stream=${tu.stream}`);
  });

  await mongoose.disconnect();
}

testQuery().catch(console.error);
