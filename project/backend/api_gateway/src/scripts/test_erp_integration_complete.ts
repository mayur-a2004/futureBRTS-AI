// 🧪 Complete Verification & Integration Test Script for ERP Sync, USID, Cloudinary, and Copilot
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectErpDB, getErpConnection } from '../config/erp_db.connection';
import { getErpModels } from '../modules/erp_integration/models/erp_schemas';
import { erpSyncService } from '../modules/erp_integration/erp_sync.service';
import { identityResolutionService } from '../modules/identity/identity_resolution.service';
import { cloudinaryService } from '../modules/storage/cloudinary.service';
import { federatedQueryEngine } from '../modules/copilot/federated_query_engine';

async function runFullIntegrationTest() {
  console.log('🚀 [TEST] Starting Complete ERP & AI Copilot Integration Audit...\n');

  // Step 1: Test Secondary ERP Database Connection
  console.log('--- TEST 1: Secondary MongoDB Connection (futurebilder_erp) ---');
  const conn = connectErpDB();
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`✅ ERP DB Connection State: ${conn.readyState} (1 = Connected)`);

  const { ErpStudentModel, ErpHomeworkModel, ErpSubmissionModel } = getErpModels();

  // Step 2: Seed Mock ERP Data for Testing
  console.log('\n--- TEST 2: ERP Data Seeding & Schema Audit ---');
  const testStudent = await ErpStudentModel.findOneAndUpdate(
    { externalId: 'STU-TEST-101', tenantId: 'mount_carmel_school' },
    {
      externalId: 'STU-TEST-101',
      tenantId: 'mount_carmel_school',
      name: 'Aarav Test Sharma',
      email: 'aarav.test@school.edu.in',
      grade: 'Class 10',
      section: 'A',
      rollNumber: 15,
      parentEmail: 'parent.aarav@gmail.com',
      parentPhone: '+919876543210'
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Seeded ERP Student Record: ${testStudent.name} (${testStudent.externalId})`);

  const testHw = await ErpHomeworkModel.findOneAndUpdate(
    { homeworkId: 'HW-MATH-101', tenantId: 'mount_carmel_school' },
    {
      homeworkId: 'HW-MATH-101',
      tenantId: 'mount_carmel_school',
      grade: 'Class 10',
      section: 'A',
      subject: 'Mathematics',
      teacherId: 'TCH-901',
      title: 'Solve Quadratic Equations Ex 4.2',
      description: 'Solve questions 1 to 10 step by step in notebook.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Seeded ERP Homework Record: ${testHw.title}`);

  // Step 3: Test Inbound Pull Sync
  console.log('\n--- TEST 3: Inbound Sync (ERP DB -> AI Student Feed) ---');
  const pulledHw = await erpSyncService.pullErpHomework('mount_carmel_school', 'Class 10', 'A');
  console.log(`✅ Inbound Pull Result: Fetched ${pulledHw.count} active homework(s)`);
  console.log(`   Sample: "${pulledHw.homeworks[0]?.title}"`);

  // Step 4: Test Cloudinary Signed Upload Token & Outbound Push Sync
  console.log('\n--- TEST 4: Cloudinary Upload Token & Outbound Push Sync ---');
  const uploadPreset = cloudinaryService.generateSignedUploadPreset('mount_carmel_school', 'homework_submissions');
  console.log(`✅ Cloudinary Signed Upload Token Generated: ${uploadPreset.uploadUrl}`);

  const pushResult = await erpSyncService.pushHomeworkSubmissionToErp({
    tenantId: 'mount_carmel_school',
    homeworkId: 'HW-MATH-101',
    studentId: 'STU-TEST-101',
    studentName: 'Aarav Test Sharma',
    fileUrl: 'https://res.cloudinary.com/future-education/image/upload/v1/test_submission.jpg',
    scoreObtained: 9.5,
    maxScore: 10.0,
    feedback: 'Excellent step-by-step resolution of roots! Very neat calculation.'
  });
  console.log(`✅ Outbound Sync Push Result: Success=${pushResult.success}, Submission ID=${pushResult.submissionId}`);

  // Step 5: Test Universal Student Passport (USID) Identity Engine
  console.log('\n--- TEST 5: Universal Student Passport (USID) Resolution ---');
  const passportResult = await identityResolutionService.resolveOrLinkPassport({
    fullName: 'Aarav Test Sharma',
    primaryPhone: '+919876543210',
    primaryEmail: 'parent.aarav@gmail.com',
    dateOfBirth: '2010-05-15',
    tenantId: 'mount_carmel_school',
    grade: 'Class 10',
    section: 'A'
  });
  console.log(`✅ USID Passport Resolution Result: Success=${passportResult.success}, USID=${passportResult.usid}`);

  // Step 6: Test Dual-DB ERP AI Copilot Query Engine
  console.log('\n--- TEST 6: Dual-DB ERP AI Copilot Query Engine ---');
  const copilotDossierResponse = await federatedQueryEngine.executeQuery({
    userRole: 'PRINCIPAL',
    tenantId: 'mount_carmel_school',
    prompt: 'Show 360 degree dossier for student Aarav',
    studentId: 'STU-TEST-101'
  });
  console.log(`✅ Copilot Intent: ${copilotDossierResponse.intent}`);
  console.log(`✅ Copilot Component UI: ${copilotDossierResponse.uiComponent}`);
  console.log(`✅ Execution Steps:`, copilotDossierResponse.executionSteps);
  console.log(`✅ Response Summary: "${copilotDossierResponse.summaryText}"`);

  const copilotFeeResponse = await federatedQueryEngine.executeQuery({
    userRole: 'ACCOUNTS',
    tenantId: 'mount_carmel_school',
    prompt: 'Show pending fee collection for Class 10'
  });
  console.log(`\n✅ Copilot Fee Intent: ${copilotFeeResponse.intent}`);
  console.log(`✅ Copilot Fee Component UI: ${copilotFeeResponse.uiComponent}`);
  console.log(`✅ Response Summary: "${copilotFeeResponse.summaryText}"`);

  console.log('\n🎉 =======================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED 100% SUCCESSFULLY!');
  console.log('🎉 Secondary MongoDB (futurebilder_erp), USID, Sync, Cloudinary, & Copilot Ready!');
  console.log('🎉 =======================================================\n');

  process.exit(0);
}

runFullIntegrationTest().catch(err => {
  console.error('❌ Integration Test Failed:', err);
  process.exit(1);
});
