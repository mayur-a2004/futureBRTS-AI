import { Request, Response } from 'express';
import { OnboardingService } from './onboarding.service';

export class OnboardingController {

  // GET /api/v1/onboarding/cities
  static async getCities(req: Request, res: Response): Promise<void> {
    try {
      const cities = await OnboardingService.getCities();
      res.json({ success: true, cities });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Could not fetch cities' });
    }
  }

  // GET /api/v1/onboarding/schools?city=Ahmedabad
  static async getSchoolsByCity(req: Request, res: Response): Promise<void> {
    try {
      const city = (req.query.city as string) || 'Ahmedabad';
      const schools = await OnboardingService.getSchoolsByCity(city);
      res.json({ success: true, city, schools });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Could not fetch schools for city' });
    }
  }

  // POST /api/v1/onboarding/register-school
  static async registerCustomSchool(req: Request, res: Response): Promise<void> {
    try {
      const { city, schoolName, board } = req.body;
      if (!city || !schoolName) {
        res.status(400).json({ success: false, error: 'City and School Name are required' });
        return;
      }

      const school = await OnboardingService.registerCustomSchool({
        city,
        schoolName,
        board,
        userId: (req as any).user?.id || (req as any).user?._id
      });

      res.json({ success: true, message: 'Custom School Registered Successfully', school });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Could not register custom school' });
    }
  }

  // POST /api/v1/onboarding/complete
  static async completeRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req as any).user?._id || req.body.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User must be authenticated to complete registration' });
        return;
      }

      const { city, schoolName, tenantOrgId, educationType, board, standard, section, stream, branch, semester } = req.body;
      if (!city || !schoolName || !tenantOrgId) {
        res.status(400).json({ success: false, error: 'City, School Name, and Tenant Org ID are required' });
        return;
      }

      const result = await OnboardingService.completeStudentRegistration({
        userId,
        city,
        schoolName,
        tenantOrgId,
        educationType: educationType || 'k12',
        board,
        standard,
        section,
        stream,
        branch,
        semester
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Could not complete student registration' });
    }
  }

  // GET /api/v1/onboarding/status
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      res.json({
        success: true,
        isOnboarded: !!user?.onboardingCompleted,
        user: user ? {
          id: user._id || user.id,
          city: user.city || '',
          schoolName: user.schoolName || '',
          tenantOrgId: user.tenantOrgId || 'mount_carmel_school',
          educationType: user.educationType || 'k12',
          board: user.board || 'CBSE',
          standard: user.standard || '10',
          section: user.section || 'A',
          stream: user.stream || 'Science',
          onboardingCompleted: !!user.onboardingCompleted
        } : null
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Could not check status' });
    }
  }
}
