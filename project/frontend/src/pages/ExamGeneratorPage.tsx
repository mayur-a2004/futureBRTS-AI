import React, { useState } from 'react';

const ExamGeneratorPage: React.FC = () => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    
    // States
    const [examScope, setExamScope] = useState('Full Subject');
    const [standard, setStandard] = useState('10th');
    const [stream, setStream] = useState('Science'); // New state for 11th/12th
    const [board, setBoard] = useState('CBSE');
    const [subject, setSubject] = useState('Mathematics');
    const [chapter, setChapter] = useState('');
    const [topic, setTopic] = useState('');
    const [marks, setMarks] = useState('50');
    const [difficulty, setDifficulty] = useState('Medium');
    
    const [loading, setLoading] = useState(false);
    const [generatedExam, setGeneratedExam] = useState<any>(null);
    const [examId, setExamId] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');
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
        if (!pdfFile || !subject || !board || !standard || !marks) {
            setErrorMsg('Please fill all required fields and upload the Study Material PDF.');
            return;
        }

        if (examScope === 'Chapter Wise' && !chapter) {
            setErrorMsg('Please enter the Chapter name.');
            return;
        }
        if (examScope === 'Specific Topic' && !topic) {
            setErrorMsg('Please enter the Topic name.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        const formData = new FormData();
        formData.append('pdfFile', pdfFile);
        if (referenceFile) {
            formData.append('referenceFile', referenceFile);
        }
        formData.append('examScope', examScope);
        formData.append('standard', standard);
        if (standard === '11th' || standard === '12th') {
            formData.append('stream', stream);
        }
        formData.append('board', board);
        formData.append('subject', subject);
        formData.append('chapter', chapter);
        formData.append('topic', topic);
        formData.append('marks', marks);
        formData.append('difficulty', difficulty);

        try {
            const token = localStorage.getItem('token');
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
                setExamId(id);
                if (paper) {
                    if (!paper.board) paper.board = board;
                    if (!paper.examScope) paper.examScope = examScope;
                    if (!paper.chapter) paper.chapter = chapter;
                    if (!paper.topic) paper.topic = topic;
                    if (!paper.difficulty) paper.difficulty = difficulty;
                    if (!paper.stream) paper.stream = (standard === '11th' || standard === '12th') ? stream : '';
                }
                setGeneratedExam(paper);
            } else {
                setErrorMsg(data.message || 'Failed to generate exam.');
            }
        } catch (err: any) {
            setErrorMsg('Network error. Ensure the backend is running.');
        } finally {
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
        <div className="max-w-4xl mx-auto my-10 p-6 font-sans bg-slate-900 rounded-xl shadow-2xl border border-slate-800 text-slate-200">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Smart AI Exam Generator</h1>
            <p className="text-center text-slate-400 mb-8">
                Generate exams for Full Subjects, Chapters, or Topics in Any Language!
            </p>

            {!generatedExam ? (
                <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                    {errorMsg && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-6 border border-red-500/30">{errorMsg}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* 1. Exam Scope */}
                        <div className="md:col-span-2 border-b border-slate-700 pb-4 mb-2">
                            <label className="block font-semibold mb-2 text-blue-300 text-lg">1. Exam Scope*</label>
                            <select value={examScope} onChange={e => {setExamScope(e.target.value); setChapter(''); setTopic('');}} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                <option value="Full Subject">Full Subject (Entire Book/Material)</option>
                                <option value="Chapter Wise">Chapter Wise</option>
                                <option value="Specific Topic">Specific Topic</option>
                            </select>
                        </div>

                        {/* Standard */}
                        <div>
                            <label className="block font-semibold mb-2 text-slate-300">Standard / Class*</label>
                            <select value={standard} onChange={e => setStandard(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={`${i+1}${i===0?'st':i===1?'nd':i===2?'rd':'th'}`}>{i+1}{i===0?'st':i===1?'nd':i===2?'rd':'th'} Standard</option>
                                ))}
                            </select>
                        </div>

                        {/* Stream (Only for 11th and 12th) */}
                        {(standard === '11th' || standard === '12th') && (
                            <div>
                                <label className="block font-semibold mb-2 text-slate-300">Stream*</label>
                                <select value={stream} onChange={e => setStream(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Arts">Arts</option>
                                </select>
                            </div>
                        )}

                        {/* Board */}
                        <div>
                            <label className="block font-semibold mb-2 text-slate-300">Education Board*</label>
                            <select value={board} onChange={e => setBoard(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                <option value="CBSE">CBSE</option>
                                <option value="ICSE">ICSE</option>
                                <option value="State Board">State Board</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block font-semibold mb-2 text-slate-300">Subject*</label>
                            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                <optgroup label="General">
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="English">English</option>
                                    <option value="Social Science">Social Science</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Gujarati">Gujarati</option>
                                    <option value="EVS">EVS</option>
                                </optgroup>
                                <optgroup label="Science Stream">
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                </optgroup>
                                <optgroup label="Commerce Stream">
                                    <option value="Accountancy">Accountancy</option>
                                    <option value="Business Studies">Business Studies</option>
                                    <option value="Economics">Economics</option>
                                    <option value="Statistics">Statistics</option>
                                </optgroup>
                                <optgroup label="Arts Stream">
                                    <option value="History">History</option>
                                    <option value="Geography">Geography</option>
                                    <option value="Political Science">Political Science</option>
                                    <option value="Sociology">Sociology</option>
                                    <option value="Psychology">Psychology</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* Conditional Inputs based on Scope */}
                        {examScope === 'Chapter Wise' && (
                            <div>
                                <label className="block font-semibold mb-2 text-slate-300">Chapter Name*</label>
                                <input type="text" value={chapter} onChange={e => setChapter(e.target.value)} placeholder="e.g. Chapter 4: Carbon" className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                        )}
                        {examScope === 'Specific Topic' && (
                            <div>
                                <label className="block font-semibold mb-2 text-slate-300">Topic Name*</label>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Covalent Bonds" className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500" />
                            </div>
                        )}
                        {examScope === 'Full Subject' && <div className="hidden md:block"></div>}

                        {/* Total Marks */}
                        <div>
                            <label className="block font-semibold mb-2 text-slate-300">Total Marks*</label>
                            <select value={marks} onChange={e => setMarks(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
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
                            <label className="block font-semibold mb-2 text-slate-300">Difficulty Level</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-3 rounded bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500">
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="mb-6 p-4 border border-dashed border-slate-500 rounded bg-slate-900/50">
                        <label className="block font-semibold mb-2 text-blue-300">Upload Study Material (PDF)*</label>
                        <p className="text-sm text-slate-400 mb-3">Any language is supported (Hindi, Gujarati, English). The AI will auto-detect it.</p>
                        <input type="file" accept="application/pdf" onChange={handlePdfChange} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                    </div>

                    {/* Reference File Upload */}
                    <div className="mb-8 p-4 border border-dashed border-slate-500 rounded bg-slate-900/50">
                        <label className="block font-semibold mb-2 text-purple-300">Upload Reference Paper Format (PDF/Photo) <span className="text-slate-400 font-normal">[Optional]</span></label>
                        <p className="text-sm text-slate-400 mb-3">Upload a previous year paper or sample paper to mimic its structure.</p>
                        <input type="file" accept="application/pdf, image/png, image/jpeg, image/jpg" onChange={handleReferenceChange} className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className={`w-full p-4 rounded-lg font-bold text-lg transition-colors ${loading ? 'bg-slate-600 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
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
