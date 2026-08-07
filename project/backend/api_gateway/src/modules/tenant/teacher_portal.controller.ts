import { Request, Response } from 'express';
import { TeacherPortalService } from './teacher_portal.service';
import { TenantUserModel } from './tenant_user.model';

export class TeacherPortalController {

  // --- HOMEWORK ASSIGNMENTS ---
  static async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { tenantOrgId, classId, grade, section, subject, board, chapter, topic, language, mode, rubric, teacherId, teacherName, title, description, dueDate } = req.body;
      const orgId = tenantOrgId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';
      
      if (!title || !subject) {
        res.status(400).json({ error: 'title and subject are required' });
        return;
      }

      const assignment = await TeacherPortalService.createAssignment({
        tenantOrgId: orgId,
        classId: classId || 'CLASS-10A',
        grade: grade || 'Class 10',
        section: section || 'A',
        subject,
        board: board || 'CBSE',
        chapter: chapter || '',
        topic: topic || '',
        language: language || 'English',
        mode: mode || 'AI_GEN',
        rubric: rubric || '',
        teacherId: teacherId || 'TCH-901',
        teacherName: teacherName || 'Faculty Teacher',
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      res.json({ success: true, assignment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAssignments(req: Request, res: Response): Promise<void> {
    try {
      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';
      const classId = (req.query.classId as string) || 'ALL';
      const teacherId = (req.query.teacherId as string) || 'ALL';

      const assignments = await TeacherPortalService.getAssignments(orgId, classId, teacherId);
      res.json({ success: true, count: assignments.length, assignments });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- HOMEWORK SUBMISSION & VISION AI AUTO-CHECKING ---
  static async submitHomework(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, tenantOrgId, classId, studentId, studentName, imageUrl, subject } = req.body;
      const orgId = tenantOrgId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      if (!assignmentId || !imageUrl) {
        res.status(400).json({ error: 'assignmentId and imageUrl are required' });
        return;
      }

      const submission = await TeacherPortalService.submitHomework({
        assignmentId,
        tenantOrgId: orgId,
        classId: classId || 'CLASS-10A',
        studentId: studentId || 'STU-10492',
        studentName: studentName || 'Aarav Sharma',
        imageUrl,
        subject: subject || 'Mathematics'
      });
      res.json({ success: true, submission });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const submissions = await TeacherPortalService.getSubmissions(assignmentId);
      res.json({ success: true, assignmentId, count: submissions.length, submissions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateSubmissionGrade(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId, scoreObtained, feedback, doubtRemark, actionTaken, status, gradingMode } = req.body;
      if (!submissionId) {
        res.status(400).json({ error: 'submissionId is required' });
        return;
      }
      const updated = await TeacherPortalService.updateSubmissionGrade({
        submissionId,
        scoreObtained,
        feedback,
        doubtRemark,
        actionTaken,
        status,
        gradingMode
      });
      res.json({ success: true, submission: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- ATTENDANCE SYSTEM ---
  static async markAttendance(req: Request, res: Response): Promise<void> {
    try {
      const { tenantOrgId, classId, grade, section, date, records, markedByTeacherId, markedByTeacherName } = req.body;
      const orgId = tenantOrgId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';
      const todayStr = date || new Date().toISOString().split('T')[0];

      if (!records || !Array.isArray(records)) {
        res.status(400).json({ error: 'records array is required' });
        return;
      }

      const result = await TeacherPortalService.markAttendance({
        tenantOrgId: orgId,
        classId: classId || 'CLASS-10A',
        grade: grade || 'Class 10',
        section: section || 'A',
        date: todayStr,
        records,
        markedByTeacherId: markedByTeacherId || 'TCH-901',
        markedByTeacherName: markedByTeacherName || 'Class Teacher'
      });
      res.json({ success: true, date: todayStr, updatedCount: result.updatedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'CLASS-10A';
      const date = req.query.date as string;

      const report = await TeacherPortalService.getAttendanceReport(orgId, classId, date);
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getStudentAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'CLASS-10A';
      const studentId = (req.query.studentId as string) || user?.id || 'STU-10492';

      const summary = await TeacherPortalService.getStudentAttendanceSummary(orgId, studentId, classId);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async syncDailySchoolData(req: Request, res: Response): Promise<void> {
    try {
      const { tenantOrgId, classId, date, teacherId, teacherName } = req.body;
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = tenantOrgId || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';

      const result = await TeacherPortalService.syncDailySchoolData({
        tenantOrgId: orgId,
        classId: classId || userClassId || 'CLASS-10A',
        date,
        teacherId,
        teacherName
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getStudentAuditTimeline(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'CLASS-10A';
      const studentId = (req.query.studentId as string) || user?.id || 'STU-10492';
      const date = req.query.date as string;

      const audit = await TeacherPortalService.getStudentAuditTimeline({
        tenantOrgId: orgId,
        classId,
        studentId,
        date
      });
      res.json({ success: true, audit });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- TIMETABLE SCHEDULER ---
  static async getTimetable(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'ALL';
      const teacherId = (req.query.teacherId as string) || 'ALL';

      const schedule = await TeacherPortalService.getTimetable(orgId, classId, teacherId);
      res.json({ success: true, schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- CALENDAR & EVENTS ---
  static async addCalendarEvent(req: Request, res: Response): Promise<void> {
    try {
      const event = await TeacherPortalService.addCalendarEvent(req.body);
      res.json({ success: true, event });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getCalendarEvents(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'ALL';

      const events = await TeacherPortalService.getCalendarEvents(orgId, classId);
      res.json({ success: true, events });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteCalendarEvent(req: Request, res: Response): Promise<void> {
    try {
      await TeacherPortalService.deleteCalendarEvent(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- EXAM SCHEDULES ---
  static async addExamSchedule(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await TeacherPortalService.addExamSchedule(req.body);
      res.json({ success: true, schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getExamSchedules(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const userClassId = user?.standard ? `CLASS-${user.standard.toString().replace(/^class_/i, '').toUpperCase()}${user.section || 'A'}` : null;

      const orgId = (req.query.tenantOrgId as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || userClassId || 'ALL';

      const schedules = await TeacherPortalService.getExamSchedules(orgId, classId);
      res.json({ success: true, schedules });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteExamSchedule(req: Request, res: Response): Promise<void> {
    try {
      await TeacherPortalService.deleteExamSchedule(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- AI EXAM PAPER GENERATOR ---
  static async generateExamPaper(req: Request, res: Response): Promise<void> {
    try {
      const { tenantOrgId, classId, subject, examTitle, totalMarks, durationMinutes, teacherName } = req.body;
      const orgId = tenantOrgId || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';

      if (!subject || !examTitle) {
        res.status(400).json({ error: 'subject and examTitle are required' });
        return;
      }

      const examPaper = await TeacherPortalService.generateExamPaper({
        tenantOrgId: orgId,
        classId: classId || 'CLASS-10A',
        subject,
        examTitle,
        totalMarks: totalMarks || 50,
        durationMinutes: durationMinutes || 60,
        teacherName: teacherName || 'Faculty Teacher'
      });
      res.json({ success: true, examPaper });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  // --- AUTHENTICATION HANDLERS ---
  static async registerTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, schoolName, teacherId, schoolAddress, subject, roleInSchool, gender, whatsappNumber, assignedClasses, assignedSubjects } = req.body;
      const orgId = schoolName ? schoolName.toLowerCase().replace(/\s+/g, '_') : 'mount_carmel_school';
      
      const classList = (Array.isArray(assignedClasses) && assignedClasses.length > 0) 
        ? assignedClasses 
        : ['CLASS-10A', 'CLASS-11B'];

      const subjectList = (Array.isArray(assignedSubjects) && assignedSubjects.length > 0)
        ? assignedSubjects
        : [subject || 'Science'];

      let user = await (TenantUserModel as any).findOne({ email: email ? email.toLowerCase() : '' });
      if (!user) {
        user = await (TenantUserModel as any).create({
          tenantOrgId: orgId,
          externalId: teacherId || `TCH-${Date.now().toString().slice(-4)}`,
          name: name || 'Faculty Teacher',
          email: email ? email.toLowerCase() : '',
          role: 'TEACHER',
          subject: subjectList[0] || 'Science',
          assignedClasses: classList,
          assignedSubjects: subjectList,
          status: 'ACTIVE'
        });
      }

      const token = `teacher_jwt_${user._id}_${Date.now()}`;
      const userPayload = {
        _id: user._id,
        firstName: (name || 'Faculty').split(' ')[0],
        lastName: (name || 'Faculty').split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: 'TEACHER',
        assignedClasses: user.assignedClasses || classList,
        assignedSubjects: user.assignedSubjects || subjectList,
        teacherDetails: {
          schoolName: schoolName || 'Mount Carmel High School',
          teacherId: teacherId || user.externalId,
          subject: subjectList.join(', '),
          schoolAddress: schoolAddress || '',
          whatsappNumber: whatsappNumber || ''
        }
      };

      res.json({ success: true, token, user: userPayload });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async loginTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email address is required' });
        return;
      }

      let user = await (TenantUserModel as any).findOne({ email: email.toLowerCase() });
      if (!user) {
        const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        user = await (TenantUserModel as any).create({
          tenantOrgId: 'mount_carmel_school',
          externalId: `TCH-${Date.now().toString().slice(-4)}`,
          name: `Prof. ${formattedName}`,
          email: email.toLowerCase(),
          role: 'TEACHER',
          subject: 'Mathematics',
          assignedClasses: ['CLASS-10A', 'CLASS-11B', 'CLASS-12SCI'],
          assignedSubjects: ['Mathematics', 'Physics', 'Chemistry'],
          status: 'ACTIVE'
        });
      }

      const token = `teacher_jwt_${user._id}_${Date.now()}`;
      const userPayload = {
        _id: user._id,
        firstName: user.name.split(' ')[0] || user.name,
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: 'TEACHER',
        assignedClasses: user.assignedClasses || ['CLASS-10A', 'CLASS-11B', 'CLASS-12SCI'],
        assignedSubjects: user.assignedSubjects || ['Mathematics', 'Physics', 'Chemistry'],
        teacherDetails: {
          schoolName: 'Mount Carmel High School',
          teacherId: user.externalId || 'TCH-101',
          subject: (user.assignedSubjects || ['Mathematics']).join(', ')
        }
      };

      res.json({ success: true, token, user: userPayload });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- LIVE EXAM ROOMS CONTROLLERS ---
  static async createLiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await TeacherPortalService.createLiveRoom(req.body);
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getLiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomCode } = req.params;
      const room = await TeacherPortalService.getLiveRoom(roomCode);
      if (!room) {
        res.status(404).json({ success: false, error: 'Live Exam Room not found' });
        return;
      }
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async joinLiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await TeacherPortalService.joinLiveRoom(req.body);
      if (!room) {
        res.status(404).json({ success: false, error: 'Live Exam Room not found' });
        return;
      }
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async startLiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomCode } = req.body;
      const room = await TeacherPortalService.startLiveRoom(roomCode);
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async endLiveRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomCode } = req.body;
      const room = await TeacherPortalService.endLiveRoom(roomCode);
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async submitLiveAnswer(req: Request, res: Response): Promise<void> {
    try {
      const room = await TeacherPortalService.submitLiveAnswer(req.body);
      res.json({ success: true, room });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async clearAllData(req: Request, res: Response): Promise<void> {
    try {
      const orgId = (req.query.tenantOrgId as string) || (req.body?.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string);
      const classId = (req.query.classId as string) || (req.body?.classId as string);
      const result = await TeacherPortalService.clearAllData(orgId, classId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- CLASS ROSTER & CUSTOM ROLL/GR NO CONTROLLERS ---
  static async getClassStudentsRoster(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : null);
      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || 'mount_carmel_school';
      const classId = (req.query.classId as string) || 'CLASS-10A';

      const students = await TeacherPortalService.getClassStudentsRoster(orgId, classId);
      res.json({ success: true, students, count: students.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getRollNoConfig(req: Request, res: Response): Promise<void> {
    try {
      const orgId = (req.query.tenantOrgId as string) || 'mount_carmel_school';
      const classId = (req.query.classId as string) || 'CLASS-10A';
      const config = await TeacherPortalService.getRollNoConfig(orgId, classId);
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateRollNoConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await TeacherPortalService.updateRollNoConfig(req.body);
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateStudentSchoolProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await TeacherPortalService.updateStudentSchoolProfile(req.body);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
