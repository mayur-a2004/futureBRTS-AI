import { motion } from "framer-motion"
import { Target, Award, Clock, Brain, Briefcase, Zap, ChevronLeft, ChevronRight, Layout, MessageSquare, Map, ArrowRight, Rocket } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>({ totalSessions: 0, activeRoadmaps: 0, completedTasks: 0, totalProjects: 0, recentSessions: [], recentProjects: [] });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('fbrts_token');
                const res = await fetch('/api/builder/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-indigo-400">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const recentSessions = stats.recentSessions || [];
    const totalPages = Math.ceil(recentSessions.length / ITEMS_PER_PAGE);
    const displayedSessions = recentSessions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const StatCard = ({ icon, value, label, color, delay }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay }}
            className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all hover:bg-white/5"
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-white/5 border border-white/5 ${color} text-white`}>
                    {icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
                <div className="text-sm text-gray-400 font-medium">{label}</div>
            </div>
        </motion.div>
    );

    return (
        <div className="text-white space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-white via-indigo-400 to-indigo-600 bg-clip-text text-transparent tracking-tighter"
                    >
                        Dashboard
                    </motion.h1>
                    <p className="text-gray-400 text-lg">Welcome back, <span className="text-white font-semibold">{user?.name || 'Futurist'}</span>. ready to build?</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/builder">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/20 px-6 h-12 rounded-xl font-bold">
                            <Zap size={18} className="mr-2" /> Quick Action
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Layout size={24} />} value={stats.totalSessions} label="Total Sessions" color="bg-indigo-500" delay={0.1} />
                <StatCard icon={<Map size={24} />} value={stats.activeRoadmaps} label="Active Roadmaps" color="bg-emerald-500" delay={0.2} />
                <StatCard icon={<Award size={24} />} value={stats.completedTasks} label="Tasks Completed" color="bg-amber-500" delay={0.3} />
                <StatCard icon={<Briefcase size={24} />} value={stats.totalProjects || 0} label="Industrial Projects" color="bg-indigo-500" delay={0.4} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Mission Control (Active Roadmap & Tasks) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Current Roadmap Widget */}
                        <div className="bg-gradient-to-br from-[#18181b] to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <Map className="text-indigo-400" size={24} />
                                </div>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">CURRENT FOCUS</span>
                            </div>

                            {stats.latestRoadmap ? (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-1 truncate" title={stats.latestRoadmap.title}>{stats.latestRoadmap.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{stats.latestRoadmap.totalSteps} Steps defined</p>

                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.latestRoadmap.progress || 5}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-6">
                                        <span>Progress</span>
                                        <span>{stats.latestRoadmap.progress || 0}%</span>
                                    </div>

                                    <Link to="/roadmap">
                                        <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">Continue Journey</Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm mb-4">No active roadmap found.</p>
                                    <Link to="/builder">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500">Create Roadmap</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Today's Tasks Widget */}
                        <div className="bg-gradient-to-br from-[#18181b] to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <Target className="text-emerald-400" size={24} />
                                </div>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">TODAY'S MISSION</span>
                            </div>

                            {stats.pendingTasks && stats.pendingTasks.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {stats.pendingTasks.map((t: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-4 h-4 rounded border border-gray-500/50" />
                                            <span className="text-sm text-gray-300 truncate">{t.title}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm mb-4">
                                    <p>All caught up!</p>
                                </div>
                            )}

                            <Link to="/today-task">
                                <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white">
                                    {stats.pendingTasks?.length > 0 ? 'View All Tasks' : 'Plan Tasks'}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Sessions List */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock size={20} className="text-indigo-400" /> Recent Activity
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-mono text-gray-500 pt-0.5">{page}/{Math.max(1, totalPages)}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {displayedSessions.length > 0 ? (
                                displayedSessions.map((session: any) => (
                                    <div
                                        onClick={() => {
                                            localStorage.setItem('fbrts_active_session', session._id);
                                            navigate('/builder');
                                        }}
                                        key={session._id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate">{session.title}</h4>
                                            <p className="text-xs text-gray-500">Last active: {new Date(session.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        {session.hasRoadmap && (
                                            <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                Roadmap
                                            </div>
                                        )}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No activity yet. Start your journey!</p>
                                    <Link to="/builder"><Button variant="link" className="text-indigo-400">Create New</Button></Link>
                                </div>
                            )}

                            {/* Recent Projects Subsection */}
                            {stats.recentProjects?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Recent Projects</p>
                                    {stats.recentProjects.map((project: any) => (
                                        <div
                                            key={project._id}
                                            onClick={() => navigate(`/projects/live/${project._id}`)}
                                            className="group flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    <Rocket size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-bold text-gray-200 truncate group-hover:text-white transition-colors">{project.title || "Experimental Project"}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5 truncate">{project.field}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${project.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                    {project.status.replace(/_/g, ' ')}
                                                </span>
                                                <ArrowRight size={14} className="text-gray-700 group-hover:text-white transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🧠 Core Intelligence Modules */}
                    <div className="grid md:grid-cols-2 gap-6 pb-4">
                        <Link to="/prediction" className="group relative bg-[#09090b] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-all" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                        <Target size={24} />
                                    </div>
                                    <span className="text-[9px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase tracking-widest">Synced</span>
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-cyan-400 transition-colors">Predictive Analysis</h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Trajectory & Industrial Research Synthesis (95% Confidence Level). AI-driven forecasting.</p>
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Initialize Matrix <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>

                        <Link to="/projects" className="group relative bg-[#09090b] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                        <Rocket size={24} />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Registry</span>
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-emerald-400 transition-colors">Collage Projects</h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Access your global project archive. Manage, view, and sync all your synthesized industrial artifacts.</p>
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Open Registry <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6 pb-4">
                        <Link to="/skill-gap" className="group relative bg-[#09090b] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.02]">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                                        <Brain size={24} />
                                    </div>
                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">Active</span>
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-indigo-400 transition-colors">Skill Gap Audit</h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Automated neural scanning and market gap identification based on profile dynamics.</p>
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Run Neural Scan <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    </div>

                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Pro Card */}
                    <div className="p-1 rounded-3xl bg-gradient-to-b from-indigo-500/20 to-purple-500/20 border border-white/10">
                        <div className="bg-black/60 backdrop-blur-md rounded-[22px] p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Zap size={24} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Unlock Pro</h3>
                            <p className="text-sm text-gray-400 mb-6">Get unlimited AI deeper generation, export to PDF, and priority support.</p>
                            <Link to="/pricing">
                                <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold rounded-xl h-10">Upgrade Now</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={16} className="text-emerald-400" /> Quick Tips</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                Update your goal weekly for better AI accuracy.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                Complete daily micro-tasks to unlock the next level.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
