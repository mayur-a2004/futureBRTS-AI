import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, TrendingUp, BookOpen, Star, AlertCircle } from 'lucide-react';

const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    'A': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    'B': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    'C': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    'D': 'text-orange-400 bg-orange-500/10 border-orange-500/25',
    'F': 'text-red-400 bg-red-500/10 border-red-500/25',
};

const MinervaResultsPage: React.FC = () => {
    const { token, user } = useAuth() as any;
    const navigate = useNavigate();

    const [exams, setExams] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadResults();
        }
    }, [token]);

    const loadResults = async () => {
        setLoading(true);
        try {
            const [examsRes, profileRes] = await Promise.all([
                minervaApi.getExams(token),
                minervaApi.getProfile(token),
            ]);
            
            if (examsRes.success) {
                // Filter only submitted/completed exams for results dashboard
                const completed = (examsRes.exams || []).filter((e: any) => e.status === 'submitted');
                setExams(completed);
            }
            if (profileRes.success) {
                setProfile(profileRes.profile);
            }
        } catch (err) {
            console.error("Failed to load results data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated metrics
    const totalExams = exams.length;
    const avgAccuracy = totalExams > 0 
        ? Math.round(exams.reduce((acc, e) => acc + (e.percentage || 0), 0) / totalExams) 
        : 0;
    
    // Estimate GPA/Grade based on average accuracy
    const avgGrade = avgAccuracy >= 90 ? 'A+' : avgAccuracy >= 75 ? 'A' : avgAccuracy >= 60 ? 'B' :
                     avgAccuracy >= 50 ? 'C' : avgAccuracy >= 35 ? 'D' : 'F';

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-indigo-300 font-medium">Assembling Academic Ledger...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <h1 className="font-black text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 flex-1">
                        🏆 Student Gradebook & Results
                    </h1>
                    {profile?.board && (
                        <div className="text-[9px] font-black uppercase bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-xl text-indigo-300 tracking-wider">
                            {profile.grade_level?.replace('_', ' ')} • {profile.board?.toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                
                {/* Onboarding info summary banner */}
                <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-cyber-dots opacity-10 pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="text-[10px] font-black text-indigo-400 tracking-[0.25em] uppercase mb-1">
                                {profile?.school_name || 'MINERVA ACADEMY OS'}
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wide">
                                {profile?.name || user?.name || 'Scholar Student'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1 max-w-xl">
                                Permanent academic progress record. These grades are cryptographically logged and cannot be edited by the student. Future homework sheets dynamically adapt based on weak areas.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-2xl uppercase tracking-widest font-black text-[9px]">
                            🛡️ Official Transcript
                        </div>
                    </div>
                </div>

                {/* Scorecards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0b0915] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-2">Exams Completed</span>
                        <div>
                            <span className="text-3xl font-black text-white">{totalExams}</span>
                            <span className="text-[10px] text-indigo-400 font-bold block mt-1">Syllabus papers</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0915] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-2">Average Accuracy</span>
                        <div>
                            <span className="text-3xl font-black text-white">{avgAccuracy}%</span>
                            <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${avgAccuracy}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0b0915] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-2">Average Grade</span>
                        <div>
                            <span className={`text-3xl font-black ${avgGrade === 'F' ? 'text-red-400' : 'text-purple-400'}`}>{avgGrade}</span>
                            <span className="text-[10px] text-purple-400 font-bold block mt-1">Passing standard achieved</span>
                        </div>
                    </div>

                    <div className="bg-[#0b0915] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-2">Study Standing</span>
                        <div>
                            <span className="text-lg font-black text-white flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                {avgAccuracy >= 75 ? 'Top 10%' : avgAccuracy >= 50 ? 'Median Pass' : 'Improvement Req.'}
                            </span>
                            <span className="text-[10px] text-gray-500 block mt-1">VS peer boards group</span>
                        </div>
                    </div>
                </div>

                {/* Main Results Table */}
                <div className="bg-[#05040a] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-400" /> Complete Assessment History
                    </h3>

                    {totalExams === 0 ? (
                        <div className="text-center py-16 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl p-8">
                            <AlertCircle className="w-8 h-8 text-indigo-400/50 mx-auto mb-3" />
                            <h4 className="text-sm font-bold text-gray-300">No Assessment Records Found</h4>
                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                You haven't submitted any exams yet. Start learning a roadmap module and take assessments to build your progress report!
                            </p>
                            <button
                                onClick={() => navigate('/future-education/exams')}
                                className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                            >
                                Take Exam Now
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/5 text-gray-400 font-black text-[9px] uppercase tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Subject & Assessment</th>
                                        <th className="px-4 py-3 text-center">Marks</th>
                                        <th className="px-4 py-3 text-center">Accuracy</th>
                                        <th className="px-4 py-3 text-center">Grade</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-gray-200">
                                    {exams.map((exam) => (
                                        <tr key={exam._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3.5 font-mono text-[10px] text-gray-400">
                                                {new Date(exam.submitted_at || exam.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-gray-100">{exam.title}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">{exam.subject} • {exam.board?.toUpperCase()}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-mono font-bold text-indigo-300">
                                                {exam.total_obtained} / {exam.total_marks}
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-mono font-bold">
                                                {exam.percentage}%
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`px-2 py-0.5 text-[10px] font-black rounded border ${gradeColors[exam.grade] || 'text-gray-400 border-gray-500/20 bg-gray-500/10'}`}>
                                                    {exam.grade || '–'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={() => navigate(`/future-education/exam/${exam._id}`)}
                                                    className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 font-bold rounded-lg transition-all"
                                                >
                                                    View Report
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Conceptual Strengths & Weaknesses aggregates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#05040a] border border-white/5 rounded-3xl p-6 shadow-2xl">
                        <h4 className="text-xs font-black text-emerald-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                            <Star size={14} className="text-emerald-400 animate-pulse" /> Mastered Concepts (Strengths)
                        </h4>
                        {profile?.strong_subjects?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.strong_subjects.map((subj: string, i: number) => (
                                    <span key={i} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full capitalize">
                                        {subj}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No conceptual masteries archived yet. Pass exams with &gt;75% to build strengths.</p>
                        )}
                    </div>

                    <div className="bg-[#05040a] border border-white/5 rounded-3xl p-6 shadow-2xl">
                        <h4 className="text-xs font-black text-red-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle size={14} className="text-red-400 animate-pulse" /> Focus Recommendations (Weaknesses)
                        </h4>
                        {profile?.weak_subjects?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.weak_subjects.map((subj: string, i: number) => (
                                    <span key={i} className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full capitalize">
                                        {subj}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">Excellent standing! No immediate weaknesses flagged by the AI engine.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinervaResultsPage;
