import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Plus, Sparkles, Compass, X, Trash2, GraduationCap, Globe, Layers, Calendar } from 'lucide-react';
import { BOARDS } from './MinervaQuizBattlePage';

// Complete Explicit List of All Standards (1 to 12, Stream-Specific, Higher Ed & Competitive)
const ALL_STANDARDS = [
    { group: '── School Standards (Class 1 to 10) ──', items: [
        { id: '1', name: 'Class 1' },
        { id: '2', name: 'Class 2' },
        { id: '3', name: 'Class 3' },
        { id: '4', name: 'Class 4' },
        { id: '5', name: 'Class 5' },
        { id: '6', name: 'Class 6' },
        { id: '7', name: 'Class 7' },
        { id: '8', name: 'Class 8' },
        { id: '9', name: 'Class 9 (Secondary School)' },
        { id: '10', name: 'Class 10 (Board Exam Standard)' }
    ]},
    { group: '── Class 11 Streams ──', items: [
        { id: '11_SCI_A', name: 'Class 11 Science (Group A - PCM)' },
        { id: '11_SCI_B', name: 'Class 11 Science (Group B - PCB)' },
        { id: '11_COMMERCE', name: 'Class 11 Commerce' },
        { id: '11_ARTS', name: 'Class 11 Arts & Humanities' }
    ]},
    { group: '── Class 12 Streams (Board Exam) ──', items: [
        { id: '12_SCI_A', name: 'Class 12 Science (Group A - PCM Board)' },
        { id: '12_SCI_B', name: 'Class 12 Science (Group B - PCB Board)' },
        { id: '12_COMMERCE', name: 'Class 12 Commerce Board' },
        { id: '12_ARTS', name: 'Class 12 Arts & Humanities Board' }
    ]},
    { group: '── Higher Education & College Degrees ──', items: [
        { id: 'diploma', name: 'Diploma / Polytechnic (GTU / State Tech)' },
        { id: 'undergrad_btech', name: 'Undergraduate Engineering (B.Tech / B.E.)' },
        { id: 'undergrad_bsc', name: 'Undergraduate Science (B.Sc / Data Science)' },
        { id: 'undergrad_bca', name: 'Undergraduate Computer Applications (B.CA)' },
        { id: 'undergrad_bcom', name: 'Undergraduate Commerce (B.Com / BBA)' },
        { id: 'undergrad_ba', name: 'Undergraduate Arts & Law (B.A / LL.B)' },
        { id: 'postgrad_mtech', name: 'Post-Graduation (M.Tech / M.Sc / MCA)' },
        { id: 'postgrad_mba', name: 'Post-Graduation Management (MBA / M.Com)' },
        { id: 'phd', name: 'PhD / Doctoral Research Scholar' }
    ]},
    { group: '── Competitive & Entrance Exams ──', items: [
        { id: 'JEE', name: 'JEE (Mains & Advanced)' },
        { id: 'NEET', name: 'NEET (Medical Entrance)' },
        { id: 'UPSC', name: 'UPSC / State PSC Civil Services' },
        { id: 'GATE', name: 'GATE (Engineering)' }
    ]}
];

