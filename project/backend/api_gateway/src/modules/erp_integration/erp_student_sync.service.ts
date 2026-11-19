// 🔄 Bi-Directional ERP Student Synchronizer & Identity Bridge
// Pulls student academic rosters from B2B School ERP (futurebilder_erp) into AI Gateway DB (futurebilder_tool)

import { getErpConnection } from '../../config/erp_db.connection';
import User from '../auth/user.model';
import bcrypt from 'bcryptjs';

export interface ISyncedStudentResult {
  email: string;
  fullName: string;
  studentId: string;
  grade: string | number;
  section: string;
  rollNumber: string | number;
  enrollmentNo: string;
  schoolName: string;
  board: string;
  status: 'CREATED' | 'UPDATED' | 'FAILED';
  error?: string;
}

export class ErpStudentSyncService {
  /**
   * Syncs all students from futurebilder_erp (student_profiles + users) into futurebilder_tool.users
   * @param defaultPassword Optional password to set/allow for login testing (default: 'password123')
   */
  public async syncAllStudentsFromErp(defaultPassword: string = 'password123'): Promise<{
    success: boolean;
    totalFound: number;
    syncedCount: number;
    results: ISyncedStudentResult[];
  }> {
    const results: ISyncedStudentResult[] = [];
    try {
      const erpConn = getErpConnection();
      if (!erpConn || erpConn.readyState !== 1) {
        console.warn('⚠️ [ErpStudentSync] ERP DB not yet connected. Waiting for connection...');
        await new Promise(r => setTimeout(r, 2000));
      }

      const erpDb = erpConn.db;
      if (!erpDb) {
        throw new Error('ERP Database instance unavailable');
      }

      // 1. Fetch student profiles from ERP
      const studentProfiles = await erpDb.collection('student_profiles').find({}).toArray();
      // 2. Fetch ERP users to get their official emails and passwordHashes
      const erpUsers = await erpDb.collection('users').find({}).toArray();
      const erpUserMap = new Map<string, any>();
      for (const u of erpUsers) {
        if (u.email) erpUserMap.set(u.email.toLowerCase().trim(), u);
        if (u.userId) erpUserMap.set(u.userId.trim(), u);
      }

      console.log(`📡 [ErpStudentSync] Found ${studentProfiles.length} student profiles in ERP DB.`);

      const defaultHash = await bcrypt.hash(defaultPassword, 10);

      for (const sp of studentProfiles) {
        const studentId = sp.studentId || sp.erpUserId || '';
        const rawEmail = sp.parentDetails?.primaryEmail || sp.email || '';
        let email = rawEmail.toLowerCase().trim();

        // If no email in profile, check erpUsers map
        if (!email && studentId && erpUserMap.has(studentId)) {
          email = erpUserMap.get(studentId).email?.toLowerCase().trim() || '';
        }

        // If still no email, generate standardized school student email
        if (!email) {
          const sanitizedName = (sp.fullName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '.');
          const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || Math.floor(Math.random() * 10000);
          email = `${sanitizedName}.${cleanId}@abcschool.edu`;
        }

        const fullName = (sp.fullName || 'Student User').trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

        // Extract class/grade
        const rawClass = sp.currentClassId || '10';
        const gradeMatch = String(rawClass).match(/\d+/);
        const numericGrade = gradeMatch ? parseInt(gradeMatch[0], 10) : 10;
        const standardStr = String(rawClass).startsWith('CLS-')
          ? `Class ${numericGrade}`
          : String(rawClass).startsWith('Class')
          ? String(rawClass)
          : `Class ${numericGrade}`;

        const section = (sp.currentSectionId || 'A').trim();
        const rollNo = sp.rollNumber ? String(sp.rollNumber) : '1';
        const enrollmentNo = sp.admissionNumber || `GR-2026-${studentId || '1001'}`;
        const schoolName = sp.schoolId === 'SCH-GANDHINAGAR-001' ? 'AD 6 Campus (Gandhinagar)' : (sp.schoolId || 'AD 6 Campus (Gandhinagar)');
        const board = sp.board || sp.aiLearningContext?.curriculumBoard || 'CBSE';
        const medium = sp.medium || 'English Medium';
        const stream = sp.stream || 'General Academic';

        // Get password hash from ERP user if available, otherwise default
        let passwordHash = defaultHash;
        const linkedErpUser = erpUserMap.get(email) || (studentId ? erpUserMap.get(studentId) : null);
        if (linkedErpUser && linkedErpUser.passwordHash) {
          passwordHash = linkedErpUser.passwordHash;
        }

        try {
          // Check if user already exists in AI DB
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.grade = numericGrade;
            existingUser.standard = standardStr;
            existingUser.section = section;
            existingUser.rollNumber = rollNo;
            existingUser.enrollmentNo = enrollmentNo;
            existingUser.schoolName = schoolName;
            existingUser.board = board;
            existingUser.medium = medium;
            existingUser.stream = stream;
            existingUser.isSchoolStudent = true;
            existingUser.role = 'STUDENT';
            existingUser.status = 'active';
            existingUser.onboardingCompleted = true;
            existingUser.onboarding_status = 'DONE';
            existingUser.provider = 'local';

            // Always ensure valid passwordHash exists
            if (!existingUser.passwordHash) {
              existingUser.passwordHash = passwordHash;
            }

            if (sp.parentDetails) {
              existingUser.parentDetails = {
                parentEmail: sp.parentDetails.primaryEmail || '',
                parentPhone: sp.parentDetails.fatherPhone || sp.parentDetails.primaryEmergencyPhone || '',
                parentEmailVerified: true
              };
            }

            await existingUser.save();
            results.push({
              email,
              fullName,
              studentId,
              grade: numericGrade,
              section,
              rollNumber: rollNo,
              enrollmentNo,
              schoolName,
              board,
              status: 'UPDATED'
            });
            console.log(`✅ [ErpStudentSync] Updated existing student in AI DB: ${email} (${fullName})`);
          } else {
            // Create brand new user in AI DB
            await User.create({
              firstName,
              lastName,
              email,
              passwordHash,
              grade: numericGrade,
              standard: standardStr,
              section,
              rollNumber: rollNo,
              enrollmentNo,
              schoolName,
              board,
              medium,
              stream,
              isSchoolStudent: true,
              role: 'STUDENT',
              status: 'active',
              onboardingCompleted: true,
              onboarding_status: 'DONE',
              provider: 'local',
              tokenBalance: 10000,
              parentDetails: sp.parentDetails ? {
                parentEmail: sp.parentDetails.primaryEmail || '',
                parentPhone: sp.parentDetails.fatherPhone || sp.parentDetails.primaryEmergencyPhone || '',
                parentEmailVerified: true
              } : undefined
            });

            results.push({
              email,
              fullName,
              studentId,
              grade: numericGrade,
              section,
              rollNumber: rollNo,
              enrollmentNo,
              schoolName,
              board,
              status: 'CREATED'
            });
            console.log(`✨ [ErpStudentSync] Created new student in AI DB: ${email} (${fullName})`);
          }
        } catch (err: any) {
          console.error(`❌ [ErpStudentSync] Failed to sync student ${email}:`, err.message);
          results.push({
            email,
            fullName,
            studentId,
            grade: numericGrade,
            section,
            rollNumber: rollNo,
            enrollmentNo,
            schoolName,
            board,
            status: 'FAILED',
            error: err.message
          });
        }
      }

      return {
        success: true,
        totalFound: studentProfiles.length,
        syncedCount: results.filter(r => r.status === 'CREATED' || r.status === 'UPDATED').length,
        results
      };
    } catch (error: any) {
      console.error('❌ [ErpStudentSync] Critical error during student sync:', error.message);
      return {
        success: false,
        totalFound: 0,
        syncedCount: 0,
        results
      };
    }
  }

  /**
   * Fetches complete real-time registration details from ERP DB for a given student email
   */
  public async getErpAcademicDetailsByEmail(email: string) {
    try {
      const erpConn = getErpConnection();
      if (!erpConn || erpConn.readyState !== 1) return null;

      const erpDb = erpConn.db;
      if (!erpDb) return null;

      const cleanEmail = email.toLowerCase().trim();
      const profile = await erpDb.collection('student_profiles').findOne({
        $or: [
          { 'parentDetails.primaryEmail': cleanEmail },
          { email: cleanEmail }
        ]
      });

      if (!profile) return null;

      // Also get attendance record if exists
      const attendance = await erpDb.collection('student_period_attendances').findOne({
        'attendanceRecords.studentId': profile.studentId
      });

      let attendancePercent = 95;
      let lastStatus = 'PRESENT';
      if (attendance && Array.isArray(attendance.attendanceRecords)) {
        const myRecord = attendance.attendanceRecords.find((r: any) => r.studentId === profile.studentId);
        if (myRecord) {
          attendancePercent = myRecord.overallPercentage || 95;
          lastStatus = myRecord.dailyStatus || 'FULL_DAY_PRESENT';
        }
      }

      return {
        studentId: profile.studentId,
        admissionNumber: profile.admissionNumber,
        admissionDate: profile.admissionDate,
        admissionType: profile.admissionType || 'REGULAR',
        academicYearId: profile.academicYearId || 'AY-2026-27',
        rollNumber: profile.rollNumber,
        currentClassId: profile.currentClassId,
        currentSectionId: profile.currentSectionId,
        schoolId: profile.schoolId,
        schoolName: profile.schoolId === 'SCH-GANDHINAGAR-001' ? 'AD 6 Campus (Gandhinagar)' : (profile.schoolId || 'AD 6 Campus (Gandhinagar)'),
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender || 'MALE',
        bloodGroup: profile.bloodGroup || 'O+',
        category: profile.category || 'GENERAL',
        nationality: profile.nationality || 'Indian',
        aadhaarNumberMasked: profile.aadhaarNumberMasked || 'XXXX-XXXX-XXXX',
        penNumber: profile.penNumber || 'PEN-2026-000000',
        permanentBrtsId: profile.permanentBrtsId,
        biometricCardId: profile.biometricCardId,
        house: profile.house || 'Aryabhata House',
        board: profile.board || 'CBSE',
        medium: profile.medium || 'English Medium',
        stream: profile.stream || 'General Academic',
        busRouteId: profile.busRouteId || 'Not Opted',
        optHostel: !!profile.optHostel,
        lifecycleStatus: profile.lifecycleStatus || 'ACTIVE',
        statusNotes: profile.statusNotes,
        electives: profile.electives || [],
        documents: profile.documents || [],
        parentDetails: profile.parentDetails || {
          fatherName: '',
          fatherPhone: '',
          fatherOccupation: '',
          motherName: '',
          motherPhone: '',
          motherOccupation: '',
          primaryEmergencyPhone: '',
          primaryEmail: cleanEmail,
          residentialAddress: {
            street: '',
            city: 'Gandhinagar',
            state: 'Gujarat',
            postalCode: '382007'
          }
        },
        attendancePercent,
        lastStatus,
        aiLearningContext: profile.aiLearningContext
      };
    } catch (e: any) {
      console.error('Error fetching ERP academic details:', e.message);
      return null;
    }
  }

  /**
   * Updates student registration details in BOTH AI DB (futurebilder_tool.users)
   * and ERP DB (futurebilder_erp.student_profiles & futurebilder_erp.users)
   */
  public async updateStudentProfileInBothDbs(userId: string, email: string, updateData: any) {
    // 1. Update in AI Database (futurebilder_tool.users)
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (updateData.fullName) {
      const parts = updateData.fullName.trim().split(' ');
      user.firstName = parts[0] || user.firstName;
      user.lastName = parts.length > 1 ? parts.slice(1).join(' ') : user.lastName;
    }
    if (updateData.standard) {
      user.standard = updateData.standard;
      const numMatch = String(updateData.standard).match(/\d+/);
      if (numMatch) user.grade = parseInt(numMatch[0], 10);
    }
    if (updateData.section) user.section = updateData.section;
    if (updateData.rollNumber) user.rollNumber = String(updateData.rollNumber);
    if (updateData.board) user.board = updateData.board;
    if (updateData.medium) user.medium = updateData.medium;
    if (updateData.stream) user.stream = updateData.stream;
    if (updateData.schoolName) user.schoolName = updateData.schoolName;
    if (updateData.parentDetails) {
      user.parentDetails = {
        ...user.parentDetails,
        parentEmail: updateData.parentDetails.primaryEmail || user.parentDetails?.parentEmail,
        parentPhone: updateData.parentDetails.fatherPhone || updateData.parentDetails.primaryEmergencyPhone || user.parentDetails?.parentPhone
      };
    }
    await user.save();

    // 2. Update in ERP Database (futurebilder_erp.student_profiles & futurebilder_erp.users)
    const erpConn = getErpConnection();
    if (erpConn && erpConn.readyState === 1 && erpConn.db) {
      const erpDb = erpConn.db;
      const cleanEmail = (email || user.email).toLowerCase().trim();

      const erpUpdatePayload: any = {
        updatedAt: new Date()
      };

      if (updateData.fullName) erpUpdatePayload.fullName = updateData.fullName;
      if (updateData.dateOfBirth) erpUpdatePayload.dateOfBirth = updateData.dateOfBirth;
      if (updateData.gender) erpUpdatePayload.gender = updateData.gender;
      if (updateData.bloodGroup) erpUpdatePayload.bloodGroup = updateData.bloodGroup;
      if (updateData.category) erpUpdatePayload.category = updateData.category;
      if (updateData.nationality) erpUpdatePayload.nationality = updateData.nationality;
      if (updateData.house) erpUpdatePayload.house = updateData.house;
      if (updateData.standard || updateData.currentClassId) {
        erpUpdatePayload.currentClassId = updateData.currentClassId || updateData.standard;
      }
      if (updateData.section || updateData.currentSectionId) {
        erpUpdatePayload.currentSectionId = updateData.currentSectionId || updateData.section;
      }
      if (updateData.rollNumber) erpUpdatePayload.rollNumber = Number(updateData.rollNumber);
      if (updateData.board) erpUpdatePayload.board = updateData.board;
      if (updateData.medium) erpUpdatePayload.medium = updateData.medium;
      if (updateData.stream) erpUpdatePayload.stream = updateData.stream;
      if (updateData.busRouteId) erpUpdatePayload.busRouteId = updateData.busRouteId;
      if (updateData.optHostel !== undefined) erpUpdatePayload.optHostel = updateData.optHostel;
      if (updateData.electives) erpUpdatePayload.electives = updateData.electives;

      // Deep merge parentDetails
      if (updateData.parentDetails) {
        const existingStudent = await erpDb.collection('student_profiles').findOne({
          $or: [
            { 'parentDetails.primaryEmail': cleanEmail },
            { email: cleanEmail },
            { studentId: updateData.studentId }
          ]
        });

        const mergedParent = {
          ...(existingStudent?.parentDetails || {}),
          ...updateData.parentDetails,
          residentialAddress: {
            ...(existingStudent?.parentDetails?.residentialAddress || {}),
            ...(updateData.parentDetails?.residentialAddress || {})
          }
        };
        erpUpdatePayload.parentDetails = mergedParent;
      }

      await erpDb.collection('student_profiles').updateOne(
        {
          $or: [
            { 'parentDetails.primaryEmail': cleanEmail },
            { email: cleanEmail },
            { studentId: updateData.studentId }
          ]
        },
        { $set: erpUpdatePayload }
      );

      // Also update name in ERP users collection if exists
      if (updateData.fullName) {
        await erpDb.collection('users').updateOne(
          { email: cleanEmail },
          { $set: { fullName: updateData.fullName, updatedAt: new Date() } }
        );
      }

      console.log(`✅ [ErpStudentSync] Successfully updated student profile in BOTH databases for ${cleanEmail}`);
    }

    // Return the fresh enriched user
    const erpDetails = await this.getErpAcademicDetailsByEmail(user.email);
    return {
      success: true,
      user: {
        ...user.toObject(),
        erpDetails
      }
    };
  }
}

export const erpStudentSyncService = new ErpStudentSyncService();

