import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import {
    ArrowLeft, Loader2, Copy, Check,
    AlertTriangle, Swords, BarChart2, Play, Users, 
    BookOpen, Star, Trophy, Calendar, Heart, ShieldAlert,
    LogOut, School, Phone, Mail, User, Book, MapPin, Tag
} from 'lucide-react';
import { io } from 'socket.io-client';
import { BOARDS, STANDARDS, STANDARD_SUBJECTS_MAP, isSchoolStandard } from './MinervaQuizBattlePage';

interface StudentStats {
    userId: string;
    name: string;
    grade: number;
    team: 'A' | 'B';
    score: number;
    totalAnswers: number;
    correctAnswers: number;
    wrongAnswers: number;
    avgSpeedSeconds: number;
    needsAttention: boolean;
    lastAnswer?: {
        selectedOption: number;
        isCorrect: boolean;
        timeMs: number;
    };
}

interface MonitorData {
    roomCode: string;
    subject: string;
    topic?: string;
    status: 'WAITING' | 'LOBBY_READY' | 'ACTIVE' | 'FINISHED';
    battleStyle?: 'SPEED_RACE' | 'ALTERNATING';
    currentTurn?: 'A' | 'B';
    currentRound: number;
    totalRounds: number;
    teamAHp: number;
    teamBHp: number;
    players: StudentStats[];
}

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Science', 'English', 'Social Studies'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function TeacherDashboardPage() {
    const navigate = useNavigate();
    const { showAlert } = useModal();

    // Core tabs: 'TEACHER' | 'PARENT'
    const [activeHubTab, setActiveHubTab] = useState<'TEACHER' | 'PARENT'>('TEACHER');

    // ─── PARENT PORTAL STATES ───
    const [parentEmail, setParentEmail] = useState('');
    const [parentLoading, setParentLoading] = useState(false);
    const [parentError, setParentError] = useState('');
    const [parentReport, setParentReport] = useState<any>(null);

    // ─── TEACHER AUTH STATES ───
    const [teacherToken, setTeacherToken] = useState<string | null>(localStorage.getItem('fbrts_teacher_token'));
    const [teacherUser, setTeacherUser] = useState<any | null>(() => {
        const u = localStorage.getItem('fbrts_teacher_user');
        return u ? JSON.parse(u) : null;
    });
    const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Teacher Register Form Fields
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regSchoolName, setRegSchoolName] = useState('');
    const [regTeacherId, setRegTeacherId] = useState('');
    const [regSchoolAddress, setRegSchoolAddress] = useState('');
    const [regSubject, setRegSubject] = useState('Science');
    const [regRole, setRegRole] = useState('Subject Teacher');
    const [regGender, setRegGender] = useState('Male');
    const [regWhatsapp, setRegWhatsapp] = useState('');

    // Teacher Login Form Fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // ─── TEACHER WORKSPACE/DASHBOARD VIEWS ───
    // Views: 'DASHBOARD' | 'CREATE' | 'MONITOR' | 'RESULTS'
    const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'MONITOR' | 'RESULTS'>('DASHBOARD');

    // Classroom Quiz Results Reports (Teacher Hub)
    const [classroomQuizResults, setClassroomQuizResults] = useState<any>(null);
    const [loadingClassroomResults, setLoadingClassroomResults] = useState(false);

    // Create Tournament Form State
    const [selBoard, setSelBoard] = useState('CBSE');
    const [selGrade, setSelGrade] = useState<string>('10');
    const [selSubject, setSelSubject] = useState('Science');
    const [selTopic, setSelTopic] = useState('');
    const [selDiff, setSelDiff] = useState('Medium');
    const [totalRounds, setTotalRounds] = useState(10);
    const [selBattleStyle, setSelBattleStyle] = useState<'SPEED_RACE' | 'ALTERNATING'>('SPEED_RACE');

    useEffect(() => {
        const subjects = STANDARD_SUBJECTS_MAP[selGrade] || SUBJECTS;
        if (subjects && subjects.length > 0) {
            setSelSubject(subjects[0]);
        }
    }, [selGrade]);

    const [invitedStudentsInput, setInvitedStudentsInput] = useState(''); // Comma or newline separated WhatsApps/IDs
    const [creating, setCreating] = useState(false);

    // Live Monitoring States
    const [monitorCode, setMonitorCode] = useState('');
    const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
    const [copied, setCopied] = useState(false);
    const monitorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const socketRef = useRef<any>(null);

    // Teacher stats
    const [teacherHistory, setTeacherHistory] = useState<any[]>([]);

    useEffect(() => {
        // Initialize teacher specific socket connection
        const s = io(window.location.hostname === 'localhost' ? 'http://localhost:7001' : window.location.origin);
        socketRef.current = s;

        // Listen for live update room updates to display live responses instantly
        s.on('arena_update', (data: any) => {
            if (data.room) {
                setMonitorData(prev => {
                    if (!prev || prev.roomCode !== data.room.roomCode) return prev;
                    
                    const players: StudentStats[] = data.room.players.map((p: any) => {
                        const answers = p.answersRecord || [];
                        const lastAns = answers.length > 0 ? answers[answers.length - 1] : undefined;

                        return {
                            userId: p.userId,
                            name: p.firstName,
                            grade: p.grade || 10,
                            team: p.team,
                            score: p.score,
                            totalAnswers: answers.length,
                            correctAnswers: answers.filter((a: any) => a.isCorrect).length,
                            wrongAnswers: answers.filter((a: any) => !a.isCorrect).length,
                            avgSpeedSeconds: answers.length > 0 ? (answers.reduce((sum: number, a: any) => sum + (a.timeMs || 0), 0) / answers.length / 1000) : 0,
                            needsAttention: answers.filter((a: any) => !a.isCorrect).length >= 3,
                            lastAnswer: lastAns ? {
                                selectedOption: lastAns.selectedOption,
                                isCorrect: lastAns.isCorrect,
                                timeMs: lastAns.timeMs
                            } : undefined
                        };
                    });

                    return {
                        ...prev,
                        status: data.room.status,
                        currentRound: data.room.currentRound,
                        teamAHp: data.room.teamA.hp,
                        teamBHp: data.room.teamB.hp,
                        currentTurn: data.room.currentTurn,
                        players
                    };
                });
            }
        });

        // Load teacher history if authenticated
        if (teacherToken) {
            fetchTeacherHistory();
        }

        return () => {
            s.disconnect();
            if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
        };
    }, [teacherToken]);

    const fetchTeacherHistory = async () => {
        try {
            const token = teacherToken || localStorage.getItem('fbrts_token');
            const res = await fetch('/api/future-education/battle/teacher/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTeacherHistory(data.rooms || []);
            }
        } catch (e) {
            console.error('Failed to load teacher history', e);
        }
    };

    const fetchClassroomResults = async (code: string) => {
        setLoadingClassroomResults(true);
        try {
            const token = teacherToken || localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/future-education/battle/teacher/room/${code}/results`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setClassroomQuizResults(data);
                setView('RESULTS');
            } else {
                showAlert('Error', data.message || 'Failed to retrieve classroom quiz results.');
            }
        } catch (e) {
            console.error('Error fetching classroom results', e);
            showAlert('Error', 'Connection failed.');
        } finally {
            setLoadingClassroomResults(false);
        }
    };

    // ─── TEACHER AUTHENTICATION METHODS ───
    const handleTeacherRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            const res = await fetch('/api/auth/teacher/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: regEmail,
                    password: regPassword,
                    name: regName,
                    schoolName: regSchoolName,
                    teacherId: regTeacherId,
                    schoolAddress: regSchoolAddress,
                    subject: regSubject,
                    roleInSchool: regRole,
                    gender: regGender,
                    whatsappNumber: regWhatsapp
                })
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('fbrts_teacher_token', data.token);
                localStorage.setItem('fbrts_teacher_user', JSON.stringify(data.user));
                setTeacherToken(data.token);
                setTeacherUser(data.user);
                showAlert('Registration Successful', `Welcome, ${data.user.firstName}! Your teacher command center is ready.`);
                setView('DASHBOARD');
            } else {
                setAuthError(data.error || 'Registration failed.');
            }
        } catch (err) {
            setAuthError('Connection failed. Please check server status.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleTeacherLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            const res = await fetch('/api/auth/teacher/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                })
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('fbrts_teacher_token', data.token);
                localStorage.setItem('fbrts_teacher_user', JSON.stringify(data.user));
                setTeacherToken(data.token);
                setTeacherUser(data.user);
                setView('DASHBOARD');
            } else {
                setAuthError(data.error || 'Invalid credentials.');
            }
        } catch (err) {
            setAuthError('Connection failed. Please check server status.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleTeacherLogout = () => {
        localStorage.removeItem('fbrts_teacher_token');
        localStorage.removeItem('fbrts_teacher_user');
        setTeacherToken(null);
        setTeacherUser(null);
        setView('DASHBOARD');
    };

    // ─── PARENT SEARCH METHODS ───
    const handleParentSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentEmail.trim()) return;

        setParentLoading(true);
        setParentError('');
        try {
            const res = await fetch(`/api/future-education/parent/report/${encodeURIComponent(parentEmail.trim())}`);
            const data = await res.json();
            if (data.success) {
                setParentReport(data);
            } else {
                setParentError(data.message || 'No linked student found for this parent Gmail or Student email.');
            }
        } catch (err) {
            setParentError('Connection error. Ensure the server is online.');
        } finally {
            setParentLoading(false);
        }
    };

    // ─── TEACHER LIVE MONITORING ───
    const fetchMonitorData = async (code: string) => {
        try {
            const token = teacherToken || localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/minerva/battle/room/${code}/monitor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMonitorData(data);
            } else {
                if (monitorIntervalRef.current) {
                    clearInterval(monitorIntervalRef.current);
                    monitorIntervalRef.current = null;
                }
                showAlert('Error', data.message || 'Failed to fetch room status.');
                setView('DASHBOARD');
            }
        } catch (e) {
            console.error('Failed to poll monitor details', e);
        }
    };

    const startMonitoring = (code: string) => {
        setMonitorCode(code);
        setView('MONITOR');
        fetchMonitorData(code);

        // Join room channel to listen to real-time events
        const teacherId = teacherUser?._id || teacherUser?.id || 'teacher_monitor';
        socketRef.current?.emit('join_arena_room', { roomCode: code, userId: String(teacherId) });

        if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = setInterval(() => {
            fetchMonitorData(code);
        }, 4000); // Back-up poll every 4 seconds
    };

    const broadcastInvite = () => {
        if (!monitorCode || !monitorData) return;
        socketRef.current?.emit('broadcast_tournament_invite', {
            roomCode: monitorCode,
            subject: monitorData.subject,
            topic: monitorData.topic
        });
        showAlert('Invite Broadcasted', `Tournament invitation was broadcasted to all active students!`);
    };

    const startTournamentMatch = () => {
        const userId = teacherUser?._id || teacherUser?.id;
        if (!monitorCode || !userId) return;
        socketRef.current?.emit('start_arena_match', {
            roomCode: monitorCode,
            userId: String(userId)
        });
        showAlert('Tournament Started', 'Live arena battle matches launched successfully!');
        fetchMonitorData(monitorCode);
    };

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const token = teacherToken || localStorage.getItem('fbrts_token');
            const res = await fetch('/api/future-education/battle/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    mode: 'CLASSROOM',
                    board: isSchoolStandard(selGrade) ? selBoard : 'N/A',
                    subject: selSubject,
                    topic: selTopic,
                    difficulty: selDiff,
                    totalRounds,
                    grade: selGrade,
                    battleStyle: selBattleStyle
                })
            });
            const data = await res.json();
            if (data.success && data.room) {
                showAlert('Tournament Created', `Classroom Battle Room ${data.room.roomCode} launched successfully.`);
                
                // Save invited students array or whatsapp list if provided
                if (invitedStudentsInput.trim()) {
                    // Quick alert simulation for students added
                    console.log('Inviting student numbers/IDs:', invitedStudentsInput);
                }

                startMonitoring(data.room.roomCode);
                fetchTeacherHistory(); // refresh history
            } else {
                showAlert('Error', data.message || 'Failed to create room.');
            }
        } catch (err) {
            showAlert('Error', 'Connection failed. Check server.');
        } finally {
            setCreating(false);
        }
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/future-education/quiz-battle?join=${monitorCode}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Share link directly on WhatsApp to students
    const getWhatsAppShareLink = () => {
        if (!monitorCode || !monitorData) return '#';
        const msg = `🎓 *Future Ed OS Live Battle!*\n\nTeacher has invited you to join a live multiplayer tournament.\n\n*Subject:* ${monitorData.subject}\n*Topic:* ${monitorData.topic || 'General Practice'}\n*Room Code:* ${monitorCode}\n\nClick this link to join the arena instantly:\n${window.location.origin}/future-education/quiz-battle?join=${monitorCode}`;
        
        // If teacher added WhatsApp numbers, let them share
        const cleanNumbers = invitedStudentsInput
            .split(/[,\n]/)
            .map(n => n.trim())
            .filter(n => n.length >= 10);
            
        if (cleanNumbers.length > 0) {
            // Share to first number as template, or general API
            return `https://api.whatsapp.com/send?phone=${cleanNumbers[0]}&text=${encodeURIComponent(msg)}`;
        }
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    };

    const strugglingStudents = monitorData?.players.filter(p => p.needsAttention) || [];

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d0922]/50 via-black to-black text-white p-4 md:p-8 font-inter relative pb-16">
            <div className="max-w-6xl mx-auto">

                {/* Main Gateway Hub Header (Bypassed in Monitor view) */}
                {view !== 'MONITOR' && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/future-education/dashboard')}
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                    <Users className="text-indigo-400" /> Teacher & Parent Command Portal
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">Control live multiplayer classrooms or monitor student analytics reports.</p>
                            </div>
                        </div>

                        {/* Top switcher tabs */}
                        <div className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl flex gap-1 shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => { setActiveHubTab('TEACHER'); setParentReport(null); }}
                                className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${activeHubTab === 'TEACHER' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <School size={14} /> Teacher Command
                            </button>
                            <button
                                onClick={() => setActiveHubTab('PARENT')}
                                className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${activeHubTab === 'PARENT' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Heart size={14} /> Parents Portal
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ VIEW 1: PARENTS GATEWAY HUB ════════════════════════════ */}
                {view !== 'MONITOR' && activeHubTab === 'PARENT' && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {!parentReport ? (
                            <div className="glass-panel p-8 max-w-md mx-auto text-center border border-indigo-500/10">
                                <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
                                <h2 className="text-xl font-black mb-2">Parents Access Dashboard</h2>
                                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                                    Enter your linked parent email (Gmail) or your child's student email address to fetch live diagnostic report logs.
                                </p>

                                <form onSubmit={handleParentSearch} className="space-y-4">
                                    {parentError && (
                                        <div className="text-red-400 bg-red-950/20 p-3 rounded-xl border border-red-500/20 text-xs flex items-center gap-2">
                                            <ShieldAlert size={14} /> {parentError}
                                        </div>
                                    )}
                                    <input
                                        type="email"
                                        placeholder="Enter Parent or Child's Email"
                                        value={parentEmail}
                                        onChange={e => setParentEmail(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-xs font-bold focus:border-indigo-500 outline-none"
                                        required
                                    />
                                    <button type="submit" disabled={parentLoading}
                                        className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                                        {parentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users size={14} />}
                                        <span>Retrieve Student Performance Report</span>
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Linked Student Profile</span>
                                        <h2 className="text-2xl font-black text-white mt-0.5">{parentReport.student.name}</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Level {parentReport.student.level} Scholar ({parentReport.student.xp} XP total)</p>
                                    </div>
                                    <button onClick={() => setParentReport(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-750">
                                        Look up another child
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Average Score', value: `${parentReport.stats.averageScore}%`, icon: <Star className="text-yellow-400" /> },
                                        { label: 'Sessions Completed', value: `${parentReport.stats.completedSessions}/${parentReport.stats.totalSessions}`, icon: <Trophy className="text-purple-400" /> },
                                        { label: 'Topics Studied', value: `${parentReport.stats.completedNodes}/${parentReport.stats.totalNodes}`, icon: <BookOpen className="text-indigo-400" /> },
                                        { label: 'Unlocked Badges', value: parentReport.student.badgesCount, icon: <Users className="text-emerald-400" /> },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="glass-panel p-5 text-center flex flex-col items-center justify-center">
                                            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl mb-3">{stat.icon}</div>
                                            <div className="text-2xl font-black tracking-tighter text-white">{stat.value}</div>
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="glass-panel p-6 border-l-4 border-l-rose-500 bg-rose-950/5">
                                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        💡 AI Guidance for Parents
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                                        {parentReport.stats.parentGuidanceTip}
                                    </p>
                                </div>

                                <div className="glass-panel p-6 space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-3">
                                        <Calendar className="w-4 h-4 text-indigo-400" /> Weekly Activity Overview
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Your child is actively studying in <strong>{parentReport.stats.totalSessions} Study Roadmaps</strong>, having unlocked and successfully cleared <strong>{parentReport.stats.completedNodes} learning modules</strong>. Keep encouraging their learning habit at home!
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ═══ VIEW 2: TEACHER PORTAL GATEWAY HUB ══════════════════════ */}
                {view !== 'MONITOR' && activeHubTab === 'TEACHER' && (
                    <div className="space-y-6">
                        
                        {/* 1. TEACHER AUTHENTICATION GATEWAY (If not logged in) */}
                        {!teacherToken ? (
                            <div className="glass-panel max-w-md mx-auto p-6 md:p-8 border border-white/5">
                                
                                {/* Auth Tabs */}
                                <div className="flex border-b border-white/5 pb-4 mb-6 gap-2">
                                    <button onClick={() => { setAuthTab('LOGIN'); setAuthError(''); }}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${authTab === 'LOGIN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                        🏫 Log In
                                    </button>
                                    <button onClick={() => { setAuthTab('REGISTER'); setAuthError(''); }}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${authTab === 'REGISTER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                        ✍️ Register Profile
                                    </button>
                                </div>

                                {authError && (
                                    <div className="text-red-400 bg-red-950/20 p-3 rounded-xl border border-red-500/20 text-xs flex items-center gap-2 mb-4">
                                        <ShieldAlert size={14} /> {authError}
                                    </div>
                                )}

                                {/* LOGIN FORM */}
                                {authTab === 'LOGIN' && (
                                    <form onSubmit={handleTeacherLogin} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Teacher Email Address*</label>
                                            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Password*</label>
                                            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500" />
                                        </div>
                                        <button type="submit" disabled={authLoading}
                                            className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] mt-6">
                                            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play size={12} />}
                                            <span>Enter Teacher Dashboard</span>
                                        </button>
                                    </form>
                                )}

                                {/* REGISTER FORM */}
                                {authTab === 'REGISTER' && (
                                    <form onSubmit={handleTeacherRegister} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Full Name*</label>
                                                <div className="relative">
                                                    <input type="text" placeholder="Teacher Name" value={regName} onChange={e => setRegName(e.target.value)} required
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                    <User size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">WhatsApp Number*</label>
                                                <div className="relative">
                                                    <input type="text" placeholder="9876543210" value={regWhatsapp} onChange={e => setRegWhatsapp(e.target.value)} required
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                    <Phone size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">School Name*</label>
                                                <div className="relative">
                                                    <input type="text" placeholder="e.g. DPS School" value={regSchoolName} onChange={e => setRegSchoolName(e.target.value)} required
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                    <School size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Teacher ID*</label>
                                                <div className="relative">
                                                    <input type="text" placeholder="ID-54321" value={regTeacherId} onChange={e => setRegTeacherId(e.target.value)} required
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                    <Tag size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">School Address*</label>
                                            <div className="relative">
                                                <input type="text" placeholder="School Address, City" value={regSchoolAddress} onChange={e => setRegSchoolAddress(e.target.value)} required
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                <MapPin size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Subject*</label>
                                                <div className="relative">
                                                    <select value={regSubject} onChange={e => setRegSubject(e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
                                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <Book size={12} className="absolute left-2.5 top-3.5 text-slate-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">School Role*</label>
                                                <input type="text" placeholder="e.g. Class Teacher" value={regRole} onChange={e => setRegRole(e.target.value)} required
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Gender*</label>
                                                <select value={regGender} onChange={e => setRegGender(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Gmail Address (Email)*</label>
                                                <div className="relative">
                                                    <input type="email" placeholder="teacher@gmail.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                                    <Mail size={12} className="absolute left-2.5 top-3 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Password*</label>
                                            <input type="password" placeholder="Min 6 characters" value={regPassword} onChange={e => setRegPassword(e.target.value)} required
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                                        </div>

                                        <button type="submit" disabled={authLoading}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] mt-6">
                                            {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play size={12} />}
                                            <span>Complete Registration & Enter</span>
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            
                            // 2. TEACHER LOGGED IN COMMAND HUB DASHBOARD
                            <div className="space-y-6">
                                
                                {/* Hero Header with Teacher Stats */}
                                <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider mb-2">
                                            <School className="w-3 h-3" /> Teacher Command Hub
                                        </div>
                                        <h2 className="text-2xl font-black text-white">{teacherUser.firstName || 'Teacher'} {teacherUser.lastName || ''}</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {teacherUser.teacherDetails?.schoolName || 'DPS School'} • {teacherUser.teacherDetails?.subject || 'Science'} Specialist
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setView('CREATE')}
                                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-black text-xs hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg active:scale-[0.99] flex items-center gap-1">
                                            ⚔️ Create Battle Room
                                        </button>
                                        <button onClick={handleTeacherLogout}
                                            className="p-2.5 bg-slate-900 border border-white/5 hover:bg-slate-850 rounded-xl transition-all text-slate-400 hover:text-white flex items-center justify-center"
                                            title="Logout Teacher Account"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Active & Historical Tournaments */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    
                                    {/* Create card/input */}
                                    <div className="glass-panel p-6 md:col-span-1 flex flex-col justify-center space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Join Active Room</h3>
                                        <p className="text-xs text-slate-500">Track student progress inside an existing classroom battle code:</p>
                                        <div className="flex gap-2">
                                            <input
                                                value={monitorCode}
                                                onChange={e => setMonitorCode(e.target.value.toUpperCase())}
                                                placeholder="ARENA-123456"
                                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-xs font-black tracking-wider uppercase focus:border-indigo-500 outline-none"
                                            />
                                            <button
                                                onClick={() => monitorCode.trim() && startMonitoring(monitorCode.trim())}
                                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
                                            >
                                                Track
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Classroom Battle Stats</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="glass-panel p-4 text-center">
                                                <div className="text-2xl font-black text-white">{teacherHistory.length}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Tournaments Hosted</div>
                                            </div>
                                            <div className="glass-panel p-4 text-center">
                                                <div className="text-2xl font-black text-emerald-450">{teacherHistory.filter(r => r.status === 'FINISHED').length}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Completed Battles</div>
                                            </div>
                                            <div className="glass-panel p-4 text-center">
                                                <div className="text-2xl font-black text-indigo-400">{teacherHistory.filter(r => r.status === 'ACTIVE').length}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Running Battles</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Tournament History List */}
                                <div className="glass-panel overflow-hidden">
                                    <div className="px-6 py-4 border-b border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recently Hosted Battle Lobbies</h3>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {teacherHistory.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500 text-xs italic">
                                                You haven't hosted any classroom tournaments yet. Create one above to get started!
                                            </div>
                                        ) : (
                                            teacherHistory.map((room: any) => (
                                                <div key={room.roomCode} onClick={() => {
                                                    if (loadingClassroomResults) return;
                                                    if (room.status === 'FINISHED') {
                                                        fetchClassroomResults(room.roomCode);
                                                    } else {
                                                        startMonitoring(room.roomCode);
                                                    }
                                                }}
                                                    className="flex items-center justify-between p-4 hover:bg-white/[0.01] cursor-pointer transition-all">
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-200">{room.subject} {room.topic && `— ${room.topic}`}</div>
                                                        <div className="text-[9px] text-slate-500 mt-0.5">Code: {room.roomCode} • Class {room.standard || room.grade || 10} • {room.totalRounds} Rounds</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${room.status === 'ACTIVE' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-850' : room.status === 'FINISHED' ? 'bg-emerald-950/65 text-emerald-400 border border-emerald-900/25' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                                                            {room.status}
                                                        </span>
                                                        <span className="text-slate-500 text-xs">→</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}

                    </div>
                )}

                {/* ═══ VIEW: CREATE TOURNAMENT ══════════════════════════════ */}
                {view === 'CREATE' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto">
                        <div className="glass-panel p-8 border border-white/5">
                            <h2 className="text-xl font-black text-white text-center mb-1">Create Tournament</h2>
                            <p className="text-[10px] text-slate-500 text-center mb-6">Generates 15v15 Classroom Quiz battle room</p>

                            <form onSubmit={handleCreateTournament} className="space-y-4">
                                <div className={`grid ${isSchoolStandard(selGrade) ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                                    {/* Board */}
                                    {isSchoolStandard(selGrade) && (
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Exam Board</label>
                                            <select
                                                value={selBoard}
                                                onChange={e => setSelBoard(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                                            >
                                                {BOARDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {/* Grade */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Class / Standard</label>
                                        <select
                                            value={selGrade}
                                            onChange={e => setSelGrade(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                                        >
                                            {STANDARDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Subject</label>
                                        <select
                                            value={selSubject}
                                            onChange={e => setSelSubject(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                                        >
                                            {(STANDARD_SUBJECTS_MAP[selGrade] || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Topic */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Topic / Chapter (Optional)</label>
                                    <input
                                        value={selTopic}
                                        onChange={e => setSelTopic(e.target.value)}
                                        placeholder="e.g. Chemical Reactions and Equations"
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-indigo-500 outline-none placeholder-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Difficulty */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Difficulty</label>
                                        <select
                                            value={selDiff}
                                            onChange={e => setSelDiff(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                                        >
                                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    {/* Rounds */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Rounds</label>
                                        <input
                                            type="number"
                                            value={totalRounds}
                                            onChange={e => setTotalRounds(parseInt(e.target.value) || 10)}
                                            min={5}
                                            max={20}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Battle Style Selector */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Battle Style</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setSelBattleStyle('SPEED_RACE')}
                                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${selBattleStyle === 'SPEED_RACE' ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-slate-800 bg-[#090b14]/50 hover:border-slate-700'}`}>
                                            {selBattleStyle === 'SPEED_RACE' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                                            <div className="text-lg mb-1">⚡</div>
                                            <div className="font-black text-xs text-white">Speed Race</div>
                                            <div className="text-[9px] text-slate-400 mt-1 leading-relaxed">Both answer — first correct win!</div>
                                            <div className="mt-1.5 text-[8px] font-black text-amber-500 uppercase tracking-wider">⏱ 15s shared timer</div>
                                        </button>
                                        <button type="button" onClick={() => setSelBattleStyle('ALTERNATING')}
                                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${selBattleStyle === 'ALTERNATING' ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-slate-800 bg-[#090b14]/50 hover:border-slate-700'}`}>
                                            {selBattleStyle === 'ALTERNATING' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                                            <div className="text-lg mb-1">⚔️</div>
                                            <div className="font-black text-xs text-white">Alternating Turn</div>
                                            <div className="text-[9px] text-slate-400 mt-1 leading-relaxed">One side attack, other defends!</div>
                                            <div className="mt-1.5 text-[8px] font-black text-violet-400 uppercase tracking-wider">⏱ 15s / 10s timer</div>
                                        </button>
                                    </div>
                                </div>

                                {/* ADD WHATSAPP / ID STUDENT FILTER */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                                        Invite Specific Student Numbers / IDs <span className="text-slate-600">[Optional]</span>
                                    </label>
                                    <textarea
                                        value={invitedStudentsInput}
                                        onChange={e => setInvitedStudentsInput(e.target.value)}
                                        placeholder="Add student WhatsApp numbers or student IDs (one per line, or comma-separated)"
                                        rows={3}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-indigo-500 outline-none placeholder-slate-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:from-indigo-500 hover:to-violet-500 mt-2 active:scale-[0.99]"
                                >
                                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Classroom Tournament Room 🚀'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* ═══ VIEW: LIVE MONITOR ═══════════════════════════════════ */}
                {view === 'MONITOR' && monitorData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        {/* Battle Details Header Card */}
                        <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1.5">
                                    <Swords className="w-3.5 h-3.5" /> Classroom Battle Arena
                                </div>
                                <h2 className="text-2xl font-black text-white">
                                    {monitorData.subject} {monitorData.topic && `— ${monitorData.topic}`}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                                    <span>Status: <span className="font-bold text-slate-200">{monitorData.status}</span></span>
                                    <span>·</span>
                                    <span>Round <span className="font-bold text-slate-200">{monitorData.currentRound + 1} / {monitorData.totalRounds}</span></span>
                                    <span>·</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${monitorData.battleStyle === 'ALTERNATING' ? 'bg-violet-900/40 text-violet-400 border border-violet-800/35' : 'bg-amber-900/40 text-amber-400 border border-amber-800/35'}`}>
                                        {monitorData.battleStyle === 'ALTERNATING' ? '⚔️ Alternating Turn' : '⚡ Speed Race'}
                                    </span>
                                    {monitorData.battleStyle === 'ALTERNATING' && monitorData.status === 'ACTIVE' && (
                                        <span className="animate-pulse bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                            👉 Turn: Team {monitorData.currentTurn === 'A' ? 'Alpha' : 'Omega'}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Share Details */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3 w-full md:w-auto">
                                <div>
                                    <div className="text-[9px] font-black uppercase text-slate-500">Room Code</div>
                                    <div className="text-lg font-black text-yellow-400 tracking-wider font-mono">{monitorData.roomCode}</div>
                                </div>
                                <button
                                    onClick={copyInviteLink}
                                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Invite Link'}
                                </button>
                                <a
                                    href={getWhatsAppShareLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 bg-emerald-900/45 hover:bg-emerald-800 border border-emerald-800/60 rounded-xl transition-all text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold"
                                >
                                    <Phone className="w-3.5 h-3.5" /> Share on WhatsApp
                                </a>
                                <button
                                    onClick={broadcastInvite}
                                    className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold"
                                >
                                    📢 Broadcast Invite
                                </button>
                                {(monitorData.status === 'WAITING' || monitorData.status === 'LOBBY_READY') && (
                                    <button
                                        onClick={startTournamentMatch}
                                        className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all text-white flex items-center justify-center gap-1.5 text-xs font-black shadow-md shadow-emerald-950/40"
                                    >
                                        <Play className="w-3.5 h-3.5" /> Start Battle ⚔️
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* HP Bars Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Alpha */}
                            <div className="glass-panel p-4 flex items-center gap-4 bg-indigo-950/5 border-indigo-900/10 text-left">
                                <span className="text-lg">🛡️</span>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase text-indigo-400">Team Alpha HP</div>
                                    <div className="text-sm font-black text-white mt-0.5">{monitorData.teamAHp} HP</div>
                                </div>
                            </div>
                            {/* Omega */}
                            <div className="glass-panel p-4 flex items-center gap-4 bg-rose-950/5 border-rose-900/10 text-left">
                                <span className="text-lg">🔥</span>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase text-rose-400">Team Omega HP</div>
                                    <div className="text-sm font-black text-white mt-0.5">{monitorData.teamBHp} HP</div>
                                </div>
                            </div>
                        </div>

                        {/* Struggling Students Alert Box */}
                        {strugglingStudents.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-amber-950/20 border border-amber-800/30 rounded-3xl p-5 flex gap-4 text-left">
                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
                                        💡 Attention Required ({strugglingStudents.length} Students)
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                        These students have made 3 or more incorrect submissions in this tournament. Consider reviewing these concepts:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {strugglingStudents.map(p => (
                                            <span key={p.userId} className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg px-2.5 py-1">
                                                👤 {p.name} ({p.wrongAnswers} wrong)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Students Performance Table */}
                        <div className="glass-panel overflow-hidden">
                            <div className="px-6 py-4.5 border-b border-slate-850 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                    <BarChart2 className="w-4 h-4 text-indigo-400" /> Student Live Answers & Rankings
                                </h3>
                                <div className="text-[10px] font-semibold text-slate-500">
                                    Total Participants: {monitorData.players.length}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-850 bg-slate-900/20 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-3.5">Student Name</th>
                                            <th className="px-6 py-3.5">Team</th>
                                            <th className="px-6 py-3.5 text-right">Score</th>
                                            <th className="px-6 py-3.5 text-center">Correct / Total</th>
                                            <th className="px-6 py-3.5 text-center">Current Round Response</th>
                                            <th className="px-6 py-3.5 text-right">Alert Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850">
                                        {monitorData.players.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">
                                                    Waiting for students to join using Room Code...
                                                </td>
                                            </tr>
                                        ) : (
                                            monitorData.players
                                                .sort((a, b) => b.score - a.score)
                                                .map((student, idx) => (
                                                    <tr key={student.userId} className="hover:bg-slate-900/20 transition-colors">
                                                        {/* Name */}
                                                        <td className="px-6 py-4 font-bold flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <div className="text-white">{student.name}</div>
                                                                <div className="text-[9px] text-slate-500 font-bold">Grade {student.grade}</div>
                                                            </div>
                                                        </td>

                                                        {/* Team */}
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${student.team === 'A' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                Team {student.team === 'A' ? 'Alpha' : 'Omega'}
                                                            </span>
                                                        </td>

                                                        {/* Score */}
                                                        <td className="px-6 py-4 text-right font-black text-indigo-300">
                                                            {student.score} pts
                                                        </td>

                                                        {/* Accuracy */}
                                                        <td className="px-6 py-4 text-center font-bold text-slate-300">
                                                            {student.correctAnswers} / {student.totalAnswers}
                                                        </td>

                                                        {/* CURRENT ROUND RESPONSE - REALTIME SUBMISSION */}
                                                        <td className="px-6 py-4 text-center font-bold text-xs">
                                                            {student.lastAnswer ? (
                                                                student.lastAnswer.isCorrect ? (
                                                                    <span className="text-emerald-450 bg-emerald-950/40 border border-emerald-900/30 px-2 py-1 rounded-lg">
                                                                        Option {String.fromCharCode(65 + student.lastAnswer.selectedOption)} (Correct) ✓
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-rose-400 bg-rose-950/40 border border-rose-900/30 px-2 py-1 rounded-lg">
                                                                        Option {student.lastAnswer.selectedOption === -1 ? 'Skipped' : String.fromCharCode(65 + student.lastAnswer.selectedOption)} (Wrong) ✗
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-slate-500 animate-pulse bg-slate-900/50 px-2 py-1 rounded-lg">
                                                                    Thinking... ⏳
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Alert Status */}
                                                        <td className="px-6 py-4 text-right">
                                                            {student.needsAttention ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-0.5 animate-pulse">
                                                                    ⚠️ Review Needed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-0.5">
                                                                    ✓ Normal
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Back / Disband room controls */}
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => {
                                    if (monitorIntervalRef.current) {
                                        clearInterval(monitorIntervalRef.current);
                                        monitorIntervalRef.current = null;
                                    }
                                    setView('DASHBOARD');
                                    setMonitorData(null);
                                }}
                                className="px-6 py-3 bg-slate-900 hover:bg-slate-850 border border-white/5 rounded-xl font-bold text-xs"
                            >
                                Stop Monitoring
                            </button>
                        </div>

                    </motion.div>
                )}

                {/* ═══ VIEW: CLASSROOM QUIZ RESULTS REPORT ══════════════════ */}
                {view === 'RESULTS' && classroomQuizResults && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                onClick={() => setView('DASHBOARD')}
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Completed Classroom Quiz Report</span>
                                <h2 className="text-2xl font-black text-white mt-0.5">
                                    {classroomQuizResults.roomInfo.subject} — {classroomQuizResults.roomInfo.topicConcept}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Room Code: {classroomQuizResults.roomInfo.roomCode} · Class {classroomQuizResults.roomInfo.standard} · Completed
                                </p>
                            </div>
                        </div>

                        {/* Top Performance Analytics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Class Average Accuracy', value: `${
                                    classroomQuizResults.results.length > 0 
                                        ? Math.round(classroomQuizResults.results.reduce((acc: number, cur: any) => acc + (cur.correctCount / (cur.correctCount + cur.wrongCount + cur.unansweredCount || 1)), 0) / classroomQuizResults.results.length * 100) 
                                        : 0
                                    }%`, icon: '📈' },
                                { label: 'Top Score', value: `${classroomQuizResults.results[0]?.score || 0} pts`, icon: '🏆' },
                                { label: 'Total Enrolled Players', value: String(classroomQuizResults.results.length), icon: '👥' },
                                { label: 'Match Rounds', value: String(classroomQuizResults.roomInfo.difficulty || 'Medium'), icon: '⚙️' }
                            ].map((stat, idx) => (
                                <div key={idx} className="glass-panel p-5 text-center flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg mb-3">{stat.icon}</div>
                                    <div className="text-2xl font-black tracking-tighter text-white">{stat.value}</div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Question Breakdown Analysis (Hardest Question Identification) */}
                        <div className="glass-panel p-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                                📊 Question-Wise Syllabus Performance Analysis
                            </h3>
                            <div className="space-y-4">
                                {classroomQuizResults.questionAnalysis.map((item: any, idx: number) => {
                                    const percent = item.correctPercentage;
                                    const isHardest = idx === 0 && percent < 60;
                                    return (
                                        <div key={item.questionIndex} className="bg-black/20 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-slate-500 font-bold">Q{item.questionIndex + 1}</span>
                                                    {isHardest && (
                                                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase rounded">🔥 Hardest Concept</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white font-bold mt-1 leading-relaxed">{item.questionText}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-sm font-black text-indigo-300">{percent}% Correct</div>
                                                <div className="text-[9px] text-slate-500 mt-0.5">{item.totalAnswers} total responses</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="glass-panel overflow-hidden">
                            <div className="px-6 py-4.5 border-b border-slate-850">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Classroom Rankings & Report Card</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-850 bg-slate-900/20 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-3.5">Rank</th>
                                            <th className="px-6 py-3.5">Student Name</th>
                                            <th className="px-6 py-3.5">Exam Board</th>
                                            <th className="px-6 py-3.5 text-right">Score</th>
                                            <th className="px-6 py-3.5 text-center">Correct / Wrong</th>
                                            <th className="px-6 py-3.5 text-right">Avg Response Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850">
                                        {classroomQuizResults.results.map((student: any, idx: number) => (
                                            <tr key={student.userId || idx} className="hover:bg-slate-900/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-400">#{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold">
                                                    <div className="text-white">{student.name}</div>
                                                    <div className="text-[9px] text-slate-500 font-bold">{student.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                                                        {student.board}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-indigo-300">{student.score} pts</td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-300">
                                                    <span className="text-emerald-450">{student.correctCount} ✓</span>
                                                    <span className="text-slate-500 mx-1">/</span>
                                                    <span className="text-rose-400">{student.wrongCount} ✗</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-400">
                                                    {student.avgTimeSec}s
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
