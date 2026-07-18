import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Search,
    MessageSquare,
    Map,
    CheckSquare,
    Flame,
    Briefcase,
    FileText,
    GraduationCap,
    HeartHandshake,
    ExternalLink,
    Info,
    RefreshCw,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EducationOSAdmin() {
    const { tab = 'tutor-chats' } = useParams<{ tab: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    
    // Teacher & Users management specific states
    const [teacherStats, setTeacherStats] = useState<any[]>([]);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [editRole, setEditRole] = useState('user');
    const [editStatus, setEditStatus] = useState('active');
    const [editTokens, setEditTokens] = useState(0);
    const [userDossier, setUserDossier] = useState<any>(null);
    const [loadingDossier, setLoadingDossier] = useState(false);

    // Dynamic drilling, modal, keywords, & surveillance states
    const [profileModalUser, setProfileModalUser] = useState<any>(null);
    const [nestedDetail, setNestedDetail] = useState<any>(null);
    const [nestedDetailType, setNestedDetailType] = useState<'chat' | 'exam' | 'roadmap' | null>(null);
    const [nestedLoading, setNestedLoading] = useState(false);
    const [keywordAnalytics, setKeywordAnalytics] = useState<any>(null);
    const [surveillanceTraffic, setSurveillanceTraffic] = useState<any[]>([]);
    const [surveillanceLogs, setSurveillanceLogs] = useState<any[]>([]);

    const tabsConfig: Record<string, { label: string; icon: any; endpoint: string; description: string }> = {
        'users': {
            label: 'Users Control',
            icon: Users,
            endpoint: '/api/admin/users',
            description: 'Direct student status, role management, and token balance adjustments.'
        },
        'tutor-chats': {
            label: 'Tutor Chats',
            icon: MessageSquare,
            endpoint: '/api/admin/education/tutor-chats',
            description: 'Track student prompts, AI responses, and tutor conversation depth.'
        },
        'roadmaps': {
            label: 'Study Roadmaps',
            icon: Map,
            endpoint: '/api/admin/education/roadmaps',
            description: 'Inspect generated syllabus path progression and node completion.'
        },
        'tasks': {
            label: 'Study Tasks',
            icon: CheckSquare,
            endpoint: '/api/admin/education/tasks',
            description: 'Monitor assignments, student answers, and AI grader feedback.'
        },
        'battles': {
            label: '1v1 Quiz Battles',
            icon: Flame,
            endpoint: '/api/admin/education/battles',
            description: 'Analyze battle arenas, room settings, match winners, and scores.'
        },
        'builder': {
            label: 'E-Builder Projects',
            icon: Briefcase,
            endpoint: '/api/admin/education/builder',
            description: 'Review student software, SaaS, or website prototypes.'
        },
        'exams': {
            label: 'Practice Exams',
            icon: FileText,
            endpoint: '/api/admin/education/exams',
            description: 'Audit generated board mock papers, teacher stats, and student proctoring violations.'
        },
        'results': {
            label: 'Academic Results',
            icon: GraduationCap,
            endpoint: '/api/admin/education/results',
            description: 'Observe global student ranking, total XP, and school profiles.'
        },
        'parents': {
            label: 'Teacher & Parent Hub',
            icon: HeartHandshake,
            endpoint: '/api/admin/education/parents',
            description: 'Manage parent links, reports, and verification flags.'
        }
    };

    const activeTab = tabsConfig[tab] || tabsConfig['tutor-chats'];

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(activeTab.endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                if (tab === 'tutor-chats') setData(result.logs || []);
                else if (tab === 'roadmaps') setData(result.roadmaps || []);
                else if (tab === 'tasks') setData(result.tasks || []);
                else if (tab === 'battles') setData(result.battles || []);
                else if (tab === 'builder') setData(result.projects || []);
                else if (tab === 'exams') {
                    setData(result.exams || []);
                    if (result.teacherStats) {
                        setTeacherStats(result.teacherStats);
                    }
                }
                else if (tab === 'results') setData(result.results || []);
                else if (tab === 'parents') setData(result.parents || []);
                else if (tab === 'users') setData(result.users || []);
            }
        } catch (err) {
            console.error('Error fetching admin education telemetry data:', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchSurveillanceAndKeywords = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            // Fetch keywords analytics
            const keywordRes = await fetch('/api/admin/seo-keyword-analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const keywordData = await keywordRes.json();
            if (keywordData.success) {
                setKeywordAnalytics(keywordData);
            }

            // Fetch live visitor traffic
            const visitorRes = await fetch('/api/admin/visitors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const visitorData = await visitorRes.json();
            if (visitorData.success) {
                setSurveillanceTraffic(visitorData.visitors || []);
            }

            // Fetch recent system logs/tracking
            const trackingRes = await fetch('/api/admin/tracking', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const trackingData = await trackingRes.json();
            if (trackingData.success) {
                setSurveillanceLogs(trackingData.logs || []);
            }
        } catch (err) {
            console.error('Error fetching dynamic surveillance/keyword data:', err);
        }
    };

    useEffect(() => {
        fetchData(true);
        fetchSurveillanceAndKeywords();
        setSelectedItem(null);
        setNestedDetail(null);
        setNestedDetailType(null);

        // Real-time automatic telemetry background polling loop (runs every 5.5 seconds)
        const interval = setInterval(() => {
            fetchData(false);
            fetchSurveillanceAndKeywords();
        }, 5500);

        return () => clearInterval(interval);
    }, [tab]);



    const handleViewDetail = async (item: any) => {
        setSelectedItem(item);
        setNestedDetail(null);
        setNestedDetailType(null);
        
        // Resolve target user ID from any telemetry list item structure
        const targetUserId = item.userId?._id || item.userId || (tab === 'users' ? (item.id || item._id) : null);
        
        if (tab === 'tutor-chats') {
            handleDrillChat(item.id || item._id);
        } else if (tab === 'exams' && item.status !== 'generated') {
            handleDrillExam(item);
        } else if (tab === 'roadmaps') {
            handleDrillRoadmap(item);
        }

        if (targetUserId) {
            setLoadingDossier(true);
            setUserDossier(null);
            try {
                const token = localStorage.getItem('fbrts_token');
                const res = await fetch(`/api/admin/user/${targetUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setUserDossier(result);
                    setEditRole(result.user?.role || 'user');
                    setEditStatus(result.user?.status || 'active');
                    setEditTokens(result.user?.tokenBalance || 0);
                }
            } catch (err) {
                console.error('Error fetching student dossier:', err);
            } finally {
                setLoadingDossier(false);
            }
        }
    };

    const handleDrillChat = async (chatSessionId: string) => {
        setNestedLoading(true);
        setNestedDetailType('chat');
        setNestedDetail(null);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/admin/session/${chatSessionId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success && result.session) {
                setNestedDetail(result.session);
            }
        } catch (err) {
            console.error('Error loading drilled chat details:', err);
        } finally {
            setNestedLoading(false);
        }
    };

    const handleDrillExam = (exam: any) => {
        setNestedDetailType('exam');
        setNestedDetail(exam);
    };

    const handleDrillRoadmap = (roadmap: any) => {
        setNestedDetailType('roadmap');
        setNestedDetail(roadmap);
    };

    const handleOpenProfileModal = async (userRecord: any) => {
        // Build initial modal structure
        setProfileModalUser(userRecord);
        try {
            const token = localStorage.getItem('fbrts_token');
            const userId = userRecord.id || userRecord._id || userRecord.userId?._id || userRecord.userId;
            const res = await fetch(`/api/admin/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setProfileModalUser({
                    ...userRecord,
                    ...result.user,
                    onboarding: result.onboarding,
                    educationOS: result.educationOS
                });
            }
        } catch (err) {
            console.error('Error loading profile modal user:', err);
        }
    };

    const handleUpdateUser = async (userId: string) => {
        setUpdatingUser(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    role: editRole,
                    status: editStatus,
                    tokenBalance: editTokens
                })
            });
            const result = await res.json();
            if (result.success) {
                alert('User details committed successfully!');
                fetchData(false);
                setSelectedItem((prev: any) => ({
                    ...prev,
                    role: editRole,
                    status: editStatus,
                    tokenBalance: editTokens
                }));
            } else {
                alert(result.error || 'Failed to update user.');
            }
        } catch (err) {
            alert('Failed to connect to the server.');
        } finally {
            setUpdatingUser(false);
        }
    };

    const filteredData = data.filter(item => {
        const query = searchQuery.toLowerCase();
        if (tab === 'users') {
            return (
                (item.firstName || '').toLowerCase().includes(query) ||
                (item.lastName || '').toLowerCase().includes(query) ||
                (item.email || '').toLowerCase().includes(query) ||
                (item.role || '').toLowerCase().includes(query)
            );
        }
        if (tab === 'tutor-chats') {
            return (item.user?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query));
        }
        if (tab === 'roadmaps') {
            return (item.user?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query) || item.subject?.toLowerCase().includes(query));
        }
        if (tab === 'tasks') {
            return (item.user?.toLowerCase().includes(query) || item.topic?.toLowerCase().includes(query) || item.subject?.toLowerCase().includes(query) || item.prompt?.toLowerCase().includes(query));
        }
        if (tab === 'battles') {
            return (item.roomCode?.toLowerCase().includes(query) || item.host?.toLowerCase().includes(query) || item.subject?.toLowerCase().includes(query));
        }
        if (tab === 'builder') {
            return (item.user?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query) || item.field?.toLowerCase().includes(query));
        }
        if (tab === 'exams') {
            return (item.user?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query) || item.subject?.toLowerCase().includes(query));
        }
        if (tab === 'results') {
            return (item.user?.toLowerCase().includes(query) || item.schoolName?.toLowerCase().includes(query) || item.rank?.toLowerCase().includes(query));
        }
        if (tab === 'parents') {
            return (item.student?.toLowerCase().includes(query) || item.studentEmail?.toLowerCase().includes(query) || item.parentEmail?.toLowerCase().includes(query));
        }
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2.5 text-indigo-400 mb-1">
                        <activeTab.icon size={22} />
                        <span className="text-xs font-black uppercase tracking-widest">Future Education OS</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">{activeTab.label} Tracking</h1>
                    <p className="text-gray-400 mt-2 text-sm">{activeTab.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData(true)}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.label.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-5 py-3 w-64 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">TOTAL SCANNED</p>
                    <h3 className="text-3xl font-black text-white">{data.length}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">FILTER MATCHES</p>
                    <h3 className="text-3xl font-black text-white">{filteredData.length}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-2xl rounded-full" />
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">OS COMPONENT</p>
                    <h3 className="text-3xl font-black text-white uppercase truncate">{tab.replace('-', ' ')}</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">TELEMETRY SYNC</p>
                    <h3 className="text-3xl font-black text-white">LIVE 🟢</h3>
                </div>
            </div>

            {/* 🌐 Real-time surveillance & Keyword Intent widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
                {/* Genesis Live IP Surveillance Feed */}
                <div className="p-6 rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>Genesis Live IP Surveillance & Traffic Feed</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Surveillance active</span>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Active Visitors ({surveillanceTraffic.length})</div>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {surveillanceTraffic.length === 0 ? (
                                <p className="text-xs text-gray-650 italic">No active traffic monitored.</p>
                            ) : (
                                surveillanceTraffic.map((v: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2 h-2 rounded-full ${v.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                            <div>
                                                <span className="font-bold text-white font-mono block">{v.ip}</span>
                                                <span className="text-[10px] text-gray-500 block truncate max-w-[200px]">{v.device}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-indigo-450 font-bold block">{v.city || 'Unknown'}, {v.country || 'IN'}</span>
                                            <span className="text-[9px] text-gray-500 block">{new Date(v.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-white/5 pt-4">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Recent Telemetry Actions</div>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                            {surveillanceLogs.length === 0 ? (
                                <p className="text-xs text-gray-650 italic">Listening for live operations...</p>
                            ) : (
                                surveillanceLogs.map((log: any, idx: number) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] leading-relaxed">
                                        <div className="flex justify-between items-center text-[9px] uppercase font-black text-indigo-400 mb-1">
                                            <span>{log.action}</span>
                                            <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-gray-300 font-medium">{log.details}</p>
                                        {log.ip && <span className="text-[9px] text-gray-600 font-mono block mt-0.5">IP: {log.ip}</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Most Searched Keywords & Topic Intent Analytics */}
                <div className="p-6 rounded-3xl border border-white/5 bg-zinc-950/40 backdrop-blur-md space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            <span>Topic Intent & Search Keyword Analytics</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">SEO Keyword Tracking</span>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Major Student Searches</div>
                        <div className="flex flex-wrap gap-2">
                            {keywordAnalytics?.keywords && keywordAnalytics.keywords.length > 0 ? (
                                keywordAnalytics.keywords.map((kw: any, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 cursor-default">
                                        {kw.keyword}
                                        <span className="px-1 py-0.2 text-[8px] bg-indigo-600/30 text-indigo-200 rounded-md font-black">{kw.count}x</span>
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-600 italic">No search metrics computed yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                            <span className="text-[10px] text-gray-550 font-black uppercase tracking-wider block mb-2">Top Subject Intent</span>
                            <span className="text-lg font-black text-white capitalize block truncate">{keywordAnalytics?.topSubject || 'Mathematics'}</span>
                            <span className="text-[10px] text-gray-500 block mt-1">{keywordAnalytics?.subjectCount || 12} distinct query targets</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                            <span className="text-[10px] text-gray-550 font-black uppercase tracking-wider block mb-2">Total Queries Tracked</span>
                            <span className="text-lg font-black text-emerald-400 block">{keywordAnalytics?.totalQueries || 0} searches</span>
                            <span className="text-[10px] text-gray-500 block mt-1">Refreshed live in background</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher statistics block (only on exams tab) */}
            {tab === 'exams' && teacherStats.length > 0 && (
                <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            <Users size={20} className="text-indigo-400" />
                            <span>Teacher Generation Leaderboard</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {teacherStats.map((stat: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-white block">{stat.name}</span>
                                    <span className="text-[10px] text-gray-500 block">{stat.email}</span>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-black">
                                        {stat.count} papers
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Interactive Table Panel */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-500">
                        <RefreshCw size={36} className="animate-spin text-indigo-400 mx-auto mb-4" />
                        <p className="font-bold tracking-tight text-sm">Decoding student telemetry feed...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        <Info size={36} className="text-gray-600 mx-auto mb-4" />
                        <p className="font-bold tracking-tight text-sm">No telemetry records match the filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.03] border-b border-white/5">
                                <tr>
                                    {tab === 'users' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">User</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Role</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Token Balance</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Level & XP</th>
                                        </>
                                    )}
                                    {tab === 'tutor-chats' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Topic</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Messages</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Last Reply</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Date</th>
                                        </>
                                    )}
                                    {tab === 'roadmaps' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Roadmap Title</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Class / Board</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Progress</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Date</th>
                                        </>
                                    )}
                                    {tab === 'tasks' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Topic / Subject</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Type</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">AI Evaluation</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                        </>
                                    )}
                                    {tab === 'battles' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Room Code</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Host</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Subject & Topic</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Mode</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Winner</th>
                                        </>
                                    )}
                                    {tab === 'builder' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Project</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Domain / Field</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Date</th>
                                        </>
                                    )}
                                    {tab === 'exams' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">User</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Exam Title</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Score / Graded</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Cheating Proctor Logs</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Date</th>
                                        </>
                                    )}
                                    {tab === 'results' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Rank & School</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">XP</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Coins</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Class / Board</th>
                                        </>
                                    )}
                                    {tab === 'parents' && (
                                        <>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Parent Email</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Failure Alert</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Linked</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredData.map((item: any) => (
                                    <tr key={item.id || item._id} className="group hover:bg-white/[0.02] transition-colors">
                                        {tab === 'users' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div 
                                                        onClick={() => handleOpenProfileModal(item)}
                                                        className="flex flex-col cursor-pointer group/name transition-colors"
                                                    >
                                                        <span className="text-sm font-bold text-white group-hover/name:text-indigo-400 transition-colors">
                                                            {item.firstName} {item.lastName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 font-black uppercase">
                                                    {item.role}
                                                </td>
                                                <td className="px-6 py-5 font-mono text-sm text-yellow-400 font-black">
                                                    {item.tokenBalance || 0} FBRTS
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-450 font-bold">
                                                    Level {item.level || 1} ({item.xp || 0} XP)
                                                </td>
                                            </>
                                        )}
                                        {tab === 'tutor-chats' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-black border border-indigo-500/20">
                                                        {item.messageCount} msg
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-400 font-medium max-w-xs truncate">
                                                    {item.lastMessage}
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                        {tab === 'roadmaps' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 uppercase font-black">
                                                    {item.grade} | {item.board}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden shrink-0">
                                                            <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
                                                        </div>
                                                        <span className="text-xs text-indigo-300 font-bold">{item.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                        {tab === 'tasks' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-300 font-medium truncate max-w-xs">{item.topic}</span>
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.subject}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 uppercase font-black">
                                                    {item.type}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {item.submitted ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20">
                                                                Score: {item.score}/100
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Not submitted</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.submitted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                        {item.submitted ? 'Graded' : 'Pending'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {tab === 'battles' && (
                                            <>
                                                <td className="px-6 py-5 font-mono text-sm text-indigo-300 font-black">
                                                    {item.roomCode}
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-white">
                                                    {item.host}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-300 font-medium truncate max-w-xs">{item.topic}</span>
                                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.subject}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 font-black">
                                                    {item.mode}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.winner !== 'N/A' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border border-white/5'}`}>
                                                        {item.winner !== 'N/A' ? `Team ${item.winner}` : 'Pending'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {tab === 'builder' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 uppercase font-black">
                                                    {item.field} | {item.category}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                        {tab === 'exams' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-emerald-400 font-bold">
                                                    {item.score}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {item.status === 'generated' ? (
                                                        <span className="text-xs text-gray-550">N/A (Generated Paper)</span>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.tabOutCount > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-gray-500'}`}>
                                                                Tab Switches: {item.tabOutCount}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.copyCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-gray-500'}`}>
                                                                Copy attempts: {item.copyCount}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                        {tab === 'results' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user}</span>
                                                        <span className="text-xs text-gray-500">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-300 font-medium">{item.rank}</span>
                                                        <span className="text-xs text-gray-500">{item.schoolName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-mono text-sm text-amber-400 font-black">
                                                    {item.xp} XP
                                                </td>
                                                <td className="px-6 py-5 font-mono text-sm text-yellow-400 font-black">
                                                    {item.coins}🪙
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 uppercase font-black">
                                                    Class {item.standard} | {item.board}
                                                </td>
                                            </>
                                        )}
                                        {tab === 'parents' && (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.student}</span>
                                                        <span className="text-xs text-gray-500">{item.studentEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-gray-300 font-medium">
                                                    {item.parentEmail}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.parentVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                        {item.parentVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-400 font-black">
                                                    {item.notifyOnFail ? 'Notify Fail 🔴' : 'Muted ⚪'}
                                                </td>
                                                <td className="px-6 py-5 text-xs text-gray-500">
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleViewDetail(item)}
                                                className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-indigo-400 hover:text-white hover:bg-indigo-650 transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                                            >
                                                Inspect <ExternalLink size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Telemetry Detail Inspection Drawer Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
                        {/* Overlay backdrop click to close */}
                        <div className="absolute inset-0" onClick={() => { setSelectedItem(null); setUserDossier(null); }} />
                        
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`relative ${userDossier ? 'w-[750px]' : 'w-[500px]'} h-full bg-zinc-950 border-l border-white/10 p-8 shadow-2xl flex flex-col z-10 overflow-y-auto`}
                        >
                            <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Record Inspection</h3>
                                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">education os telemetry feed</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedItem(null); setUserDossier(null); }}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    Close Panel
                                </button>
                            </div>

                            {/* Dynamic Detail Content */}
                            <div className="flex-1 space-y-6">
                                {loadingDossier ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs text-gray-400 font-bold">Compiling Student Dossier...</p>
                                    </div>
                                ) : userDossier ? (
                                    <>
                                        {/* Drilled Detail View */}
                                        {nestedDetail ? (
                                            <div className="space-y-6">
                                                {nestedDetailType === 'chat' && (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                            <button
                                                                onClick={() => { setNestedDetail(null); setNestedDetailType(null); }}
                                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-indigo-400 hover:text-white hover:bg-indigo-650 transition-all flex items-center gap-1.5 active:scale-95"
                                                            >
                                                                ← Back to Dossier
                                                            </button>
                                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tutor Chat Feed</span>
                                                        </div>

                                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                                            <span className="text-gray-500 font-black uppercase tracking-wider block mb-1">Session Topic</span>
                                                            <span className="text-white font-bold">{nestedDetail.title || 'General doubt session'}</span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <span>CONVERSATION LOGS</span>
                                                                {nestedLoading && <RefreshCw size={10} className="animate-spin text-indigo-400" />}
                                                            </p>

                                                            {nestedLoading ? (
                                                                <div className="p-10 text-center text-xs text-gray-500 font-bold animate-pulse">Loading dialog feed...</div>
                                                            ) : !nestedDetail.messages || nestedDetail.messages.length === 0 ? (
                                                                <div className="p-5 text-center text-xs text-gray-600 bg-white/[0.01] border border-white/5 rounded-xl">No messages cached.</div>
                                                            ) : (
                                                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                                                                    {nestedDetail.messages.map((msg: any, index: number) => (
                                                                        <div
                                                                            key={index}
                                                                            className={`p-4 rounded-2xl border text-xs leading-relaxed ${msg.role === 'student' || msg.role === 'user' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-250' : 'bg-purple-500/5 border-purple-500/10 text-purple-250'}`}
                                                                        >
                                                                            <div className="flex justify-between font-black uppercase tracking-wider mb-2 text-[9px] opacity-75">
                                                                                <span>{msg.role === 'student' || msg.role === 'user' ? 'Student Prompt' : 'AI Tutor Response'}</span>
                                                                            </div>
                                                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {nestedDetailType === 'exam' && (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                            <button
                                                                onClick={() => { setNestedDetail(null); setNestedDetailType(null); }}
                                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-indigo-400 hover:text-white hover:bg-indigo-650 transition-all flex items-center gap-1.5 active:scale-95"
                                                            >
                                                                ← Back to Dossier
                                                            </button>
                                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Exam Proctoring Report</span>
                                                        </div>

                                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EXAM PROFILE</p>
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Exam Title</span>
                                                                    <span className="text-white font-bold">{nestedDetail.title}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Score Mapped</span>
                                                                    <span className="text-emerald-400 font-black">{nestedDetail.score}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Subject</span>
                                                                    <span className="text-white font-bold">{nestedDetail.subject || 'General'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Date Taken</span>
                                                                    <span className="text-white font-bold">{new Date(nestedDetail.timestamp).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>

                                                            <div className="border-t border-white/5 pt-4 space-y-3">
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">LIVE PROCTORING SCORE</p>
                                                                <div className="flex gap-4">
                                                                    <div className="flex-1 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
                                                                        <span className="text-rose-400 text-lg font-black block">{nestedDetail.tabOutCount || 0}</span>
                                                                        <span className="text-[9px] text-gray-500 uppercase font-black">Tab Switches</span>
                                                                    </div>
                                                                    <div className="flex-1 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                                                                        <span className="text-amber-400 text-lg font-black block">{nestedDetail.copyCount || 0}</span>
                                                                        <span className="text-[9px] text-gray-500 uppercase font-black">Clipboard Violations</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {nestedDetail.proctoringLogs && nestedDetail.proctoringLogs.length > 0 && (
                                                                <div className="border-t border-white/5 pt-4 space-y-3">
                                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">VIOLATION TIMELINE LOGS</p>
                                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                                        {nestedDetail.proctoringLogs.map((log: any, idx: number) => (
                                                                            <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1">
                                                                                <div className="flex justify-between font-black text-[9px] uppercase tracking-wider text-rose-400">
                                                                                    <span>{log.event}</span>
                                                                                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                                                </div>
                                                                                <p className="text-gray-400 font-medium leading-normal">{log.details}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {nestedDetailType === 'roadmap' && (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                            <button
                                                                onClick={() => { setNestedDetail(null); setNestedDetailType(null); }}
                                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-indigo-400 hover:text-white hover:bg-indigo-650 transition-all flex items-center gap-1.5 active:scale-95"
                                                            >
                                                                ← Back to Dossier
                                                            </button>
                                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Roadmap Details</span>
                                                        </div>

                                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ROADMAP METADATA</p>
                                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Roadmap Title</span>
                                                                    <span className="text-white font-bold">{nestedDetail.title}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Syllabus Subject</span>
                                                                    <span className="text-white font-bold">{nestedDetail.subject || 'Science'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Class standard / Board</span>
                                                                    <span className="text-white font-bold uppercase">{nestedDetail.standard || nestedDetail.grade_level || 'Class 10'} | {nestedDetail.board || 'CBSE'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-400 font-semibold block">Status</span>
                                                                    <span className="text-emerald-400 font-bold">{nestedDetail.isCompleted ? 'Completed ✅' : 'In Progress ⏳'}</span>
                                                                </div>
                                                            </div>

                                                            {nestedDetail.steps && nestedDetail.steps.length > 0 && (
                                                                <div className="border-t border-white/5 pt-4 space-y-3">
                                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SYLLABUS STEPS PATHWAYS</p>
                                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                                        {nestedDetail.steps.map((step: any, idx: number) => (
                                                                            <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex justify-between items-center">
                                                                                <div>
                                                                                    <span className="font-bold text-white block">Step {idx + 1}: {step.title}</span>
                                                                                    <span className="text-[10px] text-gray-500 block">{step.description || 'Syllabus subtopic node'}</span>
                                                                                </div>
                                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${step.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-500'}`}>
                                                                                    {step.isCompleted ? 'Done' : 'Pending'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Dossier Main Profile Views */
                                            <div className="space-y-6">
                                                {/* Edit User Controls (only on Users Control panel tab) */}
                                                {tab === 'users' && (
                                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EDIT USER CONTROL</p>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-black block mb-1">USER ROLE</label>
                                                                <select
                                                                    value={editRole}
                                                                    onChange={(e) => setEditRole(e.target.value)}
                                                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                >
                                                                    <option value="user">User</option>
                                                                    <option value="teacher">Teacher</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-black block mb-1">ACCOUNT STATUS</label>
                                                                <select
                                                                    value={editStatus}
                                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                >
                                                                    <option value="active">Active</option>
                                                                    <option value="inactive">Suspended</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-black block mb-1">TOKENS BALANCE</label>
                                                                <input
                                                                    type="number"
                                                                    value={editTokens}
                                                                    onChange={(e) => setEditTokens(Number(e.target.value))}
                                                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUpdateUser(selectedItem.id || selectedItem._id)}
                                                            disabled={updatingUser}
                                                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-black shadow-lg transition-all active:scale-[0.98] mt-2"
                                                        >
                                                            {updatingUser ? 'Updating User Feed...' : 'Commit Changes'}
                                                        </button>
                                                    </div>
                                                )}

                                                <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                    Student Dossier: {userDossier.user?.firstName} {userDossier.user?.lastName}
                                                </h4>

                                                {/* Onboarding & School Info */}
                                                <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                                                    <div>
                                                        <span className="text-gray-500 font-black uppercase tracking-wider block mb-1">Standard / Board</span>
                                                        <span className="text-white font-bold">
                                                            Class {userDossier.educationOS?.studentProfile?.grade_level?.replace('class_', '') || 'N/A'} | {userDossier.educationOS?.studentProfile?.board?.toUpperCase() || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 font-black uppercase tracking-wider block mb-1">School / City</span>
                                                        <span className="text-white font-bold truncate block">
                                                            {userDossier.educationOS?.studentProfile?.school_name || 'N/A'} ({userDossier.educationOS?.studentProfile?.state || 'N/A'})
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 font-black uppercase tracking-wider block mb-1">XP / Coins</span>
                                                        <span className="text-amber-400 font-black">
                                                            {userDossier.educationOS?.studentProfile?.xp || userDossier.user?.xp || 0} XP | {userDossier.educationOS?.studentProfile?.coins || userDossier.user?.level || 0} Coins 🪙
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 font-black uppercase tracking-wider block mb-1">Premium Level</span>
                                                        <span className="text-indigo-400 font-black">
                                                            {userDossier.user?.isPremium ? 'Premium Plan Member ⭐' : 'Free Tier'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Tutor Chat History */}
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TUTOR CHATS HISTORY ({userDossier.educationOS?.chats?.length || 0})</p>
                                                    {userDossier.educationOS?.chats?.length > 0 ? (
                                                        <div className="border border-white/5 rounded-xl overflow-hidden max-h-[140px] overflow-y-auto">
                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                                                                        <th className="px-4 py-2">Session Topic</th>
                                                                        <th className="px-4 py-2">Messages</th>
                                                                        <th className="px-4 py-2">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {userDossier.educationOS.chats.map((c: any) => (
                                                                        <tr key={c._id} className="hover:bg-white/[0.01]">
                                                                            <td className="px-4 py-2 text-white font-semibold truncate max-w-[200px]">{c.title || 'General Chat'}</td>
                                                                            <td className="px-4 py-2 text-gray-400">{c.messages?.length || 0} msg</td>
                                                                            <td className="px-4 py-2">
                                                                                <button
                                                                                    onClick={() => handleDrillChat(c._id)}
                                                                                    className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-indigo-650 hover:text-white rounded text-[10px] font-black text-indigo-400 transition-all active:scale-95"
                                                                                >
                                                                                    View Dialog
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic pl-2">No tutor chat sessions found.</p>
                                                    )}
                                                </div>

                                                {/* Study Roadmaps */}
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">STUDY ROADMAPS & PROGRESS ({userDossier.educationOS?.roadmaps?.length || 0})</p>
                                                    {userDossier.educationOS?.roadmaps?.length > 0 ? (
                                                        <div className="border border-white/5 rounded-xl overflow-hidden max-h-[140px] overflow-y-auto">
                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                                                                        <th className="px-4 py-2">Roadmap</th>
                                                                        <th className="px-4 py-2">Status</th>
                                                                        <th className="px-4 py-2">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {userDossier.educationOS.roadmaps.map((r: any) => (
                                                                        <tr key={r._id} className="hover:bg-white/[0.01]">
                                                                            <td className="px-4 py-2 text-white font-semibold truncate max-w-[200px]">{r.title || 'Custom Roadmap'}</td>
                                                                            <td className="px-4 py-2 text-emerald-400 font-bold">{r.isCompleted ? 'Completed ✅' : 'In Progress ⏳'}</td>
                                                                            <td className="px-4 py-2">
                                                                                <button
                                                                                    onClick={() => handleDrillRoadmap(r)}
                                                                                    className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-indigo-650 hover:text-white rounded text-[10px] font-black text-indigo-400 transition-all active:scale-95"
                                                                                >
                                                                                    View Steps
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic pl-2">No roadmaps generated yet.</p>
                                                    )}
                                                </div>

                                                {/* Practice Exams Taken */}
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PRACTICE EXAMS & CHEAT AUDIT ({userDossier.educationOS?.exams?.length || 0})</p>
                                                    {userDossier.educationOS?.exams?.length > 0 ? (
                                                        <div className="border border-white/5 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                                                                        <th className="px-4 py-2">Exam Title</th>
                                                                        <th className="px-4 py-2">Score</th>
                                                                        <th className="px-4 py-2">Violations</th>
                                                                        <th className="px-4 py-2">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {userDossier.educationOS.exams.map((e: any) => (
                                                                        <tr key={e._id} className="hover:bg-white/[0.01]">
                                                                            <td className="px-4 py-2 text-white font-semibold truncate max-w-[160px]">{e.title}</td>
                                                                            <td className="px-4 py-2 text-emerald-400 font-bold">{e.score}</td>
                                                                            <td className="px-4 py-2">
                                                                                {e.tabOutCount > 0 || e.copyCount > 0 ? (
                                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                                                                                        Tabs: {e.tabOutCount || 0} | Copy: {e.copyCount || 0} ⚠️
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-gray-550 text-[10px] font-bold">Clean Run ✅</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                <button
                                                                                    onClick={() => handleDrillExam(e)}
                                                                                    className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-indigo-650 hover:text-white rounded text-[10px] font-black text-indigo-400 transition-all active:scale-95"
                                                                                >
                                                                                    Audit Logs
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic pl-2">No practice exams completed yet.</p>
                                                    )}
                                                </div>

                                                {/* Builder Projects */}
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BUILDER PROJECTS ({userDossier.educationOS?.builderProjects?.length || 0})</p>
                                                    {userDossier.educationOS?.builderProjects?.length > 0 ? (
                                                        <div className="border border-white/5 rounded-xl overflow-hidden max-h-[140px] overflow-y-auto">
                                                            <table className="w-full text-left text-xs border-collapse">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-white/5">
                                                                        <th className="px-4 py-2">Project</th>
                                                                        <th className="px-4 py-2">Category</th>
                                                                        <th className="px-4 py-2">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {userDossier.educationOS.builderProjects.map((p: any) => (
                                                                        <tr key={p._id} className="hover:bg-white/[0.01]">
                                                                            <td className="px-4 py-2 text-white font-semibold truncate max-w-[200px]">{p.title || 'Untitled App'}</td>
                                                                            <td className="px-4 py-2 text-indigo-400 font-bold capitalize">{p.category || 'App'}</td>
                                                                            <td className="px-4 py-2">
                                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                                                    {p.status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-600 italic pl-2">No projects built yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Original Tab-Specific Fallbacks (if no user dossier is available) */
                                    <>
                                        {tab === 'tutor-chats' && (
                                            <div className="space-y-6">
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">METADATA</p>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block">Student</span>
                                                            <span className="text-white font-bold">{selectedItem.user || 'Unknown Student'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block">Session Topic</span>
                                                            <span className="text-white font-bold">{selectedItem.title}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {tab === 'roadmaps' && (
                                            <div className="space-y-6">
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ROADMAP TELEMETRY</p>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block">Syllabus Title</span>
                                                            <span className="text-white font-bold">{selectedItem.title}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block">Subject</span>
                                                            <span className="text-white font-bold">{selectedItem.subject}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {tab === 'tasks' && (
                                            <div className="space-y-6">
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ASSIGNED PROMPT</p>
                                                    <p className="text-xs text-white bg-black/40 p-4 border border-white/5 rounded-xl font-medium">{selectedItem.prompt}</p>
                                                </div>
                                            </div>
                                        )}

                                        {tab === 'exams' && (
                                            <div className="space-y-6">
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EXAM PROFILE</p>
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-gray-400 font-semibold block">Exam Title</span>
                                                            <span className="text-white font-bold">{selectedItem.title}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detailed Student Profile Page Modal popup */}
            {profileModalUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative">
                        {/* Header banner */}
                        <div className="relative h-32 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 flex items-end p-6">
                            <button
                                onClick={() => setProfileModalUser(null)}
                                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 border border-white/10 text-white rounded-full p-2 transition-all active:scale-95 text-xs font-bold px-3 py-1.5"
                            >
                                Close Modal
                            </button>
                            
                            {/* Avatar/Photo */}
                            <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-zinc-950 shadow-xl overflow-hidden flex items-center justify-center">
                                {profileModalUser.avatar ? (
                                    <img src={profileModalUser.avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-black text-indigo-400">
                                        {profileModalUser.firstName?.[0] || 'S'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Name and Basic Metadata */}
                        <div className="pt-12 px-6 pb-4">
                            <h3 className="text-2xl font-black text-white">{profileModalUser.firstName} {profileModalUser.lastName}</h3>
                            <p className="text-xs text-indigo-450 font-bold uppercase tracking-widest mt-1">{profileModalUser.email}</p>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profileModalUser.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'}`}>
                                    Status: {profileModalUser.status || 'Active'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/10 text-indigo-405 uppercase">
                                    Role: {profileModalUser.role || 'User'}
                                </span>
                            </div>
                        </div>

                        {/* Scrollable details */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                            {/* Academic Profile */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Academic Institution details</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-500 font-semibold block mb-1">School Name</span>
                                        <span className="text-white font-bold">{profileModalUser.educationOS?.studentProfile?.school_name || 'Not Provided'}</span>
                                    </div>
                                    <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-500 font-semibold block mb-1">City / Location</span>
                                        <span className="text-white font-bold">{profileModalUser.educationOS?.studentProfile?.city || profileModalUser.educationOS?.studentProfile?.state || 'Not Provided'}</span>
                                    </div>
                                    <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-500 font-semibold block mb-1">Board / Standard</span>
                                        <span className="text-white font-bold uppercase">{profileModalUser.educationOS?.studentProfile?.board || 'N/A'} | Class {profileModalUser.educationOS?.studentProfile?.grade_level?.replace('class_', '') || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-500 font-semibold block mb-1">Medium of Instruction</span>
                                        <span className="text-white font-bold capitalize">{profileModalUser.educationOS?.studentProfile?.medium || 'English'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Style & Subjects */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Learning Analytics</h4>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5 col-span-3">
                                        <span className="text-gray-500 font-semibold block mb-1">Cognitive Learning Style</span>
                                        <span className="text-indigo-400 font-black text-sm capitalize">{profileModalUser.educationOS?.studentProfile?.learning_style || 'Conceptual & Visual learner'}</span>
                                    </div>
                                    <div className="bg-emerald-500/[0.02] p-3 rounded-xl border border-emerald-500/10 col-span-1">
                                        <span className="text-emerald-500/70 font-semibold block mb-1">Strong Subjects</span>
                                        <span className="text-emerald-400 font-bold">
                                            {profileModalUser.educationOS?.studentProfile?.strong_subjects?.join(', ') || 'Mathematics, Science'}
                                        </span>
                                    </div>
                                    <div className="bg-rose-500/[0.02] p-3 rounded-xl border border-rose-500/10 col-span-2">
                                        <span className="text-rose-500/70 font-semibold block mb-1">Target Improvement Subjects</span>
                                        <span className="text-rose-450 font-bold">
                                            {profileModalUser.educationOS?.studentProfile?.weak_subjects?.join(', ') || 'Languages'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Onboarding process */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-550 uppercase tracking-widest border-b border-white/5 pb-2">Onboarding Process Goals</h4>
                                <div className="bg-white/[0.01] p-4 rounded-xl border border-white/5 text-xs space-y-3">
                                    <div>
                                        <span className="text-gray-500 font-semibold block mb-1">Academic Category Interests</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {profileModalUser.onboarding?.category?.map((cat: string, index: number) => (
                                                <span key={index} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold uppercase text-[9px]">
                                                    {cat}
                                                </span>
                                            )) || <span className="text-gray-400 italic">No categories selected</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 font-semibold block mb-1">Academic Learning Goal</span>
                                        <p className="text-white font-medium italic">"{profileModalUser.onboarding?.goal || 'Excel in board exams and learn code'}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
