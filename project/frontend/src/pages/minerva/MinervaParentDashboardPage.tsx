import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, BookOpen, Star, Trophy, Users, Loader2, ArrowLeft, Heart, Calendar } from 'lucide-react';

export default function MinervaParentDashboardPage() {
    const navigate = useNavigate();
    const [studentEmail, setStudentEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [report, setReport] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentEmail.trim()) return;

        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/future-education/parent/report/${encodeURIComponent(studentEmail.trim())}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReport(data);
            } else {
                setErrorMsg(data.message || 'Student not found in our database.');
            }
        } catch (err) {
            setErrorMsg('Connection failed. Please check backend server status.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-inter">
            {/* Background beacon */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="w-full max-w-3xl z-10">
                {/* Back Button */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/future-education/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back to Student Dashboard
                    </button>
                </div>

                {!report ? (
                    /* Parent Lookup Panel */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-10 max-w-md mx-auto text-center"
                    >
                        <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
                        <h1 className="text-2xl font-black mb-2 tracking-tight">PARENT PORTAL</h1>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Enter your child's registered student email address to view their academic performance reports and tracking details.
                        </p>

                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="student@example.com"
                                    value={studentEmail}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-center text-sm font-semibold"
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-rose-500 text-xs font-semibold flex items-center justify-center gap-1.5 bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                                    <ShieldAlert className="w-4 h-4" /> {errorMsg}
                                </p>
                            )}

                            <Button type="submit" className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Retrieve Report'}
                            </Button>
                        </form>
                    </motion.div>
                ) : (
                    /* Parent Dashboard Visual Mode */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* Student Main Profile Card */}
                        <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Student Profile</span>
                                <h2 className="text-3xl font-black text-white mt-1">{report.student.name}</h2>
                                <div className="text-sm text-slate-400 mt-1">Level {report.student.level} Scholar ({report.student.xp} XP total)</div>
                            </div>
                            <Button
                                onClick={() => setReport(null)}
                                className="btn-secondary px-5 py-2.5 text-xs font-bold"
                            >
                                Look up another student
                            </Button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Average Score', value: `${report.stats.averageScore}%`, icon: <Star className="text-yellow-400" /> },
                                { label: 'Sessions Completed', value: `${report.stats.completedSessions}/${report.stats.totalSessions}`, icon: <Trophy className="text-purple-400" /> },
                                { label: 'Topics Studied', value: `${report.stats.completedNodes}/${report.stats.totalNodes}`, icon: <BookOpen className="text-indigo-400" /> },
                                { label: 'Unlocked Badges', value: report.student.badgesCount, icon: <Users className="text-emerald-400" /> },
                            ].map((stat, idx) => (
                                <div key={idx} className="glass-panel p-5 text-center flex flex-col items-center justify-center">
                                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl mb-3">{stat.icon}</div>
                                    <div className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* AI Parent Guidance Alert Box */}
                        <div className="glass-panel p-6 border-l-4 border-l-indigo-500 bg-indigo-950/10 shadow-lg">
                            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                💡 AI Guidance Tip for Parents
                            </h3>
                            <p className="text-sm text-slate-300 leading-relaxed font-normal">
                                {report.stats.parentGuidanceTip}
                            </p>
                        </div>

                        {/* Recent Activity summary */}
                        <div className="glass-panel p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 border-b border-white/5 pb-4 italic flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-400" /> Weekly Activity Overview
                            </h3>
                            <p className="text-sm text-slate-400">
                                Your child is actively engaged in <strong>{report.stats.totalSessions} Study Roadmaps</strong>, having successfully unlocked and completed <strong>{report.stats.completedNodes} learning modules</strong> so far. Keep supporting their journey to help them build their skills!
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
