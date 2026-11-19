import { SchoolTenantModel } from '../tenant/school_tenant.model';
import { TenantOrgModel } from '../tenant/tenant.model';
import { TenantUserModel } from '../tenant/tenant_user.model';
import User from '../auth/user.model';
import { upsertSchoolToUdiseDatabase } from '../auth/school_helper';

export class OnboardingService {

  // Seed default cities & schools if database is empty
  static async seedDefaultSchools() {
    try {
      const count = await SchoolTenantModel.countDocuments();
      if (count > 0) return;

      const defaultSchools = [
        // Ahmedabad
        { city: 'Ahmedabad', schoolName: 'Mount Carmel High School', tenantOrgId: 'mount_carmel_school', board: 'CBSE' },
        { city: 'Ahmedabad', schoolName: 'Delhi Public School (DPS) Bopal', tenantOrgId: 'dps_bopal_ahmedabad', board: 'CBSE' },
        { city: 'Ahmedabad', schoolName: 'St. Xavier’s High School Loyola', tenantOrgId: 'st_xaviers_loyola', board: 'GSEB' },
        { city: 'Ahmedabad', schoolName: 'Udgam School for Children', tenantOrgId: 'udgam_school_children', board: 'CBSE' },
        
        // Gandhinagar
        { city: 'Gandhinagar', schoolName: 'DPS Gandhinagar', tenantOrgId: 'dps_gandhinagar', board: 'CBSE' },
        { city: 'Gandhinagar', schoolName: 'Swaminarayan Dham International', tenantOrgId: 'swaminarayan_dham', board: 'CBSE' },

        // Mumbai
        { city: 'Mumbai', schoolName: 'Dhirubhai Ambani International School', tenantOrgId: 'dais_mumbai', board: 'IB' },
        { city: 'Mumbai', schoolName: 'Cathedral & John Connon School', tenantOrgId: 'cathedral_mumbai', board: 'ICSE' },
        { city: 'Mumbai', schoolName: 'Don Bosco High School Matunga', tenantOrgId: 'don_bosco_mumbai', board: 'State Board' },

        // Delhi
        { city: 'Delhi', schoolName: 'Modern School Barakhamba Road', tenantOrgId: 'modern_school_delhi', board: 'CBSE' },
        { city: 'Delhi', schoolName: 'DPS R.K. Puram', tenantOrgId: 'dps_rk_puram', board: 'CBSE' },
        { city: 'Delhi', schoolName: 'Sanskriti School Chanakyapuri', tenantOrgId: 'sanskriti_school_delhi', board: 'CBSE' },

        // Surat
        { city: 'Surat', schoolName: 'Fountainhead School', tenantOrgId: 'fountainhead_surat', board: 'IB' },
        { city: 'Surat', schoolName: 'DPS Surat', tenantOrgId: 'dps_surat', board: 'CBSE' },

        // Vadodara
        { city: 'Vadodara', schoolName: 'Navrachana School Sama', tenantOrgId: 'navrachana_vadodara', board: 'CBSE' },
        { city: 'Vadodara', schoolName: 'DPS Vadodara', tenantOrgId: 'dps_vadodara', board: 'CBSE' },

        // Bangalore
        { city: 'Bangalore', schoolName: 'National Public School (NPS) Indiranagar', tenantOrgId: 'nps_indiranagar', board: 'CBSE' },
        { city: 'Bangalore', schoolName: 'Mallya Aditi International School', tenantOrgId: 'mallya_aditi_bangalore', board: 'ICSE' },

        // Pune
        { city: 'Pune', schoolName: 'The Bishop’s School Camp', tenantOrgId: 'bishops_pune', board: 'ICSE' },
        { city: 'Pune', schoolName: 'DPS Pune', tenantOrgId: 'dps_pune', board: 'CBSE' }
      ];

      await SchoolTenantModel.insertMany(defaultSchools);
      console.log('✅ Default City-School Database Seeded Successfully!');
    } catch (err) {
      console.warn('School seed warning:', err);
    }
  }

