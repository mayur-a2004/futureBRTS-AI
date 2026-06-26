import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, Award, Clock, FileText, CheckCircle } from 'lucide-react';

const gradeColor: Record<string, string> = {
    'A+': 'text-emerald-400', A: 'text-emerald-400', B: 'text-indigo-400',
    C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400',
};

const MinervaExamListPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    const [exams, setExams] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState('');
    const [examType, setExamType] = useState('chapter_test');
    const [totalMarks, setTotalMarks] = useState(50);

    useEffect(() => { if (token) loadData(); }, [token]);

    const loadData = async () => {
        setLoading(true);
        const [examsRes, sessionsRes] = await Promise.all([
            minervaApi.getExams(token),
            minervaApi.getSessions(token),
        ]);
        if (examsRes.success) setExams(examsRes.exams || []);
        if (sessionsRes.success) {
            const ready = (sessionsRes.sessions || []).filter((s: any) => s.completed_nodes > 0);
            setSessions(ready);
            if (ready.length > 0) setSelectedSession(ready[0]._id);
        }
        setLoading(false);
    };

    const generateExam = async () => {
        if (!selectedSession) { alert('Session select karo'); return; }
        setGenLoading(true);
        const res = await minervaApi.generateExam(token, { session_id: selectedSession, exam_type: examType, total_marks: totalMarks });
        setGenLoading(false);
        if (res.success) {
            navigate(`/future-education/exam/${res.exam._id}`);
        } else {
            alert(res.error || 'Exam generate nahi hua');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <h1 className="font-black text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 flex-1">📋 Exams & Assessments</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Generate Exam Card */}
                <div className="bg-gradient-to-br from-[#1b123a]/60 via-[#0a0718]/40 to-transparent border border-amber-500/20 rounded-3xl p-6 mb-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <h2 className="font-bold text-sm text-amber-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Award size={16} /> Generate New Exam Paper
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Active Study Course</label>
                            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/40 shadow-inner">
                                {sessions.length === 0 ? (
                                    <option value="">No completed topics yet. Please complete a topic first!</option>
                                ) : sessions.map((s: any) => (
                                    <option key={s._id} value={s._id}>{s.title} ({s.completed_nodes} chapters complete)</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Exam Format</label>
                                <select value={examType} onChange={e => setExamType(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                    <option value="topic_test">Topic Diagnostic Test</option>
                                    <option value="chapter_test">Chapter Formative Assessment</option>
                                    <option value="mid_term">Mid-Term Mock Exam</option>
                                    <option value="weekly_test">Weekly Checkpoint Quiz</option>
                                    <option value="grand_finale">Grand Finale Exam</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Total Marks Weightage</label>
                                <select value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                    {[25, 30, 50, 70, 80, 100].map(m => (
                                        <option key={m} value={m}>{m} Marks Paper</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button onClick={generateExam} disabled={genLoading || !selectedSession}
                            className="w-full bg-gradient-to-r from-amber-500 via-orange-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all text-xs shadow-lg shadow-orange-950/20 active:scale-[0.99] flex items-center justify-center gap-1.5">
                            {genLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <FileText size={14} />
                            )}
                            <span>Assemble and Generate Exam Paper</span>
                        </button>
                    </div>
                </div>

                {/* Past Exams Archive List */}
                <div>
                    <h2 className="font-bold text-xs text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <span>📜</span> Completed Exams Archive ({exams.length})
                    </h2>
                    {exams.length === 0 ? (
                        <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl p-6 shadow-md">
                            <div className="text-gray-500 text-xs italic">
                                No exam records found in your database. Generate an exam above to test your skills!
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {exams.map((exam: any) => (
                                <div key={exam._id} onClick={() => navigate(`/future-education/exam/${exam._id}`)}
                                    className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/5 hover:bg-white/5 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 duration-300 group">
                                    <div className={`text-4xl font-black w-16 text-center flex-shrink-0 ${gradeColor[exam.grade] || 'text-gray-500'}`}>
                                        {exam.status === 'submitted' ? (exam.grade || '–') : '📋'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{exam.title}</div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            {exam.subject} • {exam.board?.toUpperCase()} • {exam.total_marks} Marks
                                        </div>
                                        <div className={`text-[10px] font-bold mt-1.5 flex items-center gap-1.5
                                            ${exam.status === 'submitted' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {exam.status === 'submitted' ? (
                                                <>
                                                    <CheckCircle size={10} />
                                                    <span>Graded: {exam.percentage}% Score</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={10} className="animate-pulse" />
                                                    <span>Pending Attempt</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-500 group-hover:text-indigo-400 transition-colors text-xs">→</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Loader Fallback Helper
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaExamListPage;
