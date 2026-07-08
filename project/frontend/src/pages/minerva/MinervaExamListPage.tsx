import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { BOARDS, STANDARDS, STANDARD_SUBJECTS_MAP, SUBJECTS, isSchoolStandard } from './MinervaQuizBattlePage';
import { 
    ChevronLeft, Award, Clock, FileText, CheckCircle, 
    Loader2, BookOpen, AlertCircle, Sparkles
} from 'lucide-react';

const gradeColor: Record<string, string> = {
    'A+': 'text-emerald-400', A: 'text-emerald-400', B: 'text-indigo-400',
    C: 'text-amber-400', D: 'text-orange-400', F: 'text-red-400',
};

const MinervaExamListPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    
    // Core Layout States
    const [exams, setExams] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    
    // Tab State: 'course' | 'custom'
    const [generatorTab, setGeneratorTab] = useState<'course' | 'custom'>('course');

    // ─── course (Study Session) generator states ───
    const [selectedSession, setSelectedSession] = useState('');
    const [examType, setExamType] = useState('chapter_test');
    const [totalMarks, setTotalMarks] = useState(50);

    // ─── custom generator states ───
    const [sourceType, setSourceType] = useState<'file' | 'text'>('file');
    const [pastedText, setPastedText] = useState('');
    const [inputMode, setInputMode] = useState<'syllabus' | 'old_paper'>('syllabus');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    
    const customScope = 'Full Subject';
    const [customStandard, setCustomStandard] = useState('10');
    const customStream = 'Science';
    const [customBoard, setCustomBoard] = useState('CBSE');
    const [customSubject, setCustomSubject] = useState('Science');
    const [customChapter, setCustomChapter] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [customMarks, setCustomMarks] = useState('50');
    const [customDifficulty, setCustomDifficulty] = useState('Medium');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const subjects = STANDARD_SUBJECTS_MAP[customStandard];
        if (subjects && subjects.length > 0) {
            setCustomSubject(subjects[0]);
        }
    }, [customStandard]);

    // ─── Custom Exam Viewer state ───
    const [loadedCustomExam, setLoadedCustomExam] = useState<any | null>(null);
    const [customExamId, setCustomExamId] = useState('');
    const [customEditMode, setCustomEditMode] = useState(false);

    useEffect(() => { 
        if (token) loadData(); 
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch Minerva sessions and exams
            const [examsRes, sessionsRes] = await Promise.all([
                minervaApi.getExams(token),
                minervaApi.getSessions(token),
            ]);

            // Fetch Custom generated exams
            let customExamsList: any[] = [];
            try {
                const customRes = await fetch('/api/exam/list');
                const customData = await customRes.json();
                if (customData.status === 'success') {
                    customExamsList = (customData.data.exams || []).map((e: any) => ({
                        ...e,
                        isCustom: true,
                        title: e.generatedPaper?.title || `AI Predicted Paper: ${e.subject}`,
                        status: 'submitted',
                        percentage: 100,
                        grade: 'A+' // Default grade display for completed predicted papers
                    }));
                }
            } catch (e) {
                console.error("Failed to load custom exams", e);
            }

            const minervaExams = examsRes.success ? (examsRes.exams || []) : [];
            if (sessionsRes.success) {
                const ready = (sessionsRes.sessions || []).filter((s: any) => s.completed_nodes > 0);
                setSessions(ready);
                if (ready.length > 0) setSelectedSession(ready[0]._id);
            }

            // Merge and sort by date
            const combined = [...minervaExams, ...customExamsList].sort((a: any, b: any) => {
                return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
            });
            setExams(combined);
        } catch (err) {
            console.error("Error loading exams data", err);
        } finally {
            setLoading(false);
        }
    };

    // Generate course-based exam
    const handleGenerateCourseExam = async () => {
        if (!selectedSession) { alert('Pehle active topic select karo!'); return; }
        setGenLoading(true);
        const res = await minervaApi.generateExam(token, { 
            session_id: selectedSession, 
            exam_type: examType, 
            total_marks: totalMarks 
        });
        setGenLoading(false);
        if (res.success) {
            navigate(`/future-education/exam/${res.exam._id}`);
        } else {
            alert(res.error || 'Exam generate nahi hua');
        }
    };

    // Generate Custom AI Material/Old Paper exam
    const handleGenerateCustomExam = async () => {
        if (sourceType === 'file' && !pdfFile) {
            setErrorMsg('Please upload the study material PDF or paper photo.');
            return;
        }
        if (sourceType === 'text' && (!pastedText || pastedText.trim().length < 10)) {
            setErrorMsg('Please paste the syllabus text or questions.');
            return;
        }
        if (!customSubject || (isSchoolStandard(customStandard) && !customBoard) || !customStandard || !customMarks) {
            setErrorMsg('Please fill all required fields.');
            return;
        }

        setGenLoading(true);
        setErrorMsg('');

        const formData = new FormData();
        if (sourceType === 'file' && pdfFile) {
            formData.append('pdfFile', pdfFile);
        }
        if (referenceFile) {
            formData.append('referenceFile', referenceFile);
        }
        formData.append('sourceType', sourceType);
        formData.append('pastedText', pastedText);
        formData.append('inputMode', inputMode);
        formData.append('examScope', inputMode === 'old_paper' ? 'Old Paper Solution' : customScope);
        formData.append('standard', customStandard);
        if (customStandard === '11th' || customStandard === '12th') {
            formData.append('stream', customStream);
        }
        formData.append('board', isSchoolStandard(customStandard) ? customBoard : 'N/A');
        formData.append('subject', customSubject);
        formData.append('chapter', customChapter);
        formData.append('topic', customTopic);
        formData.append('marks', customMarks);
        formData.append('difficulty', customDifficulty);

        try {
            const res = await fetch('/api/exam/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            const data = await res.json();
            if (data.status === 'success') {
                const paper = data.data.exam.generatedPaper;
                const id = data.data.exam._id;
                setCustomExamId(id);
                if (paper) {
                    if (!paper.board) paper.board = customBoard;
                    if (!paper.examScope) paper.examScope = inputMode === 'old_paper' ? 'Old Paper Solution' : customScope;
                    if (!paper.chapter) paper.chapter = customChapter;
                    if (!paper.topic) paper.topic = customTopic;
                    if (!paper.difficulty) paper.difficulty = customDifficulty;
                    if (!paper.stream) paper.stream = (customStandard === '11th' || customStandard === '12th') ? customStream : '';
                }
                setLoadedCustomExam(paper);
                loadData(); // Refresh list in background
            } else {
                setErrorMsg(data.message || 'Failed to generate paper.');
            }
        } catch (err: any) {
            setErrorMsg('Network error. Check backend connection.');
        } finally {
            setGenLoading(false);
        }
    };

    const downloadQuestionPaper = () => {
        if (!customExamId) return;
        window.open(`/api/exam/${customExamId}/pdf?mode=question`, '_blank');
    };

    const downloadAnswerKey = () => {
        if (!customExamId) return;
        window.open(`/api/exam/${customExamId}/pdf?mode=answer`, '_blank');
    };

    const downloadBothPDFs = () => {
        downloadQuestionPaper();
        setTimeout(() => downloadAnswerKey(), 500);
    };

    const handleSaveEdits = async () => {
        if (!customExamId || !loadedCustomExam) return;
        setGenLoading(true);
        try {
            const res = await fetch(`/api/exam/${customExamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ generatedPaper: loadedCustomExam })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setCustomEditMode(false);
                loadData(); // Refresh the list
            } else {
                alert(data.message || 'Failed to save edits.');
            }
        } catch (err) {
            console.error('Failed to save exam edits', err);
            alert('Failed to save edits due to network error.');
        } finally {
            setGenLoading(false);
        }
    };

    const handlePrintPaper = () => {
        const printContent = document.getElementById('printable-exam')?.innerHTML;
        if (!printContent) return;
        
        const printWindow = window.open('', '', 'width=900,height=800');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Question Paper</title>
                        <style>
                            body {
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                                color: #000;
                                margin: 40px;
                                line-height: 1.5;
                            }
                            h2 { text-align: center; font-size: 22px; margin-bottom: 5px; text-transform: uppercase; }
                            .meta-table {
                                width: 100%;
                                border: 2px solid #000;
                                border-collapse: collapse;
                                margin: 15px 0 25px 0;
                                font-size: 12px;
                            }
                            .meta-table td {
                                border: 1px solid #000;
                                padding: 8px;
                            }
                            .section-header {
                                font-size: 15px;
                                font-weight: bold;
                                text-decoration: underline;
                                margin-top: 25px;
                                margin-bottom: 15px;
                            }
                            .question-block {
                                margin-bottom: 18px;
                                page-break-inside: avoid;
                            }
                            .question-text {
                                font-weight: bold;
                                font-size: 13px;
                                display: flex;
                                justify-content: space-between;
                            }
                            .mcq-options {
                                list-style-type: upper-alpha;
                                margin-left: 25px;
                                margin-top: 5px;
                                font-size: 12px;
                            }
                            .mcq-options li { margin-bottom: 3px; }
                            .solution-box {
                                background-color: #f8fafc;
                                border: 1px solid #e2e8f0;
                                padding: 10px;
                                border-radius: 8px;
                                margin-top: 8px;
                                font-size: 12px;
                            }
                            @media print {
                                body { margin: 20px; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030209] flex items-center justify-center font-inter text-white">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030209] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f0b29]/40 via-black to-black text-white font-inter relative pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => {
                        if (loadedCustomExam) {
                            setLoadedCustomExam(null);
                        } else {
                            navigate('/future-education');
                        }
                    }} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                        <ChevronLeft size={16} />
                    </button>
                    <h1 className="font-black text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 flex-1">
                        {loadedCustomExam ? '📝 Custom Question Paper & Solution' : '📋 Exams & Assessments'}
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6">
                
                {/* ═══ VIEW 1: CUSTOM EXAM VIEWER ═══════════════════════════ */}
                {loadedCustomExam ? (
                    <div className="space-y-6">
                        <div className="relative">
                            {customEditMode && <div className="absolute -top-10 right-0 text-sm text-blue-400 font-bold bg-blue-900/20 p-2 rounded">Edit Mode Active</div>}
                            <div id="printable-exam" className="bg-white text-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl mb-8 relative pb-20 border border-slate-200">
                                
                                <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                                    {customEditMode ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">Paper Title:</span>
                                                <input type="text" className="text-2xl font-bold text-center w-full bg-slate-100 border-2 border-blue-400 rounded p-1 outline-none text-slate-900" value={loadedCustomExam.title || 'Exam Paper'} onChange={e => setLoadedCustomExam({...loadedCustomExam, title: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-left border-2 border-blue-400 p-4 rounded bg-slate-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">Board:</span>
                                                    <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900 text-xs" value={loadedCustomExam.board || ''} onChange={e => setLoadedCustomExam({...loadedCustomExam, board: e.target.value})} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">Subject:</span>
                                                    <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900 text-xs" value={loadedCustomExam.subject || ''} onChange={e => setLoadedCustomExam({...loadedCustomExam, subject: e.target.value})} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">Standard:</span>
                                                    <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900 text-xs" value={loadedCustomExam.standard || ''} onChange={e => setLoadedCustomExam({...loadedCustomExam, standard: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl font-black mb-4 text-slate-900">{loadedCustomExam.title || 'Exam Paper'}</h2>
                                            <div className="border-2 border-slate-800 p-4 rounded bg-slate-50 text-slate-850 text-xs">
                                                <div className="grid grid-cols-2 gap-3 text-left">
                                                    <div><strong>Board:</strong> {loadedCustomExam.board || customBoard}</div>
                                                    <div><strong>Subject:</strong> {loadedCustomExam.subject}</div>
                                                    <div><strong>Standard:</strong> {loadedCustomExam.standard} {loadedCustomExam.stream ? `(${loadedCustomExam.stream})` : ''}</div>
                                                    <div><strong>Difficulty:</strong> {loadedCustomExam.difficulty || 'Medium'}</div>
                                                    <div className="col-span-2"><strong>Scope:</strong> {loadedCustomExam.examScope || 'AI Predicted'}</div>
                                                    <div><strong>Time Allowed:</strong> 3 Hours</div>
                                                    <div><strong>Total Marks:</strong> {loadedCustomExam.marks} Marks</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {loadedCustomExam.sections?.map((sec: any, idx: number) => (
                                    <div key={idx} className="mb-8 text-left">
                                        {customEditMode ? (
                                            <input type="text" className="text-lg font-bold underline mb-4 w-full bg-slate-100 border-2 border-blue-400 rounded p-1 outline-none text-slate-900" value={sec.sectionName} onChange={e => {
                                                const newSections = [...loadedCustomExam.sections];
                                                newSections[idx].sectionName = e.target.value;
                                                setLoadedCustomExam({...loadedCustomExam, sections: newSections});
                                            }} />
                                        ) : (
                                            <h3 className="text-lg font-bold underline mb-4 text-slate-900">{sec.sectionName}</h3>
                                        )}
                                        
                                        {sec.questions?.map((q: any, qIdx: number) => (
                                            <div key={qIdx} className="mb-6 border-b border-slate-100 pb-4">
                                                {customEditMode ? (
                                                    <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-blue-300">
                                                        <div className="flex gap-2">
                                                            <span className="font-bold text-slate-900">Q{qIdx + 1}.</span>
                                                            <textarea className="flex-1 p-2 bg-white border border-blue-300 rounded outline-none text-slate-900 text-xs" rows={2} value={q.question} onChange={e => {
                                                                const newSections = [...loadedCustomExam.sections];
                                                                newSections[idx].questions[qIdx].question = e.target.value;
                                                                setLoadedCustomExam({...loadedCustomExam, sections: newSections});
                                                            }} />
                                                            <input type="number" className="w-12 p-1 bg-white border border-blue-300 rounded text-center text-slate-900 text-xs h-8" value={q.marks} onChange={e => {
                                                                const newSections = [...loadedCustomExam.sections];
                                                                newSections[idx].questions[qIdx].marks = Number(e.target.value);
                                                                setLoadedCustomExam({...loadedCustomExam, sections: newSections});
                                                            }} />
                                                        </div>
                                                        <textarea className="w-full p-2 bg-white border border-blue-300 rounded outline-none text-slate-900 text-xs" rows={2} value={q.answer} onChange={e => {
                                                            const newSections = [...loadedCustomExam.sections];
                                                            newSections[idx].questions[qIdx].answer = e.target.value;
                                                            setLoadedCustomExam({...loadedCustomExam, sections: newSections});
                                                        }} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="font-semibold text-slate-900 text-sm flex justify-between gap-4">
                                                            <span>Q{qIdx + 1}. {q.question}</span>
                                                            <span className="text-slate-500 font-normal text-xs shrink-0">[{q.marks} Marks]</span>
                                                        </p>
                                                        {q.options && q.options.length > 0 && (
                                                            <ol type="A" className="list-[upper-alpha] ml-8 mt-2 space-y-1 text-slate-800 text-xs">
                                                                {q.options.map((opt: string, oIdx: number) => (
                                                                    <li key={oIdx}>{opt}</li>
                                                                ))}
                                                            </ol>
                                                        )}
                                                        {q.answer && (
                                                            <div className="bg-emerald-50 border border-emerald-200/60 p-3.5 rounded-2xl mt-3 text-xs text-slate-800">
                                                                <strong className="text-emerald-700 block mb-1">Answer / solution:</strong> 
                                                                <p className="leading-relaxed whitespace-pre-line">{q.answer}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <button 
                                onClick={customEditMode ? handleSaveEdits : () => setCustomEditMode(true)}
                                disabled={genLoading}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
                            >
                                {genLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>{customEditMode ? '✓ Save Edits' : '✍️ Edit Paper'}</span>
                            </button>
                            <button 
                                onClick={downloadBothPDFs} 
                                disabled={customEditMode}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
                            >
                                <FileText size={14} /> Download PDF Pack
                            </button>
                            <button 
                                onClick={handlePrintPaper} 
                                disabled={customEditMode}
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
                            >
                                <span>🖨️ Print Paper</span>
                            </button>
                            <button onClick={() => { setLoadedCustomExam(null); setCustomEditMode(false); }} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white border border-white/5 rounded-xl text-xs transition-colors">
                                Back to Exams
                            </button>
                        </div>
                    </div>
                ) : (
                    
                    // ─── VIEW 2: EXAMS LIST & GENERATOR ────────────────────────
                    <div className="space-y-8">
                        
                        {/* Selector Tabs */}
                        <div className="bg-white/[0.02] border border-white/5 p-1 rounded-2xl flex gap-1">
                            <button 
                                onClick={() => setGeneratorTab('course')}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${generatorTab === 'course' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <BookOpen size={14} /> Course Study Exams
                            </button>
                            <button 
                                onClick={() => setGeneratorTab('custom')}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${generatorTab === 'custom' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Sparkles size={14} /> Smart AI Paper Generator
                            </button>
                        </div>

                        {/* TAB A: COURSE EXAMS GENERATOR */}
                        {generatorTab === 'course' && (
                            <div className="bg-gradient-to-br from-[#1b123a]/60 via-[#0a0718]/40 to-transparent border border-indigo-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                <h2 className="font-bold text-sm text-indigo-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Award size={16} /> Course Chapters Exam Setup
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Active Study Course</label>
                                        <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/40">
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
                                    <button onClick={handleGenerateCourseExam} disabled={genLoading || !selectedSession}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.99]">
                                        {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText size={14} />}
                                        <span>Assemble and Generate Exam Paper</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB B: CUSTOM SMART AI PAPER GENERATOR */}
                        {generatorTab === 'custom' && (
                            <div className="bg-gradient-to-br from-[#1b123a]/60 via-[#0a0718]/40 to-transparent border border-purple-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                                <h2 className="font-bold text-sm text-purple-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <Sparkles size={16} /> Past Papers, Solvers & Predictions
                                </h2>
                                
                                {errorMsg && <div className="text-red-400 bg-red-900/20 p-3.5 rounded-2xl mb-4 border border-red-500/20 text-xs flex items-center gap-2"><AlertCircle size={14} />{errorMsg}</div>}

                                <div className="space-y-4">
                                    {/* Mode selector: Syllabus vs Old Paper */}
                                    <div className="grid grid-cols-2 gap-3 border-b border-white/5 pb-4">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Generation Goal</label>
                                            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl">
                                                <button type="button" onClick={() => setInputMode('syllabus')}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${inputMode === 'syllabus' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                                    📚 Syllabus
                                                </button>
                                                <button type="button" onClick={() => setInputMode('old_paper')}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${inputMode === 'old_paper' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                                    📝 Solve Paper
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Input Source</label>
                                            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl">
                                                <button type="button" onClick={() => setSourceType('file')}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${sourceType === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                                    📁 Upload
                                                </button>
                                                <button type="button" onClick={() => setSourceType('text')}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${sourceType === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                                    ✍️ Paste Text
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject, Board, Standard */}
                                    <div className={`grid grid-cols-1 md:${isSchoolStandard(customStandard) ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Standard*</label>
                                            <select value={customStandard} onChange={e => setCustomStandard(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                                {STANDARDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </div>
                                        {isSchoolStandard(customStandard) && (
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Board*</label>
                                                <select value={customBoard} onChange={e => setCustomBoard(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                                    {BOARDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Subject*</label>
                                            <select value={customSubject} onChange={e => setCustomSubject(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                                {(STANDARD_SUBJECTS_MAP[customStandard] || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Chapter/Topic (Syllabus mode only) */}
                                    {inputMode === 'syllabus' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Chapter (Optional)</label>
                                                <input type="text" value={customChapter} onChange={e => setCustomChapter(e.target.value)} placeholder="e.g. Chapter 4: Carbon"
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Topic (Optional)</label>
                                                <input type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="e.g. Covalent Bonding"
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Marks & Difficulty */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Marks*</label>
                                            <select value={customMarks} onChange={e => setCustomMarks(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                                <option value="10">10 Marks</option>
                                                <option value="20">20 Marks</option>
                                                <option value="25">25 Marks</option>
                                                <option value="50">50 Marks</option>
                                                <option value="80">80 Marks</option>
                                                <option value="100">100 Marks</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Difficulty</label>
                                            <select value={customDifficulty} onChange={e => setCustomDifficulty(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Source Input details */}
                                    {sourceType === 'file' ? (
                                        <div className="p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl">
                                            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1.5 block">
                                                {inputMode === 'old_paper' ? 'Upload Old Question Paper File (PDF/Photo)*' : 'Upload Syllabus File (PDF)*'}
                                            </label>
                                            <input type="file" accept="application/pdf, image/png, image/jpeg, image/jpg" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                                                className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-655 file:text-white hover:file:bg-indigo-600" />
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl">
                                            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1.5 block">
                                                {inputMode === 'old_paper' ? 'Paste Old Exam Paper Content*' : 'Paste Study Material / Syllabus Text*'}
                                            </label>
                                            <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} rows={6}
                                                placeholder={inputMode === 'old_paper' ? 'Paste old questions here...' : 'Paste textbook topics here...'}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500/40" />
                                        </div>
                                    )}

                                    {/* Reference Exam File (Optional) */}
                                    <div className="p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl">
                                        <label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1.5 block">
                                            Upload Reference Paper Format (PDF/Photo) <span className="text-slate-500 font-normal">[Optional]</span>
                                        </label>
                                        <input type="file" accept="application/pdf, image/*" onChange={e => setReferenceFile(e.target.files?.[0] || null)}
                                            className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-655 file:text-white hover:file:bg-purple-600" />
                                    </div>

                                    <button onClick={handleGenerateCustomExam} disabled={genLoading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.99] mt-2">
                                        {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={14} />}
                                        <span>Generate Smart Exam Paper</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed Exams Archive */}
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
                                    {exams.map((exam: any) => {
                                        const handleClick = () => {
                                            if (exam.isCustom) {
                                                setCustomExamId(exam._id);
                                                setLoadedCustomExam(exam.generatedPaper);
                                            } else {
                                                navigate(`/future-education/exam/${exam._id}`);
                                            }
                                        };

                                        return (
                                            <div key={exam._id} onClick={handleClick}
                                                className="flex items-center gap-4 p-4 bg-white/[0.01] border border-white/5 hover:bg-white/5 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 duration-300 group">
                                                <div className={`text-2.5xl font-black w-16 text-center flex-shrink-0 ${gradeColor[exam.grade] || 'text-gray-500'}`}>
                                                    {exam.isCustom ? '📋' : (exam.status === 'submitted' ? (exam.grade || '–') : '📋')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors truncate">{exam.title}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">
                                                        {exam.subject} • {exam.board?.toUpperCase()} • {exam.total_marks || exam.marks} Marks
                                                        {exam.isCustom && <span className="ml-2 bg-purple-950/60 border border-purple-800 text-purple-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">AI Prediction</span>}
                                                    </div>
                                                    <div className={`text-[10px] font-bold mt-1.5 flex items-center gap-1.5
                                                        ${(exam.status === 'submitted' || exam.isCustom) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {(exam.status === 'submitted' || exam.isCustom) ? (
                                                            <>
                                                                <CheckCircle size={10} />
                                                                <span>Graded: {exam.percentage || 100}% Score</span>
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
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default MinervaExamListPage;
