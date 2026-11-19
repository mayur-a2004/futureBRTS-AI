import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { TeacherPortalService, cleanTenantOrgId } from './teacher_portal.service';
import { TenantUserModel } from './tenant_user.model';
import User from '../auth/user.model';
import { upsertSchoolToUdiseDatabase } from '../auth/school_helper';

export class TeacherPortalController {

  // --- HOMEWORK ASSIGNMENTS ---
  static async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { tenantOrgId, classId, grade, section, subject, board, chapter, topic, language, mode, rubric, teacherId, teacherName, title, description, attachmentUrl, videoUrl, attachmentType, maxScore, dueDate } = req.body;
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
        attachmentUrl: attachmentUrl || '',
        videoUrl: videoUrl || '',
        attachmentType: attachmentType || 'NONE',
        maxScore: maxScore ? Number(maxScore) : 100,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      res.json({ success: true, assignment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async aiGenerateHomework(req: Request, res: Response): Promise<void> {
    try {
      const { board, standard, subject, chapter, topic, language } = req.body;
      const title = `${subject} Practice Worksheet: ${chapter ? (chapter.split(':')[1] || chapter) : 'Core Concepts'} (${topic || 'General'})`;
      const questions = `📋 OFFICIAL BOARD WORKSHEET [${(board || 'GSEB').toUpperCase()} | ${(standard || '11').toUpperCase()} | ${(language || 'ENGLISH').toUpperCase()}]\n\nSubject: ${subject}\nChapter: ${chapter}\nSub-Topic: ${topic}\n\nQ1. Explain the fundamental principles of ${topic || chapter} in detail with suitable examples.\nQ2. Solve the core numerical / theoretical problem related to ${chapter}.\nQ3. Case Study Analysis: Apply ${topic || chapter} rules to analyze real-life scenarios.\nQ4. Distinguish between key concepts discussed in ${chapter}.\nQ5. Write short notes on practical applications of ${topic || chapter}.\n\n📌 Instructions: Write neat handwritten answers in your notebook and upload photo/PDF for Vision AI Auto-Grading.`;
      const rubric = `Award 20 points per question for showing clear steps, accurate calculations, and proper textbook terms for ${topic || chapter}.`;
      res.json({ success: true, title, questions, rubric });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAssignments(req: Request, res: Response): Promise<void> {
    try {
      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || 'mount_carmel_school';
      const classId = req.query.classId as string;
      const teacherId = req.query.teacherId as string;
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
        studentId: studentId || 'STU-101',
        studentName: studentName || 'Student',
        imageUrl,
        subject
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

  static async getStudentSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const studentId = (req.query.studentId as string) || user?.id || user?._id;
      const studentName = (req.query.studentName as string) || user?.name;

      const submissions = await TeacherPortalService.getStudentSubmissions(studentId, studentName);
      res.json({ success: true, count: submissions.length, submissions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateSubmissionGrade(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId, scoreObtained, feedback, teacherRemarks, teacherAttachmentUrl, status, gradingMode } = req.body;
      if (!submissionId) {
        res.status(400).json({ error: 'submissionId is required' });
        return;
      }
      const submission = await TeacherPortalService.updateSubmissionGrade({
        submissionId,
        scoreObtained: scoreObtained !== undefined ? Number(scoreObtained) : undefined,
        feedback,
        teacherRemarks,
        teacherAttachmentUrl,
        status,
        gradingMode
      });
      res.json({ success: true, submission });
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

  static async saveTimetable(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? cleanTenantOrgId(user.schoolName) : null);
      const { tenantOrgId, classId, schedules, ...singleItem } = req.body;
      const orgId = tenantOrgId || userOrgId || 'ldrp_institute_of_technology__research';

      if (Array.isArray(schedules) && schedules.length > 0) {
        const result = await TeacherPortalService.batchSaveTimetable({
          tenantOrgId: orgId,
          classId: classId || '11 Commerce-A',
          schedules
        });
        res.json({ success: true, ...result });
      } else {
        const schedule = await TeacherPortalService.saveTimetableSchedule({
          ...singleItem,
          tenantOrgId: orgId,
          classId: classId || '11 Commerce-A'
        });
        res.json({ success: true, schedule });
      }
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
      const { email, password, name, schoolName, teacherId, schoolAddress, subject, board, medium, roleInSchool, gender, whatsappNumber, assignedClasses, assignedSubjects, assignedMediums, assignedBoards, assignedSchools } = req.body;
      const orgId = schoolName ? cleanTenantOrgId(schoolName) : 'independent_teacher';
      
      const rawClasses = (Array.isArray(assignedClasses) && assignedClasses.length > 0) 
        ? assignedClasses 
        : [];

      const classListSet = new Set<string>();
      rawClasses.forEach((cls: string) => {
        if (!cls) return;
        let clean = cls
          .replace(/^CLASS[_-]/i, '')
          .replace(/^Class\s+/i, '')
          .replace(/_/g, ' ')
          .trim();

        const matchSec = clean.match(/^(.*?)(?:\s*[-_]\s*|\s+Sec\s+|\s+Section\s+|\s+)([a-zA-Z])$/i);
        if (matchSec) {
          const stdPart = matchSec[1].trim();
          const secPart = matchSec[2].toUpperCase();
          if (stdPart) {
            clean = `${stdPart}-${secPart}`;
          }
        }
        if (clean) classListSet.add(clean);
      });
      const classList = Array.from(classListSet);

      const subjectList = (Array.isArray(assignedSubjects) && assignedSubjects.length > 0)
        ? assignedSubjects
        : (subject ? [subject] : []);

      const finalTeacherId = teacherId || `TCH-${Math.floor(1000 + Math.random() * 9000)}`;

      let user: any = null;
      if (email && email.trim() !== '') {
        user = await (TenantUserModel as any).findOne({ email: email.toLowerCase() });
      }
      if (!user && finalTeacherId) {
        user = await (TenantUserModel as any).findOne({ externalId: finalTeacherId, tenantOrgId: orgId });
      }

      if (!user) {
        user = await (TenantUserModel as any).create({
          tenantOrgId: orgId,
          externalId: finalTeacherId,
          name: name || 'Faculty Teacher',
          email: (email && email.trim() !== '') ? email.toLowerCase() : `${finalTeacherId.toLowerCase()}@${orgId}.edu.in`,
          role: 'TEACHER',
          schoolName: schoolName || '',
          subject: subjectList[0] || subject || '',
          assignedClasses: classList,
          assignedSubjects: subjectList,
          status: 'ACTIVE'
        });
      } else {
        user.role = 'TEACHER';
        user.tenantOrgId = orgId;
        user.schoolName = schoolName || user.schoolName || '';
        user.assignedClasses = Array.from(new Set([...(user.assignedClasses || []), ...classList]));
        user.assignedSubjects = Array.from(new Set([...(user.assignedSubjects || []), ...subjectList]));
        if (subjectList[0]) user.subject = subjectList[0];
        await user.save();
      }

      if (email) {
        await User.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              role: 'TEACHER',
              isTeacher: true,
              schoolName: schoolName || '',
              tenantOrgId: orgId,
              onboardingCompleted: true,
              onboarding_status: 'DONE',
              teacherDetails: {
                schoolName: schoolName || '',
                teacherId: finalTeacherId,
                schoolAddress: schoolAddress || '',
                subject: subjectList.join(', '),
                whatsappNumber: whatsappNumber || '',
                assignedClasses: classList,
                assignedSubjects: subjectList,
                assignedBoards: Array.isArray(assignedBoards) ? assignedBoards : (board ? [board] : []),
                assignedMediums: Array.isArray(assignedMediums) ? assignedMediums : (medium ? [medium] : []),
                assignedSchools: Array.isArray(assignedSchools) ? assignedSchools : (schoolName ? [schoolName] : [])
              }
            }
          }
        ).catch(e => console.error('[TeacherRegister] Main User update notice:', e));
      }

      if (schoolName) {
        await upsertSchoolToUdiseDatabase({
          schoolName,
          fullAddress: schoolAddress,
          isTeacher: true
        }).catch(e => console.error('[TeacherRegister] Udise auto-save error:', e));
      }

      const secret = process.env.JWT_SECRET || 'secret';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: 'TEACHER', tenantOrgId: user.tenantOrgId || orgId },
        secret,
        { expiresIn: '7d' }
      );

      const userPayload = {
        _id: user._id,
        firstName: (name || 'Faculty').split(' ')[0],
        lastName: (name || 'Faculty').split(' ').slice(1).join(' ') || '',
        email: user.email,
        role: 'TEACHER',
        tenantOrgId: user.tenantOrgId || orgId,
        schoolName: schoolName || user.schoolName || '',
        assignedClasses: user.assignedClasses || classList,
        assignedSubjects: user.assignedSubjects || subjectList,
        teacherDetails: {
          schoolName: schoolName || user.schoolName || '',
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

      const lowerEmail = email.toLowerCase();
      let user = await (TenantUserModel as any).findOne({ email: lowerEmail });

      if (!user) {
        // Look up primary User collection for teacher record registered earlier
        const mainUser: any = await User.findOne({ email: lowerEmail });
        if (mainUser && (mainUser.role === 'TEACHER' || mainUser.role === 'teacher' || mainUser.isTeacher || mainUser.teacherDetails)) {
          const details = mainUser.teacherDetails || {};
          const resolvedSchoolName = mainUser.schoolName || details.schoolName || '';
          const orgId = mainUser.tenantOrgId || (resolvedSchoolName ? cleanTenantOrgId(resolvedSchoolName) : 'independent_teacher');

          const nameFromEmail = lowerEmail.split('@')[0].replace(/[._]/g, ' ');
          const formattedName = `${mainUser.firstName || ''} ${mainUser.lastName || ''}`.trim() || nameFromEmail;

          user = await (TenantUserModel as any).create({
            tenantOrgId: orgId,
            externalId: details.teacherId || `TCH-${mainUser._id.toString().slice(-4)}`,
            name: formattedName,
            email: lowerEmail,
            role: 'TEACHER',
            schoolName: resolvedSchoolName,
            subject: details.subject || '',
            assignedClasses: details.assignedClasses || mainUser.assignedClasses || [],
            assignedSubjects: details.assignedSubjects || (details.subject ? details.subject.split(',').map((s: string) => s.trim()) : []),
            status: 'ACTIVE'
          });
        } else {
          res.status(404).json({ success: false, error: 'Teacher account not found. Please register first.' });
          return;
        }
      }

      const secret = process.env.JWT_SECRET || 'secret';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: 'TEACHER', tenantOrgId: user.tenantOrgId },
        secret,
        { expiresIn: '7d' }
      );

      const resolvedSchoolName = user.schoolName
        || (user.tenantOrgId ? user.tenantOrgId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '');

      const userPayload = {
        _id: user._id,
        firstName: user.name ? user.name.split(' ')[0] : 'Teacher',
        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
        email: user.email,
        role: 'TEACHER',
        tenantOrgId: user.tenantOrgId || '',
        schoolName: resolvedSchoolName,
        assignedClasses: user.assignedClasses || [],
        assignedSubjects: user.assignedSubjects || [],
        teacherDetails: {
          schoolName: resolvedSchoolName,
          teacherId: user.externalId || '',
          subject: (user.assignedSubjects || []).join(', ') || user.subject || ''
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
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const user = (req as any).user;
      const schoolName = (req.query.schoolName as string) || (req.headers['x-school-name'] as string) || user?.schoolName || '';
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? cleanTenantOrgId(user.schoolName) : null);
      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || (schoolName ? cleanTenantOrgId(schoolName) : '');
      const classId = (req.query.classId as string) || (user?.assignedClasses?.[0]) || '';

      const students = await TeacherPortalService.getClassStudentsRoster(orgId, classId, schoolName);
      res.json({ success: true, students, count: students.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getRollNoConfig(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userOrgId = user?.tenantOrgId || (user?.schoolName ? cleanTenantOrgId(user.schoolName) : null);
      const orgId = (req.query.tenantOrgId as string) || (req.headers['x-tenant-org-id'] as string) || userOrgId || '';
      const classId = (req.query.classId as string) || (user?.assignedClasses?.[0]) || '';
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

  static async getStudentAssignedTeachers(req: Request, res: Response): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const { schoolName, tenantOrgId, udiseCode, standard, section } = req.query;
      const teachers = await TeacherPortalService.getStudentAssignedTeachers({
        schoolName: (schoolName as string) || '',
        tenantOrgId: (tenantOrgId as string) || '',
        udiseCode: (udiseCode as string) || '',
        standard: (standard as string) || '',
        section: (section as string) || ''
      });
      res.json({ success: true, teachers, count: teachers.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
