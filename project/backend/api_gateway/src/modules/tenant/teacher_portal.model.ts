import mongoose, { Schema, Document } from 'mongoose';

// 1. Teacher Homework Assignment Schema
export interface ITeacherAssignment extends Document {
  tenantOrgId: string;
  classId: string;
  grade: string;
  section: string;
  subject: string;
  board?: string;
  chapter?: string;
  topic?: string;
  language?: string;
  mode?: 'AI_GEN' | 'MANUAL_EDITOR';
  rubric?: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: Date;
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherAssignmentSchema = new Schema<ITeacherAssignment>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    subject: { type: String, required: true },
    board: { type: String, default: 'CBSE' },
    chapter: { type: String, default: '' },
    topic: { type: String, default: '' },
    language: { type: String, default: 'English' },
    mode: { type: String, enum: ['AI_GEN', 'MANUAL_EDITOR'], default: 'AI_GEN' },
    rubric: { type: String, default: '' },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date, required: true },
    submissionsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 2. Homework Submission & Vision AI Score Schema
export interface IHomeworkSubmission extends Document {
  assignmentId: string;
  tenantOrgId: string;
  classId: string;
  studentId: string;
  studentName: string;
  imageUrl: string;
  scoreObtained: number;
  maxScore: number;
  feedback: string;
  status: 'SUBMITTED' | 'GRADED' | 'REVIEWED';
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmission>(
  {
    assignmentId: { type: String, required: true, index: true },
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    scoreObtained: { type: Number, default: 0 },
    maxScore: { type: Number, default: 10 },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['SUBMITTED', 'GRADED', 'REVIEWED'], default: 'GRADED' },
    gradedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 3. Daily Attendance Schema
export interface IAttendanceRecord extends Document {
  tenantOrgId: string;
  classId: string;
  grade: string;
  section: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  markedByTeacherId: string;
  markedByTeacherName: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    date: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'], default: 'PRESENT' },
    markedByTeacherId: { type: String, required: true },
    markedByTeacherName: { type: String, default: 'Teacher' }
  },
  { timestamps: true }
);

AttendanceRecordSchema.index({ tenantOrgId: 1, classId: 1, date: 1, studentId: 1 }, { unique: true });

// 4. Timetable & Period Routine Schema
export interface ITimetableSchedule extends Document {
  tenantOrgId: string;
  classId: string;
  grade: string;
  section: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableScheduleSchema = new Schema<ITimetableSchedule>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    grade: { type: String, required: true },
    section: { type: String, default: 'A' },
    dayOfWeek: { type: String, required: true },
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    roomNumber: { type: String, default: 'Room 101' }
  },
  { timestamps: true }
);

// 5. Generated AI Exam Paper Schema
export interface IExamPaper extends Document {
  tenantOrgId: string;
  classId: string;
  subject: string;
  examTitle: string;
  durationMinutes: number;
  totalMarks: number;
  teacherName: string;
  questions: Array<{
    questionId: number;
    type: 'MCQ' | 'SHORT' | 'HOTS';
    questionText: string;
    options?: string[];
    correctAnswer: string;
    marks: number;
    explanation: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ExamPaperSchema = new Schema(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    examTitle: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    totalMarks: { type: Number, default: 50 },
    teacherName: { type: String, default: 'Teacher' },
    questions: { type: Schema.Types.Mixed, default: [] }
  },
  { timestamps: true }
);

// 6. Live Group Exam Arena Room Schema (Database Persistence)
export interface ILiveExamRoom extends Document {
  roomCode: string;
  tenantOrgId: string;
  classId: string;
  hostTeacherId: string;
  hostTeacherName: string;
  board: string;
  standard: string;
  subject: string;
  chapter: string;
  topic: string;
  language: string;
  durationMinutes: number;
  totalQuestions: number;
  status: 'WAITING' | 'LIVE' | 'COMPLETED';
  questions: Array<any>;
  candidates: Array<{
    studentId: string;
    studentName: string;
    grade?: string;
    joinedAt: Date;
    score: string;
    status: string;
    answers: Array<{ qId: number; type?: string; text: string; isCorrect?: boolean; score?: number }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const LiveExamRoomSchema = new Schema(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    hostTeacherId: { type: String, required: true },
    hostTeacherName: { type: String, required: true },
    board: { type: String, default: 'CBSE' },
    standard: { type: String, default: '10' },
    subject: { type: String, required: true },
    chapter: { type: String, default: '' },
    topic: { type: String, default: '' },
    language: { type: String, default: 'English' },
    durationMinutes: { type: Number, default: 15 },
    totalQuestions: { type: Number, default: 10 },
    status: { type: String, enum: ['WAITING', 'LIVE', 'COMPLETED'], default: 'WAITING' },
    questions: { type: Array, default: [] },
    candidates: { type: Array, default: [] }
  },
  { timestamps: true }
);

// 7. Master Academic Calendar & Event Schema
export interface ISchoolCalendarEvent extends Document {
  tenantOrgId: string;
  classId: string;
  title: string;
  date: string;
  category: string; // 'SPORTS_DAY' | 'EMERGENCY_HOLIDAY' | 'NATIONAL_FESTIVAL' | 'EXAM' | 'CELEBRATION'
  scope: string;
  status: string;
  impact?: string;
  createdByTeacherId?: string;
}

const SchoolCalendarEventSchema = new Schema<ISchoolCalendarEvent>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, default: 'ALL', index: true },
    title: { type: String, required: true },
    date: { type: String, required: true, index: true },
    category: { type: String, default: 'CELEBRATION' },
    scope: { type: String, default: 'ALL_SCHOOL' },
    status: { type: String, default: 'SCHEDULED' },
    impact: { type: String, default: '' },
    createdByTeacherId: { type: String, default: '' }
  },
  { timestamps: true }
);

