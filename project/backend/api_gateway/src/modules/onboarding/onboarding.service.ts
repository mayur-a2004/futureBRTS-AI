import { SchoolTenantModel } from '../tenant/school_tenant.model';
import { TenantOrgModel } from '../tenant/tenant.model';
import User from '../auth/user.model';

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

  // Complete Student Profile Onboarding Registration
  static async completeStudentRegistration(params: {
    userId: string;
    city: string;
    schoolName: string;
    tenantOrgId: string;
    educationType: 'k12' | 'higher_ed' | 'competitive';
    board?: string;
    standard?: string;
    section?: string;
    stream?: string;
    branch?: string;
    semester?: string;
  }): Promise<any> {
    const user = await User.findById(params.userId);
    if (!user) {
      throw new Error('User account not found');
    }

    user.city = params.city;
    user.schoolName = params.schoolName;
    user.tenantOrgId = params.tenantOrgId;
    user.educationType = params.educationType;
    user.board = params.board || 'CBSE';
    user.standard = params.standard || '10';
    user.section = params.section || 'A';
    user.stream = params.stream || 'Science';
    user.branch = params.branch || '';
    user.semester = params.semester || '';
    user.onboardingCompleted = true;
    user.onboarding_status = 'DONE';

    if (params.standard && !isNaN(Number(params.standard))) {
      user.grade = Number(params.standard);
    }

    await user.save();

    return {
      success: true,
      message: 'Student Registration & School Mapping Complete!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        schoolName: user.schoolName,
        tenantOrgId: user.tenantOrgId,
        educationType: user.educationType,
        board: user.board,
        standard: user.standard,
        section: user.section,
        stream: user.stream,
        onboardingCompleted: user.onboardingCompleted
      }
    };
  }
}
