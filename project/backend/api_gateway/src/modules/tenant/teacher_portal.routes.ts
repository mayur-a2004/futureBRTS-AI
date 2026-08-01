import { Router } from 'express';
import { TeacherPortalController } from './teacher_portal.controller';

const router = Router();

// Role-based protection middleware: restricts students from modifying teacher portal records
const teacherOnlyGuard = (req: any, res: any, next: any) => {
  const userRole = (req.headers['x-user-role'] || req.body?.userRole || req.query?.userRole || 'TEACHER').toString().toUpperCase();
  if (userRole === 'STUDENT') {
    return res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: '⛔ ACCESS DENIED: Students are strictly forbidden from performing Teacher Workspace actions (marking attendance, creating assignments, generating exam papers).'
    });
  }
  next();
};

// Homework & Assignments
router.post('/create-assignment', teacherOnlyGuard, TeacherPortalController.createAssignment);
router.get('/assignments', TeacherPortalController.getAssignments);
router.post('/submit-homework', TeacherPortalController.submitHomework);
router.get('/submissions/:assignmentId', TeacherPortalController.getSubmissions);
router.post('/update-submission-grade', teacherOnlyGuard, TeacherPortalController.updateSubmissionGrade);

// Attendance System
router.post('/mark-attendance', teacherOnlyGuard, TeacherPortalController.markAttendance);
router.get('/attendance-report', TeacherPortalController.getAttendanceReport);

// Timetable Schedule
router.get('/timetable', TeacherPortalController.getTimetable);

// AI Exam Paper Generator
router.post('/generate-exam-paper', teacherOnlyGuard, TeacherPortalController.generateExamPaper);

// Live Exam Rooms (Real-Time Database Persistence)
router.post('/live-rooms/create', TeacherPortalController.createLiveRoom);
router.get('/live-rooms/:roomCode', TeacherPortalController.getLiveRoom);
router.post('/live-rooms/join', TeacherPortalController.joinLiveRoom);
router.post('/live-rooms/start', TeacherPortalController.startLiveRoom);
router.post('/live-rooms/end', TeacherPortalController.endLiveRoom);
router.post('/live-rooms/submit-answer', TeacherPortalController.submitLiveAnswer);

// Auth Routes
router.post('/auth/register', TeacherPortalController.registerTeacher);
router.post('/auth/login', TeacherPortalController.loginTeacher);

export default router;
