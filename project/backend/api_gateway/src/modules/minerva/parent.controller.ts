import { Request, Response } from 'express';
import User from '../auth/user.model';
import MinervaStudySession from './models/minerva_study_session.model';
import MinervaKnowledgeNode from './models/minerva_knowledge_node.model';
import MinervaExam from './models/minerva_exam.model';
import { logger } from '../../shared/utils/logger';
import { getParentGuidanceTip } from './minerva.service';

export const parentController = {
    getStudentReport: async (req: Request, res: Response) => {
        try {
            const { studentEmail } = req.params;

            if (!studentEmail) {
                return res.status(400).json({ success: false, message: 'Student email is required.' });
            }

            const student = await User.findOne({ email: studentEmail.toLowerCase() });
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found.' });
            }

            // Fetch session progress
            const sessions = await MinervaStudySession.find({ userId: student._id });
            const totalSessions = sessions.length;
            const completedSessions = sessions.filter(s => s.progress_percent === 100).length;

            // Fetch knowledge nodes count
            const totalNodes = await MinervaKnowledgeNode.countDocuments({ userId: student._id });
            const completedNodes = await MinervaKnowledgeNode.countDocuments({ userId: student._id, status: 'DONE' });

            // Fetch exam stats
            const exams = await MinervaExam.find({ userId: student._id });
            const totalExams = exams.length;
            const averageScore = exams.length > 0 
                ? Math.round(exams.reduce((sum, e) => sum + e.percentage, 0) / exams.length) 
                : 85; // Default average fallback

            // AI generated study tip for parent
            const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
            const parentGuidanceTip = await getParentGuidanceTip(studentName, {
                level: student.level || 1,
                xp: student.xp || 0,
                totalSessions,
                completedSessions,
                totalNodes,
                completedNodes,
                totalExams,
                averageScore
            });

            res.status(200).json({
                success: true,
                student: {
                    name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                    level: student.level || 1,
                    xp: student.xp || 0,
                    badgesCount: (student.badges || []).length,
                },
                stats: {
                    totalSessions,
                    completedSessions,
                    totalNodes,
                    completedNodes,
                    totalExams,
                    averageScore,
                    parentGuidanceTip
                }
            });
        } catch (err: any) {
            logger.error('[ParentController] Get report error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
