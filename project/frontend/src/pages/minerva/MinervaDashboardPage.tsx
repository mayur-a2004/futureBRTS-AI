import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Star, Flame, Trophy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const MinervaDashboardPage: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>({
        total_exams_taken: 0,
        activeRoadmaps: 0,
        averageScore: 85,
        streak: 0,
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 0]
    });
    const [dueReviews, setDueReviews] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadDashboardData();
        }
    }, [token]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const profileRes = await minervaApi.getProfile(token);
            if (profileRes.success) {
                setProfile(profileRes.profile);
            }
            
            const statsData = await minervaApi.getStats(token);
            if (statsData.success) {
                setStats((prev: any) => ({
                    ...prev,
                    total_exams_taken: statsData.stats.total_exams || 0,
                    activeRoadmaps: statsData.stats.active_roadmaps || 0,
                    averageScore: statsData.stats.avg_exam_score || 85,
                    streak: statsData.stats.study_streak ?? 0,
                    weeklyMinutes: statsData.stats.weeklyMinutes || [0, 0, 0, 0, 0, 0, 0]
                }));
            }

            // Fetch due reviews
            const reviewsRes = await minervaApi.getDueReviews(token);
            if (reviewsRes.success) {
                setDueReviews(reviewsRes.due_nodes || []);
            }

            // Fetch leaderboard
            const leaderboardRes = await minervaApi.getLeaderboard(token);
            if (leaderboardRes.success) {
                setLeaderboard(leaderboardRes.leaderboard || []);
            }
        } catch (err) {
            console.error("Error loading dashboard metrics:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate level metrics
    const currentLevel = user?.level || 1;
    const currentXp = user?.xp || 0;
    const xpNeeded = currentLevel * 1000;
    const xpPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

    // Badges inventory
    const defaultBadges = [
        { name: 'Level 5 Scholar', icon: '🎓', desc: 'Reach Level 5 in Education OS', reqLevel: 5 },
        { name: 'Level 10 Scholar', icon: '🌟', desc: 'Reach Level 10 in Education OS', reqLevel: 10 },
        { name: 'Virtual Lab Champ', icon: '🧪', desc: 'Run code in the Visual Lab Sandbox', reqLevel: 1 },
        { name: 'Deep Explorer', icon: '🧭', desc: 'Toggle Deep Study chat lesson', reqLevel: 1 },
        { name: 'First Grade', icon: '🥇', desc: 'Get above 90% in any exam', reqLevel: 1 },
    ];

    const unlockedBadges = stats.badges || user?.badges || [];

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-24 overflow-x-hidden">
            {/* Background Beacons */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 pt-8 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/future-education')}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-all mb-8 active:scale-95 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-2xl"
                >
                    <ChevronLeft size={14} />
                    <span>Back to Portal</span>
                </button>

                {/* Dashboard Main Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400">
                            MINERVA ANALYTICS
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                            Student Progress & Achievements Dashboard
                        </p>
                    </div>

                    {/* Quick Level Card */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 w-full md:w-80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Level Progression</span>
                            <span className="text-xs font-bold text-white">Level {currentLevel}</span>
                        </div>
                        {/* XP Progress Bar */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2 border border-white/5">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${xpPercent}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                            <span>{currentXp} XP</span>
                            <span>{xpNeeded} XP for Level {currentLevel + 1}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Exams Taken', value: stats.total_exams_taken, icon: <BookOpen className="text-indigo-400" /> },
                        { label: 'Avg Exam Score', value: `${stats.averageScore}%`, icon: <Star className="text-yellow-400" /> },
                        { label: 'Study Streak', value: `${stats.streak} Days`, icon: <Flame className="text-orange-500" /> },
                        { label: 'Active Paths', value: stats.activeRoadmaps, icon: <Trophy className="text-purple-400" /> },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center text-center hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all shadow-xl">
                            <div className="p-3 bg-white/5 rounded-2xl mb-4">{stat.icon}</div>
                            <div className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">{stat.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Analytics Details */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left Column: Progress Graph */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Weekly Study Time Recharts Area Chart */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 border-b border-white/5 pb-4 mb-6 italic">Weekly Engagement Curve</h3>
                            
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={[
                                            { name: 'Mon', minutes: stats.weeklyMinutes?.[0] || 45 },
                                            { name: 'Tue', minutes: stats.weeklyMinutes?.[1] || 60 },
                                            { name: 'Wed', minutes: stats.weeklyMinutes?.[2] || 30 },
                                            { name: 'Thu', minutes: stats.weeklyMinutes?.[3] || 90 },
                                            { name: 'Fri', minutes: stats.weeklyMinutes?.[4] || 75 },
                                            { name: 'Sat', minutes: stats.weeklyMinutes?.[5] || 40 },
                                            { name: 'Sun', minutes: stats.weeklyMinutes?.[6] || 50 }
                                        ]}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMinutes)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Badges showcase */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 border-b border-white/5 pb-4 italic">Unlocked Achievements</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {defaultBadges.map((badge, idx) => {
                                    const isUnlocked = unlockedBadges.some((ub: any) => ub.name?.toLowerCase() === badge.name.toLowerCase()) || 
                                                       (badge.reqLevel && currentLevel >= badge.reqLevel);
                                    return (
                                        <div
                                            key={idx}
                                            className={`border rounded-3xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                                                isUnlocked 
                                                    ? 'bg-indigo-950/10 border-indigo-500/25 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/40' 
                                                    : 'bg-white/[0.01] border-white/5 opacity-40 select-none'
                                            }`}
                                        >
                                            <div className="text-4xl mb-3">{badge.icon}</div>
                                            <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                                            <p className="text-[9px] text-gray-500 leading-snug">{badge.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Leaderboard panel */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 italic flex items-center gap-2">
                                    <Trophy size={14} className="text-yellow-400" /> Dynamic Student Leaderboard
                                </h3>
                                <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Top 10 Global</span>
                            </div>
                            <div className="space-y-3">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((u: any, idx: number) => {
                                        const isCurrentUser = u._id === user?.id || u._id === user?._id;
                                        return (
                                            <div key={idx} className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                                                isCurrentUser 
                                                    ? 'bg-indigo-950/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                                    : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${
                                                        idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-200">{u.firstName} {u.lastName}</span>
                                                        {isCurrentUser && <span className="ml-2 text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase">You</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-right">
                                                    <div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Level {u.level || 1}</div>
                                                        <div className="text-[9px] font-bold text-indigo-400 mt-0.5">{u.xp || 0} XP</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 italic">Leaderboard is empty.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Strengths and weaknesses */}
                    <div className="space-y-10">
                        {/* Spaced Repetition Due Reviews */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 border-b border-white/5 pb-4 italic flex items-center gap-2">
                                🔁 Review Due Today
                            </h3>
                            <div className="space-y-3">
                                {dueReviews.length > 0 ? (
                                    dueReviews.map((node: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => navigate(`/future-education/learn/${node._id}`)}
                                            className="w-full text-left bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-2xl transition-all active:scale-95 block shadow-md cursor-pointer"
                                        >
                                            <span className="text-xs font-bold text-gray-200 block truncate">{node.title}</span>
                                            <span className="text-[9px] text-gray-500 font-bold block mt-1 uppercase tracking-wider">{node.topic} • Chapter {node.chapter}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 italic">
                                        All topics are current! No reviews due. 🎉
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 border-b border-white/5 pb-4 italic">🟢 Target Strengths</h3>
                            <div className="space-y-4">
                                {profile?.strong_subjects?.length > 0 ? (
                                    profile.strong_subjects.map((subj: string, i: number) => (
                                        <div key={i} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-3 rounded-2xl">
                                            <span className="text-xs font-bold capitalize text-gray-200">{subj}</span>
                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Strong</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 italic">Complete exams to map syllabus strengths.</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 border-b border-white/5 pb-4 italic">🟡 Weak Syllabus Areas</h3>
                            <div className="space-y-4">
                                {profile?.weak_subjects?.length > 0 ? (
                                    profile.weak_subjects.map((subj: string, i: number) => (
                                        <div key={i} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-3 rounded-2xl">
                                            <span className="text-xs font-bold capitalize text-gray-200">{subj}</span>
                                            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Review</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 italic">No weaknesses detected. Keep up the high standard!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinervaDashboardPage;