// Degree / Branch Mapping per Higher Ed Category
const HIGHER_ED_DEGREE_MAP: Record<string, { id: string; name: string }[]> = {
    'diploma': [
        { id: 'diploma_cse', name: 'Diploma Computer Engineering' },
        { id: 'diploma_it', name: 'Diploma Information Technology (IT)' },
        { id: 'diploma_mech', name: 'Diploma Mechanical Engineering' },
        { id: 'diploma_civil', name: 'Diploma Civil Engineering' },
        { id: 'diploma_ee', name: 'Diploma Electrical Engineering' },
        { id: 'diploma_ec', name: 'Diploma Electronics & Communication' }
    ],
    'undergrad_btech': [
        { id: 'btech_cse', name: 'B.Tech Computer Science & Engineering (CSE)' },
        { id: 'btech_it', name: 'B.Tech Information Technology (IT)' },
        { id: 'btech_ai_ds', name: 'B.Tech AI & Data Science' },
        { id: 'btech_mech', name: 'B.Tech Mechanical Engineering' },
        { id: 'btech_civil', name: 'B.Tech Civil Engineering' },
        { id: 'btech_ee', name: 'B.Tech Electrical & Electronics (EEE)' }
    ],
    'undergrad_bsc': [
        { id: 'bsc_cs', name: 'B.Sc Computer Science' },
        { id: 'bsc_it', name: 'B.Sc Information Technology' },
        { id: 'bsc_ds', name: 'B.Sc Data Science & Analytics' },
        { id: 'bsc_pcm', name: 'B.Sc Physics, Chemistry & Mathematics' },
        { id: 'bsc_biotech', name: 'B.Sc Biotechnology & Microbiology' }
    ],
    'undergrad_bca': [
        { id: 'bca_gen', name: 'B.CA General Computer Applications' },
        { id: 'bca_fullstack', name: 'B.CA Software Development & Full Stack' },
        { id: 'bca_cyber', name: 'B.CA Cyber Security & Forensic' }
    ],
    'undergrad_bcom': [
        { id: 'bcom_acc', name: 'B.Com Financial Accounting & Finance' },
        { id: 'bcom_banking', name: 'B.Com Banking & Insurance' },
        { id: 'bba_management', name: 'B.BA Business Administration' }
    ],
    'undergrad_ba': [
        { id: 'ba_econ', name: 'B.A Economics & Public Policy' },
        { id: 'ba_psych', name: 'B.A Psychology' },
        { id: 'ba_english', name: 'B.A English Literature' },
        { id: 'llb_law', name: 'B.A LL.B Integrated Law' }
    ],
    'postgrad_mtech': [
        { id: 'mtech_cse', name: 'M.Tech Computer Science & Engineering' },
        { id: 'mtech_ai', name: 'M.Tech Artificial Intelligence & Robotics' },
        { id: 'msc_it', name: 'M.Sc Information Technology' },
        { id: 'mca_master', name: 'M.CA Master of Computer Applications' }
    ],
    'postgrad_mba': [
        { id: 'mba_finance', name: 'MBA Finance Management' },
        { id: 'mba_marketing', name: 'MBA Marketing & Digital Strategy' },
        { id: 'mba_hr', name: 'MBA Human Resource Management' },
        { id: 'mcom_adv', name: 'M.Com Advanced Accountancy' }
    ],
    'phd': [
        { id: 'phd_cs_ai', name: 'PhD Computer Science & AI Research' },
        { id: 'phd_data', name: 'PhD Data Science & Machine Learning' },
        { id: 'phd_physics', name: 'PhD Physical Sciences' },
        { id: 'phd_chem', name: 'PhD Chemical Sciences' },
        { id: 'phd_mgmt', name: 'PhD Management & Economics' }
    ]
};