// 8. Exam Schedule / Timetable Schema
export interface ISchoolExamSchedule extends Document {
  tenantOrgId: string;
  classId: string;
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  syllabusTopics: string;
  roomNumber: string;
  invigilatorName: string;
}

const SchoolExamScheduleSchema = new Schema<ISchoolExamSchedule>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    examName: { type: String, required: true },
    subject: { type: String, required: true },
    examDate: { type: String, required: true },
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '12:00 PM' },
    totalMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 35 },
    syllabusTopics: { type: String, default: '' },
    roomNumber: { type: String, default: 'Hall 1' },
    invigilatorName: { type: String, default: 'Class Teacher' }
  },
  { timestamps: true }
);

// 9. School Custom Roll No & GR No Config Schema
export interface ISchoolRollNoConfig extends Document {
  tenantOrgId: string;
  classId: string;
  prefix: string;
  yearCode: string;
  startingSequence: number;
  currentSequence: number;
  autoGenerate: boolean;
}

const SchoolRollNoConfigSchema = new Schema<ISchoolRollNoConfig>(
  {
    tenantOrgId: { type: String, required: true, index: true },
    classId: { type: String, required: true, index: true },
    prefix: { type: String, default: '12-ER-' },
    yearCode: { type: String, default: '2026' },
    startingSequence: { type: Number, default: 1001 },
    currentSequence: { type: Number, default: 1000 },
    autoGenerate: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const TeacherAssignmentModel = mongoose.models.TeacherAssignment || mongoose.model<ITeacherAssignment>('TeacherAssignment', TeacherAssignmentSchema);
export const HomeworkSubmissionModel = mongoose.models.HomeworkSubmission || mongoose.model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);
export const AttendanceRecordModel = mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
export const TimetableScheduleModel = mongoose.models.TimetableSchedule || mongoose.model<ITimetableSchedule>('TimetableSchedule', TimetableScheduleSchema);
export const TeacherExamPaperModel = mongoose.models.TeacherExamPaper || mongoose.model<IExamPaper>('TeacherExamPaper', ExamPaperSchema);
export const LiveExamRoomModel = mongoose.models.LiveExamRoom || mongoose.model<ILiveExamRoom>('LiveExamRoom', LiveExamRoomSchema);
export const SchoolCalendarEventModel = mongoose.models.SchoolCalendarEvent || mongoose.model<ISchoolCalendarEvent>('SchoolCalendarEvent', SchoolCalendarEventSchema);
export const SchoolExamScheduleModel = mongoose.models.SchoolExamSchedule || mongoose.model<ISchoolExamSchedule>('SchoolExamSchedule', SchoolExamScheduleSchema);
export const SchoolRollNoConfigModel = mongoose.models.SchoolRollNoConfig || mongoose.model<ISchoolRollNoConfig>('SchoolRollNoConfig', SchoolRollNoConfigSchema);
