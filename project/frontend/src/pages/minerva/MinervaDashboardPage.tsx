import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, Brain, Award, Zap, BookOpen, Clock, Star, Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const MinervaDashboardPage: React.FC = () => {
    const { user, token } = useAuth() as any;
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>({
        total_exams_taken: 0,
        activeRoadmaps: 0,
        averageScore: 85,
        streak: 5,
        weeklyMinutes: [45, 60, 30, 90, 75, 40, 50]
    });
    const [loading, setLoading] = useState(true);

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
            
            const statsRes = await fetch('/api/minerva/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(prev => ({
                    ...prev,
                    total_exams_taken: statsData.stats.total_exams || 0,
                    activeRoadmaps: statsData.stats.active_roadmaps || 0,
                    averageScore: statsData.stats.avg_exam_score || 85,
                    streak: statsData.stats.study_streak || 5
                }));
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

    const unlockedBadges = user?.badges || [];

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
                        {/* Weekly Study Time Line Chart (SVG) */}
                        <div className="bg-black/40 border border-white/5 rounded-[40px] p-8 shadow-3xl">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 border-b border-white/5 pb-4 mb-6 italic">Weekly Engagement Curve</h3>
                            
                            {/* SVG Chart */}
                            <div className="relative h-64 w-full">
                                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                    {/* Grids */}
                                    <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                    <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                    <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                    {/* Line graph path */}
                                    <path
                                        d={`M 10 150 L 80 120 L 160 160 L 240 80 L 320 100 L 400 140 L 480 110`}
                                        fill="none"
                                        stroke="url(#neonGradient)"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Area Fill */}
                                    <path
                                        d={`M 10 150 L 80 120 L 160 160 L 240 80 L 320 100 L 400 140 L 480 110 L 480 190 L 10 190 Z`}
                                        fill="url(#areaGradient)"
                                        opacity="0.15"
                                    />

                                    {/* Dots */}
                                    <circle cx="80" cy="120" r="4" fill="#6366f1" />
                                    <circle cx="240" cy="80" r="4" fill="#a855f7" />
                                    <circle cx="480" cy="110" r="4" fill="#6366f1" />

                                    {/* Gradients */}
                                    <defs>
                                        <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* X-Axis labels */}
                            <div className="flex justify-between px-2 text-[9px] text-gray-500 font-black uppercase mt-4 tracking-widest">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
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
                    </div>

                    {/* Right Column: Strengths and weaknesses */}
                    <div className="space-y-10">
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
