import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { minervaApi } from '../../api/minerva.api';
import { ChevronLeft, BookOpen, Plus, Sparkles, Compass, X, Trash2, GraduationCap, Globe, Layers, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import { BOARDS, INDIAN_LANGUAGES } from './MinervaQuizBattlePage';
import { SchoolContextBar } from '../../components/education/SchoolContextBar';

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

// All 22 Scheduled Indian Medium Languages
const ALL_LANGUAGES = INDIAN_LANGUAGES;

export const MinervaRoadmapsPage: React.FC = () => {
    const { token, user } = useAuth() as any;
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genLoading, setGenLoading] = useState(false);
    
    // Modal Tab Mode: 'school' (Tab 1: School/College 1-12 & Higher Ed) vs 'custom' (Tab 2: Out of Course)
    const [modalTab, setModalTab] = useState<'school' | 'custom'>('school');

    const [teacherRoadmapChapters, setTeacherRoadmapChapters] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState('CLASS-10A');
    // School / Syllabus Roadmap Form States
    const [board, setBoard] = useState('CBSE');
    const [gradeLevel, setGradeLevel] = useState('10');
    const [specificDegree, setSpecificDegree] = useState('btech_cse');
    const [semester, setSemester] = useState('sem_1');
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [scopeType, setScopeType] = useState<'full_subject' | 'single_chapter'>('full_subject');
    const [specificChapter, setSpecificChapter] = useState('');
    const [language, setLanguage] = useState('hinglish');
    const [dynamicChapterList, setDynamicChapterList] = useState<string[]>([]);

    // Custom / Out of Course Form States
    const [customTopic, setCustomTopic] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedChapterDetail, setSelectedChapterDetail] = useState<any | null>(null);
    const [viewPdfDocument, setViewPdfDocument] = useState<boolean>(false);

    const isHigherEd = Boolean(HIGHER_ED_DEGREE_MAP[gradeLevel]);

    useEffect(() => {
        loadCourses();
        if (user) {
            if (user.board) setBoard(user.board.toUpperCase());
            if (user.standard) {
                const stdStr = user.standard.toString().replace(/^class_/i, '');
                setGradeLevel(stdStr);
            }
            if (user.medium) setLanguage(user.medium.toLowerCase());
        }
    }, [token, user]);

    // STATE MANAGEMENT CASCADE RESET HANDLERS
    const handleBoardChange = (newBoard: string) => {
        setBoard(newBoard);
        setLanguage('hinglish');
        setGradeLevel('10');
        setSelectedSubject('Mathematics');
        setSpecificChapter('');
        setDynamicChapterList([]);
    };

    const handleMediumChange = (newMedium: string) => {
        setLanguage(newMedium);
        setSelectedSubject('Mathematics');
        setSpecificChapter('');
        setDynamicChapterList([]);
    };

    const handleClassChange = (newClass: string) => {
        setGradeLevel(newClass);
        setSelectedSubject('Mathematics');
        setSpecificChapter('');
        setDynamicChapterList([]);
    };

    const handleSubjectChange = (newSubject: string) => {
        setSelectedSubject(newSubject);
        setSpecificChapter('');
        setDynamicChapterList([]);
    };

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
            if (token) {
                const res = await minervaApi.getSessions(token);
                if (res.success) {
                    setCourses(res.sessions || []);
                }
            }
            const tenantOrgId = (user as any)?.tenantOrgId || ((user as any)?.schoolName ? (user as any).schoolName.toLowerCase().replace(/\s+/g, '_') : 'mount_carmel_school');
            const roadmapRes = await axios.get(`/api/v1/teacher-workspace/assignments?tenantOrgId=${tenantOrgId}&classId=${selectedClass}`);
            if (roadmapRes.data && roadmapRes.data.assignments) {
                setTeacherRoadmapChapters(roadmapRes.data.assignments);
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

    // When selectedSubject or gradeLevel changes, update specificChapter automatically to Chapter 1
    useEffect(() => {
        const chs = getSubjectChapterList(selectedSubject, gradeLevel);
        if (chs && chs.length > 0 && (!specificChapter || !chs.includes(specificChapter))) {
            setSpecificChapter(chs[0]);
        }
    }, [selectedSubject, gradeLevel]);

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
                        ? `Full Official University Course Syllabus for Subject: "${selectedSubject}"` 
                        : `Single Chapter Study Roadmap for Chapter: "${specificChapter || 'Chapter 1'}" in Subject: "${selectedSubject}"`;
                    
                    promptMsg = `Create an official university college syllabus course (${roadmapTypeStr}). Degree: ${degreeName}. Term: ${semLabel}. Subject: ${selectedSubject}. Target Level: ${gradeLevel}. Instruction Language: ${language}. Include sequential modules, lab practicals, exam weightage marks, and ALL official textbook semester curriculum topics from start to finish.`;
                } else {
                    const roadmapTypeStr = scopeType === 'full_subject' 
                        ? `Full Official Board Textbook Syllabus Roadmap covering ALL chapters from Chapter 1 to final chapter for ${selectedSubject}` 
                        : `Single Chapter Textbook Roadmap for Chapter: "${specificChapter || 'Chapter 1'}" in Subject: ${selectedSubject}`;
                    
                    promptMsg = `Create an official textbook-aligned ${roadmapTypeStr}. Target Standard / Grade Level: Class ${gradeLevel}. Board Alignment: ${board}. Medium of Instruction: ${language}. CRITICAL REQUIREMENT: You MUST include ALL official textbook chapters for Class ${gradeLevel} ${board} ${selectedSubject} from Chapter 1 to the end without omitting any chapter. Provide 12 to 16 sequential roadmap nodes covering the complete official textbook syllabus with board exam weightage marks.`;
                }
            } else {
                if (!customTopic.trim()) {
                    alert('Please enter your custom topic / skill name.');
                    setGenLoading(false);
                    return;
                }
                promptMsg = `Create a custom skill roadmap course for topic: "${customTopic}". Medium of Instruction: ${language}. Include sequential learning nodes and practical projects.`;
            }

            const res = await minervaApi.sendChat(token, promptMsg, undefined, undefined, false, true, undefined, undefined, undefined, selectedSubject);
            
            const sid = res.metadata?.session_id || res.session_id;
            if (res.success && sid) {
                setShowCreateModal(false);
                navigate(`/future-education/session/${sid}`);
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

    // Helper: Dynamic Official Textbook Chapters based on Subject and Grade Level
    const getSubjectChapterList = (subjectName: string, grade: string): string[] => {
        const subLower = (subjectName || '').toLowerCase();
        const is12th = grade.startsWith('12') || grade === '12';
        const is11th = grade.startsWith('11') || grade === '11';

        // 1. GUJARATI (ધોરણ 11 vs ધોરણ 12 ગુજરાતી)
        if (subLower.includes('gujarat')) {
            if (is12th) {
                return [
                    'Chapter 1: ક્રોધી સ્વભાવને જીતવો ને (પદ - ગંગાસતી)',
                    'Chapter 2: કુસુમનું કઠણ તપ (નવલકથાખંડ - ગોવર્ધનરામ ત્રિપાઠી)',
                    'Chapter 3: એમ ઉગાર્યો ચંદ્રહાસ (આખ્યાનખંડ - પ્રેમાનંદ)',
                    'Chapter 4: સત્યાગ્રહાશ્રમ (આત્મકથાખંડ - વિનોબા ભાબે)',
                    'Chapter 5: થીગડું (વાર્તા - સુરેશ જોષી)',
                    'Chapter 6: ઉછીનું માંગનારાઓ (હાસ્ય નિબંધ - નટવરલાલ બૂચ)',
                    'Chapter 7: શ્યામ રંગ સમીપે (પદ - દયારામ)',
                    'Chapter 8: અમરનાથની યાત્રાએ (પ્રવાસ નિબંધ - વિનોદિની નીલકંઠ)',
                    'Chapter 9: ભવના અબોલા (લોકગીત)',
                    'Chapter 10: યુધિષ્ઠિર યુદ્ધવિષાદ (નાટ્યાંશ - ઉમાશંકર જોશી)',
                    'Chapter 11: ઉર્મિલા (ખંડકાવ્ય - કવિ કાન્ત)',
                    'Chapter 12: પુંજા મેજરની લગની (વાર્તા - રઘુવીર ચૌધરી)',
                    'Chapter 13: મહાત્માના માણસ (વાર્તા - ધીરુબેન પટેલ)',
                    'Chapter 14: છેલ્લું દર્શન (સોનેટ - નિરંજન ભગત)',
                    'Chapter 15: ધોરણ 12 ગુજરાતી વ્યાકરણ & લેખન (સંયોજકો, વાક્યરૂપાંતર, વિચારવિસ્તાર)'
                ];
            } else {
                return [
                    'Chapter 1: જાગને જાદવા (પદ - નરસિંહ મહેતા)',
                    'Chapter 2: ખરી મા (વાર્તા - મહાશ્વેતા દેવી)',
                    'Chapter 3: નાવિક વળતો બોલિયો (પદ - ભાલણ)',
                    'Chapter 4: પોસ્ટ ઑફિસ (વાર્તા - ધૂમકેતુ)',
                    'Chapter 5: પરાજયની જીત (ખંડકાવ્ય - સુરેશ જોષી)',
                    'Chapter 6: સુન્દરીની શોધ (આત્મકથાખંડ - જયશંકર \'સુન્દરી\')',
                    'Chapter 7: વનમાં ચાંદલિયો ઊગ્યો (લોકગીત)',
                    'Chapter 8: બુરાઈના દ્વાર પરથી (નવલિકા - ઝવેરચંદ મેઘાણી)',
                    'Chapter 9: ચક્રવાકમિથુન (ખંડકાવ્ય - કાન્ત)',
                    'Chapter 10: બે લઘુકથાઓ (ઠેસ & સાચો રસ્તો)',
                    'Chapter 11: ભવિષ્યવેત્તા (હાસ્ય વાર્તા)',
                    'Chapter 12: ધોરણ 11 ગુજરાતી વ્યાકરણ & લેખન (સમાસ, કહેવતો, વિચારવિસ્તાર)'
                ];
            }
        }

        // 2. ACCOUNTANCY (નામાના મૂળતત્વો Std 11 vs Std 12)
        if (subLower.includes('account')) {
            if (is12th) {
                return [
                    'Chapter 1: ભાગીદારી વિષય પ્રવેશ (Partnership Fundamentals)',
                    'Chapter 2: ભાગીદારી પેઢીના વાર્ષિક હિસાબો (Final Accounts)',
                    'Chapter 3: પાઘડીનું મૂલ્યાંકન (Valuation of Goodwill)',
                    'Chapter 4: ભાગીદારીનું પુનર્ગઠન (Reconstitution of Partnership)',
                    'Chapter 5: નવા ભાગીદારનો પ્રવેશ (Admission of Partner)',
                    'Chapter 6: ભાગીદારની નિવૃત્તિ / મૃત્યુ (Retirement of Partner)',
                    'Chapter 7: ભાગીદારી પેઢીનું વિસર્જન (Dissolution of Firm)',
                    'Chapter 8: શેરમૂડીના વ્યવહારો (Share Capital Accounting)',
                    'Chapter 9: ડિબેન્ચરના વ્યવહારો (Issue of Debentures)',
                    'Chapter 10: કંપનીના વાર્ષિક હિસાબો (Company Final Accounts)',
                    'Chapter 11: નાણાકીય પત્રકોનું વિશ્લેષણ & ગુણોત્તર (Ratio Analysis)',
                    'Chapter 12: રોકડ પ્રવાહ પત્રક (Cash Flow Statement - CFS)'
                ];
            } else {
                return [
                    'Chapter 1: હિસાબી પદ્ધતિ અને પારિભાષિક શબ્દો (Introduction)',
                    'Chapter 2: વ્યવહારોની દ્વિઅસર અને ખાતાના પ્રકારો (Dual Effect)',
                    'Chapter 3: આમનોંધ અને વસ્તુ-સેવાઓ કર (Journal & GST)',
                    'Chapter 4: સહાયક ચોપડાઓ (Subsidiary Books)',
                    'Chapter 5: રોકડમેળ અને તેના પ્રકારો (Cash Book)',
                    'Chapter 6: બેંક સિલકમેળ (Bank Reconciliation Statement)',
                    'Chapter 7: કાચું સરવૈયું અને ભૂલ સુધારણા (Trial Balance)',
                    'Chapter 8: ઘસારાના હિસાબો (Depreciation Accounting)',
                    'Chapter 9: જોગવાઈઓ અને અનામતો (Provisions and Reserves)',
                    'Chapter 10: એકાંકી વેપારીના વાર્ષિક હિસાબો (Sole Trader Final Accounts)',
                    'Chapter 11: અપૂર્ણ નોંધો પરથી હિસાબો (Single Entry System)'
                ];
            }
        }

        // 3. ECONOMICS (અર્થશાસ્ત્ર Std 11 vs Std 12)
        if (subLower.includes('econ')) {
            if (is12th) {
                return [
                    'Chapter 1: અર્થશાસ્ત્રમાં આલેખ (Graphs in Economics)',
                    'Chapter 2: વૃદ્ધિ અને વિકાસના નિર્દેશકો (Growth Indicators)',
                    'Chapter 3: નાણું અને ફુગાવો (Money and Inflation)',
                    'Chapter 4: બેંકિંગ અને નાણાકીય નીતિ (Banking & Policy)',
                    'Chapter 5: ગરીબી (Poverty & Poverty Alleviation)',
                    'Chapter 6: બેરોજગારી (Unemployment & Employment Schemes)',
                    'Chapter 7: વસ્તી (Population Demographics)',
                    'Chapter 8: કૃષિ ક્ષેત્ર (Agricultural Sector)',
                    'Chapter 9: વિદેશ વેપાર (Foreign Trade & BoP)',
                    'Chapter 10: ઉદ્યોગ ક્ષેત્ર (Industrial Sector & MSME)',
                    'Chapter 11: સ્થાનાંતર અને શહેરીકરણ (Migration & Urbanisation)'
                ];
            } else {
                return [
                    'Chapter 1: અર્થશાસ્ત્ર વિષય પ્રવેશ (Introduction to Economics)',
                    'Chapter 2: મૂળભૂત ખ્યાલો અને સંકલ્પનાઓ (Basic Concepts)',
                    'Chapter 3: માંગ અને માંગની સાપેક્ષતા (Demand Theory)',
                    'Chapter 4: પુરવઠો અને પુરવઠાની સાપેક્ષતા (Supply Theory)',
                    'Chapter 5: આવક અને ખર્ચના ખ્યાલો (Revenue & Cost Functions)',
                    'Chapter 6: બજાર અને બજારના પ્રકારો (Forms of Market)',
                    'Chapter 7: ભારતીય અર્થતંત્ર (Indian Economy)',
                    'Chapter 8: આર્થિક સુધારાઓ 1991 (LPG Policies)',
                    'Chapter 9: રાષ્ટ્રીય આવક (National Income Accounting)',
                    'Chapter 10: અંદાજપત્ર (Government Budget & Taxation)',
                    'Chapter 11: આર્થિક વિચારો (Economic Thoughts)'
                ];
            }
        }

        // 4. STATISTICS (આંકડાશાસ્ત્ર Std 11 vs Std 12)
        if (subLower.includes('stat')) {
            if (is12th) {
                return [
                    'Chapter 1: સૂચક આંક (Index Numbers - Laspeyres, Paasche, Fisher)',
                    'Chapter 2: રેખીય સહસંબંધ (Linear Correlation)',
                    'Chapter 3: રેખીય નિયતસંબંધ (Linear Regression)',
                    'Chapter 4: સામાયિક શ્રેણી (Time Series Analysis)',
                    'Chapter 5: સંભાવના (Probability Theory & Bayes Theorem)',
                    'Chapter 6: યાદચ્છિક ચલ અને દ્વિપદી વિતરણ (Random Variables)',
                    'Chapter 7: પ્રમાણ્ય વિતરણ (Normal Distribution & Z-Scores)',
                    'Chapter 8: લક્ષ (Limits & Continuity)',
                    'Chapter 9: વિકલન (Differentiation & Marginal Analysis)'
                ];
            } else {
                return [
                    'Chapter 1: માહિતીનું એકત્રીકરણ (Collection of Data)',
                    'Chapter 2: માહિતીનું પ્રસ્તુતીકરણ (Tabulation of Data)',
                    'Chapter 3: મધ્યવર્તી સ્થિતિના માપો (Mean, Median, Mode)',
                    'Chapter 4: પ્રસારમાન (Range, SD, Quartile Deviation)',
                    'Chapter 5: આવૃત્તિ વિતરણની વિષમતા (Skewness)',
                    'Chapter 6: ક્રમચય, સંચય અને દ્વિપદી પ્રમેય (Permutations & Combinations)',
                    'Chapter 7: નિદર્શન પદ્ધતિઓ (Sampling Techniques)',
                    'Chapter 8: વિધેય (Functions & Functional Relations)',
                    'Chapter 9: ગુણોત્તર શ્રેણી (Geometric Progression - GP)'
                ];
            }
        }

        // 5. BUSINESS STUDIES / OCM (વાણિજ્ય વ્યવસ્થા અને સંચાલન Std 11 vs Std 12)
        if (subLower.includes('business') || subLower.includes('commerc') || subLower.includes('o.c.m') || subLower.includes('ocm')) {
            if (is12th) {
                return [
                    'Chapter 1: સંચાલનનું સ્વરૂપ અને મહત્વ (Nature & Significance of Management)',
                    'Chapter 2: સંચાલનના સિદ્ધાંતો (Principles of Management)',
                    'Chapter 3: આયોજન (Planning & Strategic Goals)',
                    'Chapter 4: વ્યવસ્થાતંત્ર (Organising & Structure)',
                    'Chapter 5: કર્મચારી વ્યવસ્થા (Staffing & Recruitment)',
                    'Chapter 6: દોરવણી (Directing & Leadership)',
                    'Chapter 7: અંકુશ (Controlling & Feedback)',
                    'Chapter 8: નાણાકીય સંચાલન (Financial Management)',
                    'Chapter 9: નાણાકીય બજાર (Financial Markets & SEBI)',
                    'Chapter 10: બજારીય સંચાલન (Marketing Management & 4Ps)',
                    'Chapter 11: ગ્રાહક સુરક્ષા (Consumer Protection Act)',
                    'Chapter 12: ધંધાકીય પર્યાવરણ (Business Environment)'
                ];
            } else {
                return [
                    'Chapter 1: ધંધાનું સ્વરૂપ, હેતુ અને કાર્યક્ષેત્ર (Nature & Scope of Business)',
                    'Chapter 2: ધંધાકીય સેવાઓ - 1 (Banking, Post, Insurance)',
                    'Chapter 3: ધંધાકીય સેવાઓ - 2 (Warehousing & Transport)',
                    'Chapter 4: માહિતી સંચાર, ઈ-કોમર્સ અને આઉટસોર્સિંગ (E-Commerce)',
                    'Chapter 5: ધંધાકીય સાહસના સ્વરૂપો - 1 (Sole Trader & Partnership)',
                    'Chapter 6: ધંધાકીય સાહસના સ્વરૂપો - 2 (Joint Stock Company & Co-op)',
                    'Chapter 7: જાહેર ક્ષેત્ર, ખાનગી ક્ષેત્ર અને વૈશ્વિક સાહસો (Public & Global)',
                    'Chapter 8: ધંધાકીય મૂડીના પ્રાપ્તિસ્થાનો (Sources of Business Finance)',
                    'Chapter 9: આંતરિક વેપાર (Internal Trade & Retail)',
                    'Chapter 10: આંતરરાષ્ટ્રીય વેપાર (International Trade)',
                    'Chapter 11: ધંધાની સામાજિક જવાબદારીઓ (Social Responsibility & Ethics)'
                ];
            }
        }

        // 6. SECRETARIAL PRACTICE / SPCC (Std 11 vs Std 12)
        if (subLower.includes('spcc') || subLower.includes('secretar') || subLower.includes('correspondence') || subLower.includes('s.p.c.c')) {
            if (is12th) {
                return [
                    'Chapter 1: બેંક પત્રવ્યવહાર (Bank Correspondence)',
                    'Chapter 2: સરકારી વિભાગો સાથે પત્રવ્યવહાર (Government Dept Letters)',
                    'Chapter 3: આંતર-વિભાગીય અને કર્મચારી પત્રવ્યવહાર (Inter-departmental)',
                    'Chapter 4: વીમા પત્રવ્યવહાર (Insurance Correspondence)',
                    'Chapter 5: ઈ-કોમ્યુનિકેશન અને તેના પ્રકારો (E-Communication)',
                    'Chapter 6: શેર બહાર પાડવા અને શેર વહેંચણી (Share Issue & Allotment)',
                    'Chapter 7: શેર ફેરબદલી અને ભૌતિકીકરણ (Share Transfer & Demat)',
                    'Chapter 8: ડિબેન્ચર અને તેના પ્રકારો (Debentures)',
                    'Chapter 9: કંપનીના સંચાલકો (Company Directors & KMP)',
                    'Chapter 10: કંપનીની સભાઓ (Company Meetings & Resolutions)',
                    'Chapter 11: કંપનીનું વિસર્જન (Winding Up & Dissolution)'
                ];
            } else {
                return [
                    'Chapter 1: વાણિજ્યિક પત્રવ્યવહારનો અર્થ અને શૈલી (Commercial Correspondence)',
                    'Chapter 2: અસરકારક પત્રવ્યવહાર અને તેની શૈલીઓ (Effective Writing)',
                    'Chapter 3: વેપારી પૂછપરછ અને તેના પ્રત્યુત્તરના પત્રો (Inquiry & Quotation)',
                    'Chapter 4: ઓર્ડર આપતા, અમલ કરતા અને રદ કરતા પત્રો (Orders & Execution)',
                    'Chapter 5: ફરિયાદ અને તેના નિકાલના પત્રો (Complaints & Adjustment)',
                    'Chapter 6: ઉઘરાણી અને પતવટના પત્રો (Collection Letters)',
                    'Chapter 7: સેક્રેટરીનો અર્થ, પ્રકારો અને ગુણો (Secretary Duties)',
                    'Chapter 8: કંપનીની સ્થાપના વિધિ (Company Incorporation)',
                    'Chapter 9: આવેદનપત્ર (Memorandum of Association - MOA)',
                    'Chapter 10: નિયમનપત્ર (Articles of Association - AOA)',
                    'Chapter 11: વિજ્ઞાપનપત્ર (Prospectus & Statutory Filing)'
                ];
            }
        }

        // 7. MATHEMATICS (Class 1-5, Class 6, Class 7, Class 8, Class 9, Class 10, Class 11, Class 12)
        if (subLower.includes('math')) {
            if (is12th) {
                return [
                    'Chapter 1: Relations and Functions',
                    'Chapter 2: Inverse Trigonometric Functions',
                    'Chapter 3: Matrices & Determinants',
                    'Chapter 4: Continuity and Differentiability',
                    'Chapter 5: Applications of Derivatives (AOD)',
                    'Chapter 6: Integrals & Integration Techniques',
                    'Chapter 7: Applications of Integrals (Area under Curves)',
                    'Chapter 8: Differential Equations',
                    'Chapter 9: Vector Algebra',
                    'Chapter 10: Three Dimensional Geometry (3D)',
                    'Chapter 11: Linear Programming (LPP)',
                    'Chapter 12: Probability & Conditional Probability'
                ];
            } else if (is11th) {
                return [
                    'Chapter 1: Sets, Relations & Functions',
                    'Chapter 2: Trigonometric Functions & Equations',
                    'Chapter 3: Complex Numbers & Quadratic Equations',
                    'Chapter 4: Linear Inequalities',
                    'Chapter 5: Permutations and Combinations',
                    'Chapter 6: Binomial Theorem',
                    'Chapter 7: Sequences and Series (AP & GP)',
                    'Chapter 8: Straight Lines & Conic Sections',
                    'Chapter 9: Introduction to Three Dimensional Geometry',
                    'Chapter 10: Limits and Derivatives',
                    'Chapter 11: Statistics & Dispersion',
                    'Chapter 12: Probability Theory'
                ];
            } else if (grade === '9') {
                return [
                    'Chapter 1: Number Systems (સંખ્યા પદ્ધતિ)',
                    'Chapter 2: Polynomials (બહુપદીઓ)',
                    'Chapter 3: Coordinate Geometry (યામ ભૂમિતિ)',
                    'Chapter 4: Linear Equations in Two Variables (દ્વિચલ રેખીય સમીકરણો)',
                    'Chapter 5: Introduction to Euclid Geometry (યુક્લિડની ભૂમિતિનો પરિચય)',
                    'Chapter 6: Lines and Angles (રેખાઓ અને ખૂણાઓ)',
                    'Chapter 7: Triangles (ત્રિકોણ)',
                    'Chapter 8: Quadrilaterals (ચતુષ્કોણ)',
                    'Chapter 9: Circles (વર્તુળ)',
                    'Chapter 10: Heron\'s Formula (હેરોનનું સૂત્ર)',
                    'Chapter 11: Surface Areas and Volumes (પૃષ્ઠફળ અને ઘનફળ)',
                    'Chapter 12: Statistics (આંકડાશાસ્ત્ર)'
                ];
            } else if (grade === '8') {
                return [
                    'Chapter 1: Rational Numbers (સંમેય સંખ્યાઓ)',
                    'Chapter 2: Linear Equations in One Variable (એકચલ રેખીય સમીકરણ)',
                    'Chapter 3: Understanding Quadrilaterals (ચતુષ્કોણની સમજ)',
                    'Chapter 4: Data Handling (માહિતીનું નિયામન)',
                    'Chapter 5: Squares and Square Roots (વર્ગ અને વર્ગમૂળ)',
                    'Chapter 6: Cubes and Cube Roots (ઘન અને ઘનમૂળ)',
                    'Chapter 7: Comparing Quantities (રાશિઓની સરખામણી)',
                    'Chapter 8: Algebraic Expressions and Identities (બેજિક પદાવલીઓ)',
                    'Chapter 9: Mensuration (ક્ષેત્રફળ અને માપન)',
                    'Chapter 10: Exponents and Powers (ઘાત અને ઘાતાંક)',
                    'Chapter 11: Direct and Inverse Proportions (સમપ્રમાણ અને વ્યસ્ત પ્રમાણ)',
                    'Chapter 12: Factorisation (અવયવીકરણ)',
                    'Chapter 13: Introduction to Graphs (આલેખનો પરિચય)'
                ];
            } else if (grade === '7') {
                return [
                    'Chapter 1: Integers (પૂર્ણાંક સંખ્યાઓ)',
                    'Chapter 2: Fractions and Decimals (અપૂર્ણાંક અને દશાંશ સંખ્યાઓ)',
                    'Chapter 3: Data Handling (માહિતીનું નિયામન)',
                    'Chapter 4: Simple Equations (સાદા સમીકરણ)',
                    'Chapter 5: Lines and Angles (રેખા અને ખૂણા)',
                    'Chapter 6: The Triangle and its Properties (ત્રિકોણ અને તેના ગુણધર્મો)',
                    'Chapter 7: Comparing Quantities (રાશીઓની સરખામણી)',
                    'Chapter 8: Rational Numbers (સંમેય સંખ્યાઓ)',
                    'Chapter 9: Perimeter and Area (પરિમિતિ અને ક્ષેત્રફળ)',
                    'Chapter 10: Algebraic Expressions (બીજગણિતીય પદાવલી)',
                    'Chapter 11: Exponents and Powers (ઘાત અને ઘાતાંક)',
                    'Chapter 12: Symmetry (સિમિતિ)'
                ];
            } else if (grade === '6') {
                return [
                    'Chapter 1: Knowing Our Numbers (આપણી સંખ્યાઓને જાણવી)',
                    'Chapter 2: Whole Numbers (પૂર્ણ સંખ્યાઓ)',
                    'Chapter 3: Playing with Numbers (સંખ્યા સાથે રમત)',
                    'Chapter 4: Basic Geometrical Ideas (પાયાના ભૂમિતિના ખ્યાલો)',
                    'Chapter 5: Understanding Elementary Shapes (પ્રારંભિક આકારોની સમજ)',
                    'Chapter 6: Integers (પૂર્ણાંક સંખ્યાઓ)',
                    'Chapter 7: Fractions (અપૂર્ણાંક સંખ્યાઓ)',
                    'Chapter 8: Decimals (દશાંશ સંખ્યાઓ)',
                    'Chapter 9: Data Handling (માહિતીનું નિયામન)',
                    'Chapter 10: Mensuration (માપન)',
                    'Chapter 11: Algebra (બીજગણિત)',
                    'Chapter 12: Ratio and Proportion (ગુણોત્તર અને પ્રમાણ)'
                ];
            } else if (['1', '2', '3', '4', '5'].includes(grade)) {
                return [
                    'Chapter 1: ક્યાંથી જોવું? (Where to Look From)',
                    'Chapter 2: સંખ્યાની ગમ્મત (Fun with Numbers)',
                    'Chapter 3: આપો અને લો (Give and Take)',
                    'Chapter 4: લાંબુ અને ટૂંકું (Long and Short)',
                    'Chapter 5: આકાર અને ભાત (Shapes and Designs)',
                    'Chapter 6: આપ-લેની ગમ્મત (Fun with Give and Take)',
                    'Chapter 7: સમય વહી જાય છે (Time Goes On)',
                    'Chapter 8: કોણ ભારે છે? (Who is Heavier?)',
                    'Chapter 9: કેટલા વખત? (How Many Times?)',
                    'Chapter 10: ભાતની પેટર્ન (Play with Patterns)',
                    'Chapter 11: જગ અને મગ (Jugs and Mugs)',
                    'Chapter 12: આપણે સરખા ભાગે વહેંચી શકીએ? (Can We Share?)',
                    'Chapter 13: સ્માર્ટ ચાર્ટ (Smart Charts)',
                    'Chapter 14: રૂપિયા અને પૈસા (Rupees and Paise)'
                ];
            } else {
                return [
                    'Chapter 1: Real Numbers (વાસ્તવિક સંખ્યાઓ)',
                    'Chapter 2: Polynomials (બહુપદીઓ)',
                    'Chapter 3: Pair of Linear Equations in Two Variables (દ્વિચલ રેખીય સમીકરણ)',
                    'Chapter 4: Quadratic Equations (દ્વિઘાત સમીકરણ)',
                    'Chapter 5: Arithmetic Progressions (સમાંતર શ્રેણી)',
                    'Chapter 6: Triangles (ત્રિકોણ)',
                    'Chapter 7: Coordinate Geometry (યામ ભૂમિતિ)',
                    'Chapter 8: Introduction to Trigonometry (ત્રિકોણમિતિનો પરિચય)',
                    'Chapter 9: Some Applications of Trigonometry (ત્રિકોણમિતિના ઉપયોગો)',
                    'Chapter 10: Circles (વર્તુળ)',
                    'Chapter 11: Areas Related to Circles (વર્તુળ સંબંધિત ક્ષેત્રફળ)',
                    'Chapter 12: Surface Areas and Volumes (પૃષ્ઠફળ અને ઘનફળ)',
                    'Chapter 13: Statistics (આંકડાશાસ્ત્ર)',
                    'Chapter 14: Probability (સંભાવના)'
                ];
            }
        }

        // 8. PHYSICS (Class 11 vs Class 12)
        if (subLower.includes('physic')) {
            if (is12th) {
                return [
                    'Chapter 1: Electric Charges and Fields',
                    'Chapter 2: Electrostatic Potential and Capacitance',
                    'Chapter 3: Current Electricity & Ohm\'s Law',
                    'Chapter 4: Moving Charges and Magnetism',
                    'Chapter 5: Magnetism and Matter',
                    'Chapter 6: Electromagnetic Induction (EMI)',
                    'Chapter 7: Alternating Current (AC Circuits)',
                    'Chapter 8: Electromagnetic Waves (EM Waves)',
                    'Chapter 9: Ray Optics and Optical Instruments',
                    'Chapter 10: Wave Optics & Interference',
                    'Chapter 11: Dual Nature of Radiation and Matter',
                    'Chapter 12: Atoms & Spectral Series',
                    'Chapter 13: Nuclei & Nuclear Fission/Fusion',
                    'Chapter 14: Semiconductor Electronics: Materials & Devices'
                ];
            } else {
                return [
                    'Chapter 1: Units and Measurements & Error Analysis',
                    'Chapter 2: Motion in a Straight Line (Kinematics)',
                    'Chapter 3: Motion in a Plane & Vectors',
                    'Chapter 4: Laws of Motion & Friction',
                    'Chapter 5: Work, Energy and Power',
                    'Chapter 6: System of Particles and Rotational Motion',
                    'Chapter 7: Gravitation & Planetary Motion',
                    'Chapter 8: Mechanical Properties of Solids (Elasticity)',
                    'Chapter 9: Mechanical Properties of Fluids (Hydrostatics)',
                    'Chapter 10: Thermal Properties of Matter & Heat Transfer',
                    'Chapter 11: Thermodynamics & Heat Engines',
                    'Chapter 12: Kinetic Theory of Gases',
                    'Chapter 13: Oscillations & Simple Harmonic Motion',
                    'Chapter 14: Waves & Sound Doppler Effect'
                ];
            }
        }

        // 9. CHEMISTRY (Class 11 vs Class 12)
        if (subLower.includes('chemist')) {
            if (is12th) {
                return [
                    'Chapter 1: Solutions & Colligative Properties',
                    'Chapter 2: Electrochemistry & Nernst Equation',
                    'Chapter 3: Chemical Kinetics & Rate Laws',
                    'Chapter 4: d- and f-Block Elements',
                    'Chapter 5: Coordination Compounds & IUPAC Naming',
                    'Chapter 6: Haloalkanes and Haloarenes',
                    'Chapter 7: Alcohols, Phenols and Ethers',
                    'Chapter 8: Aldehydes, Ketones and Carboxylic Acids',
                    'Chapter 9: Amines & Diazonium Salts',
                    'Chapter 10: Biomolecules (Carbohydrates, Proteins, DNA)'
                ];
            } else {
                return [
                    'Chapter 1: Some Basic Concepts of Chemistry (Mole Concept)',
                    'Chapter 2: Structure of Atom & Quantum Numbers',
                    'Chapter 3: Periodicity in Properties',
                    'Chapter 4: Chemical Bonding and Molecular Structure',
                    'Chapter 5: Chemical Thermodynamics & Energetics',
                    'Chapter 6: Chemical & Ionic Equilibrium',
                    'Chapter 7: Redox Reactions & Oxidation Numbers',
                    'Chapter 8: Organic Chemistry: Basic Principles & Techniques',
                    'Chapter 9: Hydrocarbons (Alkanes, Alkenes, Alkynes)'
                ];
            }
        }

        // 10. BIOLOGY (Class 11 vs Class 12)
        if (subLower.includes('bio')) {
            if (is12th) {
                return [
                    'Chapter 1: Sexual Reproduction in Flowering Plants',
                    'Chapter 2: Human Reproduction & Embryology',
                    'Chapter 3: Reproductive Health & Contraception',
                    'Chapter 4: Principles of Inheritance and Variation',
                    'Chapter 5: Molecular Basis of Inheritance',
                    'Chapter 6: Evolution & Natural Selection',
                    'Chapter 7: Human Health and Diseases',
                    'Chapter 8: Microbes in Human Welfare',
                    'Chapter 9: Biotechnology: Principles and Processes',
                    'Chapter 10: Biotechnology and its Applications',
                    'Chapter 11: Organisms and Populations',
                    'Chapter 12: Ecosystem & Nutrient Cycling',
                    'Chapter 13: Biodiversity and Conservation'
                ];
            } else {
                return [
                    'Chapter 1: The Living World & Biological Classification',
                    'Chapter 2: Plant Kingdom & Animal Kingdom',
                    'Chapter 3: Morphology & Anatomy of Flowering Plants',
                    'Chapter 4: Structural Organisation in Animals',
                    'Chapter 5: Cell: The Unit of Life',
                    'Chapter 6: Biomolecules',
                    'Chapter 7: Cell Cycle and Cell Division',
                    'Chapter 8: Photosynthesis in Higher Plants',
                    'Chapter 9: Respiration in Plants',
                    'Chapter 10: Plant Growth and Development',
                    'Chapter 11: Breathing and Exchange of Gases',
                    'Chapter 12: Body Fluids and Circulation',
                    'Chapter 13: Excretory Products and their Elimination',
                    'Chapter 14: Locomotion and Movement',
                    'Chapter 15: Neural Control and Coordination',
                    'Chapter 16: Chemical Coordination and Integration'
                ];
            }
        }

        // 11. GENERAL SCIENCE (Class 1 to 10)
        if (subLower.includes('scien')) {
            return [
                'Chapter 1: Chemical Reactions and Equations (રાસાયણિક પ્રક્રિયાઓ)',
                'Chapter 2: Acids, Bases and Salts (એસિડ, બેઇઝ અને ક્ષાર)',
                'Chapter 3: Metals and Non-Metals (ધાતુઓ અને અધાતુઓ)',
                'Chapter 4: Carbon and Its Compounds (કાર્બન અને તેના સંયોજનો)',
                'Chapter 5: Life Processes (જૈવિક ક્રિયાઓ)',
                'Chapter 6: Control and Coordination (નિયંત્રણ અને સંકલન)',
                'Chapter 7: How do Organisms Reproduce? (સજીવો કેવી રીતે પ્રજનન કરે છે?)',
                'Chapter 8: Heredity and Evolution (આનુવંશિકતા અને વિકાસ)',
                'Chapter 9: Light - Reflection and Refraction (પ્રકાશ - પરાવર્તન અને વક્રીભવન)',
                'Chapter 10: Human Eye and Colourful World (માનવ આંખ અને રંગબેરંગી દુનિયા)',
                'Chapter 11: Electricity (વિદ્યુત)',
                'Chapter 12: Magnetic Effects of Electric Current (વિદ્યુતપ્રવાહની ચુંબકીય અસરો)',
                'Chapter 13: Our Environment (આપણું પર્યાવરણ)',
                'Chapter 14: Sustainable Management of Natural Resources (કુદરતી સ્ત્રોતોનું પ્રબંધન)'
            ];
        }

        // 12. SOCIAL SCIENCE (Class 1 to 10)
        if (subLower.includes('social') || subLower.includes('histor') || subLower.includes('geo') || subLower.includes('civic') || subLower.includes('politi')) {
            return [
                'Chapter 1: Heritage of India (ભારતનો વારસો)',
                'Chapter 2: Cultural Heritage of India: Traditional Handicrafts (સાંસ્કૃતિક વારસો)',
                'Chapter 3: Cultural Heritage of India: Sculpture and Architecture (શિલ્પ-સ્થાપત્ય)',
                'Chapter 4: Literary Heritage of India (સાહિત્યિક વારસો)',
                'Chapter 5: India\'s Heritage of Science and Technology (વિજ્ઞાન અને ટેકનોલોજી)',
                'Chapter 6: Places of Indian Cultural Heritage (સાંસ્કૃતિક વારસાના સ્થળો)',
                'Chapter 7: Preservation of Our Heritage (આપણા વારસાનું જતન)',
                'Chapter 8: Natural Resources (કુદરતી સંસાધનો)',
                'Chapter 9: Forests and Wildlife Resources (વન અને વન્યજીવ સંસાધન)',
                'Chapter 10: India: Agriculture (ભારત: કૃષિ)',
                'Chapter 11: Water Resources (જળ સંસાધનો)',
                'Chapter 12: Mineral and Energy Resources (ખનિજ અને શક્તિના સંસાધનો)',
                'Chapter 13: Manufacturing Industries (ઉત્પાદન ઉદ્યોગો)',
                'Chapter 14: Transportation, Communication and Trade (પરિવહન અને વ્યાપાર)',
                'Chapter 15: Economic Development (આર્થિક વિકાસ)',
                'Chapter 16: Economic Liberalization and Globalization (ઉદારીકરણ અને વૈશ્વિકીકરણ)',
                'Chapter 17: Poverty and Unemployment (ગરીબી અને બેરોજગારી)',
                'Chapter 18: Price Rise and Consumer Awareness (ભાવવધારો અને ગ્રાહક જાગૃતિ)',
                'Chapter 19: Human Development (માનવ વિકાસ)',
                'Chapter 20: Social Problems of India and Challenges (સામાજિક સમસ્યાઓ)',
                'Chapter 21: Social Change (સામાજિક પરિવર્તન)'
            ];
        }

        // 13. COMPUTER & IT
        if (subLower.includes('data') || subLower.includes('programming') || subLower.includes('computer') || subLower.includes('c++') || subLower.includes('java') || subLower.includes('python') || subLower.includes('it')) {
            return [
                'Unit 1: Computer Fundamentals & Hardware Architecture',
                'Unit 2: Networking Concepts, Internet Protocols & Cyber Safety',
                'Unit 3: Algorithmic Thinking & Flowchart Design',
                'Unit 4: Object-Oriented Programming (OOP) Principles',
                'Unit 5: Linear Data Structures (Arrays, Linked Lists, Stacks, Queues)',
                'Unit 6: Non-Linear Data Structures (Trees, Binary Search Trees, Graphs)',
                'Unit 7: Sorting & Searching Algorithms (Bubble, Quick, Merge)',
                'Unit 8: Database Management Systems (DBMS) & SQL Queries',
                'Unit 9: Operating Systems, Memory & Process Management',
                'Unit 10: Web Development Basics (HTML5, CSS3, JavaScript)'
            ];
        }

        // Default Fallback
        return [
            'Chapter 1: Introduction to Core Concepts & Principles',
            'Chapter 2: Fundamental Theories, Definitions & Axioms',
            'Chapter 3: Analytical Framework & Methodological Approaches',
            'Chapter 4: Practical Applications & Standard Blueprints',
            'Chapter 5: Advanced Case Studies & Exercise Problem Sets',
            'Chapter 6: Board & University Comprehensive Revision Unit'
        ];
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

        // School Standards Branching (Class 1 to 12 & Streams)
        if (['1', '2', '3', '4', '5'].includes(gradeLevel)) {
            return ['Mathematics', 'Environmental Studies (EVS / આસપાસ)', 'English Language & Literature', 'Gujarati Subject (ગુજરાતી વિષય)', 'Hindi Subject (हिंदी विषय)', 'General Knowledge (GK)', 'Computer / Drawing'];
        } else if (['6', '7', '8', '9', '10'].includes(gradeLevel)) {
            return ['Mathematics', 'Science (વિજ્ઞાન)', 'Social Science (સામાજિક વિજ્ઞાન)', 'English Language & Literature', 'Gujarati Subject (ગુજરાતી વિષય & સાહિત્ય)', 'Hindi Subject (हिंदी साहित्य एवं व्याकरण)', 'Sanskrit Subject (संस्कृतम्)', 'Computer / IT'];
        } else if (['11_SCI_A', '12_SCI_A'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Mathematics', 'English Core', 'Gujarati Subject (ગુજરાતી વિષય)', 'Hindi Subject (हिंदी विषय)', 'Computer Science / IP'];
        } else if (['11_SCI_B', '12_SCI_B'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Biology', 'English Core', 'Gujarati Subject (ગુજરાતી વિષય)', 'Hindi Subject (हिंदी विषय)', 'Computer Science / IP'];
        } else if (['11_COMMERCE', '12_COMMERCE'].includes(gradeLevel)) {
            return ['Accountancy', 'Business Studies (O.C.M.)', 'Economics', 'Statistics', 'Gujarati Subject (ગુજરાતી વિષય)', 'Hindi Subject (हिंदी विषय)', 'English Core', 'Secretarial Practice (S.P.C.C.)', 'Computer / IT'];
        } else if (['11_ARTS', '12_ARTS'].includes(gradeLevel)) {
            return ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'Philosophy / Logic (તત્વજ્ઞાન)', 'Gujarati Subject (ગુજરાતી વિષય & સાહિત્ય)', 'Hindi Subject (हिंदी साहित्य)', 'Sanskrit Subject (संस्कृतम्)', 'English Core', 'Computer / IT'];
        } else if (['JEE', 'NEET', 'UPSC', 'GATE'].includes(gradeLevel)) {
            return ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General Studies (Paper 1-4)', 'CSAT & Reasoning'];
        } else {
            return ['Mathematics', 'Science (વિજ્ઞાન)', 'Social Science (સામાજિક વિજ્ઞાન)', 'English Language & Literature', 'Hindi Subject (हिंदी विषय)', 'Gujarati Subject (ગુજરાતી વિષય)', 'Sanskrit Subject (संस्कृतम्)', 'Computer / IT'];
        }
    };

    return (
        <div className="min-h-screen bg-[#05030a] text-white p-4 sm:p-8 font-inter relative overflow-y-auto pb-28">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <SchoolContextBar
                    moduleTitle="🗺️ Day-by-Day Roadmaps"
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    selectedSubject={selectedSubject}
                    onSubjectChange={setSelectedSubject}
                />

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

                {/* 🗺️ TEACHER PUBLISHED CLASS CURRICULUM ROADMAP SECTION */}
                <div className="mb-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-black text-white flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-400" /> Official Class {selectedClass} Curriculum Roadmap
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">Live syllabus pacing and chapter completion status set by your Class Teachers.</p>
                        </div>
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl font-mono">
                            Academic Year 2026-27
                        </span>
                    </div>

                    {teacherRoadmapChapters.length === 0 ? (
                        <div className="p-10 text-center bg-[#0B0915]/50 border border-dashed border-white/10 rounded-3xl space-y-3 shadow-inner">
                            <BookOpen size={36} className="text-indigo-400/50 mx-auto" />
                            <h3 className="text-sm font-bold text-white">No Official Class Curriculum Roadmap Published Yet</h3>
                            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                Class Teachers for <strong className="text-indigo-300">{selectedClass}</strong> have not published official syllabus roadmap chapters yet. You can create your own custom AI study courses below.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teacherRoadmapChapters.map((ch, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => { setSelectedChapterDetail(ch); setViewPdfDocument(false); }}
                                    className="p-5 rounded-3xl bg-[#0B0915]/80 border border-white/10 hover:border-indigo-500/50 hover:bg-[#0E0B1F] transition-all cursor-pointer active:scale-[0.99] space-y-3 shadow-xl group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1">
                                                Chapter #{idx + 1} • <span className="underline group-hover:text-indigo-300">Click to Open PDF & Notes</span>
                                            </span>
                                            <h3 className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors">{ch.title}</h3>
                                        </div>

                                        {ch.status === 'COMPLETED' ? (
                                            <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase shrink-0">
                                                ✅ Completed
                                            </span>
                                        ) : ch.status === 'IN_PROGRESS' ? (
                                            <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase shrink-0">
                                                ⚡ In Progress
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase shrink-0">
                                                ⏳ Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Subtopics:</span>
                                        <div className="space-y-1 font-mono text-xs">
                                            {(ch.subtopics || []).map((sub: string, sIdx: number) => (
                                                <div key={sIdx} className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-300 flex items-center gap-1.5 text-[11px]">
                                                    <span className="text-indigo-400 font-bold">•</span>
                                                    <span>{sub}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                                        <span>Duration: {ch.duration || '6 Lectures'}</span>
                                        <span className="text-indigo-400 font-bold flex items-center gap-1">
                                            <FileText size={12} /> Open Chapter PDF & Notes →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider">Additional Self-Study Courses</h2>
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
                                            onChange={e => handleClassChange(e.target.value)}
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
                                            onChange={e => handleBoardChange(e.target.value)}
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
                                            onChange={e => handleSubjectChange(e.target.value)}
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

                                    {/* Specific Chapter Dropdown / Input if Single Chapter mode selected */}
                                    {scopeType === 'single_chapter' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Select Official Curriculum Unit / Chapter</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (specificChapter.startsWith('Custom: ')) {
                                                            setSpecificChapter('');
                                                        } else {
                                                            setSpecificChapter('Custom: ');
                                                        }
                                                    }}
                                                    className="text-[9px] text-indigo-400 hover:underline font-bold"
                                                >
                                                    {specificChapter.startsWith('Custom: ') ? '📋 Select from Chapter List' : '✍️ Enter Custom Topic'}
                                                </button>
                                            </div>

                                            {specificChapter.startsWith('Custom: ') ? (
                                                <input
                                                    type="text"
                                                    value={specificChapter.replace(/^Custom:\s*/, '')}
                                                    onChange={e => setSpecificChapter(`Custom: ${e.target.value}`)}
                                                    placeholder="e.g. Unit 1: Advanced Data Structures & Graph Algorithms"
                                                    className="w-full bg-[#030209] border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                                                />
                                            ) : (
                                                <select
                                                    value={specificChapter}
                                                    onChange={e => setSpecificChapter(e.target.value)}
                                                    className="w-full bg-[#030209] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                                                >
                                                    <option value="">-- Select Chapter --</option>
                                                    {getSubjectChapterList(selectedSubject, gradeLevel).map((ch, cIdx) => (
                                                        <option key={cIdx} value={ch}>{ch}</option>
                                                    ))}
                                                </select>
                                            )}
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

            {/* 📄 CHAPTER DETAIL & TEXTBOOK PDF VIEWER MODAL */}
            {selectedChapterDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0B0915] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative space-y-6">
                        <button
                            onClick={() => setSelectedChapterDetail(null)}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="space-y-1">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded-full font-mono uppercase">
                                Official Class {selectedClass} Chapter Detail
                            </span>
                            <h2 className="text-xl font-black text-white pt-1">{selectedChapterDetail.title}</h2>
                            <p className="text-xs text-gray-400">Duration: {selectedChapterDetail.duration || '5 Lectures'} • Board Textbook Standard</p>
                        </div>

                        {/* Chapter Subtopics list */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Chapter Subtopics & Micro-Concepts</h4>
                            <div className="space-y-2 font-mono">
                                {(selectedChapterDetail.subtopics || []).map((sub: string, sIdx: number) => (
                                    <div key={sIdx} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-gray-200 text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                                                {sIdx + 1}
                                            </span>
                                            <span>{sub}</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-400 font-bold">Concept Ready</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PDF View Container */}
                        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="text-indigo-400" size={18} />
                                    <span className="text-xs font-bold text-white">Official Board Textbook PDF & Solution Notes</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {(selectedChapterDetail.official_pdf_url || selectedChapterDetail.official_book_url) && (
                                        <a
                                            href={selectedChapterDetail.official_pdf_url || selectedChapterDetail.official_book_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                                        >
                                            🌐 Open Official Govt Portal ↗
                                        </a>
                                    )}
                                    <a
                                        href={`/api/v1/minerva/chapter-pdf/download?direct=true&chapterTitle=${encodeURIComponent(selectedChapterDetail.title)}&board=${encodeURIComponent(board)}&standard=${encodeURIComponent(gradeLevel)}&subject=${encodeURIComponent(selectedSubject)}&medium=${encodeURIComponent(language)}&subtopics=${encodeURIComponent((selectedChapterDetail.subtopics || []).join(','))}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                                    >
                                        📥 Download Official PDF ↗
                                    </a>
                                    <button
                                        onClick={() => setViewPdfDocument(!viewPdfDocument)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                    >
                                        {viewPdfDocument ? 'Hide PDF View' : '📄 Preview PDF Content'}
                                    </button>
                                </div>
                            </div>

                            {viewPdfDocument ? (
                                <div className="space-y-3 pt-2">
                                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 flex items-center justify-between text-xs font-bold">
                                        <span>📖 Official Government Textbook Curriculum — {board} Class {gradeLevel} ({language.toUpperCase()} Medium)</span>
                                        <a 
                                            href={`/api/v1/minerva/chapter-pdf/download?direct=true&chapterTitle=${encodeURIComponent(selectedChapterDetail.title)}&board=${encodeURIComponent(board)}&standard=${encodeURIComponent(gradeLevel)}&subject=${encodeURIComponent(selectedSubject)}&medium=${encodeURIComponent(language)}&subtopics=${encodeURIComponent((selectedChapterDetail.subtopics || []).join(','))}`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="underline text-emerald-400 font-bold flex items-center gap-1"
                                        >
                                            📥 Open Official PDF Stream ↗
                                        </a>
                                    </div>
                                    <iframe 
                                        src={`/api/v1/minerva/chapter-pdf/download?chapterTitle=${encodeURIComponent(selectedChapterDetail.title)}&board=${encodeURIComponent(board)}&standard=${encodeURIComponent(gradeLevel)}&subject=${encodeURIComponent(selectedSubject)}&medium=${encodeURIComponent(language)}&subtopics=${encodeURIComponent((selectedChapterDetail.subtopics || []).join(','))}#toolbar=1`}
                                        title={`Official PDF for ${selectedChapterDetail.title}`}
                                        className="w-full h-[450px] rounded-2xl bg-white border border-white/10 shadow-2xl"
                                    />
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-400">
                                    Click <strong>"Preview PDF Content"</strong> or <strong>"Download Official PDF ↗"</strong> to view the official {board} Class {gradeLevel} textbook PDF module in {language} medium.
                                </p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/5">
                            <button
                                onClick={() => {
                                    setSelectedChapterDetail(null);
                                    navigate(`/future-education?askDoubt=${encodeURIComponent(`Mujhe Chapter '${selectedChapterDetail.title}' ke baare mein samjhaiye aur iske key formulas aur exam questions batayiye.`)}`);
                                }}
                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                                <Sparkles size={14} /> Ask AI Teacher Doubt on Chapter
                            </button>
                            <button
                                onClick={() => setSelectedChapterDetail(null)}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinervaRoadmapsPage;
