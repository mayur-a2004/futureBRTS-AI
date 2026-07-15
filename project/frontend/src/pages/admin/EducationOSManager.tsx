import { useState, useEffect } from 'react';
import {
    BookOpen,
    FileSpreadsheet,
    Flame,
    Users,
    Activity,
    Award,
    Calendar,
    Search,
    Map
} from 'lucide-react';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative group hover:bg-white/[0.04] transition-all overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20`}>
                <Icon size={24} className={`text-${color}-400`} />
            </div>
        </div>
        <div className="relative z-10">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);

export default function EducationOSManager() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'exams' | 'sessions' | 'battles'>('students');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEducationStats();
    }, []);

    const fetchEducationStats = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/education-stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resData = await res.json();
            if (resData.success) {
                setData(resData);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync Education OS database.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = data?.stats || {};
    const students = data?.studentProfiles || [];
    const exams = data?.recentExams || [];
    const sessions = data?.recentSessions || [];
    const battles = data?.recentBattles || [];

    // Filters
    const filteredStudents = students.filter((s: any) =>
        (s.userId?.firstName + " " + s.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.school_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredExams = exams.filter((e: any) =>
        (e.userId?.firstName + " " + e.userId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter">Future Education OS Control Center</h1>
                <p className="text-gray-400 mt-2 font-medium">Manage and review student progress, curriculum roadmaps, adaptive tasks, and arena battles.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Student Profiles" value={stats.totalProfiles || 0} icon={Users} color="indigo" />
                <StatCard title="Syllabus Courses" value={stats.totalStudySessions || 0} icon={BookOpen} color="purple" />
                <StatCard title="Exams Graded" value={stats.totalExamsGraded || 0} icon={Award} color="emerald" />
                <StatCard title="Tasks Created" value={stats.totalTasksCreated || 0} icon={Activity} color="amber" />
                <StatCard title="Quiz Battles" value={stats.totalBattlesPlayed || 0} icon={Flame} color="rose" />
                <StatCard title="Teacher Papers" value={stats.totalTeacherPapers || 0} icon={FileSpreadsheet} color="sky" />
            </div>

            {/* Management Panel */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Tabs */}
                    <div className="flex gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-2xl">
                        {(['students', 'exams', 'sessions', 'battles'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                                className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                                    activeTab === tab 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-4 top-3 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/40 transition-all"
                        />
                    </div>
                </div>

                {/* Tab Contents */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    {activeTab === 'students' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Board & Standard</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">School</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Coins Balance</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">City</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-500 font-medium">No students registered yet.</td>
                                        </tr>
                                    ) : filteredStudents.map((profile: any) => (
                                        <tr key={profile._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">
                                                        {profile.userId ? `${profile.userId.firstName?.[0] || ''}${profile.userId.lastName?.[0] || ''}` : 'ST'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">
                                                            {profile.userId ? `${profile.userId.firstName} ${profile.userId.lastName}` : 'Guest Student'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">{profile.userId?.email || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs text-gray-300 font-semibold">{profile.board || 'CBSE'}</div>
                                                <div className="text-[10px] text-gray-500">Class {profile.standard || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400 font-medium">
                                                {profile.school_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4.5 text-xs font-black text-amber-400">
                                                🪙 {profile.coins || 0} Coins
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400">
                                                {profile.city || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Exam Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Subject</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Score</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Result Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredExams.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-500 font-medium">No recent exam attempts found.</td>
                                        </tr>
                                    ) : filteredExams.map((exam: any) => (
                                        <tr key={exam._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs text-white font-bold">{exam.title}</div>
                                                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" /> {new Date(exam.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs font-semibold text-gray-300">
                                                    {exam.userId ? `${exam.userId.firstName} ${exam.userId.lastName}` : 'Anonymous Student'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400">
                                                {exam.subject}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs text-white font-black">{exam.total_obtained} / {exam.total_marks}</div>
                                                <div className="text-[10px] text-indigo-400 font-bold">{exam.percentage?.toFixed(1)}% ({exam.grade || 'N/A'})</div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    exam.percentage >= 33 
                                                        ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                                                }`}>
                                                    {exam.percentage >= 33 ? 'PASSED' : 'FAILED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Course Roadmap</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Student</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Board & Grade</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Subject</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Topics</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-500 font-medium">No study sessions generated.</td>
                                        </tr>
                                    ) : sessions.map((sess: any) => (
                                        <tr key={sess._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-2">
                                                    <Map className="w-4 h-4 text-purple-400" />
                                                    <span className="text-xs text-white font-bold">Session ID: {sess._id.slice(-6)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1">Created: {new Date(sess.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs font-semibold text-gray-300">
                                                    {sess.userId ? `${sess.userId.firstName} ${sess.userId.lastName}` : 'Anonymous Student'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="text-xs text-gray-300">{sess.board || 'CBSE'}</div>
                                                <div className="text-[10px] text-gray-500">Grade {sess.grade_level || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-purple-400 font-semibold">
                                                {sess.subject}
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400">
                                                {sess.chapters?.length || 0} Chapters
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'battles' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Room Code</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Game Mode</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Subject</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Rounds</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {battles.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-500 font-medium">No quiz arena battles recorded.</td>
                                        </tr>
                                    ) : battles.map((room: any) => (
                                        <tr key={room._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4.5">
                                                <span className="px-2.5 py-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded-xl text-xs font-black uppercase tracking-wider">
                                                    {room.roomCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-300 font-bold capitalize">
                                                {room.mode?.replace(/_/g, ' ') || 'Solo vs AI'}
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400">
                                                {room.subject || 'All Subjects'}
                                            </td>
                                            <td className="px-6 py-4.5 text-xs text-gray-400 font-semibold">
                                                Round {room.currentRound + 1} / {room.totalRounds}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    room.status === 'finished' 
                                                        ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                                                        : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                                                }`}>
                                                    {room.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
