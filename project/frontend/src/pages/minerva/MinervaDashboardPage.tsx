import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Star, Flame, Trophy, CheckSquare, Zap, Hammer, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { AnimatePresence } from 'framer-motion';
import { AIMemoryCompanionWidget } from '@/components/education/AIMemoryCompanionWidget';

const MinervaDashboardPage: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [activeRange, setActiveRange] = useState<string>('week');
    const [stats, setStats] = useState<any>({
        total_exams_taken: 0,
        activeRoadmaps: 0,
        averageScore: 85,
        streak: 0,
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
        chartData: []
    });
    const [dueReviews, setDueReviews] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [battleProfile, setBattleProfile] = useState<any>(null);
    const [battleHistory, setBattleHistory] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    useEffect(() => {
        if (token) {
            loadDashboardData(activeRange);
        }

        const handleRefreshStats = () => {
            if (token) loadDashboardData(activeRange);
        };

        window.addEventListener('future-education-refresh-stats', handleRefreshStats);
        return () => {
            window.removeEventListener('future-education-refresh-stats', handleRefreshStats);
        };
    }, [token, activeRange]);

    const loadDashboardData = async (range?: string) => {
        const targetRange = range || activeRange;
        setLoading(true);
        try {
            const profileRes = await minervaApi.getProfile(token);
            if (profileRes.success) {
                setProfile(profileRes.profile);
            }
            
            const statsData = await minervaApi.getStats(token, targetRange);
            if (statsData.success) {
                setStats((prev: any) => ({
                    ...prev,
                    total_exams_taken: statsData.stats.total_exams || 0,
                    activeRoadmaps: statsData.stats.active_roadmaps || 0,
                    averageScore: statsData.stats.avg_exam_score || 85,
                    streak: statsData.stats.study_streak ?? 0,
                    weeklyMinutes: statsData.stats.weeklyMinutes || [0, 0, 0, 0, 0, 0, 0],
                    chartData: statsData.stats.chartData || [],
                    pending_homework: statsData.stats.pending_homework || 0
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

            // Fetch battle stats
            try {
                const res = await fetch('/api/minerva/battle/my-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const d = await res.json();
                if (d.success) {
                    setBattleProfile(d.profile);
                    setBattleHistory(d.recentBattles || []);
                }
            } catch (battleErr) {
                console.error("Error loading battle stats:", battleErr);
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

                {/* 🧠 AI SMART MEMORY & COMPANION PROGRESS DIGEST WIDGET */}
                <div className="mb-8">
                    <AIMemoryCompanionWidget />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Exams Taken', value: stats.total_exams_taken, icon: <BookOpen className="text-indigo-450" />, path: "/future-education/exams", desc: "View results & insights" },
                        { label: 'Avg Exam Score', value: `${stats.averageScore}%`, icon: <Star className="text-yellow-450" />, path: "/future-education/exams", desc: "Subject proficiency" },
                        { label: 'Study Streak', value: `${stats.streak} Days`, icon: <Flame className="text-orange-550" />, path: "/future-education/tasks", desc: "Consecutive days" },
                        { label: 'Active Paths', value: stats.activeRoadmaps, icon: <Trophy className="text-purple-450" />, path: "/future-education/roadmaps", desc: "Custom study roadmaps" },
                        { label: 'Pending Tasks', value: `${stats.pending_homework || 0} Task`, icon: <CheckSquare className="text-emerald-450" />, path: "/future-education/tasks", desc: "Assigned homework" },
                        { label: 'Quiz Battle', value: "Arena", icon: <Zap className="text-pink-500" />, path: "/future-education/quiz-battle", desc: "Live multiplayer battle" },
                        { label: 'e-Builder', value: "Build", icon: <Hammer className="text-cyan-450" />, path: "/future-education/exam-generator", desc: "Generate custom papers" },
                        { label: 'AI doubts', value: "Tutor", icon: <MessageSquare className="text-blue-450" />, path: "/future-education", desc: "Ask doubts to Minerva" },
                    ].map((stat, i) => (
                        <button
                            key={i}
                            onClick={() => stat.path && navigate(stat.path)}
                            className="bg-white/[0.02] border border-white/5 rounded-[32px] p-5 flex flex-col items-center justify-center text-center hover:bg-indigo-500/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl cursor-pointer active:scale-95 group relative overflow-hidden w-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="p-3 bg-white/5 rounded-2xl mb-3.5 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                            <div className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 group-hover:to-indigo-300 transition-all pr-2">{stat.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">{stat.label}</div>
                            <div className="text-[7px] font-bold uppercase tracking-wider text-slate-650 mt-1">{stat.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Analytics Details */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left Column: Progress Graph */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Weekly Study Time Recharts Area Chart */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-6 gap-3">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 italic">Engagement Curve</h3>
                                
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {[
                                        { label: 'Hour', value: 'hour' },
                                        { label: 'Week', value: 'week' },
                                        { label: '15 Days', value: '15days' },
                                        { label: 'Month', value: 'month' },
                                        { label: '6 Months', value: '6months' },
                                        { label: 'Year', value: 'year' },
                                    ].map((r) => (
                                        <button
                                            key={r.value}
                                            onClick={() => setActiveRange(r.value)}
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border ${
                                                activeRange === r.value
                                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.chartData && stats.chartData.length > 0 ? stats.chartData : [
                                            { name: 'Mon', minutes: 15 },
                                            { name: 'Tue', minutes: 25 },
                                            { name: 'Wed', minutes: 10 },
                                            { name: 'Thu', minutes: 45 },
                                            { name: 'Fri', minutes: 30 },
                                            { name: 'Sat', minutes: 15 },
                                            { name: 'Sun', minutes: 20 }
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
                                        <button
                                            key={idx}
                                            onClick={() => isUnlocked && setSelectedBadge(badge)}
                                            className={`border rounded-3xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                                                isUnlocked 
                                                    ? 'bg-indigo-950/10 border-indigo-500/25 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/40 cursor-pointer active:scale-95 hover:-translate-y-0.5' 
                                                    : 'bg-white/[0.01] border-white/5 opacity-40 select-none cursor-default'
                                            }`}
                                        >
                                            <div className="text-4xl mb-3">{badge.icon}</div>
                                            <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                                            <p className="text-[9px] text-gray-500 leading-snug">{badge.desc}</p>
                                        </button>
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
                                            <button 
                                                key={idx} 
                                                onClick={() => setSelectedStudent(u)}
                                                className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-left w-full cursor-pointer hover:scale-[1.01] active:scale-[0.99] group ${
                                                    isCurrentUser 
                                                        ? 'bg-indigo-950/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                                                        : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black uppercase transition-all ${
                                                        idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'
                                                    }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{u.firstName} {u.lastName}</span>
                                                        {isCurrentUser && <span className="ml-2 text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md font-bold uppercase">You</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-right">
                                                    <div>
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Level {u.level || 1}</div>
                                                        <div className="text-[9px] font-bold text-indigo-400 mt-0.5 group-hover:text-indigo-355 transition-colors">{u.xp || 0} XP</div>
                                                    </div>
                                                </div>
                                            </button>
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
                        {/* ⚔️ Quiz Battle Command Card */}
                        {battleProfile && (
                            <div className="bg-black/40 border border-indigo-500/10 rounded-[40px] p-8 shadow-3xl space-y-6">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 italic flex items-center gap-2">
                                        ⚔️ Battle Command Card
                                    </h3>
                                    <span className="text-[10px] font-black text-yellow-450 uppercase tracking-wider">{battleProfile.rank}</span>
                                </div>

                                {/* Stats Block */}
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="text-lg font-black text-white">{battleProfile.battleStats?.totalBattles || 0}</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Total Battles</div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="text-lg font-black text-indigo-400">
                                            {battleProfile.battleStats?.totalBattles > 0
                                                ? Math.round(((battleProfile.battleStats?.wins || 0) / battleProfile.battleStats?.totalBattles) * 100)
                                                : 0}%
                                        </div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Win Rate</div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="text-lg font-black text-emerald-450">{battleProfile.battleStats?.wins || 0}</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Wins</div>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                                        <div className="text-lg font-black text-rose-500">{battleProfile.battleStats?.longestStreak || 0} 🔥</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Best Streak</div>
                                    </div>
                                </div>

                                {/* Recent Battles list */}
                                {battleHistory.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recent Battle Activity</h4>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                            {battleHistory.map((b, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/[0.01] border border-white/5 px-3 py-2 rounded-xl text-[10px]">
                                                    <div>
                                                        <span className="font-bold text-slate-200">{b.subject}</span>
                                                        <span className="text-slate-500 block text-[9px]">{b.mode?.replace(/_/g, ' ')}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`font-black ${b.result === 'WIN' ? 'text-emerald-450' : b.result === 'DRAW' ? 'text-amber-500' : 'text-rose-500'}`}>
                                                            {b.result}
                                                        </span>
                                                        <span className="text-[9px] text-indigo-400 block mt-0.5">{b.score} pts</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/future-education/quiz-battle')}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/30 hover:to-violet-600/30 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl text-[10px] font-black uppercase tracking-wider text-indigo-300 transition-all active:scale-95"
                                >
                                    Enter Quiz Arena ⚔️
                                </button>
                            </div>
                        )}

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
                                        <button
                                            key={i}
                                            onClick={() => navigate(`/future-education?q=Help me study ${subj} in detail`)}
                                            className="w-full flex justify-between items-center bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] px-4 py-3 rounded-2xl transition-all duration-200 active:scale-95 group text-left cursor-pointer"
                                        >
                                            <span className="text-xs font-bold capitalize text-gray-200 group-hover:text-emerald-300 transition-colors">{subj}</span>
                                            <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">Strong</span>
                                        </button>
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
                                        <button
                                            key={i}
                                            onClick={() => navigate(`/future-education?q=Explain ${subj} topic because I need help with it`)}
                                            className="w-full flex justify-between items-center bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.02] px-4 py-3 rounded-2xl transition-all duration-200 active:scale-95 group text-left cursor-pointer"
                                        >
                                            <span className="text-xs font-bold capitalize text-gray-200 group-hover:text-amber-300 transition-colors">{subj}</span>
                                            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 px-2 py-0.5 rounded-md uppercase tracking-wider">Review</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-xs text-gray-500 italic">No weaknesses detected. Keep up the high standard!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Achievement Details Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                            onClick={() => setSelectedBadge(null)}
                        />
                        <div className="bg-[#0b081a]/95 border border-indigo-500/30 rounded-[32px] p-8 max-w-sm w-full text-center relative z-10 shadow-2xl animate-in zoom-in-95 duration-250 backdrop-blur-2xl">
                            <div className="text-6xl mb-4 animate-bounce">{selectedBadge.icon}</div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                                {selectedBadge.name}
                            </h3>
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-4">
                                Achievement Unlocked!
                            </p>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                {selectedBadge.desc}
                            </p>
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-95 w-full shadow-lg shadow-indigo-900/40 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            {/* Student Comparison & Rank Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div 
                            className="absolute inset-0 bg-black/70 backdrop-blur-md" 
                            onClick={() => setSelectedStudent(null)}
                        />
                        <div className="bg-[#0c0a21]/95 border border-indigo-500/25 rounded-[36px] p-8 max-w-md w-full relative z-10 shadow-3xl animate-in zoom-in-95 duration-200 backdrop-blur-3xl text-left">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
                                <div>
                                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        Dynamic Comparison
                                    </span>
                                    <h3 className="text-xl font-black text-white mt-2 uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-indigo-400 uppercase tracking-wider">Level {selectedStudent.level || 1}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5 font-bold">{selectedStudent.xp || 0} XP</div>
                                </div>
                            </div>

                            {/* Comparison Cards */}
                            <div className="space-y-4 mb-6">
                                {/* level comparison */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2.5">
                                        <span>Level Comparison</span>
                                        <span className="text-[10px] text-indigo-300 font-bold uppercase">
                                            {currentLevel >= (selectedStudent.level || 1) 
                                                ? currentLevel === (selectedStudent.level || 1) 
                                                    ? "Neck-and-neck" 
                                                    : `You lead by ${currentLevel - (selectedStudent.level || 1)} lvl`
                                                : `They lead by ${(selectedStudent.level || 1) - currentLevel} lvl`
                                            }
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1">
                                                <span>YOU (Level {currentLevel})</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${Math.min(100, (currentLevel / Math.max(currentLevel, selectedStudent.level || 1)) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1">
                                                <span>THEM (Level {selectedStudent.level || 1})</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-650 rounded-full" style={{ width: `${Math.min(100, ((selectedStudent.level || 1) / Math.max(currentLevel, selectedStudent.level || 1)) * 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* XP comparison */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2.5">
                                        <span>XP Comparison</span>
                                        <span className="text-[10px] text-amber-400 font-bold uppercase">
                                            {currentXp >= (selectedStudent.xp || 0)
                                                ? currentXp === (selectedStudent.xp || 0)
                                                    ? "Tied XP"
                                                    : `You lead by ${currentXp - (selectedStudent.xp || 0)} XP`
                                                : `They lead by ${(selectedStudent.xp || 0) - currentXp} XP`
                                            }
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1">
                                                <span>YOU ({currentXp} XP)</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full" style={{ width: `${Math.min(100, (currentXp / Math.max(currentXp, selectedStudent.xp || 1)) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-1">
                                                <span>THEM ({selectedStudent.xp || 0} XP)</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-650 rounded-full" style={{ width: `${Math.min(100, ((selectedStudent.xp || 0) / Math.max(currentXp, selectedStudent.xp || 1)) * 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges unlocked comparison */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2">
                                        <span>Badges Unlocked</span>
                                        <span className="text-[10px] text-gray-500 font-bold">
                                            {unlockedBadges.length} vs {(selectedStudent.badges || []).length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                        {(selectedStudent.badges || []).length > 0 ? (
                                            (selectedStudent.badges || []).map((badge: any, bIdx: number) => (
                                                <span key={bIdx} title={badge.name} className="text-xl p-1 bg-white/5 border border-white/5 rounded-lg select-none">
                                                    {badge.icon || '🏅'}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-600 italic">No achievements unlocked yet.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors active:scale-95 w-full shadow-lg shadow-indigo-900/40 cursor-pointer text-center"
                            >
                                Close Comparison
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MinervaDashboardPage;
