import React, { useState, useEffect } from 'react';
import { BOARDS, STANDARDS, STANDARD_SUBJECTS_MAP, SUBJECTS, isSchoolStandard } from './minerva/MinervaQuizBattlePage';

const ExamGeneratorPage: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    
    // States
    const [sourceType, setSourceType] = useState<'file' | 'text'>('file');
    const [pastedText, setPastedText] = useState('');
    const [inputMode, setInputMode] = useState<'syllabus' | 'old_paper'>('syllabus');

    const [examScope, setExamScope] = useState('Full Subject');
    const [standard, setStandard] = useState('10');
    const [stream, setStream] = useState('Science'); // New state for 11th/12th
    const [board, setBoard] = useState('CBSE');
    const [subject, setSubject] = useState('Mathematics');
    const [chapter, setChapter] = useState('');
    const [topic, setTopic] = useState('');
    const [marks, setMarks] = useState('50');
    const [difficulty, setDifficulty] = useState('Medium');
    const [language, setLanguage] = useState('Auto-Detect');
    const [customizeBlueprint, setCustomizeBlueprint] = useState(false);
    const [blueprint, setBlueprint] = useState({
        mcq: 10,
        true_false: 5,
        blank: 5,
        q1: 10,
        q2: 5,
        q3: 5,
        q4: 0,
        q5: 1
    });

    useEffect(() => {
        const totalMarks = Number(marks) || 50;
        if (totalMarks === 10) {
            setBlueprint({ mcq: 5, true_false: 0, blank: 0, q1: 5, q2: 0, q3: 0, q4: 0, q5: 0 });
        } else if (totalMarks === 20) {
            setBlueprint({ mcq: 5, true_false: 3, blank: 2, q1: 5, q2: 2, q3: 0, q4: 0, q5: 0 });
        } else if (totalMarks === 25) {
            setBlueprint({ mcq: 5, true_false: 5, blank: 5, q1: 5, q2: 2, q3: 1, q4: 0, q5: 0 });
        } else if (totalMarks === 50) {
            setBlueprint({ mcq: 10, true_false: 5, blank: 5, q1: 10, q2: 5, q3: 5, q4: 0, q5: 1 });
        } else if (totalMarks === 80) {
            setBlueprint({ mcq: 15, true_false: 5, blank: 5, q1: 15, q2: 10, q3: 5, q4: 0, q5: 3 });
        } else if (totalMarks === 100) {
            setBlueprint({ mcq: 20, true_false: 10, blank: 10, q1: 20, q2: 10, q3: 10, q4: 0, q5: 2 });
        }
    }, [marks]);

    const blueprintSum = 
        (blueprint.mcq * 1) + 
        (blueprint.true_false * 1) + 
        (blueprint.blank * 1) + 
        (blueprint.q1 * 1) + 
        (blueprint.q2 * 2) + 
        (blueprint.q3 * 3) + 
        (blueprint.q4 * 4) + 
        (blueprint.q5 * 5);

    useEffect(() => {
        const subjects = STANDARD_SUBJECTS_MAP[standard];
        if (subjects && subjects.length > 0) {
            setSubject(subjects[0]);
        }
    }, [standard]);
    
    const [loading, setLoading] = useState(false);
    const [generatedExam, setGeneratedExam] = useState<any>(null);
    const [examId, setExamId] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [editMode, setEditMode] = useState(false); // Toggle for editing headers

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
        }
    };

    const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReferenceFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (sourceType === 'file' && !pdfFile) {
            setErrorMsg('Please upload the Study Material PDF or Question Paper Image.');
            return;
        }
        if (sourceType === 'text' && (!pastedText || pastedText.trim().length < 10)) {
            setErrorMsg('Please paste the Old Question Paper text.');
            return;
        }
        if (!subject || !board || !standard || !marks) {
            setErrorMsg('Please fill all required fields.');
            return;
        }
        if (customizeBlueprint && blueprintSum !== Number(marks)) {
            setErrorMsg(`Blueprint marks total (${blueprintSum} Marks) does not match Target Marks (${marks} Marks). Please adjust the blueprint question counts to match.`);
            return;
        }

        if (inputMode === 'syllabus') {
            if (examScope === 'Chapter Wise' && !chapter) {
                setErrorMsg('Please enter the Chapter name.');
                return;
            }
            if (examScope === 'Specific Topic' && !topic) {
                setErrorMsg('Please enter the Topic name.');
                return;
            }
        }

        setLoading(true);
        setErrorMsg('');
        setProgress(0);
        setProgressText('Step 1/5: Uploading and parsing textbook PDF...');

        let currentProgress = 0;
        const interval = setInterval(() => {
            if (currentProgress < 25) {
                currentProgress += 1.5;
                setProgressText('Step 1/5: Uploading and parsing textbook PDF...');
            } else if (currentProgress < 45) {
                currentProgress += 0.8;
                setProgressText('Step 2/5: Scanning for target chapters/topics...');
            } else if (currentProgress < 65) {
                currentProgress += 0.4;
                setProgressText('Step 3/5: Sending optimized context to AI Engine...');
            } else if (currentProgress < 85) {
                currentProgress += 0.2;
                setProgressText('Step 4/5: Generating exam paper questions and detailed answer key...');
            } else if (currentProgress < 98) {
                currentProgress += 0.1;
                setProgressText('Step 5/5: Formatting exam layout & checking marks distribution...');
            }
            setProgress(currentProgress);
        }, 200);

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
        formData.append('examScope', inputMode === 'old_paper' ? 'Old Paper Solution' : examScope);
        formData.append('standard', standard);
        if (standard === '11' || standard === '12') {
            formData.append('stream', stream);
        }
        formData.append('board', isSchoolStandard(standard) ? board : 'N/A');
        formData.append('subject', subject);
        formData.append('chapter', chapter);
        formData.append('topic', topic);
        formData.append('marks', marks);
        formData.append('difficulty', difficulty);
        formData.append('language', language);
        if (customizeBlueprint) {
            formData.append('blueprint', JSON.stringify(blueprint));
        }

        try {
            const token = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || '';
            const res = await fetch('/api/exam/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            const data = await res.json();
            clearInterval(interval);
            if (data.status === 'success') {
                setProgress(100);
                setProgressText('Completed successfully!');
                const paper = data.data.exam.generatedPaper;
                const id = data.data.exam._id;
                setExamId(id);
                if (paper) {
                    if (!paper.board) paper.board = board;
                    if (!paper.examScope) paper.examScope = examScope;
                    if (!paper.chapter) paper.chapter = chapter;
                    if (!paper.topic) paper.topic = topic;
                    if (!paper.difficulty) paper.difficulty = difficulty;
                    if (!paper.stream) paper.stream = (standard === '11' || standard === '12') ? stream : '';
                }
                setGeneratedExam(paper);
            } else {
                setErrorMsg(data.message || 'Failed to generate exam.');
            }
        } catch (err: any) {
            clearInterval(interval);
            setErrorMsg('Network error. Ensure the backend is running.');
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    const downloadQuestionPaper = () => {
        if (!examId) return;
        const url = `/api/exam/${examId}/pdf?mode=question`;
        window.open(url, '_blank');
    };

    const downloadAnswerKey = () => {
        if (!examId) return;
        const url = `/api/exam/${examId}/pdf?mode=answer`;
        window.open(url, '_blank');
    };

    const downloadBothPDFs = () => {
        downloadQuestionPaper();
        setTimeout(() => {
            downloadAnswerKey();
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto my-10 p-6 font-sans text-slate-200">
            <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-300 mb-2">
                Smart AI Exam Generator
            </h1>
            <p className="text-center text-slate-400 mb-8">
                Generate exams for Full Subjects, Chapters, or Topics in Any Language!
            </p>

            {!generatedExam ? (
                <div className="bg-gradient-to-br from-[#1b123a]/60 via-[#0a0718]/40 to-transparent border border-purple-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    {errorMsg && <div className="text-red-400 bg-red-900/20 p-3.5 rounded-2xl mb-6 border border-red-500/20 text-xs flex items-center gap-2">{errorMsg}</div>}

                    {/* Mode Selectors */}
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-white/5 pb-6">
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Generation Goal</label>
                            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl">
                                <button type="button" onClick={() => setInputMode('syllabus')}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${inputMode === 'syllabus' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    📚 Syllabus Material
                                </button>
                                <button type="button" onClick={() => setInputMode('old_paper')}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${inputMode === 'old_paper' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    📝 Solve & Predict Old Paper
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Input Source Type</label>
                            <div className="flex gap-1.5 bg-black/45 p-1 rounded-xl">
                                <button type="button" onClick={() => setSourceType('file')}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${sourceType === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    📁 File Upload (PDF/Image)
                                </button>
                                <button type="button" onClick={() => setSourceType('text')}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${sourceType === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    ✍️ Paste Paper Text
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* 1. Exam Scope (Syllabus Mode Only) */}
                        {inputMode === 'syllabus' && (
                            <div className="md:col-span-2 border-b border-white/5 pb-4 mb-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">1. Exam Scope*</label>
                                <select value={examScope} onChange={e => {setExamScope(e.target.value); setChapter(''); setTopic('');}} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                    <option value="Full Subject">Full Subject (Entire Book/Material)</option>
                                    <option value="Chapter Wise">Chapter Wise</option>
                                    <option value="Specific Topic">Specific Topic</option>
                                </select>
                            </div>
                        )}

                        {/* Standard */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Standard / Class*</label>
                            <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                {STANDARDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        {/* Stream (Only for 11th and 12th) */}
                        {(standard === '11' || standard === '12') && (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Stream*</label>
                                <select value={stream} onChange={e => setStream(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Arts">Arts</option>
                                </select>
                            </div>
                        )}

                        {/* Board */}
                        {isSchoolStandard(standard) ? (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Education Board*</label>
                                <select value={board} onChange={e => setBoard(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                    {BOARDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="hidden md:block"></div>
                        )}

                        {/* Subject */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Subject*</label>
                            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                {(STANDARD_SUBJECTS_MAP[standard] || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                                           {/* Conditional Inputs based on Scope */}
                        {inputMode === 'syllabus' && examScope === 'Chapter Wise' && (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Chapter Name*</label>
                                <input type="text" value={chapter} onChange={e => setChapter(e.target.value)} placeholder="e.g. Chapter 4: Carbon" className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none" />
                            </div>
                        )}
                        {inputMode === 'syllabus' && examScope === 'Specific Topic' && (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Topic Name*</label>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Covalent Bonds" className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none" />
                            </div>
                        )}
                        {(inputMode !== 'syllabus' || examScope === 'Full Subject') && <div className="hidden md:block"></div>}

                        {/* Total Marks */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Total Marks*</label>
                            <select value={marks} onChange={e => setMarks(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                <option value="10">10 Marks</option>
                                <option value="20">20 Marks</option>
                                <option value="25">25 Marks</option>
                                <option value="50">50 Marks</option>
                                <option value="80">80 Marks</option>
                                <option value="100">100 Marks</option>
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Difficulty Level</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        {/* Target Language */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5 block">Target Language</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none">
                                <option value="Auto-Detect">Auto-Detect (Same as PDF)</option>
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Gujarati">Gujarati</option>
                            </select>
                        </div>
                    </div>

                    {/* Blueprint Section */}
                    {inputMode !== 'old_paper' && (
                        <div className="mb-6 p-4 border border-white/5 rounded-2xl bg-black/40">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <label className="flex items-center gap-2 font-semibold text-slate-350 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={customizeBlueprint} 
                                        onChange={e => setCustomizeBlueprint(e.target.checked)} 
                                        className="w-4 h-4 rounded border-white/10 bg-slate-900 text-indigo-500 focus:ring-indigo-500" 
                                    />
                                    Customize Question Blueprint (Marks Distribution)
                                </label>
                                <span className={`text-xs font-bold ${blueprintSum === Number(marks) ? 'text-emerald-450' : 'text-red-405'}`}>
                                    Total Marks: {blueprintSum} / {marks} Marks
                                </span>
                            </div>

                            {customizeBlueprint && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-4">
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">MCQs (1 Mark)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.mcq} 
                                            onChange={e => setBlueprint({ ...blueprint, mcq: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">True/False (1 Mark)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.true_false} 
                                            onChange={e => setBlueprint({ ...blueprint, true_false: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Blanks (1 Mark)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.blank} 
                                            onChange={e => setBlueprint({ ...blueprint, blank: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Very Short (1 Mark)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.q1} 
                                            onChange={e => setBlueprint({ ...blueprint, q1: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Short (2 Marks)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.q2} 
                                            onChange={e => setBlueprint({ ...blueprint, q2: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Medium (3 Marks)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.q3} 
                                            onChange={e => setBlueprint({ ...blueprint, q3: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Long (4 Marks)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.q4} 
                                            onChange={e => setBlueprint({ ...blueprint, q4: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-500 mb-1">Essay (5 Marks)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={blueprint.q5} 
                                            onChange={e => setBlueprint({ ...blueprint, q5: Math.max(0, Number(e.target.value)) })} 
                                            className="w-full p-2 text-center rounded-xl bg-black/60 border border-white/10 text-white text-xs" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* File Uploads vs Text Paste Area */}
                    {sourceType === 'file' ? (
                        <div className="mb-6 p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl text-left">
                            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1.5 block">
                                {inputMode === 'old_paper' ? 'Upload Old Question Paper (PDF or Photo)*' : 'Upload Study Material (PDF)*'}
                            </label>
                            <p className="text-[11px] text-slate-400 mb-3">
                                {inputMode === 'old_paper' 
                                    ? 'Upload a PDF or an Image photo of the old question paper. The AI will extract the questions and create a predicted model paper!' 
                                    : 'Any language is supported (Hindi, Gujarati, English). The AI will auto-detect it.'}
                            </p>
                            <input type="file" accept="application/pdf, image/png, image/jpeg, image/jpg" onChange={handlePdfChange} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
                            {pdfFile && (
                                <div className="mt-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 text-xs text-amber-300 leading-relaxed">
                                    ⚠️ <strong>Scanned PDF / Hand Written Warning:</strong> If your uploaded file contains hand-written notes or low-contrast scanned pages, the AI text extractor might miss some portions. Ensure text is clear and readable for accurate question generation.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-6 p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl text-left">
                            <label className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1.5 block">
                                {inputMode === 'old_paper' ? 'Paste Old Question Paper Text*' : 'Paste Study Material / Syllabus Text*'}
                            </label>
                            <p className="text-[11px] text-slate-400 mb-3">Copy and paste the text content directly into the box below:</p>
                            <textarea 
                                value={pastedText} 
                                onChange={e => setPastedText(e.target.value)}
                                placeholder={inputMode === 'old_paper' ? "Paste questions from old papers here..." : "Paste syllabus content or chapter chapters here..."}
                                rows={8}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500/40"
                            />
                        </div>
                    )}

                    {/* Reference File Upload */}
                    <div className="mb-8 p-4 border border-dashed border-white/10 bg-black/40 rounded-2xl text-left">
                        <label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1.5 block">Upload Reference Paper Format (PDF/Photo) <span className="text-slate-400 font-normal">[Optional]</span></label>
                        <p className="text-[11px] text-slate-400 mb-3">Upload a previous year paper or sample paper to mimic its structure.</p>
                        <input type="file" accept="application/pdf, image/png, image/jpeg, image/jpg" onChange={handleReferenceChange} className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                    </div>

                    {loading && (
                        <div className="mb-6 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-left">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                                <span>{progressText}</span>
                                <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">
                                Note: Parsing large textbooks and generating answers takes around 15-30 seconds.
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-[0.99] mt-2"
                    >
                        {loading ? 'Processing Document & Generating AI Exam... Please wait' : 'Generate Smart Exam Paper'}
                    </button>
                </div>
            ) : (
                <div>
                    {/* Printable Area Wrapper */}
                    <div className="relative">
                        {editMode && <div className="absolute -top-10 right-0 text-sm text-blue-400 font-bold bg-blue-900/20 p-2 rounded">Edit Mode Active</div>}
                        <div id="printable-exam" className="bg-white text-slate-900 p-10 rounded-lg shadow-xl mb-8 relative pb-20">
                            
                            {/* Watermark (Hidden by default, shown during PDF Generation) */}
                            <div id="pdf-watermark" style={{display: 'none'}} className="absolute bottom-4 right-8 text-slate-400 font-bold text-sm italic opacity-70">
                                Generated by FutureBuilder AI
                            </div>

                            <div className="text-center border-b-2 border-slate-800 pb-6 mb-8 text-slate-900">
                                {editMode ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">Paper Title:</span>
                                            <input type="text" className="text-3xl font-bold text-center w-full bg-slate-100 border-2 border-blue-400 rounded p-1 outline-none text-slate-900" value={generatedExam.title || 'Exam Paper'} onChange={e => setGeneratedExam({...generatedExam, title: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-left border-2 border-blue-400 p-4 rounded bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Board:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.board || ''} onChange={e => setGeneratedExam({...generatedExam, board: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Subject:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.subject || ''} onChange={e => setGeneratedExam({...generatedExam, subject: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Standard:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.standard || ''} onChange={e => setGeneratedExam({...generatedExam, standard: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Stream:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.stream || ''} onChange={e => setGeneratedExam({...generatedExam, stream: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Difficulty:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.difficulty || ''} onChange={e => setGeneratedExam({...generatedExam, difficulty: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Scope:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.examScope || ''} onChange={e => setGeneratedExam({...generatedExam, examScope: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2 md:col-span-2">
                                                <span className="font-bold">Chapter Name:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.chapter || ''} onChange={e => setGeneratedExam({...generatedExam, chapter: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2 md:col-span-2">
                                                <span className="font-bold">Topic Name:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.topic || ''} onChange={e => setGeneratedExam({...generatedExam, topic: e.target.value})} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Total Marks:</span>
                                                <input type="text" className="border border-blue-400 px-2 py-1 bg-white rounded outline-none flex-1 text-slate-900" value={generatedExam.marks || ''} onChange={e => setGeneratedExam({...generatedExam, marks: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl font-bold mb-4 text-slate-900">{generatedExam.title || 'Exam Paper'}</h2>
                                        <div className="border-2 border-slate-800 p-4 rounded bg-slate-50 text-slate-800 text-sm">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                                                <div><strong>Board:</strong> {generatedExam.board || board}</div>
                                                <div><strong>Subject:</strong> {generatedExam.subject}</div>
                                                <div><strong>Standard:</strong> {generatedExam.standard} {generatedExam.stream ? `(${generatedExam.stream})` : ''}</div>
                                                <div><strong>Difficulty:</strong> {generatedExam.difficulty}</div>
                                                <div><strong>Scope:</strong> {generatedExam.examScope}</div>
                                                {generatedExam.chapter && <div className="col-span-2"><strong>Chapter Focus:</strong> {generatedExam.chapter}</div>}
                                                {generatedExam.topic && <div className="col-span-2"><strong>Topic Focus:</strong> {generatedExam.topic}</div>}
                                                <div><strong>Time:</strong> 2 Hours</div>
                                                <div><strong>Total Marks:</strong> {generatedExam.marks} Marks</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {generatedExam.sections?.map((sec: any, idx: number) => (
                                <div key={idx} className="mb-8">
                                    {editMode ? (
                                        <input type="text" className="text-xl font-bold underline mb-4 w-full bg-slate-100 border-2 border-blue-400 rounded p-1 outline-none text-slate-900" value={sec.sectionName} onChange={e => {
                                            const newSections = [...generatedExam.sections];
                                            newSections[idx].sectionName = e.target.value;
                                            setGeneratedExam({...generatedExam, sections: newSections});
                                        }} />
                                    ) : (
                                        <h3 className="text-xl font-bold underline mb-4">{sec.sectionName}</h3>
                                    )}
                                    
                                    {sec.questions?.map((q: any, qIdx: number) => (
                                        <div key={qIdx} className="mb-6 page-break-inside-avoid">
                                            {editMode ? (
                                                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-blue-300 text-left">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-slate-900">Q{qIdx + 1}.</span>
                                                        <textarea 
                                                            className="flex-1 p-2 bg-white border border-blue-300 rounded outline-none text-slate-900 text-sm" 
                                                            rows={2}
                                                            value={q.question} 
                                                            onChange={e => {
                                                                const newSections = [...generatedExam.sections];
                                                                newSections[idx].questions[qIdx].question = e.target.value;
                                                                setGeneratedExam({...generatedExam, sections: newSections});
                                                            }} 
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <input 
                                                                type="number" 
                                                                className="w-16 p-1 bg-white border border-blue-300 rounded text-center text-slate-900 text-sm" 
                                                                value={q.marks} 
                                                                onChange={e => {
                                                                    const newSections = [...generatedExam.sections];
                                                                    newSections[idx].questions[qIdx].marks = Number(e.target.value);
                                                                    setGeneratedExam({...generatedExam, sections: newSections});
                                                                }} 
                                                            />
                                                            <span className="text-slate-700 text-xs">Marks</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {q.options && q.options.length > 0 && (
                                                        <div className="ml-6 space-y-1">
                                                            <span className="text-xs font-bold text-slate-700 block mb-1">Options:</span>
                                                            {q.options.map((opt: string, oIdx: number) => (
                                                                <div key={oIdx} className="flex items-center gap-2">
                                                                    <span className="text-slate-800 font-semibold">{String.fromCharCode(65 + oIdx)}.</span>
                                                                    <input 
                                                                        type="text" 
                                                                        className="flex-1 p-1 bg-white border border-blue-300 rounded text-slate-900 text-xs" 
                                                                        value={opt} 
                                                                        onChange={e => {
                                                                            const newSections = [...generatedExam.sections];
                                                                            newSections[idx].questions[qIdx].options[oIdx] = e.target.value;
                                                                            setGeneratedExam({...generatedExam, sections: newSections});
                                                                        }} 
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mt-2 bg-white p-3 rounded border border-blue-300">
                                                        <strong className="text-slate-900 text-sm">Answer:</strong>
                                                        <textarea 
                                                            className="w-full p-2 mt-1 bg-white border border-blue-300 rounded outline-none text-slate-900 text-xs" 
                                                            rows={2}
                                                            value={q.answer} 
                                                            onChange={e => {
                                                                const newSections = [...generatedExam.sections];
                                                                newSections[idx].questions[qIdx].answer = e.target.value;
                                                                setGeneratedExam({...generatedExam, sections: newSections});
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="font-semibold text-lg flex justify-between">
                                                        <span>Q{qIdx + 1}. {q.question}</span>
                                                        <span className="text-slate-500 font-normal text-sm">[{q.marks} Marks]</span>
                                                    </p>
                                                    
                                                    {q.options && q.options.length > 0 && (
                                                        <ol type="A" className="list-[upper-alpha] ml-8 mt-2 space-y-1">
                                                            {q.options.map((opt: string, oIdx: number) => (
                                                                <li key={oIdx} className="text-slate-800">{opt}</li>
                                                            ))}
                                                        </ol>
                                                    )}

                                                    {(!q.options || q.options.length === 0) && (
                                                        (() => {
                                                            const ans = String(q.answer || '').trim().toLowerCase();
                                                            const isTF = ans === 'true' || ans === 'false' || ans === 'સાચું' || ans === 'ખોટું' || ans === 'सत्य' || ans === 'असत्य';
                                                            if (!isTF) return null;
                                                            
                                                            const isGuj = language === 'Gujarati' || String(generatedExam?.title || '').includes('ગુજરાતી') || ans === 'સાચું' || ans === 'ખોટું';
                                                            const isHin = language === 'Hindi' || ans === 'सत्य' || ans === 'असत्य';
                                                            
                                                            let tfLabel = "(A) True     (B) False";
                                                            if (isGuj) tfLabel = "(A) સાચું     (B) ખોટું";
                                                            else if (isHin) tfLabel = "(A) सत्य     (B) असत्य";
                                                            
                                                            return (
                                                                <div className="ml-8 mt-2 text-slate-800 font-semibold text-sm">
                                                                    {tfLabel}
                                                                </div>
                                                            );
                                                        })()
                                                    )}
         
                                                    <div className="bg-slate-100 p-4 rounded-md mt-4 text-slate-700 border border-slate-200 answer-block">
                                                        <strong>Answer:</strong> {q.answer}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <button 
                            onClick={() => setEditMode(!editMode)}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500 transition-colors shadow-lg"
                        >
                            {editMode ? 'Save Edits' : 'Edit Paper Details'}
                        </button>
                        <button 
                            onClick={downloadQuestionPaper}
                            className="px-6 py-3 bg-teal-600 text-white font-bold rounded hover:bg-teal-500 transition-colors shadow-lg"
                        >
                            Download Question Paper
                        </button>
                        <button 
                            onClick={downloadAnswerKey}
                            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-500 transition-colors shadow-lg"
                        >
                            Download Answer Key
                        </button>
                        <button 
                            onClick={downloadBothPDFs}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition-colors shadow-lg"
                        >
                            Download Both
                        </button>
                        <button 
                            onClick={() => {
                                setGeneratedExam(null);
                                setEditMode(false);
                            }}
                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition-colors shadow-lg"
                        >
                            Create Another Paper
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamGeneratorPage;