  // Get list of popular cities
  static async getCities(): Promise<string[]> {
    await this.seedDefaultSchools();
    const citiesFromDb = await SchoolTenantModel.distinct('city');
    const defaultCities = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot', 'Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Indore'];
    return Array.from(new Set([...citiesFromDb, ...defaultCities])).sort();
  }

  // Get schools registered under a city
  static async getSchoolsByCity(city: string): Promise<any[]> {
    await this.seedDefaultSchools();
    const schools = await SchoolTenantModel.find({ 
      city: { $regex: new RegExp(`^${city}$`, 'i') } 
    }).sort({ schoolName: 1 });

    return schools;
  }

  // Register a custom new school under a city
  static async registerCustomSchool(params: {
    city: string;
    schoolName: string;
    board?: string;
    userId?: string;
  }): Promise<any> {
    const city = params.city.trim();
    const schoolName = params.schoolName.trim();
    const board = params.board || 'CBSE';

    // Generate unique tenantOrgId slug
    let slug = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!slug) slug = 'custom_school_' + Date.now();

    // Check if already exists
    const existing = await SchoolTenantModel.findOne({ tenantOrgId: slug });
    if (existing) {
      return existing;
    }

    const newSchool = await SchoolTenantModel.create({
      city,
      schoolName,
      tenantOrgId: slug,
      board,
      isCustom: true,
      addedByUserId: params.userId || ''
    });

    // Also register in TenantOrgModel if needed
    try {
      await TenantOrgModel.create({
        orgId: slug,
        orgName: schoolName,
        orgType: 'SINGLE_SCHOOL',
        city,
        apiKey: `key_${slug}_${Date.now()}`,
        secretKeyHash: `secret_${slug}`
      });
    } catch (e) {
      // tenant org might already exist
    }