// All 14+ Instruction Medium Languages
const ALL_LANGUAGES = [
    { id: 'hinglish', name: 'Hinglish (Mix)' },
    { id: 'english', name: 'English' },
    { id: 'hindi', name: 'Hindi (हिंदी)' },
    { id: 'gujarati', name: 'Gujarati (ગુજરાતી)' },
    { id: 'marathi', name: 'Marathi (मરાઠી)' },
    { id: 'bengali', name: 'Bengali (বাংলা)' },
    { id: 'tamil', name: 'Tamil (தமிழ்)' },
    { id: 'telugu', name: 'Telugu (తెలుగు)' },
    { id: 'kannada', name: 'Kannada (ಕನ್ನಡ)' },
    { id: 'malayalam', name: 'Malayalam (മലയാളം)' },
    { id: 'punjabi', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { id: 'odia', name: 'Odia (ଓଡ଼ିଆ)' },
    { id: 'assamese', name: 'Assamese (অসমীয়া)' },
    { id: 'urdu', name: 'Urdu (اردو)' }
];

export const MinervaRoadmapsPage: React.FC = () => {
    const { token } = useAuth() as any;
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    
    // Modal Tab Mode: 'school' (Tab 1: School/College 1-12 & Higher Ed) vs 'custom' (Tab 2: Out of Course)
    const [modalTab, setModalTab] = useState<'school' | 'custom'>('school');

    // School / Syllabus Roadmap Form States
    const [board, setBoard] = useState('CBSE');
    const [gradeLevel, setGradeLevel] = useState('10');
    const [specificDegree, setSpecificDegree] = useState('btech_cse');
    const [semester, setSemester] = useState('sem_1');
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [scopeType, setScopeType] = useState<'full_subject' | 'single_chapter'>('full_subject');
    const [specificChapter, setSpecificChapter] = useState('');
    const [language, setLanguage] = useState('hinglish');

    // Custom / Out of Course Form States
    const [customTopic, setCustomTopic] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);

    const isHigherEd = Boolean(HIGHER_ED_DEGREE_MAP[gradeLevel]);

    useEffect(() => {
        if (token) {
            loadCourses();
        }
    }, [token]);

    // When gradeLevel changes, sync degree options and subjects
    useEffect(() => {
        const degrees = HIGHER_ED_DEGREE_MAP[gradeLevel];
        if (degrees && degrees.length > 0) {
            setSpecificDegree(degrees[0].id);
        }
    }, [gradeLevel]);

    // When specificDegree or semester changes, update subject list automatically
    useEffect(() => {
        const subjs = getSubjectOptions();
        if (subjs.length > 0) {
            setSelectedSubject(subjs[0]);
        }
    }, [gradeLevel, specificDegree, semester]);

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

    const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        if (!window.confirm('Are you sure you want to delete this Roadmap course? All its topics and progress will be deleted.')) return;
        try {
            const res = await minervaApi.deleteSession(token, courseId);
            if (res.success) {
                setCourses(prev => prev.filter(c => c._id !== courseId));
            } else {
                alert(res.error || 'Failed to delete roadmap course.');
            }
        } catch (err) {
            console.error('Delete course error:', err);
            alert('Error deleting course.');
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenLoading(true);

        try {
            let promptMsg = '';

            if (modalTab === 'school') {
                if (isHigherEd) {
                    const degreeObj = HIGHER_ED_DEGREE_MAP[gradeLevel]?.find(d => d.id === specificDegree);
                    const degreeName = degreeObj ? degreeObj.name : specificDegree;
                    const semLabel = semester.replace('sem_', 'Semester ');

                    const roadmapTypeStr = scopeType === 'full_subject' 
                        ? `Full University Course Syllabus for Subject: "${selectedSubject}"` 
                        : `Single Chapter Study Roadmap for Chapter: "${specificChapter || 'Chapter 1'}" in Subject: "${selectedSubject}"`;
                    
                    promptMsg = `Create an official university college syllabus course (${roadmapTypeStr}). Degree: ${degreeName}. Term: ${semLabel}. Subject: ${selectedSubject}. Target Level: ${gradeLevel}. Instruction Language: ${language}. Include sequential modules, lab practicals, exam weightage marks, and semester curriculum topics.`;
                } else {
                    const roadmapTypeStr = scopeType === 'full_subject' 
                        ? `Full Official Board Textbook Roadmap for ${selectedSubject}` 
                        : `Single Chapter Textbook Roadmap for Chapter: "${specificChapter || 'Chapter 1'}" in Subject: ${selectedSubject}`;
                    
                    promptMsg = `Create an official textbook-aligned ${roadmapTypeStr}. Target Standard / Grade Level: Class ${gradeLevel}. Board Alignment: ${board}. Medium of Instruction: ${language}. Include all official textbook chapters and sub-topics with board exam weightage marks.`;
                }
            } else {
                if (!customTopic.trim()) {
                    alert('Please enter your custom topic / skill name.');
                    setGenLoading(false);
                    return;
                }
                promptMsg = `Create a custom skill roadmap course for topic: "${customTopic}". Medium of Instruction: ${language}. Include sequential learning nodes and practical projects.`;
            }

            const res = await minervaApi.sendChat(token, promptMsg, undefined, undefined, false, true);
            
            if (res.success && res.content_type === 'roadmap' && res.metadata?.session_id) {
                setShowCreateModal(false);
                navigate(`/future-education/session/${res.metadata.session_id}`);
            } else if (res.success && res.reply) {
                alert(`AI Response: ${res.reply}\n\nPlease ask the AI Tutor directly in the Chat room to build a roadmap.`);
                setShowCreateModal(false);
                navigate('/future-education');
            } else {
                alert(res.error || 'Failed to assemble roadmap course. Try another subject or topic.');
            }
        } catch (err) {
            console.error('Error creating course:', err);
            alert('Error creating roadmap course. Please check your internet connection.');
        } finally {
            setGenLoading(false);
        }
    };

    // Helper: Dynamic Subjects based on Grade Level, Selected Degree Branch AND Semester
    const getSubjectOptions = (): string[] => {
        // Higher Ed Branching Logic
        if (isHigherEd) {
            if (specificDegree.includes('cse') || specificDegree.includes('it') || specificDegree.includes('ai')) {
                if (semester === 'sem_1' || semester === 'sem_2') {
                    return [
                        'Engineering Mathematics I & II',
                        'Engineering Physics & Quantum Mechanics',
                        'Basic Electrical & Electronics Engineering',
                        'Programming in C & C++',
                        'Engineering Graphics & CAD',
                        'Technical Communication & English'
                    ];
                } else if (semester === 'sem_3') {
                    return [
                        'Data Structures & Algorithms (DSA)',
                        'Database Management Systems (DBMS)',
                        'Digital Logic & Computer Design',
                        'Object-Oriented Programming using Java / C++',
                        'Discrete Mathematical Structures'
                    ];
                } else if (semester === 'sem_4') {
                    return [
                        'Design & Analysis of Algorithms (DAA)',
                        'Operating Systems (OS)',
                        'Computer Networks (CN)',
                        'Theory of Computation (TOC) & Automata',
                        'Software Engineering & Agile Methodologies'
                    ];
                } else if (semester === 'sem_5') {
                    return [
                        'Compiler Design & Language Processor',
                        'Web Technologies (Full Stack MERN/PERN)',
                        'Artificial Intelligence & Expert Systems',
                        'Database Implementation & SQL Optimization',
                        'Computer Organization & Architecture'
                    ];
                } else if (semester === 'sem_6') {
                    return [
                        'Machine Learning & Predictive Modeling',
                        'Information & Cyber Security',
                        'Cloud Computing & DevOps Infrastructure',
                        'Mobile Application Development (React Native/Android)',
                        'Distributed Operating Systems'
                    ];
                } else {
                    return [
                        'Deep Learning & Neural Network Architectures',
                        'Big Data Analytics & Hadoop/Spark',
                        'Blockchain & Smart Contracts Development',
                        'Internet of Things (IoT) & Embedded Systems',
                        'Capstone Major Project & Research Thesis'
                    ];
                }
            } else if (specificDegree.includes('mech') || specificDegree.includes('civil') || specificDegree.includes('ee')) {
                if (semester === 'sem_1' || semester === 'sem_2') {
                    return ['Engineering Mathematics I', 'Engineering Chemistry', 'Engineering Mechanics', 'Workshop Practice & Manufacturing', 'Basic Electrical Systems'];
                } else if (semester === 'sem_3' || semester === 'sem_4') {
                    return ['Fluid Mechanics & Machinery', 'Thermodynamics & Heat Transfer', 'Kinematics of Machines', 'Strength of Materials', 'Manufacturing Processes'];
                } else {
                    return ['Design of Machine Elements', 'Automobile Engineering', 'Control Systems', 'CAD/CAM & Automation', 'Renewable Energy Systems'];
                }
            } else if (specificDegree.includes('bcom') || specificDegree.includes('bba') || specificDegree.includes('mcom') || specificDegree.includes('mba')) {
                if (semester === 'sem_1' || semester === 'sem_2') {
                    return ['Financial Accounting I & II', 'Business Economics & Microeconomics', 'Commercial Law & Contracts', 'Business Communication', 'Business Mathematics & Statistics'];
                } else if (semester === 'sem_3' || semester === 'sem_4') {
                    return ['Corporate Accounting', 'Cost Accounting', 'Macroeconomics & Monetary Policy', 'Income Tax Law & Practice', 'Auditing & Corporate Governance'];
                } else {
                    return ['Management Accounting', 'GST & Indirect Taxation', 'Financial Management & Corporate Finance', 'Banking & Insurance Services', 'International Business & Forex'];
                }
            } else if (specificDegree.includes('bsc_cs') || specificDegree.includes('bca')) {
                if (semester === 'sem_1' || semester === 'sem_2') {
                    return ['Computer Fundamentals & Office Tools', 'C Programming & Logic Development', 'Discrete Mathematics', 'Web Designing (HTML/CSS/JS)', 'Digital Electronics'];
                } else if (semester === 'sem_3' || semester === 'sem_4') {
                    return ['Data Structures using C++', 'Database Management Systems (DBMS)', 'Core Java Programming', 'System Software & Operating Systems', 'Python Programming'];
                } else {
                    return ['PHP & Web Frameworks', 'Software Engineering & Testing', 'Computer Networks & Security', 'Data Mining & Warehousing', 'Major Project & Viva'];
                }
            } else if (specificDegree.includes('phd')) {
                return [
                    'Research Methodology & Quantitative Techniques',
                    'Advanced Literature Survey & Citation Analysis',
                    'Academic Thesis Writing & Patent Filing',
                    'Specialized Domain Deep Study Paper',
                    'Experimental Data Modeling & Viva Preparation'
                ];
            } else {
                return [
                    'Core Theory Paper I',
                    'Core Theory Paper II',
                    'Applied Practical Lab & Field Work',
                    'Interdisciplinary Elective Paper',
                    'Seminar & Technical Presentation'
                ];
            }
        }

        // School Standards Branching
        if (['11_SCI_A', '12_SCI_A'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Mathematics', 'English Core', 'Computer Science / IP'];
        } else if (['11_SCI_B', '12_SCI_B'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Biology', 'English Core', 'Computer Science / IP'];
        } else if (['11_COMMERCE', '12_COMMERCE'].includes(gradeLevel)) {
            return ['Accountancy', 'Business Studies', 'Economics', 'Statistics', 'English Core'];
        } else if (['11_ARTS', '12_ARTS'].includes(gradeLevel)) {
            return ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English Core'];
        } else if (['JEE', 'NEET', 'UPSC', 'GATE'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Studies (Paper 1-4)', 'CSAT & Reasoning'];
        } else {
            return ['Mathematics', 'Science (Physics/Chemistry/Biology)', 'Social Science', 'English', 'Computer / IT', 'Hindi', 'Gujarati'];
        }
    };

    return (
        <div className="min-h-screen bg-[#05030a] text-white p-4 sm:p-8 font-inter relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header Navbar */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/future-education')}
                            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                <span>Future Education OS Roadmaps</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-bold tracking-wider">
                                    34+ Boards • Degree &amp; Semester Alignment
                                </span>
                            </h1>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                                Official Board Textbook Syllabuses (1-12 &amp; College Degrees) &amp; Custom Skill Learning Paths
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                    >
                        <Plus size={16} />
                        <span>Start New Study Course</span>
                    </button>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-44 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse p-6" />
                        ))
                    ) : courses.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white/[0.01] border border-white/5 rounded-3xl">
                            <Compass size={40} className="mx-auto text-indigo-400/50 mb-3" />
                            <h3 className="text-sm font-bold text-gray-300">No Active Study Courses</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                                Start an official textbook syllabus course or custom skill roadmap to track your progress step-by-step.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
                            >
                                Create First Roadmap
                            </button>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <div
                                key={course._id}
                                onClick={() => navigate(`/future-education/session/${course._id}`)}
                                className="group relative bg-[#0b081e]/80 border border-white/10 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
                            >
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteCourse(e, course._id)}
                                    title="Delete Roadmap"
                                    className="absolute top-4 right-4 p-2 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-xl transition-all opacity-80 hover:opacity-100 z-20 border border-rose-500/20"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            <BookOpen size={16} />
                                        </span>
                                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                            {course.board ? course.board.toUpperCase() : 'COLLEGE / BOARD SYLLABUS'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1 pr-8">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                                        {course.subject || 'Standard Educational Curriculum'}
                                    </p>
                                </div>

                                <div className="space-y-2 pt-3 border-t border-white/5">
                                    <div className="flex justify-between text-[11px] text-gray-400">
                                        <span className="font-medium">Course Progress</span>
                                        <span className="font-bold text-indigo-400">{course.progress_percent || 0}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${course.progress_percent || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2-Tab Option Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-6 overflow-y-auto">
                    <div className="bg-[#0b081e]/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl my-auto">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                        
                        <h2 className="font-bold text-base text-white mb-1 flex items-center gap-2">
                            <Sparkles size={18} className="text-indigo-400" /> Assemble New Study Roadmap
                        </h2>
                        <p className="text-gray-400 text-xs mb-4">
                            Choose between School/College Syllabus mode or Custom Skill mode.
                        </p>

                        {/* 2 Dedicated Option Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl mb-5">
                            <button
                                type="button"
                                onClick={() => setModalTab('school')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    modalTab === 'school'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <GraduationCap size={15} />
                                <span>1 to 12 &amp; Higher Ed (Syllabus)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalTab('custom')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    modalTab === 'custom'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Globe size={15} />
                                <span>Out of Syllabus (Custom)</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            
                            {/* TAB 1: SCHOOL & COLLEGE SYLLABUS ROADMAP */}
                            {modalTab === 'school' && (
                                <>
                                    {/* Standard / Class Selector (All explicit individual entries) */}
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">1. Select Student Standard / Education Category</label>
                                        <select
                                            value={gradeLevel}
                                            onChange={e => {
                                                setGradeLevel(e.target.value);
                                            }}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            {ALL_STANDARDS.map(group => (
                                                <optgroup key={group.group} label={group.group}>
                                                    {group.items.map(item => (
                                                        <option key={item.id} value={item.id}>{item.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    {/* DYNAMIC FIELD: Specific College Degree / Branch Selection for Higher Ed */}
                                    {isHigherEd && HIGHER_ED_DEGREE_MAP[gradeLevel] && (
                                        <div>
                                            <label className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <Layers size={12} /> 2. Select Specific Degree / Branch Program
                                            </label>
                                            <select
                                                value={specificDegree}
                                                onChange={e => setSpecificDegree(e.target.value)}
                                                className="w-full bg-[#030209] border border-indigo-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 shadow-md"
                                            >
                                                {HIGHER_ED_DEGREE_MAP[gradeLevel].map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* DYNAMIC FIELD: Semester Selection for College / Higher Ed */}
                                    {isHigherEd && (
                                        <div>
                                            <label className="text-[9px] text-purple-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <Calendar size={12} /> 3. Select Semester / Term Year
                                            </label>
                                            <select
                                                value={semester}
                                                onChange={e => setSemester(e.target.value)}
                                                className="w-full bg-[#030209] border border-purple-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500 shadow-md"
                                            >
                                                <option value="sem_1">Semester 1 (1st Year)</option>
                                                <option value="sem_2">Semester 2 (1st Year)</option>
                                                <option value="sem_3">Semester 3 (2nd Year)</option>
                                                <option value="sem_4">Semester 4 (2nd Year)</option>
                                                <option value="sem_5">Semester 5 (3rd Year)</option>
                                                <option value="sem_6">Semester 6 (3rd Year)</option>
                                                <option value="sem_7">Semester 7 (4th Year - B.Tech)</option>
                                                <option value="sem_8">Semester 8 (4th Year - B.Tech)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Board Selector (34+ Boards) — Hide if Higher Ed or show University Board */}
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                                            {isHigherEd ? '4. University / Examining Authority Alignment' : '2. Select Educational Board (34+ Central & State Boards)'}
                                        </label>
                                        <select
                                            value={board}
                                            onChange={e => setBoard(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 max-h-48"
                                        >
                                            {BOARDS.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Standard / Degree-Specific Subject Selector */}
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                                            {isHigherEd ? '5. Select Semester Course Subject' : '3. Select Standard Subject'}
                                        </label>
                                        <select
                                            value={selectedSubject}
                                            onChange={e => setSelectedSubject(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            {getSubjectOptions().map(subj => (
                                                <option key={subj} value={subj}>{subj}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Roadmap Scope Type */}
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Roadmap Scope</label>
                                        <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/10 p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setScopeType('full_subject')}
                                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                                                    scopeType === 'full_subject' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                📚 Full Subject Syllabus
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScopeType('single_chapter')}
                                                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                                                    scopeType === 'single_chapter' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                📑 Single Unit Study
                                            </button>
                                        </div>
                                    </div>

                                    {/* Specific Chapter input if Single Chapter mode selected */}
                                    {scopeType === 'single_chapter' && (
                                        <div>
                                            <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Unit / Chapter Name</label>
                                            <input
                                                type="text"
                                                value={specificChapter}
                                                onChange={e => setSpecificChapter(e.target.value)}
                                                placeholder="e.g. Unit 1: Data Structures and Complexity Analysis"
                                                className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                                            />
                                        </div>
                                    )}

                                    {/* Instruction Medium (14+ Languages) */}
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Instruction Medium (14+ Languages)</label>
                                        <select
                                            value={language}
                                            onChange={e => setLanguage(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            {ALL_LANGUAGES.map(lang => (
                                                <option key={lang.id} value={lang.id}>{lang.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* TAB 2: OUT OF SYLLABUS / CUSTOM SKILL ROADMAP */}
                            {modalTab === 'custom' && (
                                <>
                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Custom Skill / Course Topic</label>
                                        <textarea
                                            required={modalTab === 'custom'}
                                            value={customTopic}
                                            onChange={e => setCustomTopic(e.target.value)}
                                            placeholder="e.g., Python Data Structures & Algorithms, Machine Learning from Scratch, UPSC History of Modern India"
                                            className="w-full h-28 bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 outline-none resize-none mb-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">Instruction Medium (14+ Languages)</label>
                                        <select
                                            value={language}
                                            onChange={e => setLanguage(e.target.value)}
                                            className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                        >
                                            {ALL_LANGUAGES.map(lang => (
                                                <option key={lang.id} value={lang.id}>{lang.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={genLoading}
                                className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25"
                            >
                                {genLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

export default MinervaRoadmapsPage;
