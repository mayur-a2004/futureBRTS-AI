// 📚 Complete Mongoose Schema Definitions for B2B School ERP (futurebilder_erp)
import { Schema, Document } from 'mongoose';
import { getErpConnection } from '../../../config/erp_db.connection';

// 1. Universal Student Lifetime Passport Schema (USID)
export interface IUniversalStudentPassport extends Document {
  usid: string;
  govtIdHash?: string;
  primaryPhone: string;
  primaryEmail: string;
  fullName: string;
  dateOfBirth: string;
  activeTenantId?: string;
  activeGrade?: string;
  activeSection?: string;
  historicalSchoolLogs: {
    tenantId: string;
    schoolName: string;
    fromGrade: string;
    toGrade: string;
    joinedDate: Date;
    leftDate?: Date;
    transferCertificateUrl?: string;
  }[];
  aiLearningMemoryVault: {
    totalTutorHours: number;
    masteredTopics: string[];
    weakTopics: string[];
    certificatesEarned: { title: string; date: Date; url: string }[];
  };
}

const UniversalStudentPassportSchema = new Schema<IUniversalStudentPassport>({
  usid: { type: String, required: true, unique: true, index: true },
  govtIdHash: { type: String, index: true },
  primaryPhone: { type: String, required: true, index: true },
  primaryEmail: { type: String, required: true, index: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  activeTenantId: { type: String, index: true },
  activeGrade: { type: String },
  activeSection: { type: String },
  historicalSchoolLogs: [{
    tenantId: { type: String },
    schoolName: { type: String },
    fromGrade: { type: String },
    toGrade: { type: String },
    joinedDate: { type: Date, default: Date.now },
    leftDate: { type: Date },
    transferCertificateUrl: { type: String }
  }],
  aiLearningMemoryVault: {
    totalTutorHours: { type: Number, default: 0 },
    masteredTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    certificatesEarned: [{
      title: { type: String },
      date: { type: Date, default: Date.now },
      url: { type: String }
    }]
  }
}, { timestamps: true });

// 2. ERP Student Roster Schema
export interface IErpStudent extends Document {
  externalId: string;
  tenantId: string;
  usid?: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  rollNumber: number;
  parentEmail?: string;
  parentPhone?: string;
}

const ErpStudentSchema = new Schema<IErpStudent>({
  externalId: { type: String, required: true, index: true },
  tenantId: { type: String, required: true, index: true },
  usid: { type: String, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
  rollNumber: { type: Number, required: true },
  parentEmail: { type: String },
  parentPhone: { type: String }
}, { timestamps: true });

// 3. ERP Teacher Roster Schema
export interface IErpTeacher extends Document {
  externalId: string;
  tenantId: string;
  name: string;
  email: string;
  subject: string;
  assignedClasses: { grade: string; section: string }[];
  phone?: string;
}

const ErpTeacherSchema = new Schema<IErpTeacher>({
  externalId: { type: String, required: true, index: true },
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  assignedClasses: [{
    grade: { type: String },
    section: { type: String }
  }],
  phone: { type: String }
}, { timestamps: true });

// 4. ERP Homework Schema
export interface IErpHomework extends Document {
  homeworkId: string;
  tenantId: string;
  grade: string;
  section: string;
  subject: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: Date;
  attachmentUrl?: string;
}

const ErpHomeworkSchema = new Schema<IErpHomework>({
  homeworkId: { type: String, required: true, index: true },
  tenantId: { type: String, required: true, index: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  attachmentUrl: { type: String }
}, { timestamps: true });

// 5. ERP Attendance Schema
export interface IErpAttendance extends Document {
  tenantId: string;
  studentId: string;
  grade: string;
  section: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

const ErpAttendanceSchema = new Schema<IErpAttendance>({
  tenantId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  grade: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: String, required: true, index: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'], default: 'PRESENT' }
}, { timestamps: true });

// 6. ERP Submissions Schema (Vision AI Notebook Checks)
export interface IErpSubmission extends Document {
  tenantId: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  submittedAt: Date;
  aiGraded: boolean;
  scoreObtained: number;
  maxScore: number;
  feedback: string;
  teacherApproved: boolean;
}

const ErpSubmissionSchema = new Schema<IErpSubmission>({
  tenantId: { type: String, required: true, index: true },
  homeworkId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  aiGraded: { type: Boolean, default: true },
  scoreObtained: { type: Number, required: true },
  maxScore: { type: Number, default: 10 },
  feedback: { type: String, required: true },
  teacherApproved: { type: Boolean, default: false }
}, { timestamps: true });

// 7. ERP Fee Structure Schema
export interface IErpFee extends Document {
  tenantId: string;
  studentId: string;
  usid?: string;
  academicYear: string;
  totalFeeINR: number;
  paidAmountINR: number;
  dueAmountINR: number;
  dueDate: Date;
  installments: {
    installmentNo: number;
    amount: number;
    dueDate: Date;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    transactionId?: string;
    receiptUrl?: string;
  }[];
}

const ErpFeeSchema = new Schema<IErpFee>({
  tenantId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  usid: { type: String, index: true },
  academicYear: { type: String, required: true },
  totalFeeINR: { type: Number, required: true },
  paidAmountINR: { type: Number, default: 0 },
  dueAmountINR: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  installments: [{
    installmentNo: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING' },
    transactionId: { type: String },
    receiptUrl: { type: String }
  }]
}, { timestamps: true });

// Lazily Bind Models to Secondary ERP Mongo Connection
export const getErpModels = () => {
  const conn = getErpConnection();
  return {
    UniversalStudentPassportModel: conn.model<IUniversalStudentPassport>('UniversalPassport', UniversalStudentPassportSchema, 'universal_passports'),
    ErpStudentModel: conn.model<IErpStudent>('ErpStudent', ErpStudentSchema, 'erp_students'),
    ErpTeacherModel: conn.model<IErpTeacher>('ErpTeacher', ErpTeacherSchema, 'erp_teachers'),
    ErpHomeworkModel: conn.model<IErpHomework>('ErpHomework', ErpHomeworkSchema, 'erp_homework'),
    ErpAttendanceModel: conn.model<IErpAttendance>('ErpAttendance', ErpAttendanceSchema, 'erp_attendance'),
    ErpSubmissionModel: conn.model<IErpSubmission>('ErpSubmission', ErpSubmissionSchema, 'erp_submissions'),
    ErpFeeModel: conn.model<IErpFee>('ErpFee', ErpFeeSchema, 'erp_fees')
  };
};
