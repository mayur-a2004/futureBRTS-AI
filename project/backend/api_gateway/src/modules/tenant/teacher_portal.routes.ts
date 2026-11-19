import { Router } from 'express';
import { TeacherPortalController } from './teacher_portal.controller';
import { authMiddleware, guestOrAuthMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Role-based protection middleware: restricts students from modifying teacher portal records
const teacherOnlyGuard = (req: any, res: any, next: any) => {
  const userRole = (req.user?.role || req.headers['x-user-role'] || req.body?.userRole || req.query?.userRole || 'TEACHER').toString().toUpperCase();
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
router.post('/create-assignment', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.createAssignment);
router.post('/ai-generate-homework', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.aiGenerateHomework);
router.get('/assignments', guestOrAuthMiddleware, TeacherPortalController.getAssignments);
router.post('/submit-homework', guestOrAuthMiddleware, TeacherPortalController.submitHomework);
router.get('/submissions/:assignmentId', guestOrAuthMiddleware, TeacherPortalController.getSubmissions);
router.get('/student-homework-grades', guestOrAuthMiddleware, TeacherPortalController.getStudentSubmissions);
router.post('/update-submission-grade', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.updateSubmissionGrade);

// Attendance System
router.post('/mark-attendance', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.markAttendance);
router.get('/attendance-report', guestOrAuthMiddleware, TeacherPortalController.getAttendanceReport);
router.get('/student-attendance-summary', guestOrAuthMiddleware, TeacherPortalController.getStudentAttendanceSummary);
router.post('/sync-daily-data', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.syncDailySchoolData);
router.get('/student-audit', guestOrAuthMiddleware, TeacherPortalController.getStudentAuditTimeline);

// Calendar & Events
router.post('/calendar/event', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.addCalendarEvent);
router.get('/calendar/events', guestOrAuthMiddleware, TeacherPortalController.getCalendarEvents);
router.delete('/calendar/event/:id', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.deleteCalendarEvent);

// Exam Schedules
router.post('/exam-schedule', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.addExamSchedule);
router.get('/exam-schedules', guestOrAuthMiddleware, TeacherPortalController.getExamSchedules);
router.delete('/exam-schedule/:id', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.deleteExamSchedule);

// Timetable Schedule
router.get('/timetable', guestOrAuthMiddleware, TeacherPortalController.getTimetable);
router.post('/timetable', guestOrAuthMiddleware, TeacherPortalController.saveTimetable);

// AI Exam Paper Generator
router.post('/generate-exam-paper', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.generateExamPaper);

// Live Exam Rooms (Real-Time Database Persistence)
router.post('/live-rooms/create', guestOrAuthMiddleware, TeacherPortalController.createLiveRoom);
router.get('/live-rooms/:roomCode', guestOrAuthMiddleware, TeacherPortalController.getLiveRoom);
router.post('/live-rooms/join', guestOrAuthMiddleware, TeacherPortalController.joinLiveRoom);
router.post('/live-rooms/start', guestOrAuthMiddleware, TeacherPortalController.startLiveRoom);
router.post('/live-rooms/end', guestOrAuthMiddleware, TeacherPortalController.endLiveRoom);
router.post('/live-rooms/submit-answer', guestOrAuthMiddleware, TeacherPortalController.submitLiveAnswer);

// Data Reset / Purge Endpoint
router.delete('/clear-all-data', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.clearAllData);
router.post('/clear-all-data', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.clearAllData);

// Auth Routes
router.post('/register', TeacherPortalController.registerTeacher);
router.post('/teacher/register', TeacherPortalController.registerTeacher);
router.post('/auth/register', TeacherPortalController.registerTeacher);
router.post('/auth/login', TeacherPortalController.loginTeacher);

// Class Roster & Custom Roll Number Configuration
router.get('/class-roster', guestOrAuthMiddleware, TeacherPortalController.getClassStudentsRoster);
router.get('/assigned-teachers-for-student', guestOrAuthMiddleware, TeacherPortalController.getStudentAssignedTeachers);
router.get('/rollno-config', guestOrAuthMiddleware, TeacherPortalController.getRollNoConfig);
router.post('/rollno-config', guestOrAuthMiddleware, teacherOnlyGuard, TeacherPortalController.updateRollNoConfig);
router.post('/student-school-profile', guestOrAuthMiddleware, TeacherPortalController.updateStudentSchoolProfile);

export default router;
