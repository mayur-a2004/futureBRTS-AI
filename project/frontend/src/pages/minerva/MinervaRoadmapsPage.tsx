import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Plus, Sparkles, Compass, X } from 'lucide-react';

const MinervaRoadmapsPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    
    // Form state for new course
    const [topic, setTopic] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [board, setBoard] = useState('cbse');
    const [language, setLanguage] = useState('hinglish');

    useEffect(() => {
        if (token) {
            loadCourses();
        }
    }, [token]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const res = await minervaApi.getSessions(token);
            if (res.success) {
                setCourses(res.sessions || []);
            }
        } catch (err) {
            console.error('Error loading courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setGenLoading(true);
        try {
            // Send the prompt to AI Tutor which triggers roadmap auto-generation with board and language alignment
            const promptMsg = `Create a study roadmap course for topic: ${topic}. Alignment Board: ${board.toUpperCase()}. Medium of Instruction: ${language}.`;
            const res = await minervaApi.sendChat(token, promptMsg);
            
            if (res.success && res.content_type === 'roadmap' && res.metadata?.session_id) {
                // Course generated successfully! Navigate to course detail page.
                navigate(`/future-education/session/${res.metadata.session_id}`);
            } else if (res.success && res.reply) {
                // If it returned a text reply instead of auto-generating roadmap directly
                alert(`AI Response: ${res.reply}\n\nPlease ask the AI Tutor directly in the Chat room to build a roadmap.`);
                navigate('/future-education');
            } else {
                alert(res.error || 'Failed to assemble roadmap course. Try typing another topic.');
            }
        } catch (err) {
            console.error('Roadmap generation error:', err);
            alert('Failed to generate roadmap course.');
        } finally {
            setGenLoading(false);
            setShowCreateModal(false);
            setTopic('');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
            
            {/* Header */}
            <header className="sticky top-14 md:top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/future-education')} className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all text-gray-400 hover:text-white flex items-center justify-center active:scale-95">
                        <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
                            <Compass size={13} className="animate-pulse" />
                        </div>
                        <span className="font-display font-black text-xs tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-indigo-200 select-none">
                            Future Education OS
                        </span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 select-none text-[9px] font-black text-gray-400 tracking-wider uppercase">
                        <span>Roadmaps</span>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-950/20 border border-indigo-400/20"
                >
                    <Plus size={13} />
                    <span>Start New Course</span>
                </button>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
                
                {/* Intro Hero Section */}
                <div className="relative overflow-hidden bg-[#0A0815]/50 border border-white/[0.05] rounded-3xl p-8 mb-8 backdrop-blur-2xl shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-cyber-dots opacity-20 pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-[9px] font-black text-indigo-400 tracking-[0.2em] uppercase mb-2.5 block">CURRICULUM ARCHITECT</span>
                        <h2 className="text-2xl font-black font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 mb-3">Structured, Board-Aligned Study Pathways</h2>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                            Start study sessions for school boards (CBSE, Maharashtra SSC, State Boards) or competitive exams (JEE, NEET, UPSC). 
                            Minerva's AI will draft a customized step-by-step pathway, complete with detailed notes, exercises, and exams.
                        </p>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-[#0B0915]/30 border border-dashed border-white/5 rounded-3xl p-8 shadow-md">
                            <Compass className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-gray-300 font-bold text-sm mb-1">No Active Topic Courses</h3>
                            <p className="text-gray-500 text-xs mb-6 max-w-md mx-auto">
                                You haven't generated any study courses yet. Ask the AI Tutor or click the button below to start a structured syllabus roadmap!
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-5 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl text-xs font-bold hover:bg-indigo-600/30 transition-all inline-flex items-center gap-1.5"
                            >
                                <Plus size={14} /> Start Your First Course
                            </button>
                        </div>
                    ) : (
                        courses.map((course: any) => (
                            <div
                                key={course._id}
                                onClick={() => navigate(`/future-education/session/${course._id}`)}
                                className="bg-[#0B0915]/60 border border-white/[0.05] hover:border-indigo-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl cursor-pointer transition-all hover:scale-[1.02] hover:shadow-indigo-500/5 duration-300 group flex flex-col justify-between h-48 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/25 transition-all">
                                            <BookOpen size={18} />
                                        </div>
                                        <span className="text-[9px] font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            {course.board ? course.board.toUpperCase() : 'GENERAL'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xs text-gray-200 mt-4 group-hover:text-white transition-colors truncate">{course.title}</h3>
                                    <p className="text-[10px] text-gray-500 mt-1 truncate">Subject: {course.subject}</p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1.5">
                                        <span className="font-medium">Course Progress</span>
                                        <span className="font-bold text-indigo-400">{course.progress_percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${course.progress_percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
                    <div className="bg-[#0b081e]/90 border border-white/10 rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                        
                        <h2 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-400" /> Start New Study Course
                        </h2>
                        <p className="text-gray-500 text-[11px] mb-4">
                            Describe what you want to learn. The AI will draft a complete board-aligned study syllabus/roadmap for you.
                        </p>

                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Course Topic / Subject</label>
                                <textarea
                                    required
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., Class 10 Physics Electricity, or UPSC History of Modern India"
                                    className="w-full h-24 bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none resize-none mb-3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Syllabus Board</label>
                                    <select
                                        value={board}
                                        onChange={e => setBoard(e.target.value)}
                                        className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                    >
                                        <option value="cbse">CBSE (NCERT)</option>
                                        <option value="icse">ICSE / ISC</option>
                                        <option value="msbshse">Maharashtra Board</option>
                                        <option value="upmsp">UP Board</option>
                                        <option value="general">General / Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Instruction Medium</label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                    >
                                        <option value="hinglish">Hinglish (Mix)</option>
                                        <option value="english">English</option>
                                        <option value="hindi">Hindi (हिंदी)</option>
                                        <option value="marathi">Marathi (मराठी)</option>
                                        <option value="gujarati">Gujarati (ગુજરાતી)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={genLoading || !topic.trim()}
                                className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {genLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles size={14} />
                                )}
                                <span>Assemble AI Study Course</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// SVG Helpers
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default MinervaRoadmapsPage;
