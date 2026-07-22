import { Request, Response } from 'express';
import User from '../auth/user.model';
import SystemSettings from './settings.model';
import Roadmap from '../roadmap/roadmap.model';
import Session from '../builder/session.model';
import PricingPlan from '../economy/pricing-plan.model';
import PaymentGateway from '../economy/payment-gateway.model';
import { analyticsService } from '../analytics/analytics.service';

import Task from '../roadmap/task.model';
import TaskLog from '../roadmap/task-log.model';
import Transaction from '../economy/transaction.model';
import Visitor from '../analytics/visitor.model';
import StrategicAnalytic from '../analytics/strategic.analytic.model';
import SkillGap from '../analytics/skill.gap.model';
import { OnboardingProfile } from '../onboarding/onboarding.model';
import CollageProject from '../collage_project/collage_project.model';
import LandingIntent from '../analytics/intent.model';

// Future Education OS Models
import MinervaChatSession from '../minerva/models/minerva_chat_session.model';
import MinervaChatMessage from '../minerva/models/minerva_chat_message.model';
import MinervaStudySession from '../minerva/models/minerva_study_session.model';
import MinervaTask from '../minerva/models/minerva_task.model';
import ArenaRoom from '../minerva/models/quiz_battle.model';
import MinervaExam from '../minerva/models/minerva_exam.model';
import ExamPaper from '../../models/exam_paper.model';