    return newSchool;
  }

  // Complete Student Profile Onboarding Registration with Automated Teacher Matcher
  static async completeStudentRegistration(params: {
    userId: string;
    firstName?: string;
    lastName?: string;
    city: string;
    schoolName: string;
    udiseCode?: string;
    tenantOrgId: string;
    educationType: 'k12' | 'higher_ed' | 'competitive';
    board?: string;
    medium?: string;
    standard?: string;
    section?: string;
    stream?: string;
    branch?: string;
    semester?: string;
    rollNumber?: string;
    enrollmentNo?: string;
    grNumber?: string;
    mobile_number?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
  }): Promise<any> {
    const user = await User.findById(params.userId);
    if (!user) {
      throw new Error('User account not found');
    }

    if (params.firstName) user.firstName = params.firstName;
    if (params.lastName) user.lastName = params.lastName;
    user.city = params.city;
    user.schoolName = params.schoolName;
    if (params.udiseCode) user.udiseCode = params.udiseCode;
    user.tenantOrgId = params.tenantOrgId;
    user.educationType = params.educationType;
    user.board = params.board || 'CBSE';
    user.medium = params.medium || 'English Medium';
    user.standard = params.standard || '10';
    user.section = params.section || 'A';
    user.stream = params.stream || 'Science';
    user.branch = params.branch || '';
    user.semester = params.semester || '';
    if (params.rollNumber) user.rollNumber = params.rollNumber;
    if (params.enrollmentNo) user.enrollmentNo = params.enrollmentNo;
    if (params.mobile_number) user.mobile_number = params.mobile_number;

    user.parentDetails = {
      parentEmail: params.parentEmail || user.parentDetails?.parentEmail || '',
      parentPhone: params.parentPhone || user.parentDetails?.parentPhone || '',
      parentEmailVerified: user.parentDetails?.parentEmailVerified || false,
      parentVerificationToken: user.parentDetails?.parentVerificationToken || ''
    };

    user.onboardingCompleted = true;
    user.onboarding_status = 'DONE';

    // 🏫 Auto-save / Upsert School in UDISE Master Database for Community Discovery
    await upsertSchoolToUdiseDatabase({
        schoolName: params.schoolName,
        city: params.city,
        board: params.board,
        udiseCode: params.udiseCode,
        isTeacher: false
    }).catch(e => console.error('[OnboardingService] Udise auto-save error:', e));

    if (params.standard && !isNaN(Number(params.standard))) {
      user.grade = Number(params.standard);
    }

    await user.save();

    // 🏫 Sync student to TenantUserModel for instant Teacher Portal Class Roster visibility
    try {
        const studentFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student User';
        const cleanStd = (user.standard || '10').replace(/^class_/i, '').replace(/^CLASS-?/i, '');
        const cleanSec = (user.section || 'A').toUpperCase();
        const formatA = `${cleanStd}-${cleanSec}`; // Format A: 10-B
        const formatCompact = `${cleanStd}${cleanSec}`; // Format: 10B
        const formatLegacy = `CLASS-${cleanStd}${cleanSec}`;
        const formatVerbose = `Class ${cleanStd} Sec-${cleanSec}`;

        await TenantUserModel.updateOne(
            {
                $or: [
                    { email: user.email },
                    { externalId: user._id.toString() }
                ]
            },
            {
                $set: {
                    tenantOrgId: user.tenantOrgId,
                    externalId: user._id.toString(),
                    name: studentFullName,
                    email: user.email || '',
                    role: 'STUDENT',
                    grade: `Class ${cleanStd}`,
                    section: cleanSec,
                    stream: user.stream || '',
                    board: user.board || '',
                    medium: user.medium || '',
                    udiseCode: user.udiseCode || '',
                    schoolName: user.schoolName,
                    classId: formatA,
                    assignedClasses: [formatA, formatCompact, formatLegacy, formatVerbose, `Class ${cleanStd}`],
                    rollNumber: user.rollNumber || '',
                    enrollmentNo: user.enrollmentNo || '',
                    isSchoolStudent: true,
                    status: 'ACTIVE'
                }
            },
            { upsert: true }
        );
        console.log(`[OnboardingService] Student "${studentFullName}" synced to TenantUserModel for class "${formatA}"`);
    } catch (tErr) {
        console.error('[OnboardingService] Error syncing student to TenantUserModel:', tErr);
    }

    // ⚡ REAL-TIME AUTOMATED TEACHER-STUDENT MATCHING ENGINE
    let matchedTeachers: any[] = [];
    try {
      // Build school search terms
      const schoolWords = (user.schoolName || '')
        .split(/\s+/)
        .map((w: string) => w.replace(/[^a-z0-9]/gi, '').toLowerCase())
        .filter((w: string) => w.length > 3);

      const schoolOrConditions: any[] = [];
      if (user.udiseCode) {
        schoolOrConditions.push({ udiseCode: user.udiseCode });
      }
      if (user.tenantOrgId) {
        schoolOrConditions.push({ tenantOrgId: user.tenantOrgId });
      }
      schoolWords.forEach((word: string) => {
        schoolOrConditions.push({ schoolName: { $regex: word, $options: 'i' } });
      });

      if (schoolOrConditions.length > 0) {
        matchedTeachers = await User.find({
          $or: [
            { role: { $in: ['teacher', 'TEACHER', 'Faculty', 'FACULTY'] } },
            { roleInSchool: { $in: ['teacher', 'TEACHER', 'Faculty', 'FACULTY'] } }
          ],
          $and: [
            { $or: schoolOrConditions }
          ]
        }).select('firstName lastName email teacherDetails schoolName assignedClasses assignedSubjects');
      }
    } catch (e) {
      console.warn('Teacher matching engine notice:', e);
    }

    return {
      success: true,
      message: 'Student Registration & School Mapping Complete! Auto-matched with active teachers.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        schoolName: user.schoolName,
        udiseCode: user.udiseCode,
        tenantOrgId: user.tenantOrgId,
        educationType: user.educationType,
        board: user.board,
        medium: user.medium,
        standard: user.standard,
        section: user.section,
        stream: user.stream,
        onboardingCompleted: user.onboardingCompleted
      },
      matchedTeachersCount: matchedTeachers.length,
      matchedTeachers: matchedTeachers.map(t => ({
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        schoolName: t.teacherDetails?.schoolName || user.schoolName,
        assignedClasses: t.teacherDetails?.assignedClasses || [],
        assignedSubjects: t.teacherDetails?.assignedSubjects || []
      }))
    };
  }
}