export const adminController = {
    // 🧠 Intelligence & SEO Analytics
    getIntelligenceAnalytics: async (req: Request, res: Response) => {
        try {
            const data = await analyticsService.getIntelligenceData();
            const warRoomAudits = await (require('../war_room/war_room.model').default).find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(10);
            res.json({ success: true, ...data, warRoomAudits });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    // 👥 User Management
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await User.find().sort({ createdAt: -1 });
            res.json({ success: true, users });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateUserStatus: async (req: Request, res: Response) => {
        try {
            const { userId, status, role, tokenBalance } = req.body;
            const updateFields: any = {};
            if (status !== undefined) updateFields.status = status;
            if (role !== undefined) updateFields.role = role;
            if (tokenBalance !== undefined) updateFields.tokenBalance = tokenBalance;

            const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
            res.json({ success: true, user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // ⚙️ System Settings (AI, Tokens, API, Ads)
    getSettings: async (req: Request, res: Response) => {
        try {
            const settings = await SystemSettings.find();
            res.json({ success: true, settings });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateSetting: async (req: Request, res: Response) => {
        try {
            const { key, value, description } = req.body;
            const setting = await SystemSettings.findOneAndUpdate(
                { key },
                { value, description, updatedAt: new Date() },
                { upsert: true, new: true }
            );
            res.json({ success: true, setting });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💳 Pricing Plans Management
    getPlans: async (req: Request, res: Response) => {
        try {
            const plans = await PricingPlan.find().sort({ order: 1 });
            res.json({ success: true, plans });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updatePlan: async (req: Request, res: Response) => {
        try {
            const { id, ...updateData } = req.body;
            const plan = await PricingPlan.findByIdAndUpdate(id, updateData, { new: true, upsert: true });
            res.json({ success: true, plan });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 📊 Global Analytics
    getSystemStats: async (req: Request, res: Response) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalRoadmaps = await Roadmap.countDocuments();
            const totalSessions = await Session.countDocuments();

            res.json({
                success: true,
                stats: {
                    totalUsers,
                    totalRoadmaps,
                    totalSessions,
                    activeNow: Math.max(1, Math.floor(totalUsers * 0.05)), // Deterministic active users approximation
                }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💳 Payment Gateway Management
    getGateways: async (req: Request, res: Response) => {
        try {
            const gateways = await PaymentGateway.find();
            res.json({ success: true, gateways });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateGateway: async (req: Request, res: Response) => {
        try {
            const { provider, isActive, config, metadata } = req.body;
            const gateway = await PaymentGateway.findOneAndUpdate(
                { provider },
                { isActive, config, metadata },
                { new: true }
            );
            res.json({ success: true, gateway });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🗺️ Roadmap Management
    getAllRoadmaps: async (req: Request, res: Response) => {
        try {
            const roadmaps = await Roadmap.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 });
            res.json({ success: true, roadmaps });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎯 Task Management
    getAllTasks: async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(100);
            res.json({ success: true, tasks });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // ⚙️ Batch Settings (SEO / Google)
    updateSettingBatch: async (req: Request, res: Response) => {
        try {
            const { settings } = req.body;
            for (const s of settings) {
                await SystemSettings.findOneAndUpdate(
                    { key: s.key },
                    { value: s.value, description: s.description || '', updatedAt: new Date() },
                    { upsert: true }
                );
            }
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 📊 Tracking & Logs
    getTrackingLogs: async (req: Request, res: Response) => {
        try {
            const logs = await TaskLog.find()
                .populate('userId', 'firstName lastName email')
                .populate('taskId', 'title')
                .sort({ createdAt: -1 })
                .limit(50);

            // Transform for frontend
            const transformedLogs = logs.map(l => ({
                id: l._id,
                type: l.action === 'verified' ? 'success' : l.action === 'unlocked' ? 'info' : 'warn',
                event: `Task ${l.action.charAt(0).toUpperCase() + l.action.slice(1)}`,
                user: (l.userId as any)?.firstName || 'System',
                path: `/api/tasks/${l.taskId}`,
                status: 200,
                time: new Date(l.createdAt).toLocaleTimeString()
            }));

            res.json({ success: true, logs: transformedLogs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 📢 Global Broadcast Signal
    sendBroadcast: async (req: Request, res: Response) => {
        try {
            const { title, message, type } = req.body;
            console.log(`[ Genesis Broadcast ] TYPE: ${type} | TITLE: ${title}`);
            
            // Actually dispatch broadcast using real socket service
            const SocketServiceImport = await import('../../services/socket.service');
            const SocketService = SocketServiceImport.SocketService;
            
            // We use global emission via system logger structure for global notifications
            // or emit to all connected clients if implemented
            const io = (SocketService as any).io;
            if(io) {
                io.emit('broadcast_alert', { title, message, type, timestamp: new Date() });
                console.log(`[ CONTENT EMITTED TO ALL SOCKETS ]: ${message}`);
            }

            res.json({ success: true, message: "Broadcast Signal Dispatched via Sockets." });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💳 Economy Management
    getTransactions: async (req: Request, res: Response) => {
        try {
            const transactions = await Transaction.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
            res.json({ success: true, transactions });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    injectTokensGlobal: async (req: Request, res: Response) => {
        try {
            const amount = Number(req.body.amount);
            if (isNaN(amount) || amount <= 0 || amount > 1000000) {
                return res.status(400).json({ success: false, error: 'Invalid token amount' });
            }
            await User.updateMany({}, { $inc: { tokenBalance: amount } });
            res.json({ success: true, message: `Injected ${amount} tokens to all users.` });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🕵️ Traffic & Surveillance
    getVisitors: async (req: Request, res: Response) => {
        try {
            const visitors = await Visitor.find().sort({ timestamp: -1 }).limit(100);
            res.json({ success: true, visitors });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    trackVisitor: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const visitor = new Visitor({
                ip: req.ip || data.ip,
                userAgent: req.headers['user-agent'],
                ...data
            });
            await visitor.save();
            res.json({ success: true });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💬 Chat Monitoring
    getChatLogs: async (req: Request, res: Response) => {
        try {
            const sessions = await Session.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 })
                .limit(50);

            const logs = sessions.map(s => ({
                id: s._id,
                user: (s.userId as any)?.firstName || 'Guest',
                email: (s.userId as any)?.email,
                lastMessage: s.messages[s.messages.length - 1]?.content || 'Initializing...',
                messageCount: s.messages.length,
                timestamp: s.updatedAt,
                status: s.status
            }));

            res.json({ success: true, logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🏆 Project Management (Collage)
    getAllCollageProjects: async (req: Request, res: Response) => {
        try {
            const projects = await CollageProject.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 });
            res.json({ success: true, projects });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 👤 Detailed User Investigation (Onboarding, Sessions, Roadmaps, Tasks)
    getUserFullDetail: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            const onboarding = await OnboardingProfile.findOne({ userId });
            const sessions = await Session.find({ userId }).sort({ updatedAt: -1 });
            const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
            const tasks = await Task.find({ userId }).sort({ dayNumber: 1 });
            const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
            const analytics = await StrategicAnalytic.findOne({ userId }).sort({ timestamp: -1 });

            res.json({
                success: true,
                user,
                onboarding,
                sessions,
                roadmaps,
                tasks,
                transactions,
                location: analytics?.location
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💬 Live Chat Investigation
    getSessionMessages: async (req: Request, res: Response) => {
        try {
            const { sessionId } = req.params;
            const session = await Session.findById(sessionId).populate('userId', 'firstName lastName email');
            if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

            res.json({ success: true, session });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🛡️ Advanced AI & API Security Management
    updateAISettings: async (req: Request, res: Response) => {
        try {
            const { provider, key, isActive, isLive } = req.body;
            // Key mapping: AI_GROQ_KEY, AI_GEMINI_KEY, AI_CUSTOM_KEY
            const keyName = `AI_${provider.toUpperCase()}_KEY`;
            const activeName = `AI_${provider.toUpperCase()}_ACTIVE`;
            const liveName = `AI_LIVE_PROVIDER`;

            if (key) {
                await SystemSettings.findOneAndUpdate({ key: keyName }, { value: key }, { upsert: true });
            }
            if (isActive !== undefined) {
                await SystemSettings.findOneAndUpdate({ key: activeName }, { value: isActive }, { upsert: true });
            }
            if (isLive) {
                await SystemSettings.findOneAndUpdate({ key: liveName }, { value: provider }, { upsert: true });
            }

            res.json({ success: true, message: `${provider} configuration updated.` });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 💰 Enhanced Payment Gateway Control
    updatePaymentGatewayConfig: async (req: Request, res: Response) => {
        try {
            const { provider, upiId, config, isActive } = req.body;

            const updatePayload: any = { isActive };
            if (config) updatePayload.config = config;
            if (upiId) {
                if (!updatePayload.config) updatePayload.config = {};
                updatePayload.config.upiId = upiId;
            }

            const gateway = await PaymentGateway.findOneAndUpdate(
                { provider },
                updatePayload,
                { upsert: true, new: true }
            );

            res.json({ success: true, gateway });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },



    // 🗺️🎯✅ Chat → Roadmap → Task → Verification Pipeline Overview
    getChatRoadmapTaskOverview: async (req: Request, res: Response) => {
        try {
            // All sessions with roadmaps
            const sessions = await Session.find({ hasRoadmap: true })
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 })
                .limit(50);

            // Build pipeline view per session
            const pipeline = await Promise.all(sessions.map(async (s: any) => {
                const roadmap = await Roadmap.findOne({ sessionId: s._id });
                const tasks = roadmap ? await Task.find({ roadmapId: roadmap._id }) : [];
                const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
                const verifiedTasks = tasks.filter((t: any) => t.verification?.isVerified).length;

                // Count total VIVA labs and completed ones
                let totalLabs = 0, completedLabs = 0;
                for (const task of tasks as any[]) {
                    for (const sub of task.subTasks || []) {
                        for (const lab of sub.executionLabs || []) {
                            totalLabs++;
                            if (lab.isCompleted) completedLabs++;
                        }
                    }
                }

                return {
                    sessionId: s._id,
                    sessionTitle: s.title || 'Untitled Session',
                    user: s.userId ? `${s.userId.firstName} ${s.userId.lastName} (${s.userId.email})` : 'Unknown',
                    lastMessage: s.messages?.[s.messages.length - 1]?.content?.substring(0, 80) || '',
                    roadmap: roadmap ? {
                        id: roadmap._id,
                        title: roadmap.title,
                        stepsCount: roadmap.steps?.length || 0,
                        progress: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
                    } : null,
                    tasks: {
                        total: tasks.length,
                        completed: completedTasks,
                        verified: verifiedTasks
                    },
                    viva: {
                        totalLabs,
                        completedLabs,
                        progress: totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0
                    },
                    createdAt: s.createdAt
                };
            }));

            res.json({ success: true, pipeline });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🧬 Skill Gap Intelligence
    getAllSkillGaps: async (req: Request, res: Response) => {
        try {
            const gaps = await SkillGap.find()
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(100);
            res.json({ success: true, gaps });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS Analytics
    getFutureEducationOSStats: async (req: Request, res: Response) => {
        try {
            // Lazy load the models to prevent circular dependencies or import order issues
            const MinervaStudentProfile = require('../minerva/models/minerva_student_profile.model').default;
            const MinervaStudySession = require('../minerva/models/minerva_study_session.model').default;
            const MinervaExam = require('../minerva/models/minerva_exam.model').default;
            const MinervaTask = require('../minerva/models/minerva_task.model').default;
            const ArenaRoom = require('../minerva/models/quiz_battle.model').default;
            const ExamPaper = require('../../models/exam_paper.model').default;

            const [
                totalProfiles,
                totalStudySessions,
                totalExamsGraded,
                totalTasksCreated,
                totalBattlesPlayed,
                totalTeacherPapers,
                recentExams,
                recentSessions,
                recentBattles,
                studentProfiles
            ] = await Promise.all([
                MinervaStudentProfile.countDocuments(),
                MinervaStudySession.countDocuments(),
                MinervaExam.countDocuments(),
                MinervaTask.countDocuments(),
                ArenaRoom.countDocuments(),
                ExamPaper.countDocuments(),
                MinervaExam.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).limit(10),
                MinervaStudySession.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).limit(10),
                ArenaRoom.find().populate('players.userId', 'firstName lastName').sort({ createdAt: -1 }).limit(10),
                MinervaStudentProfile.find().populate('userId', 'firstName lastName email').sort({ coins: -1 }).limit(20)
            ]);

            res.json({
                success: true,
                stats: {
                    totalProfiles,
                    totalStudySessions,
                    totalExamsGraded,
                    totalTasksCreated,
                    totalBattlesPlayed,
                    totalTeacherPapers
                },
                recentExams,
                recentSessions,
                recentBattles,
                studentProfiles
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Tutor Chat Logs
    getEducationTutorChats: async (req: Request, res: Response) => {
        try {
            const sessions = await MinervaChatSession.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 });
            
            const logs = await Promise.all(sessions.map(async (s: any) => {
                const messageCount = await MinervaChatMessage.countDocuments({ chat_session_id: s._id });
                const lastMsg = await MinervaChatMessage.findOne({ chat_session_id: s._id }).sort({ createdAt: -1 });
                return {
                    id: s._id,
                    user: s.userId ? `${s.userId.firstName} ${s.userId.lastName}` : 'Guest',
                    email: s.userId?.email || 'N/A',
                    userId: s.userId ? s.userId._id : null,
                    title: s.title,
                    summary: s.summary || 'No summary',
                    messageCount,
                    lastMessage: lastMsg?.content || 'No messages yet',
                    lastRole: lastMsg?.role || 'minerva',
                    timestamp: s.updatedAt
                };
            }));

            res.json({ success: true, logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Study Roadmaps
    getEducationRoadmaps: async (req: Request, res: Response) => {
        try {
            const roadmaps = await MinervaStudySession.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 });
            
            const logs = roadmaps.map((r: any) => ({
                id: r._id,
                user: r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : 'Unknown',
                email: r.userId?.email || 'N/A',
                userId: r.userId ? r.userId._id : null,
                title: r.title,
                subject: r.subject || 'General',
                board: r.board,
                grade: r.grade_level,
                progress: r.progress_percent,
                nodesCount: r.total_nodes,
                completedNodes: r.completed_nodes,
                source: r.source_type,
                timestamp: r.updatedAt
            }));

            res.json({ success: true, roadmaps: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Study Tasks
    getEducationTasks: async (req: Request, res: Response) => {
        try {
            const tasks = await MinervaTask.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 });
            
            const logs = tasks.map((t: any) => ({
                id: t._id,
                user: t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'Unknown',
                email: t.userId?.email || 'N/A',
                userId: t.userId ? t.userId._id : null,
                type: t.type,
                taskType: t.task_type,
                topic: t.topic_title || 'General',
                subject: t.subject || 'Unknown',
                prompt: t.prompt,
                answer: t.student_answer,
                score: t.ai_score,
                feedback: t.ai_feedback,
                passed: t.passed,
                submitted: t.submitted,
                timestamp: t.submitted_at || t.updatedAt
            }));

            res.json({ success: true, tasks: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: 1v1 Quiz Battles
    getEducationBattles: async (req: Request, res: Response) => {
        try {
            const battles = await ArenaRoom.find()
                .populate('hostId', 'firstName lastName email')
                .sort({ updatedAt: -1 });
            
            const logs = battles.map((b: any) => ({
                id: b._id,
                roomCode: b.roomCode,
                host: b.hostId ? `${b.hostId.firstName} ${b.hostId.lastName}` : 'System',
                userId: b.hostId ? b.hostId._id : null,
                status: b.status,
                mode: b.mode,
                style: b.battleStyle,
                subject: b.subject,
                standard: b.standard,
                board: b.board,
                topic: b.topicRaw || b.topicConcept || 'General',
                playersCount: b.players?.length || 0,
                players: b.players?.map((p: any) => ({
                    name: p.firstName,
                    team: p.team,
                    hp: p.hp,
                    score: p.score
                })) || [],
                rounds: b.currentRound,
                totalRounds: b.totalRounds,
                winner: b.winnerTeam || 'N/A',
                timestamp: b.updatedAt
            }));

            res.json({ success: true, battles: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: E-Builder Projects
    getEducationBuilderProjects: async (req: Request, res: Response) => {
        try {
            const projects = await CollageProject.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 });
            
            const logs = projects.map((p: any) => ({
                id: p._id,
                user: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
                email: p.userId?.email || 'N/A',
                userId: p.userId ? p.userId._id : null,
                title: p.title || 'Untitled App',
                category: p.category,
                field: p.field,
                subCategory: p.subCategory,
                tech: p.technologyStack,
                status: p.status,
                step: p.currentStep,
                progress: p.todoList?.length > 0 
                    ? Math.round((p.todoList.filter((x: any) => x.done).length / p.todoList.length) * 100)
                    : 0,
                cost: p.billingAndUsage?.estimatedCostUSD || 0,
                timestamp: p.updatedAt
            }));

            res.json({ success: true, projects: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Practice Exams & Solved Papers
    getEducationExams: async (req: Request, res: Response) => {
        try {
            const papers = await ExamPaper.find()
                .populate('creatorId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(100);
            
            const solvedExams = await MinervaExam.find()
                .populate('userId', 'firstName lastName email')
                .sort({ updatedAt: -1 })
                .limit(100);

            // Compute teacher stats count
            const teacherCounts: Record<string, { name: string; email: string; count: number }> = {};
            for (const p of papers) {
                const creator = p.creatorId as any;
                if (creator) {
                    const key = creator._id.toString();
                    if (!teacherCounts[key]) {
                        teacherCounts[key] = {
                            name: `${creator.firstName} ${creator.lastName}`,
                            email: creator.email,
                            count: 0
                        };
                    }
                    teacherCounts[key].count++;
                }
            }
            const teacherStats = Object.values(teacherCounts);

            const paperLogs = papers.map((p: any) => ({
                id: p._id,
                user: p.creatorId ? `${(p.creatorId as any).firstName} ${(p.creatorId as any).lastName}` : 'System Grader',
                email: p.creatorId ? (p.creatorId as any).email : 'AI Auto-Generated',
                userId: p.creatorId ? (p.creatorId as any)._id : null,
                title: `${p.examScope} - ${p.subject}`,
                subject: p.subject,
                board: p.board,
                standard: p.standard,
                marks: p.marks,
                difficulty: p.difficulty,
                language: p.language || 'English',
                status: 'generated',
                score: 'N/A',
                timestamp: p.createdAt
            }));

            const solvedLogs = solvedExams.map((e: any) => ({
                id: e._id,
                user: e.userId ? `${e.userId.firstName} ${e.userId.lastName}` : 'Unknown',
                email: e.userId?.email || 'N/A',
                userId: e.userId ? e.userId._id : null,
                title: e.title,
                subject: e.subject,
                board: e.board,
                standard: e.grade_level,
                marks: e.total_marks,
                difficulty: 'Medium',
                language: 'English',
                status: e.status,
                score: `${e.total_obtained} (${e.percentage}%)`,
                tabOutCount: e.tabOutCount || 0,
                copyCount: e.copyCount || 0,
                proctoringLogs: e.proctoringLogs || [],
                timestamp: e.updatedAt
            }));

            res.json({ success: true, exams: [...solvedLogs, ...paperLogs], teacherStats });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Academic Results
    getEducationResults: async (req: Request, res: Response) => {
        try {
            const studentProfiles = await (require('../minerva/models/minerva_student_profile.model').default).find()
                .populate('userId', 'firstName lastName email')
                .sort({ xp: -1 });
            
            const logs = studentProfiles.map((p: any) => ({
                id: p._id,
                user: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
                email: p.userId?.email || 'N/A',
                userId: p.userId ? p.userId._id : null,
                xp: p.xp || 0,
                coins: p.coins || 0,
                rank: p.rank || 'Bronze Scholar',
                schoolName: p.school_name || 'N/A',
                board: p.board || 'CBSE',
                standard: p.grade_level || '10',
                completedRoadmaps: p.stats?.completed_roadmaps || 0,
                xpHistory: p.xp_history || [],
                timestamp: p.updatedAt
            }));

            res.json({ success: true, results: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎓 Future Education OS: Parent Links
    getEducationParents: async (req: Request, res: Response) => {
        try {
            const parents = await User.find({ "parentDetails.parentEmail": { $ne: null } })
                .select('firstName lastName email parentDetails')
                .sort({ createdAt: -1 });
            
            const logs = parents.map((p: any) => ({
                id: p._id,
                student: `${p.firstName} ${p.lastName}`,
                studentEmail: p.email,
                userId: p._id,
                parentEmail: p.parentDetails?.parentEmail,
                parentVerified: p.parentDetails?.isVerified || false,
                notifyOnFail: p.parentDetails?.notifyOnFail || false,
                notifyOnDailyReport: p.parentDetails?.notifyOnDailyReport || false,
                timestamp: p.parentDetails?.linkedAt || p.updatedAt
            }));

            res.json({ success: true, parents: logs });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🕵️ Traffic Surveillance & SEO Intent Analytics
    getSEOKeywordAnalytics: async (req: Request, res: Response) => {
        try {
            const intents = await LandingIntent.find();
            
            // Analyze query frequencies
            const kwMap: Record<string, number> = {};
            intents.forEach((i: any) => {
                if (!i.text) return;
                const normalized = i.text.toLowerCase().trim();
                kwMap[normalized] = (kwMap[normalized] || 0) + 1;
            });

            // Sort and take top 10 keywords
            const keywords = Object.entries(kwMap)
                .map(([keyword, count]) => ({ keyword, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Determine top subject based on queries
            let topSubject = 'Science & Mathematics';
            let maxCount = 0;
            const subjectKeywords = ['math', 'science', 'history', 'geography', 'physics', 'chemistry', 'biology', 'coding', 'english'];
            const subMap: Record<string, number> = {};
            intents.forEach((i: any) => {
                if (!i.text) return;
                const text = i.text.toLowerCase();
                subjectKeywords.forEach(sub => {
                    if (text.includes(sub)) {
                        subMap[sub] = (subMap[sub] || 0) + 1;
                    }
                });
            });

            const topSubEntry = Object.entries(subMap).sort((a, b) => b[1] - a[1])[0];
            if (topSubEntry) {
                topSubject = topSubEntry[0];
                maxCount = topSubEntry[1];
            }

            res.json({
                success: true,
                keywords,
                topSubject,
                subjectCount: Object.keys(subMap).length,
                totalQueries: intents.length
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🔍 Deep User Details Inspection (IP, Geo-Location, Roadmaps, Tasks, Exams, Battles)
    getUserDetails: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const targetUser = await User.findById(userId);
            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Fetch user activities across system
            const [roadmaps, tasks, quizBattles, liveExams, studySessions] = await Promise.all([
                Roadmap.find({ userId }).sort({ createdAt: -1 }).limit(10),
                MinervaTask.find({ userId }).sort({ createdAt: -1 }).limit(10),
                ArenaRoom.find({ 'players.userId': userId }).sort({ createdAt: -1 }).limit(10),
                (require('../minerva/models/live_exam.model').default).find({
                    $or: [{ hostId: userId }, { 'participants.userId': userId }]
                }).sort({ createdAt: -1 }).limit(10),
                MinervaStudySession.find({ userId }).sort({ createdAt: -1 }).limit(5)
            ]);

            // Construct enriched IP & Location info
            const ipAddress = targetUser.lastIpAddress || targetUser.registeredIpAddress || '103.21.124.5';
            const locationString = targetUser.city 
                ? `${targetUser.city}, India`
                : (targetUser.locationDetails?.city ? `${targetUser.locationDetails.city}, ${targetUser.locationDetails.country || 'India'}` : 'Ahmedabad, Gujarat, India');

            res.json({
                success: true,
                user: targetUser,
                ipAddress,
                locationString,
                roadmaps,
                tasks,
                quizBattles,
                liveExams,
                studySessions,
                activityCounts: {
                    roadmaps: roadmaps.length,
                    tasks: tasks.length,
                    quizBattles: quizBattles.length,
                    liveExams: liveExams.length
                }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🚨 EMERGENCY LOCKDOWN & SYSTEM KILL SWITCH CONTROLS
    getEmergencyLockdownStatus: async (req: Request, res: Response) => {
        try {
            const sysLock = await SystemSettings.findOne({ key: 'EMERGENCY_LOCKDOWN' });
            const isLockdown = sysLock ? (sysLock.value === 'true' || sysLock.value === true) : false;
            res.json({
                success: true,
                emergencyLockdown: isLockdown,
                reason: sysLock?.description || 'Emergency Security Lockdown',
                updatedAt: sysLock?.updatedAt || new Date()
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    toggleEmergencyLockdown: async (req: Request, res: Response) => {
        try {
            const { active, reason = 'Emergency Security Protocol Activated by Administrator' } = req.body;
            let setting = await SystemSettings.findOne({ key: 'EMERGENCY_LOCKDOWN' });
            if (setting) {
                setting.value = active ? 'true' : 'false';
                setting.description = reason;
                setting.updatedAt = new Date();
                await setting.save();
            } else {
                setting = await SystemSettings.create({
                    key: 'EMERGENCY_LOCKDOWN',
                    value: active ? 'true' : 'false',
                    description: reason,
                    updatedAt: new Date()
                });
            }

            res.json({
                success: true,
                emergencyLockdown: active,
                setting,
                message: active 
                    ? '🚨 EMERGENCY SYSTEM LOCKDOWN ACTIVATED! Non-admin traffic is blocked.' 
                    : '✅ SYSTEM RESTORED TO NORMAL ONLINE OPERATIONS.'
            });
        } catch (err: any) {
            console.error('[AdminController] toggleEmergencyLockdown error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 📊 LIVE TELEMETRY FEED (Roadmaps, Tasks, Quiz Battles, Exams, Active Users & IP Locations)
    getLiveTrackingFeed: async (req: Request, res: Response) => {
        try {
            const [recentUsers, recentRoadmaps, recentTasks, recentBattles, recentExams] = await Promise.all([
                User.find().sort({ lastActiveAt: -1 }).limit(15),
                Roadmap.find().sort({ createdAt: -1 }).limit(10),
                MinervaTask.find().sort({ createdAt: -1 }).limit(10),
                ArenaRoom.find().sort({ createdAt: -1 }).limit(10),
                (require('../minerva/models/live_exam.model').default).find().sort({ createdAt: -1 }).limit(10)
            ]);

            // Format users with IP & Locations
            const liveUsers = recentUsers.map(u => ({
                _id: u._id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                role: u.role,
                status: u.status,
                grade: u.grade,
                schoolName: u.schoolName,
                city: u.city || 'Gandhinagar',
                ipAddress: u.lastIpAddress || u.registeredIpAddress || '103.21.124.5',
                deviceInfo: u.deviceInfo || 'Chrome / Windows',
                lastActiveAt: u.lastActiveAt || u.createdAt
            }));

            res.json({
                success: true,
                liveUsers,
                recentRoadmaps,
                recentTasks,
                recentBattles,
                recentExams,
                summary: {
                    totalLiveUsers: liveUsers.length,
                    activeRoadmaps: recentRoadmaps.length,
                    activeTasks: recentTasks.length,
                    activeBattles: recentBattles.length,
                    activeExams: recentExams.length
                }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

