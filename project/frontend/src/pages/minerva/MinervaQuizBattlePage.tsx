import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import {
    Swords, ArrowLeft, Loader2, Copy, Check, Shield, Zap, Clock, Shuffle,
    Bot, Crown, Flame, Star, ChevronRight, Play, BookOpen, HelpCircle, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ArenaPlayer {
    userId: string; firstName: string; grade: number; team: string; hp: number;
    score: number; streakCount: number;
    powerups: { shield: boolean; doubleStrike: boolean; freeze: boolean; fiftyFifty: boolean };
    powerupsUsed: string[]; hasFinished: boolean; isConnected: boolean;
    answersRecord: { questionId: number; isCorrect: boolean; damage: number }[];
}
interface ArenaTeam { label: string; hp: number; maxHp: number; playerIds: string[]; }
interface ArenaQuestion {
    question: string; options: string[]; correctAnswer: number;
    grade: number; subject: string; explanation?: string;
}
interface ArenaRoom {
    _id: string; roomCode: string; hostId: any; status: string; mode: string;
    teamASizeTarget: number; teamBSizeTarget: number; subject: string;
    players: ArenaPlayer[]; teamA: ArenaTeam; teamB: ArenaTeam;
    currentRound: number; totalRounds: number; playerQuestions: Record<string, ArenaQuestion[]>;
    aiDifficulty?: string; winnerTeam?: string | null; mvpPlayerId?: string;
    roundStates: any[];
    battleStyle?: 'SPEED_RACE' | 'ALTERNATING'; // ⚡ or ⚔️
    currentTurn?: 'A' | 'B';
    roomType?: 'OPEN_ARENA' | 'TEACHER_ROOM';
    board?: string;
    standard?: string;
    topic?: string;
    topicConcept?: string;
    semester?: string;
    invitedStudentIds?: string[];
}

// ─── Utility Helpers ─────────────────────────────────────────────────────────
const formatTopic = (topicStr?: string) => {
    if (!topicStr) return 'General Quiz';
    let str = topicStr.trim();
    try {
        if (str.startsWith('[') || str.startsWith('{')) {
            const parsed = JSON.parse(str);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                if (first && typeof first === 'object') {
                    // e.g. [{"html": "HTML"}] → pick the longest value (most descriptive)
                    const vals = Object.values(first).filter(v => typeof v === 'string') as string[];
                    return vals.reduce((a, b) => b.length > a.length ? b : a, vals[0] || '');
                }
                return String(first);
            }
            if (typeof parsed === 'object' && parsed !== null) {
                const vals = Object.values(parsed).filter(v => typeof v === 'string') as string[];
                return vals.reduce((a, b) => b.length > a.length ? b : a, vals[0] || '');
            }
        }
    } catch (e) {
        // Fallback
    }
    // Strip any stray JSON characters
    return str.replace(/[\[\]{}"]/g, '').trim() || 'General Quiz';
};

// ─── Clean stray JSON artifacts from question text (backward compat) ─────────
const cleanQuestionText = (text?: string): string => {
    if (!text) return '';
    // Pattern: "[BOARD GRADE – [ JSON ] ] Actual question text"
    // Strip everything inside the leading bracket prefix if it contains JSON chars
    return text.replace(/^\[.*?\]\s*/s, (match) => {
        // Keep the prefix only if it looks clean (no { } chars indicating JSON)
        if (match.includes('{') || match.includes('[{"') || match.includes('[ {')) return '';
        return match;
    });
};

// ─── Constants ───────────────────────────────────────────────────────────────
const MODES = [
    { id: 'SOLO_VS_AI',    label: 'Solo vs AI',    icon: '🤖', desc: 'Battle Future Education OS AI' },
    { id: 'SOLO_VS_SOLO',  label: 'Solo vs Solo',  icon: '⚔️', desc: '1v1 Duel' },
    { id: 'SOLO_VS_DUO',   label: 'Solo vs Duo',   icon: '⚡',    desc: '1 vs 2' },
    { id: 'SOLO_VS_TRIO',  label: 'Solo vs Trio',  icon: '💀', desc: '1 vs 3 – Brave!' },
    { id: 'SOLO_VS_SQUAD', label: 'Solo vs Squad', icon: '🔥', desc: '1 vs 4 – Legendary' },
    { id: 'DUO_VS_DUO',   label: 'Duo vs Duo',    icon: '🛡️',  desc: '2v2 Team Clash' },
    { id: 'DUO_VS_TRIO',  label: 'Duo vs Trio',   icon: '🌪️',  desc: '2 vs 3' },
    { id: 'DUO_VS_SQUAD', label: 'Duo vs Squad',  icon: '🌊',  desc: '2 vs 4' },
    { id: 'TRIO_VS_TRIO',  label: 'Trio vs Trio',  icon: '🏰', desc: '3v3 Guild Battle' },
    { id: 'TRIO_VS_SQUAD', label: 'Trio vs Squad', icon: '👑', desc: '3 vs 4' },
    { id: 'SQUAD_VS_SQUAD',label: 'Squad Wars',    icon: '👾', desc: '4v4 Full War' },
];
export const BOARDS = [
    // National / Common Boards
    { id: 'CBSE', name: 'CBSE (Central Board of Secondary Education)' },
    { id: 'NCERT', name: 'NCERT' },
    
    // State Boards
    { id: 'BSEAP', name: 'Andhra Pradesh (BSEAP)' },
    { id: 'CBSE_ARUNACHAL', name: 'Arunachal Pradesh (CBSE)' },
    { id: 'ASSEB', name: 'Assam (ASSEB)' },
    { id: 'BSEB', name: 'Bihar (BSEB)' },
    { id: 'CGBSE', name: 'Chhattisgarh (CGBSE)' },
    { id: 'GBSHSE', name: 'Goa (GBSHSE)' },
    { id: 'GSEB', name: 'Gujarat (GSEB)' },
    { id: 'BSEH', name: 'Haryana (BSEH)' },
    { id: 'HPBOSE', name: 'Himachal Pradesh (HPBOSE)' },
    { id: 'JAC', name: 'Jharkhand (JAC)' },
    { id: 'KSEAB', name: 'Karnataka (KSEAB)' },
    { id: 'KERALA_BOARD', name: 'Kerala Board of Public Examinations' },
    { id: 'MPBSE', name: 'Madhya Pradesh (MPBSE)' },
    { id: 'MSBSHSE', name: 'Maharashtra (MSBSHSE)' },
    { id: 'BOSEM', name: 'Manipur (BOSEM)' },
    { id: 'MBOSE', name: 'Meghalaya (MBOSE)' },
    { id: 'MBSE', name: 'Mizoram (MBSE)' },
    { id: 'NBSE', name: 'Nagaland (NBSE)' },
    { id: 'BSE_ODISHA', name: 'Odisha (BSE Odisha)' },
    { id: 'PSEB', name: 'Punjab (PSEB)' },
    { id: 'RBSE', name: 'Rajasthan (RBSE)' },
    { id: 'BSES', name: 'Sikkim (BSES)' },
    { id: 'DGE_TN', name: 'Tamil Nadu (DGE TN)' },
    { id: 'BSE_TELANGANA', name: 'Telangana (BSE Telangana)' },
    { id: 'TBSE', name: 'Tripura (TBSE)' },
    { id: 'UPMSP', name: 'Uttar Pradesh (UPMSP)' },
    { id: 'UBSE', name: 'Uttarakhand (UBSE)' },
    { id: 'WBBSE', name: 'West Bengal (WBBSE)' },
    { id: 'JKBOSE', name: 'Jammu & Kashmir (JKBOSE)' },
    { id: 'CBSE_JKBOSE_LADAKH', name: 'Ladakh (CBSE/JKBOSE)' }
];

export const STANDARDS = [
    { id: '5', name: 'Class 5' },
    { id: '6', name: 'Class 6' },
    { id: '7', name: 'Class 7' },
    { id: '8', name: 'Class 8' },
    { id: '9', name: 'Class 9' },
    { id: '10', name: 'Class 10' },
    
    // Post 10th school streams
    { id: 'science_pcm', name: 'Science (PCM) Stream' },
    { id: 'science_pcb', name: 'Science (PCB) Stream' },
    { id: 'commerce_stream', name: 'Commerce Stream' },
    { id: 'arts_humanities_stream', name: 'Arts & Humanities Stream' },

    { id: '11_SCI_A', name: 'Class 11 Science (Group A)' },
    { id: '11_SCI_B', name: 'Class 11 Science (Group B)' },
    { id: '11_COMMERCE', name: 'Class 11 Commerce' },
    { id: '11_ARTS', name: 'Class 11 Arts' },
    { id: '12_SCI_A', name: 'Class 12 Science (Group A)' },
    { id: '12_SCI_B', name: 'Class 12 Science (Group B)' },
    { id: '12_COMMERCE', name: 'Class 12 Commerce' },
    { id: '12_ARTS', name: 'Class 12 Arts' },
    
    // Higher Ed & Professional
    { id: 'diploma_iti', name: 'Diploma & ITI Skill Courses' },
    { id: 'undergrad', name: 'Undergraduate Courses' },
    { id: 'postgrad', name: 'Postgraduate Courses' },
    { id: 'doctoral', name: 'Doctoral & Research' },
    { id: 'emerging_tech', name: 'Emerging Technology Specializations' },
    { id: 'health_sciences', name: 'Health Sciences Specializations' },
    { id: 'law_policy', name: 'Law, Policy & Governance' },
    { id: 'creative_media', name: 'Creative Media & Design' },
    { id: 'agriculture_env', name: 'Agriculture & Environment' },
    { id: 'aviation_maritime', name: 'Aviation & Maritime' },
    { id: 'finance_adv', name: 'Finance Advanced' },
    { id: 'education_teaching', name: 'Education & Teaching' },
    { id: 'comp_exams', name: 'Competitive Exams Paths' },
    { id: 'prof_certifications', name: 'Professional Certifications' },

    // Legacy standard entries for fallback compatibility
    { id: 'JEE', name: 'JEE Exam' },
    { id: 'NEET', name: 'NEET Exam' },
    { id: 'GOVT_EXAM', name: 'UPSC / GPSC Govt Exams' },
    { id: 'BANKING', name: 'Banking Exams' }
];

export const STANDARD_SUBJECTS_MAP: Record<string, string[]> = {
    '5': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'EVS'],
    '6': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Sanskrit'],
    '7': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Sanskrit'],
    '8': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Sanskrit'],
    '9': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Computer Science'],
    '10': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Computer Science'],
    
    'science_pcm': ['Engineering', 'Architecture', 'Defence Services', 'Commercial Pilot', 'Data Science'],
    'science_pcb': ['MBBS', 'BDS', 'BAMS', 'BHMS', 'BUMS', 'BPT', 'BSc Nursing', 'Biotechnology'],
    'commerce_stream': ['BCom', 'Chartered Accountancy (CA)', 'Company Secretary (CS)', 'Cost and Management Accountancy (CMA)', 'BBA', 'Economics', 'Banking and Finance'],
    'arts_humanities_stream': ['BA', 'Law', 'Journalism', 'Psychology', 'Political Science', 'Public Administration'],

    '11_SCI_A': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
    '11_SCI_B': ['Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'],
    '11_COMMERCE': ['Accountancy', 'Business Studies', 'Economics', 'Statistics', 'English'],
    '11_ARTS': ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English'],
    '12_SCI_A': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
    '12_SCI_B': ['Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'],
    '12_COMMERCE': ['Accountancy', 'Business Studies', 'Economics', 'Statistics', 'English'],
    '12_ARTS': ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English'],
    
    'diploma_iti': [
        "Diploma in Engineering", "Diploma in Pharmacy", "Diploma in Hotel Management", 
        "Diploma in Fashion Designing", "Diploma in Animation", "Diploma in Agriculture", 
        "Diploma in Medical Lab Technology", "Diploma in Radiology", "Diploma in Operation Theatre Technology", 
        "Diploma in Dialysis Technology", "Diploma in X-Ray Technology", "Electrician", 
        "Fitter", "Welder", "Plumber", "Mechanic", 
        "Computer Operator and Programming Assistant (COPA)", "Digital Marketing", "Web Development", 
        "App Development", "Graphic Designing", "Cyber Security", "Tally", "Data Entry Operator"
    ],
    'undergrad': [
        "BTech", "BE", "BCA", "BSc IT", "BSc Computer Science", "BSc", "BCom", "BBA", "BBM", "BMS", 
        "MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BPT", "BSc Nursing", "BA", "BJMC", "BFA", "BEd", 
        "LLB", "BArch", "BSW", "BPEd", "BDes", "Marine Engineering", "Nautical Science", 
        "Food Technology", "Agribusiness Management", "Aerospace Engineering", "Petroleum Engineering", 
        "Mining Engineering", "Textile Engineering", "Automobile Engineering"
    ],
    'postgrad': [
        "MTech", "ME", "MD", "MS", "MDS", "MBA", "PGDM", "MCom", "MA", "MSc", "LLM", "MArch", "MSW", "MPEd"
    ],
    'doctoral': [
        "PhD", "Doctorate of Medicine (DM)", "MCh", "Junior Research Fellowship (JRF)", 
        "Senior Research Fellowship (SRF)", "Post Doctoral Fellowship"
    ],
    'emerging_tech': [
        "Artificial Intelligence", "Machine Learning", "Blockchain Technology", "Cloud Computing", 
        "Internet of Things", "Robotics", "Quantum Computing", "Data Engineering", "DevOps Engineering", 
        "AR/VR Development", "Digital Forensics", "Industrial Automation", "Embedded Systems", 
        "Electric Vehicle Technology", "Renewable Energy Engineering", "FinTech", "Health Informatics"
    ],
    'health_sciences': [
        "Occupational Therapy", "Speech and Hearing", "Public Health", "Clinical Research", 
        "Genetics", "Nutrition and Dietetics", "Hospital Administration", "Medical Coding"
    ],
    'law_policy': [
        "Corporate Law", "Criminal Law", "Cyber Law", "Intellectual Property Law", "International Law", 
        "Disaster Management", "Policy Studies", "Strategic Studies", "Intelligence Studies"
    ],
    'creative_media': [
        "Animation", "Visual Effects", "Game Design", "UI/UX Design", "Interior Designing", 
        "Photography", "Film Making", "Cinematography", "Music Production", "Advertising", 
        "Public Relations", "Mass Communication"
    ],
    'agriculture_env': [
        "Horticulture", "Dairy Technology", "Fisheries", "Environmental Science", 
        "Climate Change Studies", "Wildlife Conservation", "Forestry", "Water Resource Management", 
        "Organic Farming"
    ],
    'aviation_maritime': [
        "Commercial Pilot License", "Aircraft Maintenance Engineering", "Aviation Safety Management", 
        "Ship Building Technology", "Port Management"
    ],
    'finance_adv': [
        "Actuarial Science", "Investment Banking", "Financial Modelling", "Risk Management", 
        "Financial Planning"
    ],
    'education_teaching': [
        "D.El.Ed", "Special Education", "Educational Leadership"
    ],
    'comp_exams': [
        "UPSC Civil Services", "SSC", "IBPS", "SBI PO", "Railway Exams", "State PSC", "NDA", "CDS", 
        "AFCAT", "Coast Guard Entry"
    ],
    'prof_certifications': [
        "AWS Certification", "Microsoft Certification", "Cisco CCNA", "Google Cloud Certification", 
        "Certified Ethical Hacker", "Project Management Professional (PMP)", "Six Sigma"
    ],

    // Legacy standard entries for fallback compatibility
    'JEE': ['Physics', 'Chemistry', 'Mathematics'],
    'NEET': ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
    'GOVT_EXAM': ['Quantitative Aptitude', 'Logical Reasoning', 'General English', 'General Knowledge & Current Affairs', 'History & Constitution'],
    'BANKING': ['Quantitative Aptitude', 'Logical Reasoning', 'English Language', 'Banking Awareness', 'General Awareness']
};

export const HIGHER_SEMESTERS_MAP: Record<string, { id: string; name: string }[]> = {
    'BTech': Array.from({ length: 8 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BE': Array.from({ length: 8 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BCA': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BSc IT': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BSc Computer Science': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BSc': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BCom': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BBA': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BBM': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'BMS': Array.from({ length: 6 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'MBBS': Array.from({ length: 5 }, (_, i) => ({ id: `year${i+1}`, name: `Year ${i+1}` })),
    'BDS': Array.from({ length: 4 }, (_, i) => ({ id: `year${i+1}`, name: `Year ${i+1}` })),
    'LLB': Array.from({ length: 3 }, (_, i) => ({ id: `year${i+1}`, name: `Year ${i+1}` })),
    'MTech': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'ME': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'MBA': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'PGDM': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'MCom': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'MA': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'MSc': Array.from({ length: 4 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'LLM': Array.from({ length: 2 }, (_, i) => ({ id: `sem${i+1}`, name: `Semester ${i+1}` })),
    'UPSC Civil Services': [
        { id: 'prelims', name: 'Civil Services Prelims' },
        { id: 'mains_general', name: 'GS Mains (Paper I - IV)' },
        { id: 'mains_optional', name: 'Optional Subject' }
    ],
    'SSC': [
        { id: 'tier1', name: 'Tier 1' },
        { id: 'tier2', name: 'Tier 2' }
    ],
    'IBPS': [
        { id: 'prelims', name: 'IBPS Prelims' },
        { id: 'mains', name: 'IBPS Mains' }
    ],
    'SBI PO': [
        { id: 'prelims', name: 'SBI Prelims' },
        { id: 'mains', name: 'SBI Mains' }
    ],
    'Railway Exams': [
        { id: 'cbt1', name: 'CBT 1' },
        { id: 'cbt2', name: 'CBT 2' }
    ],
    'State PSC': [
        { id: 'prelims', name: 'State PSC Prelims' },
        { id: 'mains', name: 'State PSC Mains' }
    ],
    'AWS Certification': [
        { id: 'foundational', name: 'Cloud Practitioner (Foundational)' },
        { id: 'associate', name: 'Associate Level' },
        { id: 'professional', name: 'Professional / Specialty Level' }
    ],
    'Microsoft Certification': [
        { id: 'fundamentals', name: 'Fundamentals' },
        { id: 'associate', name: 'Associate Level' },
        { id: 'expert', name: 'Expert Level' }
    ],
    'Cisco CCNA': [
        { id: 'ccna', name: 'CCNA Routing & Switching' },
        { id: 'ccnp', name: 'CCNP Enterprise' }
    ],
    'Google Cloud Certification': [
        { id: 'associate', name: 'Associate Cloud Engineer' },
        { id: 'professional', name: 'Professional Cloud Architect' }
    ]
};

const cleanOptionText = (opt: string, letter: string): string => {
    if (!opt) return '';
    const trimmed = opt.trim();
    const regex = new RegExp(`^${letter}\\s*[.)\\-:]\\s*`, 'i');
    return trimmed.replace(regex, '').trim();
};

export const isSchoolStandard = (stdId: string) => {
    return [
        '5', '6', '7', '8', '9', '10',
        '11_SCI_A', '11_SCI_B', '11_COMMERCE', '11_ARTS',
        '12_SCI_A', '12_SCI_B', '12_COMMERCE', '12_ARTS',
        'science_pcm', 'science_pcb', 'commerce_stream', 'arts_humanities_stream'
    ].includes(stdId);
};

export const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Science', 'English', 'Social Studies'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const AI_DIFFS = [
    { id: 'ROOKIE', label: 'Rookie', desc: '40% accuracy, slow thinking' },
    { id: 'SCHOLAR', label: 'Scholar', desc: '72% accuracy, medium speed' },
    { id: 'GRANDMASTER', label: 'Grandmaster', desc: '94% accuracy, lightning fast' },
];

// ─── HP Bar Component ─────────────────────────────────────────────────────────
function HpBar({ current, max }: { current: number; max: number }) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const color = pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#ef4444';
    return (
        <div className="w-full">
            <div className="flex justify-between text-[11px] font-black mb-1">
                <span className="text-slate-300 tracking-wide">{current} / {max} HP</span>
                <span className="text-slate-500">{Math.round(pct)}%</span>
            </div>
            <div className="h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner p-[1px]">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

// ─── Damage Float ─────────────────────────────────────────────────────────────
function DamageFloat({ amount, isHeal }: { amount: number; isHeal: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.7 }}
            animate={{ opacity: 0, y: -70, scale: 1.3 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 text-2xl font-black pointer-events-none z-50 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${isHeal ? 'text-emerald-400' : 'text-rose-500 animate-bounce'}`}
        >
            {isHeal ? '❤️ +' : '💥 -'}{amount}
        </motion.div>
    );
}


// ─── Cartoon Avatar 3D Component ────────────────────────────────────────────────
function CartoonAvatar3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [webglError, setWebglError] = useState(false);

    useEffect(() => {
        if ((window as any).THREE) {
            setScriptLoaded(true);
            return;
        }

        const existingScript = document.getElementById('threejs-cdn-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => setScriptLoaded(true));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.id = 'threejs-cdn-script';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => setWebglError(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !containerRef.current) return;

        const THREE = (window as any).THREE;
        if (!THREE) return;

        const width = containerRef.current.clientWidth || 240;
        const height = containerRef.current.clientHeight || 240;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 7.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        const avatarGroup = new THREE.Group();
        scene.add(avatarGroup);

        const skinMat = new THREE.MeshPhongMaterial({ color: 0xfcd0a1, shininess: 30 });
        const darkIndigoMat = new THREE.MeshPhongMaterial({ color: 0x312e81, shininess: 15 });
        const goldMat = new THREE.MeshPhongMaterial({ color: 0xd97706, shininess: 100 });
        const blackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const bookCoverMat = new THREE.MeshPhongMaterial({ color: 0xdb2777, shininess: 20 });
        const bookPagesMat = new THREE.MeshPhongMaterial({ color: 0xf8fafc, shininess: 10 });

        // Head
        const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 0.5;
        avatarGroup.add(head);

        // Scholar Hat Brim
        const brimGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.08, 32);
        const brim = new THREE.Mesh(brimGeo, darkIndigoMat);
        brim.position.y = 1.5;
        brim.rotation.x = 0.08;
        avatarGroup.add(brim);

        // Scholar Hat Cone
        const hatConeGeo = new THREE.ConeGeometry(1.1, 1.6, 32);
        const hatCone = new THREE.Mesh(hatConeGeo, darkIndigoMat);
        hatCone.position.set(0, 2.2, -0.15);
        hatCone.rotation.x = -0.08;
        avatarGroup.add(hatCone);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const leftEye = new THREE.Mesh(eyeGeo, blackMat);
        leftEye.position.set(-0.35, 0.6, 1.0);
        avatarGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, blackMat);
        rightEye.position.set(0.35, 0.6, 1.0);
        avatarGroup.add(rightEye);

        // Glasses (Torus)
        const frameGeo = new THREE.TorusGeometry(0.26, 0.04, 8, 24);
        const leftFrame = new THREE.Mesh(frameGeo, goldMat);
        leftFrame.position.set(-0.35, 0.6, 1.05);
        avatarGroup.add(leftFrame);

        const rightFrame = new THREE.Mesh(frameGeo, goldMat);
        rightFrame.position.set(0.35, 0.6, 1.05);
        avatarGroup.add(rightFrame);

        // Bridge for glasses
        const bridgeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8);
        const bridge = new THREE.Mesh(bridgeGeo, goldMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.6, 1.08);
        avatarGroup.add(bridge);

        // Robe (Cylinder)
        const robeGeo = new THREE.CylinderGeometry(0.85, 1.25, 1.8, 32);
        const robe = new THREE.Mesh(robeGeo, darkIndigoMat);
        robe.position.y = -1.1;
        avatarGroup.add(robe);

        // Levitating Book
        const bookGroup = new THREE.Group();
        bookGroup.position.set(1.9, 0.0, 0.4);
        scene.add(bookGroup);

        const coverGeo = new THREE.BoxGeometry(0.75, 0.95, 0.12);
        const cover = new THREE.Mesh(coverGeo, bookCoverMat);
        bookGroup.add(cover);

        const pagesGeo = new THREE.BoxGeometry(0.7, 0.9, 0.1);
        const pages = new THREE.Mesh(pagesGeo, bookPagesMat);
        pages.position.z = 0.015;
        bookGroup.add(pages);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(4, 8, 6);
        scene.add(dirLight);

        const glowLight = new THREE.PointLight(0x6366f1, 1.8, 12);
        glowLight.position.set(-3, -2, -2);
        scene.add(glowLight);

        const glowLight2 = new THREE.PointLight(0xdb2777, 1.8, 12);
        glowLight2.position.set(3, 2, -2);
        scene.add(glowLight2);

        // Mouse tracking
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const x = event.clientX - rect.left - width / 2;
            const y = event.clientY - rect.top - height / 2;
            mouseX = (x / (width / 2)) * 0.25;
            mouseY = (y / (height / 2)) * 0.25;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation
        let animFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animFrameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Avatar base hover and slow rotation
            avatarGroup.position.y = Math.sin(time * 1.6) * 0.04;
            avatarGroup.rotation.y = time * 0.15 + mouseX;
            avatarGroup.rotation.x = mouseY;

            // Book animation
            bookGroup.position.y = Math.sin(time * 2.2) * 0.12;
            bookGroup.rotation.y = time * 0.7;
            bookGroup.rotation.x = Math.cos(time * 0.4) * 0.08;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const newW = containerRef.current.clientWidth || width;
            const newH = containerRef.current.clientHeight || height;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [scriptLoaded]);

    if (webglError) {
        return (
            <div className="w-full h-52 bg-slate-950/20 border border-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <span className="text-3xl mb-1.5">🎓</span>
                <span className="text-xs font-bold text-indigo-400">Education OS Scholar</span>
                <span className="text-[10px] text-slate-500 mt-1">
                    WebGL error or CDN unreachable. 3D Scholar Avatar offline.
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-52 flex items-center justify-center select-none overflow-hidden rounded-2xl bg-indigo-950/5 border border-indigo-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div ref={containerRef} className="w-full h-full" />
            {!scriptLoaded && (
                <div className="absolute flex flex-col items-center justify-center">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-[9px] text-slate-500 mt-2 tracking-wider uppercase font-bold">Loading Avatar...</span>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MinervaQuizBattlePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showAlert, confirm } = useModal();
    const [socket, setSocket] = useState<Socket | null>(null);

    const getLevelInfo = (xp: number) => {
        const level = Math.floor(xp / 500) + 1;
        const currentLevelXp = xp % 500;
        const nextLevelXp = 500;
        const percent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));
        
        let rankName = 'Novice Scholar';
        let rankColor = 'text-slate-400 border-slate-500/20 bg-slate-500/5';
        let rankIcon = '📜';
        if (level >= 10) {
            rankName = 'Grand Archmage';
            rankColor = 'text-pink-400 border-pink-500/30 bg-pink-500/10';
            rankIcon = '👑';
        } else if (level >= 7) {
            rankName = 'Battle Champion';
            rankColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            rankIcon = '⚔️';
        } else if (level >= 5) {
            rankName = 'Honor Student';
            rankColor = 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
            rankIcon = '✨';
        } else if (level >= 3) {
            rankName = 'Adept Mage';
            rankColor = 'text-violet-400 border-violet-500/30 bg-violet-500/10';
            rankIcon = '🔮';
        } else if (level >= 2) {
            rankName = 'Apprentice';
            rankColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            rankIcon = '🌱';
        }
        
        return { level, currentLevelXp, nextLevelXp, percent, rankName, rankColor, rankIcon };
    };

    const getOpponentsList = (hist: any[]) => {
        const opponentDetails: Record<string, { count: number; lastPlayed: string; winCount: number }> = {};
        
        hist.forEach(h => {
            h.participants?.forEach((p: any) => {
                if (!p.isSelf) {
                    const name = p.name || 'Anonymous';
                    if (!opponentDetails[name]) {
                        opponentDetails[name] = { count: 0, lastPlayed: h.date, winCount: 0 };
                    }
                    opponentDetails[name].count++;
                    if (h.isWinner) {
                        opponentDetails[name].winCount++;
                    }
                    if (new Date(h.date) > new Date(opponentDetails[name].lastPlayed)) {
                        opponentDetails[name].lastPlayed = h.date;
                    }
                }
            });
        });
        
        return Object.keys(opponentDetails).map(name => ({
            name,
            ...opponentDetails[name]
        })).sort((a, b) => b.count - a.count);
    };

    const formatCountdown = (targetDate: Date) => {
        const diff = targetDate.getTime() - currentTime.getTime();
        if (diff <= 0) return 'Live Now! 🔴';
        
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Views
    const [view, setView] = useState<'LOBBY' | 'CREATE' | 'JOIN' | 'WAITING' | 'BATTLE' | 'RESULTS' | 'TEACHER_STOPPED' | 'HISTORY'>('LOBBY');
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ARENA'>('DASHBOARD');

    // Stats & History
    const [stats, setStats] = useState<{
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        totalXp?: number;
    } | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyFilterStatus, setHistoryFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'DRAW'>('ALL');
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [loadingStats, setLoadingStats] = useState(false);
    const [sprintSlideIndex, setSprintSlideIndex] = useState(0);

    // Dynamic countdown timer for upcoming tournaments
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const [upcomingTournaments] = useState<any[]>([
        {
            id: 't1',
            title: 'National Science Sprint Championship',
            subject: 'Science',
            startTime: new Date(Date.now() + 12 * 60 * 1000 + 45 * 1000),
            prizePool: '1,500 XP + "Grand Scientist" Badge',
            icon: '🧬'
        },
        {
            id: 't2',
            title: 'Future Education OS Weekly Math Olympiad',
            subject: 'Mathematics',
            startTime: new Date(Date.now() + 115 * 60 * 1000 + 30 * 1000),
            prizePool: '3,000 XP + Scholar Rank Up multiplier',
            icon: '📐'
        },
        {
            id: 't3',
            title: 'Humanities & History Quiz Clash',
            subject: 'Social Science',
            startTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
            prizePool: '2,500 XP + Rare "Historian" Armor',
            icon: '🏛️'
        }
    ]);

    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/minerva/battle/my-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setHistory(data.history);
            }
        } catch (err) {
            console.error('Error fetching battle stats:', err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'LOBBY') {
            fetchStats();
        }
    }, [view, fetchStats]);

    // Onboarding / Tutorial State
    const [showTraining, setShowTraining] = useState<boolean>(() => {
        return !localStorage.getItem('fb_arena_trained');
    });
    const [trainingStep, setTrainingStep] = useState<number>(0);

    // Daily Challenge State
    const [dailyChallengePlayed, setDailyChallengePlayed] = useState(false);
    const [dailySubject, setDailySubject] = useState('Science');


    // Create form state
    const [selMode, setSelMode] = useState('SOLO_VS_SOLO');
    const [selBoard, setSelBoard] = useState(user?.board || 'CBSE');
    const [selGrade, setSelGrade] = useState<string>('10');
    const [selSubject, setSelSubject] = useState('Science');
    const [selDiff, setSelDiff] = useState('Medium');
    const [selAiDiff, setSelAiDiff] = useState('SCHOLAR');
    const [totalRounds, setTotalRounds] = useState(10);
    const [selBattleStyle, setSelBattleStyle] = useState<'SPEED_RACE' | 'ALTERNATING'>('SPEED_RACE');
    const [selLanguage, setSelLanguage] = useState('english');

    // Topic & Board dynamic states
    const [selTopic, setSelTopic] = useState('');
    const [normalizedTopic, setNormalizedTopic] = useState('');
    const [topicNormalizing, setTopicNormalizing] = useState(false);
    const [topicError, setTopicError] = useState('');
    const [selSemester, setSelSemester] = useState('');
    const [selRoomType, setSelRoomType] = useState<'OPEN_ARENA' | 'TEACHER_ROOM'>('OPEN_ARENA');
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]); 
    const [studentsList, setStudentsList] = useState<any[]>([]); 
    const [searchStudentTerm, setSearchStudentTerm] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(false);


    useEffect(() => {
        const subjects = STANDARD_SUBJECTS_MAP[selGrade] || SUBJECTS;
        if (subjects.length > 0) {
            setSelSubject(subjects[0]);
        }
    }, [selGrade]);

    useEffect(() => {
        setSelTopic('');
        setNormalizedTopic('');
    }, [selGrade, selSubject]);

    const [room, setRoom] = useState<ArenaRoom | null>(null);
    useEffect(() => {
        if (room?.roomCode) {
            localStorage.setItem('active_room_code', room.roomCode);
        } else if (room === null) {
            localStorage.removeItem('active_room_code');
        }
    }, [room]);
    const [activeRooms, setActiveRooms] = useState<ArenaRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinTeam, setJoinTeam] = useState<'A' | 'B'>('B');
    const [joinGrade, setJoinGrade] = useState<string>(String(user?.grade || '10'));
    const [joinMode, setJoinMode] = useState<'SAME' | 'CUSTOM'>('SAME');
    const [joinSubject, setJoinSubject] = useState<string>('');
    const [joinTopic, setJoinTopic] = useState<string>('');
    
    // Live Join Preview State
    const [previewRoom, setPreviewRoom] = useState<any | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [joinToast, setJoinToast] = useState<string | null>(null);

    const getStandardName = (id: string | number) => {
        return STANDARDS.find(s => String(s.id) === String(id))?.name || `Class ${id}`;
    };

    const getBoardName = (id: string) => {
        return BOARDS.find(b => String(b.id) === String(id))?.name || id;
    };

    // Auto-synchronize standard/board/subject/topic based on joining mode
    useEffect(() => {
        if (!previewRoom) return;
        if (joinMode === 'SAME') {
            if (previewRoom.standard) setJoinGrade(String(previewRoom.standard));
            if (previewRoom.board && previewRoom.board !== 'N/A') setSelBoard(previewRoom.board);
            setJoinSubject(previewRoom.subject || '');
            setJoinTopic(previewRoom.topicConcept || previewRoom.topic || '');
        } else {
            // Restore joining user's defaults but keep host's subject/topic as starting point
            setJoinGrade(String(user?.grade || '10'));
            setSelBoard(user?.board || 'CBSE');
            setJoinSubject(previewRoom.subject || '');
            setJoinTopic(previewRoom.topicConcept || previewRoom.topic || '');
        }
    }, [joinMode, previewRoom, user]);

    useEffect(() => {
        const fetchPreviewDetails = async () => {
            const code = joinCode.trim().toUpperCase();
            if (code.length < 8) {
                setPreviewRoom(null);
                setPreviewError('');
                return;
            }
            setLoadingPreview(true);
            setPreviewError('');
            try {
                const tokenVal = localStorage.getItem('fbrts_token') || localStorage.getItem('token') || '';
                const res = await fetch(`/api/future-education/battle/room/${code}`, {
                    headers: { Authorization: `Bearer ${tokenVal}` }
                });
                const d = await res.json();
                if (d.success && d.room) {
                    setPreviewRoom(d.room);
                    setPreviewError('');
                    // Auto-sync standard standard
                    if (joinMode === 'SAME' && d.room.standard) {
                        setJoinGrade(String(d.room.standard));
                    }
                    if (joinMode === 'SAME' && d.room.board && d.room.board !== 'N/A') {
                        setSelBoard(d.room.board);
                    }
                } else {
                    setPreviewRoom(null);
                    setPreviewError(d.message || 'Room not found.');
                }
            } catch (err) {
                setPreviewRoom(null);
                setPreviewError('Failed to fetch room details.');
            } finally {
                setLoadingPreview(false);
            }
        };

        const timer = setTimeout(() => {
            fetchPreviewDetails();
        }, 400); // debounce typing
        return () => clearTimeout(timer);
    }, [joinCode, joinMode]);


    // Battle state
    const [currentRound, setCurrentRound] = useState(0);
    const [myQuestion, setMyQuestion] = useState<ArenaQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [timerFrozen, setTimerFrozen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [activeTurn, setActiveTurn] = useState<'A' | 'B'>('A'); // for ALTERNATING mode
    const [damageEventsA, setDamageEventsA] = useState<{ id: number; amount: number }[]>([]);
    const [damageEventsB, setDamageEventsB] = useState<{ id: number; amount: number }[]>([]);
    const [shakeA, setShakeA] = useState(false);
    const [shakeB, setShakeB] = useState(false);
    const [comboMsg, setComboMsg] = useState<string | null>(null);
    const [roundComplete, setRoundComplete] = useState(false);
    const [teammateWrong, setTeammateWrong] = useState<{ wrongOption: number } | null>(null);
    const [battleFeed, setBattleFeed] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Auto-submit on timeout ───────────────────────────────────────────────
    const autoSubmitTimeout = useCallback(() => {
        if (hasSubmitted || !room) return;
        
        // In alternating turn mode, do not submit timeout if it is not my turn
        const isAlternating = room.battleStyle === 'ALTERNATING';
        const myPlayer = room.players.find(p => ((p.userId as any)?._id || p.userId)?.toString() === user?._id?.toString());
        const myTeam = myPlayer?.team;
        if (isAlternating && room.mode !== 'SOLO_VS_AI' && activeTurn !== myTeam) {
            return;
        }

        setHasSubmitted(true);
        setSelectedOption(-1); // special value for timeout
        socket?.emit('submit_arena_answer', {
            roomCode: room.roomCode,
            userId: user?._id,
            roundIndex: currentRound,
            selectedOption: -1, // timeout
            timeMs: 15000
        });
    }, [room, currentRound, hasSubmitted, socket, user, activeTurn]);

    const startTimer = useCallback((initialSeconds?: number, overrideActiveTurn?: 'A' | 'B') => {
        clearInterval(timerRef.current!);
        if (watchdogRef.current) {
            clearTimeout(watchdogRef.current);
            watchdogRef.current = null;
        }
        if (!room) return;

        const isAlternating = room.battleStyle === 'ALTERNATING';
        const myPlayer = room.players.find(p => ((p.userId as any)?._id || p.userId)?.toString() === user?._id?.toString());
        const myTeam = myPlayer?.team;
        
        const turnToUse = overrideActiveTurn !== undefined ? overrideActiveTurn : activeTurn;
        const isMyTurn = isAlternating ? (room.mode === 'SOLO_VS_AI' || turnToUse === myTeam) : true;

        const startSec = initialSeconds !== undefined ? initialSeconds : 15;
        setTimeLeft(startSec);

        // If it's alternating turn mode and NOT my turn, don't run the countdown interval on the client!
        if (isAlternating && room.mode !== 'SOLO_VS_AI' && !isMyTurn) {
            return;
        }

        if (startSec <= 0) {
            autoSubmitTimeout();
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    autoSubmitTimeout();

                    // Start client watchdog to exit if server/socket is actually disconnected
                    if (watchdogRef.current) clearTimeout(watchdogRef.current);
                    watchdogRef.current = setTimeout(() => {
                        if (socket && !socket.connected) {
                            console.warn('[Arena] Watchdog triggered: Socket disconnected. Exiting stuck battle.');
                            clearInterval(timerRef.current!);
                            setRoom(null);
                            resetBattleState();
                            setView('TEACHER_STOPPED');
                        } else {
                            console.warn('[Arena] Watchdog: Server is busy generating questions. Retaining connection.');
                        }
                    }, 7000);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [autoSubmitTimeout, room, activeTurn]);

    const userRef = useRef(user);
    const hasSubmittedRef = useRef(hasSubmitted);
    const startTimerRef = useRef(startTimer);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { hasSubmittedRef.current = hasSubmitted; }, [hasSubmitted]);
    useEffect(() => { startTimerRef.current = startTimer; }, [startTimer]);

    // ─── Socket Setup ─────────────────────────────────────────────────────────
    useEffect(() => {
        fetchActiveRooms();
        fetchDailyChallengeStatus();
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        // 🔧 PROD FIX: VITE_API_URL is baked at build-time (points to localhost:7001).
        // On futurebrts.com we MUST use window.location.origin, never the inlined localhost URL.
        let socketUrl = (import.meta as any).env?.VITE_SOCKET_URL;
        if (!socketUrl) {
            if (isProd) {
                // Production: always connect to the live domain (futurebrts.com)
                socketUrl = window.location.origin;
            } else {
                const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
                if (viteApiUrl) {
                    try {
                        const url = new URL(viteApiUrl);
                        socketUrl = url.origin;
                    } catch (e) {
                        socketUrl = viteApiUrl;
                    }
                } else {
                    socketUrl = window.location.origin.replace(/:\d+$/, ':7001');
                }
            }
        }
        const s = io(socketUrl);

        s.on('connect', () => {
            console.log('[Arena] Connected/Reconnected to Socket.IO. Socket ID:', s.id);
            const activeRoomCode = localStorage.getItem('active_room_code') || '';
            const userId = userRef.current?._id;
            if (activeRoomCode && userId) {
                console.log('[Arena] Re-emitting join_arena_lobby for reconnect:', activeRoomCode);
                s.emit('join_arena_lobby', { roomCode: activeRoomCode, userId });
            }
        });

        setSocket(s);
        checkMyActiveRoom(s);

        s.on('arena_lobby_update', (d: { room: ArenaRoom }) => setRoom(d.room));

        // Host notification when someone joins with their choice details
        s.on('arena_player_joined', (d: { 
            playerName: string; joinMode: string; grade: string; board: string; 
            subject?: string; topic?: string; 
        }) => {
            const modeLabel = d.joinMode === 'SAME' ? '👉 Same to Same' : '⚙️ Customize';
            let details = `Grade: ${d.grade} | Board: ${d.board}`;
            if (d.joinMode === 'CUSTOM') {
                if (d.subject) details += ` | Subject: ${d.subject}`;
                if (d.topic) details += ` | Topic: ${d.topic}`;
            }
            setJoinToast(`🎮 ${d.playerName} joined! [${modeLabel}] ${details}`);
            setTimeout(() => setJoinToast(null), 5000);
        });


        s.on('arena_started', (d: { room: ArenaRoom }) => {
            setRoom(d.room);
            setView('BATTLE');
            resetBattleState();
            setCurrentRound(0);
            setBattleFeed([`⚔️ The battle has begun! Show your knowledge!`]);
            loadQuestion(d.room, 0);
            startTimerRef.current();
        });

        s.on('arena_update', (d: {
            room: ArenaRoom; team: string; isCorrect: boolean;
            damage: number; selfDamage: number; roundComplete: boolean;
            event: string; answeredBy: string; playerName?: string; xpDeducted?: number;
            shieldUsed?: boolean; activeTurn?: 'A' | 'B';
        }) => {
            setRoom(d.room);

            // Add detailed battle feed activity message
            if (d.event === 'AI_ANSWER') {
                const msg = d.isCorrect
                    ? `🤖 Future Education OS AI answered CORRECTLY! Dealt ${d.damage} damage to Team Alpha.`
                    : `💥 Future Education OS AI got it WRONG! It took ${d.damage} self-damage.`;
                setBattleFeed(prev => [msg, ...prev].slice(0, 15));
            } else if (d.event === 'ANSWER') {
                const name = d.playerName || 'Teammate';
                const teamName = d.team === 'A' ? 'Alpha' : 'Omega';
                const oppTeamName = d.team === 'A' ? 'Omega' : 'Alpha';

                let msg = '';
                if (d.isCorrect) {
                    msg = `🎯 ${name} (Team ${teamName}) got it RIGHT! Dealt ${d.damage} damage to Team ${oppTeamName}.`;
                } else {
                    const suffix = d.shieldUsed ? ` (Shield Protected!)` : ` (Dealt ${d.selfDamage} self-damage to Team ${teamName} & lost ${d.xpDeducted || 10} XP!)`;
                    msg = `❌ ${name} (Team ${teamName}) got it WRONG!${suffix}`;
                }
                setBattleFeed(prev => [msg, ...prev].slice(0, 15));
            } else if (d.event === 'POWERUP_USED') {
                const usedByPlayer = d.room.players.find(p => (((p.userId as any)._id || p.userId) as string).toString() === d.answeredBy);
                const name = usedByPlayer ? usedByPlayer.firstName : 'Teammate';
                const teamName = usedByPlayer ? (usedByPlayer.team === 'A' ? 'Alpha' : 'Omega') : 'Alpha';
                const powerupNames: Record<string, string> = {
                    shield: '🛡️ Shield',
                    doubleStrike: '⚡ 2x Strike',
                    freeze: '❄️ Freeze',
                    fiftyFifty: '🔀 50/50'
                };
                const label = powerupNames[(d as any).powerup] || (d as any).powerup;
                const msg = `✨ ${name} (Team ${teamName}) activated ${label}!`;
                setBattleFeed(prev => [msg, ...prev].slice(0, 15));
            }

            // Damage animations
            if (d.damage > 0) {
                const targetTeam = d.team === 'A' ? 'B' : 'A';
                const id = Date.now();
                if (targetTeam === 'A') {
                    setDamageEventsA(prev => [...prev, { id, amount: d.damage }]);
                    setShakeA(true);
                    setTimeout(() => { setShakeA(false); setDamageEventsA(p => p.filter(x => x.id !== id)); }, 1400);
                } else {
                    setDamageEventsB(prev => [...prev, { id, amount: d.damage }]);
                    setShakeB(true);
                    setTimeout(() => { setShakeB(false); setDamageEventsB(p => p.filter(x => x.id !== id)); }, 1400);
                }
            }
            if (d.selfDamage > 0) {
                const id = Date.now();
                if (d.team === 'A') {
                    setDamageEventsA(prev => [...prev, { id, amount: d.selfDamage }]);
                    setShakeA(true);
                    setTimeout(() => { setShakeA(false); setDamageEventsA(p => p.filter(x => x.id !== id)); }, 1400);
                } else {
                    setDamageEventsB(prev => [...prev, { id, amount: d.selfDamage }]);
                    setShakeB(true);
                    setTimeout(() => { setShakeB(false); setDamageEventsB(p => p.filter(x => x.id !== id)); }, 1400);
                }
            }

            if (d.roundComplete) {
                setRoundComplete(true);
                clearInterval(timerRef.current!);
                setTimeout(() => {
                    setRoundComplete(false);
                    const nextRound = d.room.currentRound;
                    setCurrentRound(nextRound);
                    loadQuestion(d.room, nextRound);
                    setSelectedOption(null);
                    setHasSubmitted(false);
                    setHiddenOptions([]);
                    setTeammateWrong(null);
                    setActiveTurn((d.room.currentTurn as 'A' | 'B') || 'A');
                    startTimerRef.current(undefined, d.room.currentTurn);
                }, 1800);
            } else if (d.activeTurn) {
                setActiveTurn(d.activeTurn as 'A' | 'B');
            }
        });

        s.on('arena_finished', (d: { room: ArenaRoom }) => { setRoom(d.room); setView('RESULTS'); clearInterval(timerRef.current!); });
        s.on('arena_forfeit', (d: { room: ArenaRoom }) => { setRoom(d.room); setView('RESULTS'); clearInterval(timerRef.current!); });
        s.on('arena_disbanded', () => {
            showAlert('Lobby Disbanded', 'The match lobby was cancelled or disbanded by the host.');
            setRoom(null);
            setView('CREATE');
            resetBattleState();
        });

        // ─── TEACHER FORCE STOPPED ─────────────────────────────────────────────
        s.on('arena_teacher_stopped', () => {
            clearInterval(timerRef.current!);
            setRoom(null);
            resetBattleState();
            setView('TEACHER_STOPPED');
        });



        s.on('arena_combo', (d: { message: string }) => {
            setComboMsg(d.message);
            setTimeout(() => setComboMsg(null), 3000);
        });

        s.on('arena_teammate_wrong', (d: { roundIndex: number; wrongOption: number }) => {
            if (!hasSubmittedRef.current) setTeammateWrong({ wrongOption: d.wrongOption });
        });

        s.on('arena_powerup_used', (d: { effect: string; duration?: number; hideIndices?: number[] }) => {
            if (d.effect === 'TIMER_FROZEN') {
                setTimerFrozen(true);
                clearInterval(timerRef.current!);
                setTimeout(() => { setTimerFrozen(false); startTimerRef.current(); }, d.duration || 10000);
            } else if (d.effect === 'HIDE_OPTIONS' && d.hideIndices) {
                setHiddenOptions(d.hideIndices);
            }
        });

        s.on('arena_daily_complete', (d: { userId: string; doubleXpEarned: number }) => {
            if (d.userId === userRef.current?._id) {
                showAlert('✨ Daily Challenge Complete!', `Congratulations! You completed the challenge and earned ${d.doubleXpEarned} XP! (2x Double XP Bonus)`);
                setDailyChallengePlayed(true);
            }
        });

        s.on('arena_badge_unlocked', (d: { userId: string; playerName: string; badges: { name: string; icon: string }[] }) => {
            if (d.userId === userRef.current?._id) {
                showAlert('🏆 Badge Unlocked!', `You unlocked new badges: ${d.badges.map(b => b.icon + ' ' + b.name).join(', ')}! Check your Profile stats.`);
            }
        });

        return () => { s.disconnect(); clearInterval(timerRef.current!); if (watchdogRef.current) clearTimeout(watchdogRef.current); };
    }, [user?._id]);

    // ─── arena_turn_switch listener (ALTERNATING mode) ───────────────────────
    useEffect(() => {
        if (!socket) return;
        const handler = (d: { activeTurn: 'A' | 'B'; timerSeconds: number; roundIndex: number }) => {
            setActiveTurn(d.activeTurn);
            // Reset the timer for the defender
            startTimerRef.current(d.timerSeconds || 10, d.activeTurn);
            setBattleFeed(prev => [
                `⚔️ Turn switched! ${d.activeTurn === 'A' ? 'Team Alpha' : 'Team Omega'} must now answer (${d.timerSeconds || 10}s)`,
                ...prev
            ].slice(0, 15));
        };
        socket.on('arena_turn_switch', handler);
        return () => { socket.off('arena_turn_switch', handler); };
    }, [socket]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('join') || params.get('code');
        if (code) {
            setJoinCode(code.toUpperCase());
            setView('JOIN');
        }
    }, []);

    const resetBattleState = useCallback(() => {
        setSelectedOption(null);
        setHasSubmitted(false);
        setHiddenOptions([]);
        setTimerFrozen(false);
        setTeammateWrong(null);
        setBattleFeed([]);
        if (watchdogRef.current) {
            clearTimeout(watchdogRef.current);
            watchdogRef.current = null;
        }
    }, []);

    const loadQuestion = (r: ArenaRoom, roundIdx: number) => {
        const uid = String(user?._id ?? '');
        const qs = r.playerQuestions?.[uid] || (r.playerQuestions as any)?.[uid];
        setMyQuestion(qs?.[roundIdx] ?? null);
    };

    // ─── API ──────────────────────────────────────────────────────────────────
    const checkMyActiveRoom = async (sInst?: any) => {
        try {
            const res = await fetch('/api/future-education/battle/active', {
                headers: { Authorization: `Bearer ${token()}` }
            });
            const d = await res.json();
            if (d.success && d.room) {
                setRoom(d.room);
                if (d.room.status === 'ACTIVE') {
                    setView('BATTLE');
                    resetBattleState();
                    setCurrentRound(d.room.currentRound);
                    setBattleFeed([`⚔️ Restored active battle session!`]);
                    loadQuestion(d.room, d.room.currentRound);

                    // Sync the timer
                    const currentRoundState = d.room.roundStates[d.room.currentRound];
                    let secondsLeft = 15;
                    if (currentRoundState && currentRoundState.startedAt) {
                        const elapsed = Math.floor((Date.now() - new Date(currentRoundState.startedAt).getTime()) / 1000);
                        secondsLeft = Math.max(0, 15 - elapsed);
                    }

                    // Restore answer state
                    const myPlayer = d.room.players.find((p: any) => (p.userId?._id || p.userId)?.toString() === user?._id?.toString());
                    const myAnswer = myPlayer?.answersRecord?.find((r: any) => r.roundIndex === d.room.currentRound);
                    if (myAnswer) {
                        setHasSubmitted(true);
                        setSelectedOption(myAnswer.selectedOption);
                    }

                    startTimerRef.current(secondsLeft);
                } else {
                    setView('WAITING');
                }
                const activeSocket = sInst || socket;
                activeSocket?.emit('join_arena_lobby', { roomCode: d.room.roomCode, userId: user?._id });
            }
        } catch { /* silent */ }
    };
    const token = () => localStorage.getItem('fbrts_token') || '';

    const fetchActiveRooms = async () => {
        try {
            const res = await fetch('/api/future-education/battle/rooms', { headers: { Authorization: `Bearer ${token()}` } });
            const d = await res.json();
            if (d.success) setActiveRooms(d.rooms || []);
        } catch { /* silent */ }
    };

    const fetchDailyChallengeStatus = async () => {
        try {
            const res = await fetch('/api/future-education/battle/daily-status', {
                headers: { Authorization: `Bearer ${token()}` }
            });
            const d = await res.json();
            if (d.success) {
                setDailyChallengePlayed(d.alreadyPlayed);
                setDailySubject(d.subject);
            }
        } catch { /* silent */ }
    };

    const startDailyChallenge = async () => {
        if (dailyChallengePlayed) {
            showAlert('Daily Challenge Complete', 'You have already completed today\'s Daily Challenge. Play again tomorrow for double XP!');
            return;
        }
        resetBattleState();
        setLoading(true);
        try {
            const res = await fetch('/api/future-education/battle/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    mode: 'SOLO_VS_AI',
                    subject: dailySubject,
                    difficulty: 'Medium',
                    totalRounds: 10,
                    grade: user?.grade || 10,
                    aiDifficulty: 'SCHOLAR',
                    isDaily: true
                })
            });
            const d = await res.json();
            if (d.success) {
                setRoom(d.room);
                setView('WAITING');
                socket?.emit('join_arena_lobby', { roomCode: d.room.roomCode, userId: user?._id });
            } else {
                showAlert('Error', d.message || 'Failed to start daily challenge');
            }
        } catch (err: any) {
            console.error("Daily challenge start error:", err);
            showAlert('Error', 'Connection failed. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };


    const createRoom = async () => {
        // Validate topic
        if (!selTopic.trim()) {
            setTopicError('Topic is required to start a battle room!');
            showAlert('Topic Required', 'Please enter a topic or chapter to battle on.');
            setLoading(false);
            return;
        }

        // Validate board
        if (!selBoard) {
            showAlert('Board Required', 'Please select your exam board.');
            setLoading(false);
            return;
        }

        resetBattleState();
        setLoading(true);
        try {
            const finalTopic = normalizedTopic || selTopic.trim();
            const res = await fetch('/api/future-education/battle/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    mode: selRoomType === 'TEACHER_ROOM' ? 'CLASSROOM' : selMode,
                    board: selBoard,
                    subject: selSubject,
                    topic: finalTopic,
                    difficulty: selDiff,
                    totalRounds,
                    grade: selGrade,
                    semester: selSemester || undefined,
                    roomType: selRoomType,
                    invitedStudentIds: selectedStudents.map(s => s._id),
                    aiDifficulty: selMode === 'SOLO_VS_AI' ? selAiDiff : undefined,
                    battleStyle: selBattleStyle,
                    language: selLanguage
                })
            });
            const d = await res.json();
            if (d.success) {
                setRoom(d.room);
                setActiveTurn((d.room.currentTurn as 'A' | 'B') || 'A');
                setView('WAITING');
                
                // If it is a teacher room and students are selected, broadcast invite
                if (selRoomType === 'TEACHER_ROOM' && selectedStudents.length > 0) {
                    socket?.emit('broadcast_tournament_invite', {
                        roomCode: d.room.roomCode,
                        subject: selSubject,
                        topic: finalTopic
                    });
                }
                
                socket?.emit('join_arena_lobby', { roomCode: d.room.roomCode, userId: user?._id });
            } else showAlert('Error', d.message || 'Failed to create room');
        } catch (err: any) { 
            console.error("Room creation error:", err);
            showAlert('Error', `Connection failed: ${err.message || 'Server returned invalid response. Make sure backend is running.'}`); 
        }
        finally { setLoading(false); }
    };

    // Topic Normalizer API Caller
    const handleTopicNormalize = async () => {
        const raw = selTopic.trim();
        if (!raw || raw.length < 3) return;

        // Instantly clean frontend input to remove JSON brackets or quotes
        const cleanedRaw = formatTopic(raw);
        if (cleanedRaw !== raw) {
            setSelTopic(cleanedRaw);
        }

        setTopicNormalizing(true);
        setTopicError('');
        try {
            const res = await fetch('/api/future-education/battle/normalize-topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ topic: cleanedRaw, subject: selSubject, standard: selGrade })
            });
            const d = await res.json();
            if (d.success && d.normalizedTopic) {
                const cleanNormalized = formatTopic(d.normalizedTopic);
                setNormalizedTopic(cleanNormalized);
                setTopicError('');
            }
        } catch (err) {
            console.error('Error normalizing topic:', err);
        } finally {
            setTopicNormalizing(false);
        }
    };

    // Search students for Classroom Quiz
    const searchClassroomStudents = async (query: string) => {
        if (!query.trim()) {
            setStudentsList([]);
            return;
        }
        setLoadingStudents(true);
        try {
            const res = await fetch(`/api/future-education/battle/teacher/search-students?q=${query}&grade=${selGrade}`, {
                headers: { Authorization: `Bearer ${token()}` }
            });
            const d = await res.json();
            if (d.success) {
                setStudentsList(d.students || []);
            }
        } catch (err) {
            console.error('Error searching students:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Helper functions for Semester Mapping
    const getSemesterLabel = (subject: string): string | null => {
        const course = subject;
        if (["BTech", "BE", "BCA", "BSc IT", "BSc Computer Science", "BSc", "BCom", "BBA", "BBM", "BMS", "MTech", "ME", "MBA", "PGDM", "MCom", "MA", "MSc", "LLM"].includes(course)) {
            return "Semester";
        }
        if (["MBBS", "BDS", "LLB"].includes(course)) {
            return "Academic Year";
        }
        if (["UPSC Civil Services", "SSC", "IBPS", "SBI PO", "Railway Exams", "State PSC"].includes(course)) {
            return "Exam Stage";
        }
        if (["AWS Certification", "Microsoft Certification", "Cisco CCNA", "Google Cloud Certification"].includes(course)) {
            return "Certification Level";
        }
        return null;
    };

    const getSemesterOptions = (subject: string): { id: string; name: string }[] => {
        return HIGHER_SEMESTERS_MAP[subject] || [];
    };


    const joinRoom = async () => {
        if (!joinCode) return;
        
        // Validation: Ensure board is set
        const boardToSend = joinMode === 'SAME' ? (previewRoom?.board || user?.board || selBoard) : selBoard;
        if (!boardToSend) {
            showAlert('Board Required', 'Please select your board before joining.');
            return;
        }

        const subjectToSend = joinMode === 'SAME' ? (previewRoom?.subject || '') : joinSubject;
        const topicToSend = joinMode === 'SAME' ? (previewRoom?.topicConcept || previewRoom?.topic || '') : joinTopic;
        const gradeToSend = joinMode === 'SAME' ? (previewRoom?.standard || joinGrade) : joinGrade;

        resetBattleState();
        setLoading(true);
        try {
            const res = await fetch('/api/future-education/battle/room/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ 
                    roomCode: joinCode.toUpperCase(), 
                    team: joinTeam, 
                    grade: gradeToSend,
                    board: boardToSend,
                    subject: subjectToSend || undefined,
                    topic: topicToSend || undefined,
                    joinMode
                })
            });
            const d = await res.json();
            if (d.success) {
                setRoom(d.room);
                if (d.room.status === 'ACTIVE') {
                    setView('BATTLE');
                    resetBattleState();
                    setCurrentRound(d.room.currentRound);
                    setBattleFeed([`⚔️ Reconnected to active battle!`]);
                    loadQuestion(d.room, d.room.currentRound);

                    // Sync the timer
                    const currentRoundState = d.room.roundStates[d.room.currentRound];
                    let secondsLeft = 15;
                    if (currentRoundState && currentRoundState.startedAt) {
                        const elapsed = Math.floor((Date.now() - new Date(currentRoundState.startedAt).getTime()) / 1000);
                        secondsLeft = Math.max(0, 15 - elapsed);
                    }

                    // Restore answer state
                    const myPlayer = d.room.players.find((p: any) => (p.userId?._id || p.userId)?.toString() === user?._id?.toString());
                    const myAnswer = myPlayer?.answersRecord?.find((r: any) => r.roundIndex === d.room.currentRound);
                    if (myAnswer) {
                        setHasSubmitted(true);
                        setSelectedOption(myAnswer.selectedOption);
                    }

                    startTimerRef.current(secondsLeft);
                } else {
                    setView('WAITING');
                }
                // Emit join with choice info so host gets notified
                socket?.emit('join_arena_lobby', { 
                    roomCode: joinCode.toUpperCase(), 
                    userId: user?._id,
                    joinMode,
                    grade: gradeToSend,
                    board: boardToSend,
                    subject: subjectToSend,
                    topic: topicToSend
                });
            } else {
                showAlert('Error', d.message || 'Room not found or full');
            }
        } catch (err: any) { 
            console.error("Room join error:", err);
            showAlert('Error', `Connection failed: ${err.message || 'Server returned invalid response. Make sure backend is running.'}`); 
        }
        finally { setLoading(false); }
    };

    const startMatch = () => {
        if (!room) return;
        socket?.emit('start_arena_match', { roomCode: room.roomCode, userId: user?._id });
    };

    const leaveLobby = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/future-education/battle/room/leave', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` }
            });
            const d = await res.json();
            if (d.success) {
                setRoom(null);
                setView('CREATE');
                resetBattleState();
            } else {
                showAlert('Error', d.message || 'Failed to leave lobby');
            }
        } catch (err: any) {
            showAlert('Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveBattle = async () => {
        if (!room) return;
        const confirmed = await confirm({
            title: '🏃 Forfeit & Leave?',
            message: 'Are you sure you want to leave this active battle? You will forfeit the match and may lose XP/rank progression.',
            confirmText: 'Yes, Leave Match',
            cancelText: 'No, Keep Playing',
            type: 'confirm'
        });

        if (!confirmed) return;

        setLoading(true);
        try {
            // 1. Emit socket leave event
            socket?.emit('leave_arena_battle', { roomCode: room.roomCode, userId: user?._id });

            // 2. Call REST endpoint
            await fetch('/api/future-education/battle/room/leave', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` }
            });
            
            // 3. Reset client state
            setRoom(null);
            setView('CREATE');
            resetBattleState();
        } catch (err: any) {
            showAlert('Error', 'Failed to leave battle properly');
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherStopQuiz = async () => {
        if (!room) return;
        const confirmed = await confirm({
            title: '🛑 Stop & Terminate Quiz?',
            message: 'Are you sure you want to stop this quiz? This will immediately end the battle for all students and kick them out.',
            confirmText: 'Yes, Stop Quiz',
            cancelText: 'No, Keep Running',
            type: 'confirm'
        });

        if (!confirmed) return;

        setLoading(true);
        try {
            socket?.emit('teacher_stop_quiz', { roomCode: room.roomCode, userId: user?._id });
        } catch (err) {
            showAlert('Error', 'Failed to send stop command.');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = (optIdx: number) => {
        if (hasSubmitted || !room) return;
        setSelectedOption(optIdx);
        setHasSubmitted(true);
        clearInterval(timerRef.current!);
        socket?.emit('submit_arena_answer', {
            roomCode: room.roomCode, userId: user?._id,
            roundIndex: currentRound, selectedOption: optIdx,
            timeMs: (15 - timeLeft) * 1000
        });
    };

    const usePowerup = (pu: string) => {
        if (!room) return;
        socket?.emit('use_arena_powerup', { roomCode: room.roomCode, userId: user?._id, powerup: pu });
    };

    const copyCode = async () => {
        if (!room) return;
        await navigator.clipboard.writeText(room.roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const closeTraining = () => {
        localStorage.setItem('fb_arena_trained', 'true');
        setShowTraining(false);
    };

    // ─── Derived ──────────────────────────────────────────────────────────────
    const myPlayer = room?.players.find(p => ((p.userId as any)?._id || p.userId)?.toString() === user?._id?.toString());
    const myTeam = myPlayer?.team as 'A' | 'B' | undefined;
    const teamAPlayers = room?.players.filter(p => p.team === 'A') ?? [];
    const teamBPlayers = room?.players.filter(p => p.team === 'B') ?? [];
    const isHost = room && (String(room.hostId) === String(user?._id) || String(room.hostId?._id) === String(user?._id));
    const isReady = room && (room.mode === 'SOLO_VS_AI' || room.players.length >= (room.teamASizeTarget + room.teamBSizeTarget));

    // Training steps array
    const tutorialSteps = [
        {
            title: "Welcome to the Quiz Arena! ⚔️",
            desc: "The Quiz Arena is an RPG battle simulator where knowledge is your ultimate weapon. You'll compete against other students or our intelligent Future Education OS Bot using standard curriculum-aligned questions.",
            icon: "🏆"
        },
        {
            title: "Teams & Health Pools 🩸",
            desc: "Both teams start with a collective HP pool. Answering correctly strikes the enemy team's HP. Answering incorrectly deals self-damage to your own team and deducts 10 XP from your profile!",
            icon: "❤️"
        },
        {
            title: "Co-op Answer Ownership 🛡️",
            desc: "If a teammate answers correctly, they claim the round points for your team. If they choose a wrong option, it gets flagged on your screen in real time so you can avoid picking the same mistake!",
            icon: "🤝"
        },
        {
            title: "Strategic Power-ups ⚡",
            desc: "Unleash battle items! Use the Shield to block wrong answer damage, Double Strike to deal 2x damage, Freeze to pause the round timer, or 50/50 to eliminate two incorrect choices.",
            icon: "🔥"
        },
        {
            title: "Fair Grade-Adaptive Matching 🎓",
            desc: "During room creation, select your school Class (Grade 5 to 12). Questions are generated dynamically for each student's grade level, so a 5th grader and 10th grader can battle fairly in the same match!",
            icon: "📘"
        }
    ];

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="w-full min-h-full bg-[#05070f] text-white relative font-inter pb-32">
            {/* Background Grid & Lighting */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#1a103c66,transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0b213f55,transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#330b3f44,transparent_40%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:44px_44px]" />
            </div>

            {/* Combo Banner */}
            <AnimatePresence>
                {comboMsg && (
                    <motion.div initial={{ opacity: 0, y: -60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-orange-500 to-rose-600 text-white px-8 py-3.5 rounded-2xl font-black text-xl shadow-[0_0_50px_rgba(249,115,22,0.6)] border border-orange-400/40">
                        {comboMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guided Training Tour Overlay */}
            <AnimatePresence>
                {showTraining && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0b0e1a] border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(99,102,241,0.25)]">
                            <button onClick={closeTraining} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center">
                                <div className="text-6xl mb-4 animate-bounce">{tutorialSteps[trainingStep].icon}</div>
                                <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent mb-3">
                                    {tutorialSteps[trainingStep].title}
                                </h2>
                                <p className="text-slate-350 text-sm leading-relaxed mb-6 font-medium">
                                    {tutorialSteps[trainingStep].desc}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex gap-1">
                                    {tutorialSteps.map((_, i) => (
                                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${trainingStep === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'}`} />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {trainingStep > 0 && (
                                        <button onClick={() => setTrainingStep(p => p - 1)} className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors">
                                            Prev
                                        </button>
                                    )}
                                    {trainingStep < tutorialSteps.length - 1 ? (
                                        <button onClick={() => setTrainingStep(p => p + 1)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/30 transition-all">
                                            Next
                                        </button>
                                    ) : (
                                        <button onClick={closeTraining} className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all">
                                            Enter Arena ⚔️
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 max-w-5xl mx-auto p-4 py-6">

                {/* ═══ LOBBY ══════════════════════════════════════════════════ */}
                {view === 'LOBBY' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => navigate('/future-education/dashboard')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                                <ArrowLeft className="w-4 h-4" /> Back to Core
                            </button>
                            <div className="flex items-center gap-2">
                                <Swords className="w-6 h-6 text-indigo-400 animate-pulse" />
                                <span className="text-xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent tracking-tight">QUIZ ARENA</span>
                            </div>
                            <button onClick={() => { setTrainingStep(0); setShowTraining(true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/40 text-xs font-bold transition-all">
                                <HelpCircle className="w-3.5 h-3.5" /> How to Play
                            </button>
                        </div>

                        {activeTab === 'DASHBOARD' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Side: 3D Scholar Avatar & XP Dial */}
                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    <div className="bg-[#0b0e1a]/80 border border-indigo-500/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[8px] font-black uppercase tracking-wider rounded-lg">
                                                Visual Scholar 3D
                                            </span>
                                        </div>
                                        
                                        <div className="w-full mt-4">
                                            <CartoonAvatar3D />
                                        </div>

                                        {/* Dynamic XP Dial / Progression */}
                                        {(() => {
                                            const lvl = getLevelInfo(stats?.totalXp ?? 0);
                                            const r = 40;
                                            const circ = 2 * Math.PI * r;
                                            const strokeOffset = circ - (lvl.percent / 100) * circ;
                                            
                                            return (
                                                <div className="w-full flex flex-col items-center mt-4 border-t border-slate-900 pt-5">
                                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                                        <svg className="absolute w-full h-full transform -rotate-90">
                                                            {/* Track */}
                                                            <circle cx="48" cy="48" r={r} fill="transparent" stroke="#0f172a" strokeWidth="6" />
                                                            {/* Fill */}
                                                            <circle cx="48" cy="48" r={r} fill="transparent" stroke="url(#xpGrad)" strokeWidth="6"
                                                                strokeDasharray={circ} strokeDashoffset={strokeOffset} strokeLinecap="round" />
                                                            
                                                            <defs>
                                                                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#6366f1" />
                                                                    <stop offset="50%" stopColor="#a855f7" />
                                                                    <stop offset="100%" stopColor="#ec4899" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                        <div className="flex flex-col items-center justify-center z-10">
                                                            <span className="text-2xl font-black text-white">{lvl.level}</span>
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Level</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-center mt-3">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider ${lvl.rankColor}`}>
                                                            <span>{lvl.rankIcon}</span>
                                                            <span>{lvl.rankName}</span>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-400 mt-2">
                                                            {stats?.totalXp ?? 0} <span className="text-[10px] text-slate-600 font-normal">Total XP</span>
                                                        </div>
                                                        <div className="text-[9px] text-slate-500 mt-1">
                                                            {lvl.currentLevelXp} / {lvl.nextLevelXp} XP to next level ({lvl.percent}%)
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Right Side: Stats Grid, Actions, Tournament Sprints, Rivals */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    {/* Stats Cards grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-[#0b0e1a]/80 border border-indigo-500/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                                            <div className="absolute -right-4 -bottom-4 text-indigo-500/5 text-6xl font-black select-none">🎮</div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Games</span>
                                            <span className="text-2xl font-black text-white mt-2">{stats?.totalGames ?? 0}</span>
                                        </div>
                                        <div className="bg-[#0b0e1a]/80 border border-emerald-500/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                                            <div className="absolute -right-4 -bottom-4 text-emerald-500/5 text-6xl font-black select-none">🏆</div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Wins</span>
                                            <span className="text-2xl font-black text-emerald-400 mt-2">{stats?.wins ?? 0}</span>
                                        </div>
                                        <div className="bg-[#0b0e1a]/80 border border-rose-500/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                                            <div className="absolute -right-4 -bottom-4 text-rose-500/5 text-6xl font-black select-none">💀</div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Defeats</span>
                                            <span className="text-2xl font-black text-rose-450 mt-2">{stats?.losses ?? 0}</span>
                                        </div>
                                        <div className="bg-[#0b0e1a]/80 border border-amber-500/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
                                            <div className="absolute -right-4 -bottom-4 text-amber-500/5 text-6xl font-black select-none">⚡</div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Win Rate</span>
                                            <span className="text-2xl font-black text-amber-400 mt-2">{stats?.winRate ?? 0}%</span>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    <div className="bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-purple-950/40 border border-indigo-500/25 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
                                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                                            <div>
                                                <h3 className="text-md font-black text-white">Ready to Battle? ⚔️</h3>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                    Match against peer students, challenge the swarm AI, or join team clash rooms.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('ARENA')}
                                                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 border border-indigo-400/20"
                                            >
                                                ⚔️ Enter Battle Arena
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upcoming Sprints Section — Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-1.5">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                🚨 Live Tournament Sprints
                                            </h2>
                                            {/* Prev / Next arrows */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setSprintSlideIndex(i => (i - 1 + upcomingTournaments.length) % upcomingTournaments.length)}
                                                    className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-900 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 transition-all text-[10px]"
                                                >&lt;</button>
                                                <button
                                                    onClick={() => setSprintSlideIndex(i => (i + 1) % upcomingTournaments.length)}
                                                    className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-900 hover:bg-indigo-500/20 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-300 transition-all text-[10px]"
                                                >&gt;</button>
                                            </div>
                                        </div>

                                        {/* Single visible card */}
                                        {(() => {
                                            const t = upcomingTournaments[sprintSlideIndex];
                                            return (
                                                <div
                                                    key={t.id}
                                                    className="bg-[#0b0e1a]/85 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-3 shadow-lg transition-all"
                                                    style={{ animation: 'fadeInSlide 0.25s ease' }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-3xl">{t.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-black text-white leading-snug">{t.title}</h4>
                                                            <p className="text-[10px] text-slate-500 mt-1">
                                                                Subject: <span className="text-slate-300 font-bold">{t.subject}</span>
                                                            </p>
                                                            <p className="text-[10px] text-indigo-400 font-medium mt-0.5 truncate">🏆 {t.prizePool}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-black rounded-lg">
                                                            ⏳ {formatCountdown(t.startTime)}
                                                        </span>
                                                        <button className="text-[9px] font-black uppercase text-indigo-300 hover:text-white transition-colors bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/25 px-3 py-1.5 rounded-lg">
                                                            Register
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Dot indicators */}
                                        <div className="flex items-center justify-center gap-1.5 mt-2">
                                            {upcomingTournaments.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSprintSlideIndex(idx)}
                                                    className={`rounded-full transition-all ${
                                                        idx === sprintSlideIndex
                                                            ? 'w-4 h-1.5 bg-indigo-400'
                                                            : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rivals Opponent Log */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-1.5">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                👤 Opponents Log (Rivals)
                                            </h2>
                                        </div>
                                        {(() => {
                                            const opponents = getOpponentsList(history);
                                            if (opponents.length === 0) {
                                                return (
                                                    <div className="text-center py-6 text-slate-500 border border-dashed border-slate-900 rounded-2xl text-[11px] bg-slate-950/20">
                                                        No opponents encountered yet. Start arena battles to build your rivals list! ⚔️
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {opponents.slice(0, 4).map((opp, idx) => (
                                                        <div key={idx} className="bg-[#0b0e1a]/85 border border-slate-900 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm">
                                                                    👤
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-black text-white">{opp.name}</div>
                                                                    <div className="text-[9px] text-slate-500 mt-0.5">
                                                                        Last played: {new Date(opp.lastPlayed).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] font-black text-indigo-400">{opp.count} Match(es)</div>
                                                                <div className="text-[9px] text-slate-400 mt-0.5">
                                                                    W-L: <span className="text-emerald-400">{opp.winCount}</span> - <span className="text-rose-450">{opp.count - opp.winCount}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* History Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" /> Recent Battle History
                                            </h2>
                                            <div className="flex items-center gap-3">
                                                {history.length > 2 && (
                                                    <button
                                                        onClick={() => setView('HISTORY')}
                                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/30 border border-indigo-900/40 px-2.5 py-1 rounded-lg flex items-center gap-1"
                                                    >
                                                        <span>View All History ({history.length})</span> <ChevronRight size={12} />
                                                    </button>
                                                )}
                                                <button onClick={fetchStats} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Refresh Stats</button>
                                            </div>
                                        </div>

                                        {loadingStats ? (
                                            <div className="flex flex-col items-center justify-center py-16 bg-slate-950/10 border border-slate-900 rounded-2xl">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-xs text-slate-500 mt-3 font-medium">Fetching history log...</p>
                                            </div>
                                        ) : history.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl text-sm bg-slate-950/20">
                                                No games played yet. Click "Enter Battle Arena" to start your first match!
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {history.slice(0, 2).map((h, idx) => (
                                                    <div key={idx} className="bg-[#0b0e1a]/85 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg hover:border-slate-800 transition-all">
                                                        <div>
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div>
                                                                    <div className="font-bold text-white text-sm">
                                                                        {h.subject} <span className="text-xs text-slate-400 font-normal">({formatTopic(h.topic)})</span>
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                                                                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
                                                                            {h.mode?.replace(/_/g, ' ')}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{h.battleStyle === 'ALTERNATING' ? '⚔️ Alternating' : '⚡ Speed'}</span>
                                                                        <span>•</span>
                                                                        <span>{new Date(h.date).toLocaleDateString()} at {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    {h.isDraw ? (
                                                                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black uppercase rounded-lg">🤝 Draw</span>
                                                                    ) : h.isWinner ? (
                                                                        <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-450 text-[10px] font-black uppercase rounded-lg">🏆 Win</span>
                                                                    ) : (
                                                                        <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-450 text-[10px] font-black uppercase rounded-lg">💀 Fail</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Participants log */}
                                                        <div className="bg-black/30 border border-white/[0.02] rounded-xl p-2.5 flex flex-col gap-1.5 mt-auto">
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-600 block">Participants list</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {h.participants && h.participants.map((p: any, pIdx: number) => (
                                                                    <span
                                                                        key={pIdx}
                                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border ${
                                                                            p.isSelf
                                                                                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-bold'
                                                                                : p.team === 'A'
                                                                                    ? 'bg-blue-950/20 border-blue-500/10 text-blue-300'
                                                                                    : 'bg-purple-950/20 border-purple-500/10 text-purple-300'
                                                                        }`}
                                                                    >
                                                                        <span>{p.name}</span>
                                                                        <span className="text-[8px] opacity-60">({p.team === 'A' ? 'Alpha' : 'Omega'})</span>
                                                                        <span className="text-[9px] font-mono text-indigo-400 font-black ml-1">+{p.score}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('DASHBOARD')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-indigo-500/20 mb-6 active:scale-95"
                                >
                                    <ArrowLeft size={10} /> Back to stats dashboard
                                </button>

                                {/* 🏆 Daily Battle Challenge Banner */}
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-indigo-950/20 border border-amber-500/35 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative z-10">
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider mb-2.5">
                                                🔥 Daily Double XP Active
                                            </div>
                                            <h3 className="text-xl font-black text-white">Daily Battle Challenge</h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Today's Subject: <span className="font-bold text-slate-200">{dailySubject}</span> · 10 rounds against Future Education OS Scholar AI.
                                            </p>
                                        </div>
                                        <div className="shrink-0 w-full md:w-auto">
                                            {dailyChallengePlayed ? (
                                                <div className="px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 rounded-2xl text-xs font-black text-center flex items-center justify-center gap-1.5">
                                                    ✓ Completed Today
                                                </div>
                                            ) : (
                                                <button onClick={startDailyChallenge}
                                                    className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-2xl font-black text-xs uppercase tracking-wider text-black transition-all shadow-lg shadow-orange-950/45 hover:scale-[1.01] active:scale-95">
                                                    Fight Challenge ⚔️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Interactive RPG Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                                        onClick={() => setView('CREATE')}
                                        className="relative bg-gradient-to-br from-indigo-950/30 via-indigo-900/10 to-[#070914] border border-indigo-500/25 hover:border-indigo-400/50 rounded-3xl p-6 text-left transition-all group overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">➕</div>
                                        <div className="font-black text-lg text-white group-hover:text-indigo-300 transition-colors">Create Room</div>
                                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">Host a custom battle arena, select matching standard (Class 5-12), subject topic, and invite classmates.</div>
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                                        onClick={() => setView('JOIN')}
                                        className="relative bg-gradient-to-br from-purple-950/30 via-purple-900/10 to-[#070914] border border-purple-500/25 hover:border-purple-400/50 rounded-3xl p-6 text-left transition-all group overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
                                        <div className="font-black text-lg text-white group-hover:text-purple-300 transition-colors">Join by Code</div>
                                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">Enter an invite room code to join Team Omega or Team Alpha. Cooperate with teammates to win.</div>
                                    </motion.button>
                                </div>

                                <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Active Battle Rooms
                                    </h2>
                                    <button onClick={fetchActiveRooms} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Refresh</button>
                                </div>
                                {activeRooms.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl text-sm bg-slate-950/20">
                                        No active matches available at the moment. Create a room to begin!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {activeRooms.map(r => (
                                            <motion.div key={r._id} whileHover={{ scale: 1.01 }}
                                                className="bg-[#0b0e1a] border border-slate-850 hover:border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-mono text-sm text-indigo-400 font-black tracking-wider flex items-center gap-1.5">
                                                        <span>{r.roomCode}</span>
                                                        {r.roomType === 'TEACHER_ROOM' && (
                                                            <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-[8px] font-black rounded uppercase">Classroom</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-black text-white mt-1 truncate">📌 {formatTopic(r.topicConcept) || r.topic || 'General Quiz'}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{r.subject} • Class/Grade {r.standard}</div>
                                                    <div className="text-[9px] mt-1 font-black flex flex-wrap gap-2">
                                                        {r.battleStyle === 'ALTERNATING'
                                                            ? <span className="text-violet-400">⚔️ Alternating</span>
                                                            : <span className="text-amber-400">⚡ Speed Race</span>}
                                                        <span className="text-slate-500">•</span>
                                                        {r.roomType === 'TEACHER_ROOM' ? (
                                                            <span className="text-violet-400">📚 Board: {r.board}</span>
                                                        ) : (
                                                            <span className="text-emerald-400">🌍 Open Board (Your board questions generated)</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={() => { setJoinCode(r.roomCode); setView('JOIN'); }}
                                                    className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-950/50 transition-all active:scale-95">
                                                    <Swords className="w-3 h-3" /> Fight
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ═══ CREATE ═════════════════════════════════════════════════ */}
                {view === 'CREATE' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <button onClick={() => setView('LOBBY')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <h1 className="text-2xl font-black mb-5 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Configure Battle Arena</h1>

                        {!user?.board && (
                            <div className="bg-amber-500/10 border border-amber-500/35 rounded-2xl p-4 mb-6 text-xs text-amber-405 font-semibold flex items-center gap-2">
                                ⚠️ Your profile has no default Exam Board configured. Please select your Exam Board below to ensure proper syllabus question delivery.
                            </div>
                        )}

                        {/* Mode Grid */}
                        <div className="mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select Battle Mode</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                {MODES.map(m => (
                                    <button key={m.id} onClick={() => setSelMode(m.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all relative ${selMode === m.id ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.25)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                        {selMode === m.id && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                        <div className="text-xl mb-1">{m.icon}</div>
                                        <div className="text-xs font-black text-white leading-tight">{m.label}</div>
                                        <div className="text-[9px] text-slate-500 mt-0.5">{m.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Room Type Selector */}
                        <div className="mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Room Type</div>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setSelRoomType('OPEN_ARENA')}
                                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${selRoomType === 'OPEN_ARENA' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                    <div className="font-black text-xs text-white">⚔️ Open Arena</div>
                                    <div className="text-[9px] text-slate-500 mt-1">Anyone can join. Each student gets their own board-specific questions.</div>
                                </button>
                                <button type="button" onClick={() => { setSelRoomType('TEACHER_ROOM'); setSelMode('CLASSROOM'); }}
                                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${selRoomType === 'TEACHER_ROOM' ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                    <div className="font-black text-xs text-white">📚 Classroom Quiz (Teacher)</div>
                                    <div className="text-[9px] text-slate-500 mt-1">Invited students only. Everyone gets identical questions matching teacher's board.</div>
                                </button>
                            </div>
                        </div>

                        {/* Board, Standard, and Subject Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                    <span>Exam Board</span>
                                    <span className="text-red-400 font-bold">*</span>
                                </div>
                                <select value={selBoard} onChange={e => setSelBoard(e.target.value)}
                                    className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                    <option value="">-- Select Exam Board --</option>
                                    {BOARDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Class / Standard</div>
                                <select value={selGrade} onChange={e => setSelGrade(e.target.value)}
                                    className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                    {STANDARDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Subject / Course</div>
                                <select value={selSubject} onChange={e => setSelSubject(e.target.value)}
                                    className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                    {(STANDARD_SUBJECTS_MAP[selGrade] || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Semester & Topic Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            {/* Conditional Semester Selector */}
                            {getSemesterLabel(selSubject) && (
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                        <span>{getSemesterLabel(selSubject)}</span>
                                        <span className="text-red-400 font-bold">*</span>
                                    </div>
                                    <select value={selSemester} onChange={e => setSelSemester(e.target.value)}
                                        className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                        <option value="">-- Choose {getSemesterLabel(selSubject)} --</option>
                                        {getSemesterOptions(selSubject).map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Topic Input with AI Normalization */}
                            <div className={getSemesterLabel(selSubject) ? "" : "col-span-2"}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                    <span>Topic / Chapter Focus</span>
                                    <span className="text-red-400 font-bold">* Required</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={selTopic}
                                        onChange={e => { setSelTopic(e.target.value); setNormalizedTopic(''); setTopicError(''); }}
                                        onBlur={handleTopicNormalize}
                                        placeholder="e.g. Metals and Non-Metals, Quadratic Equations, Newton's Laws..."
                                        className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                        required
                                    />
                                    {topicNormalizing && (
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                                {topicError && (
                                    <div className="text-xs text-rose-500 mt-1 font-semibold">{topicError}</div>
                                )}
                                {normalizedTopic && normalizedTopic.toLowerCase() !== selTopic.toLowerCase().trim() && (
                                    <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                        <span>✨ Auto-corrected topic to:</span>
                                        <button type="button" onClick={() => setSelTopic(normalizedTopic)} className="underline font-black hover:text-emerald-350">
                                            "{normalizedTopic}"
                                        </button>
                                    </div>
                                )}
                                {normalizedTopic && normalizedTopic.toLowerCase() === selTopic.toLowerCase().trim() && (
                                    <div className="text-[10px] text-emerald-500 mt-1.5 flex items-center gap-1">
                                        <span>✓ Normalized successfully</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Difficulty Selector */}
                        <div className="mb-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 font-display">Difficulty</div>
                            <div className="flex gap-1.5 h-10">
                                {DIFFICULTIES.map(d => (
                                    <button key={d} type="button" onClick={() => setSelDiff(d)}
                                        className={`flex-1 rounded-xl text-xs font-bold border transition-all ${selDiff === d ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-850 text-slate-500 hover:border-slate-800'}`}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quiz Language Selector */}
                        <div className="mb-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 font-display">Quiz Language</div>
                            <select value={selLanguage} onChange={e => setSelLanguage(e.target.value)}
                                className="w-full bg-[#080a13] border border-slate-850 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50">
                                <option value="english">English (English)</option>
                                <option value="hinglish">Hinglish (Mix)</option>
                                <option value="hindi">Hindi (हिंदी)</option>
                                <option value="marathi">Marathi (मराठी)</option>
                                <option value="gujarati">Gujarati (ગુજરાતી)</option>
                                <option value="bengali">Bengali (বাংলা)</option>
                                <option value="tamil">Tamil (தமிழ்)</option>
                                <option value="telugu">Telugu (తెలుగు)</option>
                                <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                                <option value="malayalam">Malayalam (മലയാളം)</option>
                                <option value="punjabi">Punjabi (પੰਜਾਬી)</option>
                                <option value="urdu">Urdu (اردو)</option>
                            </select>
                        </div>

                        {/* Rounds */}
                        <div className="mb-5 bg-[#080a13] border border-slate-850 rounded-2xl p-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex justify-between">
                                <span>Total Match Rounds</span><span className="text-indigo-400 font-bold">{totalRounds} Rounds</span>
                            </div>
                            <input type="range" min={5} max={20} value={totalRounds} onChange={e => setTotalRounds(+e.target.value)}
                                className="w-full accent-indigo-500 cursor-pointer" />
                        </div>

                        {/* AI Difficulty */}
                        {selMode === 'SOLO_VS_AI' && (
                            <div className="mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Future Education OS AI Difficulty</div>
                                <div className="grid grid-cols-3 gap-3">
                                    {AI_DIFFS.map(a => (
                                        <button key={a.id} onClick={() => setSelAiDiff(a.id)}
                                            className={`p-3 rounded-2xl border text-left transition-all ${selAiDiff === a.id ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                            <div className="font-black text-xs text-white">{a.label}</div>
                                            <div className="text-[9px] text-slate-500 mt-1">{a.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Battle Style Selector */}
                        {selMode !== 'SOLO_VS_AI' && (
                            <div className="mb-6">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Battle Style</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setSelBattleStyle('SPEED_RACE')}
                                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${selBattleStyle === 'SPEED_RACE' ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                        {selBattleStyle === 'SPEED_RACE' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                                        <div className="text-2xl mb-1.5">⚡</div>
                                        <div className="font-black text-sm text-white">Speed Race</div>
                                        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">Both answer at once — first correct answer wins the round instantly!</div>
                                        <div className="mt-2 text-[9px] font-black text-amber-500 uppercase tracking-wider">⏱ 15s shared timer</div>
                                    </button>
                                    <button onClick={() => setSelBattleStyle('ALTERNATING')}
                                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${selBattleStyle === 'ALTERNATING' ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border-slate-850 bg-[#090b14]/50 hover:border-slate-800'}`}>
                                        {selBattleStyle === 'ALTERNATING' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                                        <div className="text-2xl mb-1.5">⚔️</div>
                                        <div className="font-black text-sm text-white">Alternating Turn</div>
                                        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">One player attacks, then the other defends — strategic chess-style duels!</div>
                                        <div className="mt-2 text-[9px] font-black text-violet-400 uppercase tracking-wider">⏱ 15s attack / 10s defense</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Teacher Classroom Invite Panel */}
                        {selRoomType === 'TEACHER_ROOM' && (
                            <div className="mb-6 bg-[#080a13] border border-violet-500/20 rounded-3xl p-5">
                                <h3 className="text-sm font-black text-white flex items-center gap-1.5 mb-1.5">
                                    <span>👥 Invite Class Students</span>
                                </h3>
                                <p className="text-[10px] text-slate-500 mb-3.5 leading-relaxed">
                                    Search for enrolled students to invite to this private classroom quiz room.
                                </p>
                                
                                <div className="flex gap-2 mb-4">
                                    <input 
                                        type="text" 
                                        value={searchStudentTerm}
                                        onChange={e => setSearchStudentTerm(e.target.value)}
                                        placeholder="Search by student name or email..."
                                        className="flex-1 bg-[#05060b] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => searchClassroomStudents(searchStudentTerm)}
                                        className="px-4 py-2 bg-violet-650 hover:bg-violet-650/80 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                                        disabled={loadingStudents}
                                    >
                                        {loadingStudents ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
                                    </button>
                                </div>

                                {/* Results List */}
                                {studentsList.length > 0 && (
                                    <div className="bg-[#05060b] border border-slate-850 rounded-2xl max-h-40 overflow-y-auto mb-4 p-2.5 flex flex-col gap-1.5">
                                        {studentsList.map(s => {
                                            const isAlreadySelected = selectedStudents.some(item => item._id === s._id);
                                            return (
                                                <div key={s._id} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                                                    <div>
                                                        <div className="text-xs font-black text-white">{s.firstName} {s.lastName || ''}</div>
                                                        <div className="text-[9px] text-slate-500">{s.email} · {s.board} · Class {s.grade}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isAlreadySelected) {
                                                                setSelectedStudents(prev => prev.filter(item => item._id !== s._id));
                                                            } else {
                                                                setSelectedStudents(prev => [...prev, s]);
                                                            }
                                                        }}
                                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all ${
                                                            isAlreadySelected 
                                                                ? 'bg-rose-500/20 text-rose-450 border border-rose-500/30' 
                                                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/35'
                                                        }`}
                                                    >
                                                        {isAlreadySelected ? 'Remove' : 'Select'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Selected Students chips */}
                                {selectedStudents.length > 0 && (
                                    <div>
                                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">Selected ({selectedStudents.length}):</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedStudents.map(s => (
                                                <span key={s._id} className="inline-flex items-center gap-1.5 bg-violet-950/40 border border-violet-500/30 px-2.5 py-1 rounded-lg text-[10px] text-violet-300 font-medium">
                                                    <span>{s.firstName}</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSelectedStudents(prev => prev.filter(item => item._id !== s._id))}
                                                        className="text-violet-400 hover:text-white"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <motion.button whileTap={{ scale: 0.97 }} onClick={createRoom} disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 rounded-2xl font-black text-base shadow-lg shadow-indigo-950/45 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
                            {loading ? 'Generating adaptive questions...' : 'Initialize Arena Match'}
                        </motion.button>
                    </motion.div>
                )}

                {/* ═══ JOIN ════════════════════════════════════════════════════ */}
                {view === 'JOIN' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-sm mx-auto">
                        <button onClick={() => setView('LOBBY')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-5 text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="bg-[#0b0e1a]/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                            <h2 className="text-xl font-black mb-5 text-center tracking-tight">Enter Room Code</h2>
                            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ARENA-123456"
                                className="w-full bg-[#05060b] border border-slate-850 rounded-2xl px-4 py-3.5 text-center font-mono text-xl font-black text-indigo-400 tracking-widest mb-5 focus:border-indigo-500 focus:outline-none" />
                            
                            {/* Live Room Info Preview Card */}
                            {loadingPreview && (
                                <div className="mb-5 p-4 bg-slate-900/20 border border-slate-800/80 rounded-2xl animate-pulse flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 text-indigo-450 animate-spin" />
                                    <span className="text-[11px] font-bold text-slate-400">Verifying code & fetching topic...</span>
                                </div>
                            )}

                            {previewError && (
                                <div className="mb-5 p-3.5 bg-rose-950/20 border border-rose-900/30 text-rose-350 rounded-2xl text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
                                    <span>⚠️</span> {previewError}
                                </div>
                            )}

                            {previewRoom && (
                                <>
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        className="mb-5 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl text-left relative overflow-hidden shadow-inner shadow-indigo-950/50 animate-fadeIn">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                                        <div className="text-[9px] font-black uppercase text-indigo-400 tracking-wider mb-1 flex items-center justify-between">
                                            <span>✨ Room Found</span>
                                            <span className="bg-indigo-900/40 px-1.5 py-0.5 rounded text-[8px] text-indigo-300 font-bold">{previewRoom.roomCode}</span>
                                        </div>
                                        <h3 className="text-xs font-black text-white mb-2 leading-tight">
                                            📌 {formatTopic(previewRoom.topicConcept) || previewRoom.topic || 'General Quiz'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] text-slate-400 font-semibold border-t border-slate-850 pt-2.5 mt-1">
                                            <div className="flex items-center gap-1 truncate">
                                                <span>📚</span> <span className="truncate" title={previewRoom.subject}>{previewRoom.subject}</span>
                                            </div>
                                            <div className="flex items-center gap-1 truncate">
                                                <span>👤</span> <span className="truncate" title={previewRoom.hostId ? `${previewRoom.hostId.firstName} ${previewRoom.hostId.lastName || ''}` : 'System'}>By {previewRoom.hostId ? `${previewRoom.hostId.firstName} ${previewRoom.hostId.lastName || ''}` : 'System'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 truncate">
                                                <span>⚔️</span> <span>{previewRoom.battleStyle === 'SPEED_RACE' ? 'Speed Race' : 'Alternating Turn'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 truncate">
                                                <span>🎯</span> <span>{previewRoom.totalRounds || 10} Rounds ({previewRoom.difficulty || 'Medium'})</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Join Strategy / Option buttons */}
                                    <div className="mb-5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Join Option</div>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button 
                                                type="button"
                                                onClick={() => setJoinMode('SAME')}
                                                className={`py-3 px-2 rounded-2xl font-bold text-xs border transition-all flex flex-col items-center justify-center gap-1 ${
                                                    joinMode === 'SAME' 
                                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-450 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                                                        : 'border-slate-850 text-slate-400 hover:border-slate-800'
                                                }`}
                                            >
                                                <span className="font-black text-[11px]">👉 Same to Same</span>
                                                <span className="text-[8px] opacity-75 font-normal text-center">Use Host's settings</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setJoinMode('CUSTOM')}
                                                className={`py-3 px-2 rounded-2xl font-bold text-xs border transition-all flex flex-col items-center justify-center gap-1 ${
                                                    joinMode === 'CUSTOM' 
                                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
                                                        : 'border-slate-850 text-slate-400 hover:border-slate-800'
                                                }`}
                                            >
                                                <span className="font-black text-[11px]">⚙️ Customize</span>
                                                <span className="text-[8px] opacity-75 font-normal text-center">Adapt to my class</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="mb-5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select Battle Side</div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {(['A', 'B'] as const).map(t => (
                                        <button key={t} onClick={() => setJoinTeam(t)}
                                            className={`py-3 rounded-2xl font-bold text-xs border transition-all ${joinTeam === t ? (t === 'A' ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]') : 'border-slate-850 text-slate-500 hover:border-slate-800'}`}>
                                            {t === 'A' ? '🔵 Team Alpha' : '🔴 Team Omega'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Same-to-Same Strategy Display */}
                            {previewRoom && joinMode === 'SAME' && (
                                <div className="mb-5 p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-2xl text-left text-[11px] text-emerald-400 font-semibold space-y-1.5 animate-fadeIn">
                                    <div className="flex items-center gap-2">
                                        <span>✅</span>
                                        <span>Connected to Host's Settings!</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 mt-2 text-slate-300 font-medium text-[10px] border-t border-emerald-500/10 pt-2">
                                        <div>📚 Board: <span className="text-white font-bold">{getBoardName(previewRoom.board)}</span></div>
                                        <div>🎓 Grade: <span className="text-white font-bold">{getStandardName(previewRoom.standard)}</span></div>
                                        <div className="col-span-2 mt-1">📌 Topic: <span className="text-white font-bold">{formatTopic(previewRoom.topicConcept) || previewRoom.topic || 'General Quiz'}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Custom Strategy Config Display */}
                            {(!previewRoom || joinMode === 'CUSTOM') && (
                                <div className="mb-5 text-left animate-fadeIn space-y-4">
                                    {previewRoom && (
                                        <div className="text-[10px] text-slate-400 font-semibold bg-indigo-950/10 border border-indigo-500/10 p-3 rounded-xl leading-relaxed">
                                            ⚙️ Customize your settings. You can change <span className="text-white font-bold">Board, Grade, Subject, and Topic</span> — questions will be generated just for you.
                                        </div>
                                    )}

                                    {/* Board */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                            <span>Your Exam Board</span>
                                            <span className="text-red-400 font-bold">*</span>
                                        </div>
                                        <select value={selBoard} onChange={e => setSelBoard(e.target.value)}
                                            className="w-full bg-[#05060b] border border-slate-850 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                            <option value="">-- Select Exam Board --</option>
                                            {BOARDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Grade */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Select Your Class / Grade</div>
                                        <select value={joinGrade} onChange={e => setJoinGrade(e.target.value)}
                                            className="w-full bg-[#05060b] border border-slate-850 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                            {STANDARDS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                            <span>Subject</span>
                                            <span className="text-xs text-indigo-400 font-medium normal-case tracking-normal">host: {previewRoom?.subject || '—'}</span>
                                        </div>
                                        <select value={joinSubject} onChange={e => setJoinSubject(e.target.value)}
                                            className="w-full bg-[#05060b] border border-slate-850 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                            <option value="">-- Same as Host --</option>
                                            {(STANDARD_SUBJECTS_MAP[joinGrade] || SUBJECTS).map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Topic */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
                                            <span>Topic / Chapter</span>
                                            <span className="text-xs text-indigo-400 font-medium normal-case tracking-normal">host: {formatTopic(previewRoom?.topicConcept) || previewRoom?.topic || '—'}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={joinTopic}
                                            onChange={e => setJoinTopic(e.target.value)}
                                            placeholder="Enter topic (leave blank = same as host)"
                                            className="w-full bg-[#05060b] border border-slate-850 rounded-2xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-700"
                                        />
                                        <p className="text-[9px] text-slate-600 mt-1 ml-1">Leave blank to use host's topic</p>
                                    </div>
                                </div>
                            )}


                            <motion.button whileTap={{ scale: 0.97 }} onClick={joinRoom} disabled={loading || !joinCode}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-2xl font-black text-sm tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                                Join Arena Lobby
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ═══ WAITING LOBBY ══════════════════════════════════════════ */}
                {view === 'WAITING' && room && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Join Toast Notification */}
                        <AnimatePresence>
                            {joinToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.96 }}
                                    className="mb-4 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-300 font-semibold flex items-start gap-2 shadow-lg shadow-emerald-950/30"
                                >
                                    <span className="shrink-0 text-base">🎉</span>
                                    <span className="leading-relaxed">{joinToast}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                {room.subject} • {room.mode?.replace(/_/g, ' ')} • Class/Grade {room.standard}
                            </div>
                            <h1 className="text-2xl font-black mb-1 tracking-tight">Match Lobby Arena</h1>

                            
                            {/* Topic Banner */}
                            <div className="mb-4 text-sm font-black text-indigo-300">
                                📌 Topic: <span className="text-white">{formatTopic(room.topicConcept) || room.topic || 'General Quiz'}</span>
                            </div>

                            <div className="inline-flex items-center gap-3 bg-[#0a0d18] border border-slate-800 rounded-2xl px-5 py-3 shadow-lg mb-3">
                                <span className="font-mono text-xl font-black text-indigo-400 tracking-widest">{room.roomCode}</span>
                                <button onClick={copyCode} className="text-slate-400 hover:text-white transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                Share this code with other students to fill the teams!
                            </div>

                            {/* Board Specific Status Note */}
                            <div className="mt-4 max-w-md mx-auto p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl text-[11px]">
                                {room.roomType === 'TEACHER_ROOM' ? (
                                    <div className="text-violet-400 font-semibold">
                                        📚 Classroom Quiz: Everyone gets identical questions matching Teacher's board (<span className="text-white font-bold">{room.board}</span>).
                                    </div>
                                ) : (
                                    <div className="text-emerald-450 font-semibold">
                                        🌍 Open Arena: You will get questions customized to your board (<span className="text-white font-bold">{user?.board || 'NCERT'}</span>).
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Team A */}
                            <div className="bg-[#0b1021] border border-indigo-900/40 rounded-3xl p-5 shadow-xl">
                                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2 border-b border-indigo-950/40 pb-2">
                                    <Shield className="w-4 h-4 text-indigo-400" /> Team Alpha ({teamAPlayers.length} / {room.teamASizeTarget})
                                </div>
                                <div className="space-y-2">
                                    {teamAPlayers.map(p => (
                                        <div key={p.userId} className="flex items-center gap-3 bg-[#060a18]/60 border border-slate-850 px-3.5 py-2.5 rounded-2xl">
                                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black">{p.firstName[0]}</div>
                                            <span className="font-bold text-sm truncate">{p.firstName}</span>
                                            <span className="ml-auto text-[10px] bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full font-black">Class {p.grade}</span>
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, room.teamASizeTarget - teamAPlayers.length) }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs text-slate-600 px-3.5 py-2.5 border border-dashed border-slate-850 rounded-2xl">
                                            <div className="w-7 h-7 rounded-full border border-dashed border-slate-800 flex items-center justify-center font-bold">?</div>
                                            <span>Waiting for player...</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Team B */}
                            <div className="bg-[#210b10] border border-rose-900/30 rounded-3xl p-5 shadow-xl">
                                <div className="text-xs font-black uppercase tracking-widest text-rose-450 mb-4 flex items-center gap-2 border-b border-rose-950/40 pb-2">
                                    {room.mode === 'SOLO_VS_AI' ? <Bot className="w-4 h-4 text-rose-450" /> : <Flame className="w-4 h-4 text-rose-450" />}
                                    {room.mode === 'SOLO_VS_AI' ? `Future Education OS Bot` : `Team Omega (${teamBPlayers.length} / ${room.teamBSizeTarget})`}
                                </div>
                                <div className="space-y-2">
                                    {room.mode === 'SOLO_VS_AI' ? (
                                        <div className="flex items-center gap-3 bg-[#1d080c]/60 border border-rose-950/30 px-3.5 py-2.5 rounded-2xl">
                                            <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                                            <span className="font-bold text-sm">Future Education OS Bot</span>
                                            <span className="ml-auto text-[10px] bg-rose-900/40 text-rose-305 px-2.5 py-0.5 rounded-full font-black">{room.aiDifficulty}</span>
                                        </div>
                                    ) : (
                                        <>
                                            {teamBPlayers.map(p => (
                                                <div key={p.userId} className="flex items-center gap-3 bg-[#18060a]/60 border border-slate-850 px-3.5 py-2.5 rounded-2xl">
                                                    <div className="w-7 h-7 rounded-full bg-rose-650 flex items-center justify-center text-[11px] font-black">{p.firstName[0]}</div>
                                                    <span className="font-bold text-sm truncate">{p.firstName}</span>
                                                    <span className="ml-auto text-[10px] bg-rose-900/40 text-rose-300 px-2 py-0.5 rounded-full font-black">Class {p.grade}</span>
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, room.teamBSizeTarget - teamBPlayers.length) }).map((_, i) => (
                                                <div key={i} className="flex items-center gap-3 text-xs text-slate-650 px-3.5 py-2.5 border border-dashed border-slate-850 rounded-2xl">
                                                    <div className="w-7 h-7 rounded-full border border-dashed border-slate-800 flex items-center justify-center font-bold">?</div>
                                                    <span>Waiting for player...</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isHost ? (
                            <motion.button whileTap={{ scale: 0.97 }} onClick={startMatch}
                                disabled={!isReady}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-900 disabled:to-slate-950 disabled:text-slate-700 disabled:border-slate-900 disabled:border rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2">
                                <Play className="w-4 h-4" />
                                {isReady ? 'Launch Arena Battle!' : `Waiting for players to connect (${room.players.length} / ${room.teamASizeTarget + (room.mode === 'SOLO_VS_AI' ? 0 : room.teamBSizeTarget)})`}
                            </motion.button>
                        ) : (
                            <div className="text-center py-4 text-slate-500 text-sm flex items-center justify-center gap-2 border border-slate-850 bg-slate-950/20 rounded-2xl font-semibold">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" /> Host will launch the battle shortly...
                            </div>
                        )}

                        {room.roomType === 'TEACHER_ROOM' && isHost ? (
                            <button
                                onClick={handleTeacherStopQuiz}
                                disabled={loading}
                                className="w-full mt-3 py-3 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800 hover:border-rose-700 text-rose-250 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                🛑 Stop Quiz & Terminate Room
                            </button>
                        ) : (
                            <button
                                onClick={leaveLobby}
                                disabled={loading}
                                className="w-full mt-3 py-3 bg-slate-900/60 hover:bg-rose-950/25 border border-slate-800 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isHost ? 'Cancel Battle & Close Lobby' : 'Leave Lobby & Exit'}
                            </button>
                        )}
                    </motion.div>
                )}

                {/* ═══ BATTLE ══════════════════════════════════════════════════ */}
                {view === 'BATTLE' && room && (
                    <div className="flex flex-col gap-4 min-h-screen py-1">

                        {/* Interactive RPG Character Avatars & HP Board */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Team Alpha Hero Card */}
                            <motion.div
                                animate={shakeA ? { x: [0, -10, 10, -7, 7, -4, 4, 0], scale: [1, 0.96, 1.04, 1] } : {}}
                                transition={{ duration: 0.4 }}
                                className="bg-[#0b1021]/80 border border-indigo-500/30 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_30px_rgba(99,102,241,0.15)] flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0">🛡️</div>
                                    <div className="text-left min-w-0">
                                        <div className="text-xs font-black text-indigo-400 tracking-widest uppercase">Team Alpha</div>
                                        <div className="text-[9px] text-slate-500 truncate">Knight Scholar</div>
                                    </div>
                                </div>
                                <HpBar current={room.teamA.hp} max={room.teamA.maxHp} />
                                <div className="flex flex-col gap-1.5 mt-2.5 border-t border-indigo-950/40 pt-2 text-left w-full">
                                    {teamAPlayers.map(p => {
                                        const roundState = room.roundStates[currentRound];
                                        const answered = roundState?.teamAAnswers?.[p.userId] || (roundState?.teamAAnswers as any)?.[p.userId] || (room.players.find(x => x.userId === p.userId)?.hasFinished);
                                        const isActiveTurnPlayer = room.battleStyle === 'ALTERNATING' && activeTurn === 'A';
                                        return (
                                            <div key={p.userId} className="flex items-center justify-between text-[10px]">
                                                <span className="font-bold text-indigo-300 truncate max-w-[90px]">
                                                    {p.firstName}{p.streakCount >= 2 ? ` 🔥` : ''}
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                                    answered ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20' :
                                                    isActiveTurnPlayer && !answered ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30 animate-pulse' :
                                                    'bg-slate-900 text-slate-500 border border-slate-800'
                                                }`}>
                                                    {answered ? '✓ DONE' : isActiveTurnPlayer ? '⚔️ ATTACKING' : '🛡️ STANDBY'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {damageEventsA.map(d => <DamageFloat key={d.id} amount={d.amount} isHeal={false} />)}
                            </motion.div>

                            {/* Team Omega / Bot Hero Card */}
                            <motion.div
                                animate={shakeB ? { x: [0, 10, -10, 7, -7, 4, -4, 0], scale: [1, 0.96, 1.04, 1] } : {}}
                                transition={{ duration: 0.4 }}
                                className="bg-[#210b10]/80 border border-rose-500/25 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_30px_rgba(244,63,94,0.15)] flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-550/45 flex items-center justify-center text-xl shrink-0">
                                        {room.mode === 'SOLO_VS_AI' ? '🤖' : '🔮'}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <div className="text-xs font-black text-rose-450 tracking-widest uppercase">
                                            {room.mode === 'SOLO_VS_AI' ? 'Future Education OS AI' : 'Team Omega'}
                                        </div>
                                        <div className="text-[9px] text-slate-500 truncate">
                                            {room.mode === 'SOLO_VS_AI' ? `${room.aiDifficulty} Cyborg` : 'Challengers'}
                                        </div>
                                    </div>
                                </div>
                                <HpBar current={room.teamB.hp} max={room.teamB.maxHp} />
                                <div className="flex flex-col gap-1.5 mt-2.5 border-t border-rose-950/40 pt-2 text-left w-full">
                                    {room.mode === 'SOLO_VS_AI' ? (() => {
                                        const roundState = room.roundStates[currentRound];
                                        const answered = roundState?.teamBAnswers?.['AI'] || (roundState?.teamBAnswers as any)?.get?.('AI');
                                        return (
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="font-bold text-rose-300">
                                                    🤖 Future Education OS Bot
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${answered ? 'bg-emerald-950/60 text-emerald-450 border border-emerald-500/20' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                                                    {answered ? '✓ DONE' : '⏳ THINKING'}
                                                </span>
                                            </div>
                                        );
                                    })() : teamBPlayers.map(p => {
                                        const roundState = room.roundStates[currentRound];
                                        const answered = roundState?.teamBAnswers?.[p.userId] || (roundState?.teamBAnswers as any)?.[p.userId] || (room.players.find(x => x.userId === p.userId)?.hasFinished);
                                        const isActiveTurnPlayer = room.battleStyle === 'ALTERNATING' && activeTurn === 'B';
                                        return (
                                            <div key={p.userId} className="flex items-center justify-between text-[10px]">
                                                <span className="font-bold text-rose-300 truncate max-w-[90px]">
                                                    {p.firstName}{p.streakCount >= 2 ? ` 🔥` : ''}
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                                                    answered ? 'bg-emerald-950/60 text-emerald-450 border border-emerald-500/20' :
                                                    isActiveTurnPlayer && !answered ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30 animate-pulse' :
                                                    'bg-slate-900 text-slate-500 border border-slate-800'
                                                }`}>
                                                    {answered ? '✓ DONE' : isActiveTurnPlayer ? '⚔️ ATTACKING' : '🛡️ STANDBY'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {damageEventsB.map(d => <DamageFloat key={d.id} amount={d.amount} isHeal={false} />)}
                            </motion.div>
                        </div>

                        {/* Question Card */}
                        <div className="flex-1 bg-[#090b14]/90 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-2xl relative">
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.03),transparent)] pointer-events-none rounded-3xl" />

                            <div className="flex items-center justify-between mb-4 relative z-10 border-b border-slate-900 pb-3">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round {currentRound + 1} / {room.totalRounds}</div>
                                    <div className="text-xs font-black text-indigo-400 mt-0.5">📌 {formatTopic(room.topicConcept) || room.topic || 'General Quiz'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {room.roomType === 'TEACHER_ROOM' && isHost ? (
                                        <button
                                            onClick={handleTeacherStopQuiz}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-rose-500 bg-rose-900/60 hover:bg-rose-800 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-rose-950/50"
                                        >
                                            🛑 Stop Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleLeaveBattle}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-450 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-rose-950/50"
                                        >
                                            🏃 Leave
                                        </button>
                                    )}
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
                                        (room.battleStyle === 'ALTERNATING' && room.mode !== 'SOLO_VS_AI' && activeTurn !== myTeam) ? 'border-amber-500/30 bg-amber-900/10 text-amber-400' :
                                        timerFrozen ? 'border-blue-500/30 bg-blue-900/20 text-blue-400' : 
                                        timeLeft <= 5 ? 'border-rose-500/40 bg-rose-900/20 text-rose-400 animate-pulse' : 
                                        'border-slate-800 bg-[#06080e] text-slate-350'
                                    }`}>
                                        <Clock className="w-3.5 h-3.5" />
                                        {(room.battleStyle === 'ALTERNATING' && room.mode !== 'SOLO_VS_AI' && activeTurn !== myTeam) ? '🛡️ STANDBY' : timerFrozen ? 'TIMER FROZEN' : `${timeLeft} Seconds`}
                                    </div>
                                </div>
                            </div>

                            {/* ⚔️ YOUR TURN / OPPONENT'S TURN Banner */}
                            {room.battleStyle === 'ALTERNATING' && room.mode !== 'SOLO_VS_AI' && (
                                <AnimatePresence mode="wait">
                                    {activeTurn === myTeam ? (
                                        <motion.div key="your-turn"
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            className="mb-4 relative z-10 bg-gradient-to-r from-emerald-900/50 to-teal-900/40 border border-emerald-500/50 rounded-2xl px-4 py-3 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg animate-bounce">⚔️</div>
                                            <div>
                                                <div className="text-sm font-black text-emerald-300 tracking-wide">IT'S YOUR TURN! Answer Now!</div>
                                                <div className="text-[10px] text-emerald-500/70 font-medium">You are the ATTACKER — strike the opponent!</div>
                                            </div>
                                            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="opponent-turn"
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            className="mb-4 relative z-10 bg-slate-900/60 border border-slate-700/40 rounded-2xl px-4 py-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/40 flex items-center justify-center text-lg">🔒</div>
                                            <div>
                                                <div className="text-sm font-black text-slate-400 tracking-wide">Opponent's Turn</div>
                                                <div className="text-[10px] text-slate-600 font-medium">Wait for them to answer first...</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}

                            {teammateWrong && !hasSubmitted && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mb-4 text-[11px] bg-amber-900/20 border border-amber-500/20 text-amber-400 rounded-xl px-3 py-2.5 font-medium relative z-10 flex items-center gap-1.5">
                                    <span>⚠️</span> Teammate chose Option {String.fromCharCode(65 + teammateWrong.wrongOption)} (WRONG!). Choose another option!
                                </motion.div>
                            )}

                            {myQuestion ? (
                                <div className="relative z-10 flex flex-col flex-1">
                                    <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">Class {myPlayer?.grade} • {room.subject} Syllabus</div>
                                    <h3 className="text-base font-bold text-white mb-6 leading-relaxed">{cleanQuestionText(myQuestion.question)}</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {myQuestion.options?.map((opt, idx) => {
                                            if (hiddenOptions.includes(idx)) return null;
                                            const isSelected = selectedOption === idx;
                                            const isCorrectOpt = myQuestion.correctAnswer === idx;
                                            const isTeammateWrong = teammateWrong?.wrongOption === idx;
                                            // ALTERNATING: lock buttons if it's not my turn
                                            const isMyTurnLocked = !hasSubmitted &&
                                                room.battleStyle === 'ALTERNATING' &&
                                                room.mode !== 'SOLO_VS_AI' &&
                                                activeTurn !== myTeam;

                                            let cls = 'border-slate-800 bg-[#06080e]/40 hover:border-indigo-500/40 hover:bg-indigo-950/10 text-slate-300 cursor-pointer';
                                            if (isMyTurnLocked) {
                                                cls = 'border-slate-900 bg-slate-950/30 text-slate-700 cursor-not-allowed opacity-40';
                                            } else if (hasSubmitted) {
                                                if (isSelected && isCorrectOpt) cls = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 cursor-default';
                                                else if (isSelected) cls = 'border-rose-500 bg-rose-950/40 text-rose-350 cursor-default';
                                                else if (isCorrectOpt) cls = 'border-emerald-500/40 bg-emerald-950/15 text-emerald-400 cursor-default';
                                                else cls = 'border-slate-900 opacity-25 cursor-default';
                                            } else if (isTeammateWrong) {
                                                cls = 'border-amber-900/30 bg-amber-950/5 text-slate-650 cursor-not-allowed';
                                            }

                                            return (
                                                <motion.button key={idx}
                                                    whileHover={!hasSubmitted && !isTeammateWrong && !isMyTurnLocked ? { scale: 1.005 } : {}}
                                                    whileTap={!hasSubmitted && !isTeammateWrong && !isMyTurnLocked ? { scale: 0.99 } : {}}
                                                    disabled={hasSubmitted || isTeammateWrong || isMyTurnLocked}
                                                    onClick={() => submitAnswer(idx)}
                                                    className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center gap-3 ${cls}`}>
                                                    <span className="w-5.5 h-5.5 flex-shrink-0 rounded-full border border-current flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>
                                                    <span className="flex-1">{cleanOptionText(opt, String.fromCharCode(65 + idx))}</span>
                                                    {isTeammateWrong && <span className="text-[9px] shrink-0 text-amber-500 font-bold">Team ✗</span>}
                                                    {isMyTurnLocked && <span className="text-[9px] shrink-0 text-slate-600 font-bold">🔒</span>}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Detailed Wrong/Right Feedback with Real Answer & XP deduction */}
                                    {hasSubmitted && selectedOption !== null && selectedOption !== myQuestion.correctAnswer && (
                                        <div className="mt-4 text-xs bg-rose-950/30 border border-rose-800/40 text-rose-455 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                                            <span>❌</span>
                                            <div>
                                                Incorrect answer. The correct answer was: <span className="underline text-rose-300 font-black">{cleanOptionText(myQuestion.options[myQuestion.correctAnswer], String.fromCharCode(65 + myQuestion.correctAnswer))}</span>.
                                                <div className="text-[10px] text-slate-500 mt-0.5">Deducted 150 team HP & lost 10 Profile XP.</div>
                                            </div>
                                        </div>
                                    )}
                                    {hasSubmitted && selectedOption === myQuestion.correctAnswer && (
                                        <div className="mt-4 text-xs bg-emerald-950/30 border border-emerald-800/40 text-emerald-455 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                                            <span>🎯</span>
                                            <div>
                                                Correct! Critical strike dealt to opponent team.
                                                <div className="text-[10px] text-slate-500 mt-0.5">Claimed points for your team!</div>
                                            </div>
                                        </div>
                                    )}

                                    {hasSubmitted && (
                                        <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                            {roundComplete ? 'Loading next round stage...' : 'Waiting for opponent side to answer...'}
                                        </div>
                                    )}
                                    {hasSubmitted && myQuestion.explanation && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="mt-3 text-[11px] bg-blue-950/20 border border-blue-900/30 text-blue-300 rounded-xl px-4 py-2.5 leading-relaxed">
                                            <strong>Concept:</strong> {myQuestion.explanation}
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-500">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" /> Loading next dynamic question set...
                                </div>
                            )}
                        </div>

                        {/* Power-ups */}
                        {myPlayer && !hasSubmitted && (
                            <div className="flex gap-2.5 justify-center flex-wrap">
                                {[
                                    { key: 'shield', icon: <Shield className="w-3.5 h-3.5" />, label: 'Shield', tip: 'Block wrong damage' },
                                    { key: 'doubleStrike', icon: <Zap className="w-3.5 h-3.5" />, label: '2x Strike', tip: 'Double correct damage' },
                                    { key: 'freeze', icon: <Clock className="w-3.5 h-3.5" />, label: 'Freeze', tip: 'Pause round timer' },
                                    { key: 'fiftyFifty', icon: <Shuffle className="w-3.5 h-3.5" />, label: '50/50', tip: 'Hide two wrong options' },
                                ].map(pu => {
                                    const used = myPlayer.powerupsUsed.includes(pu.key) || !myPlayer.powerups[pu.key as keyof typeof myPlayer.powerups];
                                    return (
                                        <button key={pu.key} disabled={used} onClick={() => usePowerup(pu.key)}
                                            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-[10px] font-black border transition-all w-24 relative overflow-hidden ${used ? 'border-slate-900 bg-[#05060b]/40 text-slate-700 cursor-not-allowed' : 'border-indigo-500/20 bg-indigo-950/20 text-indigo-300 hover:border-indigo-400 hover:scale-[1.02] active:scale-95'}`}>
                                            <div className="text-sm mb-1">{pu.icon}</div>
                                            <div>{pu.label}</div>
                                            <div className="text-[7.5px] text-slate-500 mt-0.5 leading-tight font-medium text-center">{pu.tip}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Battle Feed Log Panel */}
                        {battleFeed.length > 0 && (
                            <div className="bg-[#080b13]/85 border border-slate-850 rounded-2xl p-4 mt-1 max-h-[150px] overflow-y-auto shadow-inner">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 border-b border-slate-850 pb-1.5 flex items-center gap-2">
                                    <Swords className="w-3.5 h-3.5 text-indigo-450 animate-pulse" /> Battle Arena Logs
                                </div>
                                <div className="space-y-1.5 scrollbar-thin">
                                    {battleFeed.map((feed, i) => (
                                        <div key={i} className="text-[11px] font-medium text-slate-350 font-mono tracking-tight leading-relaxed border-l-2 border-indigo-500/40 pl-2.5">
                                            {feed}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* ═══ RESULTS ════════════════════════════════════════════════ */}
                {view === 'RESULTS' && room && (
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center">
                        <div className="mb-7">
                            {room.winnerTeam === 'DRAW' ? (
                                <>
                                    <div className="text-5xl mb-3">🤝</div>
                                    <h1 className="text-3xl font-black text-amber-400">DRAW!</h1>
                                    <p className="text-slate-500 text-sm mt-1">Equal power, equal might!</p>
                                </>
                            ) : room.winnerTeam ? (
                                <>
                                    <motion.div animate={{ rotate: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.6 }} className="text-5xl mb-3">🏆</motion.div>
                                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                        TEAM {room.winnerTeam === 'A' ? 'ALPHA' : 'OMEGA'} WINS!
                                    </h1>
                                    {myTeam === room.winnerTeam
                                        ? <p className="text-emerald-450 text-sm mt-1.5 font-black">VICTORY! Profile XP awarded (+300 XP)</p>
                                        : <p className="text-slate-500 text-sm mt-1.5 font-semibold">Match complete. Participation reward (+100 XP)</p>
                                    }
                                </>
                            ) : (
                                <><div className="text-5xl mb-3">⚔️</div><h1 className="text-3xl font-black">Battle Over</h1></>
                            )}
                        </div>

                        {/* Scorecards */}
                        <div className="space-y-4 mb-6">
                            {[{ players: teamAPlayers, teamKey: 'A', label: 'Team Alpha', icon: <Shield className="w-3.5 h-3.5" />, color: 'indigo' },
                              { players: room.mode === 'SOLO_VS_AI' ? [] : teamBPlayers, teamKey: 'B', label: room.mode === 'SOLO_VS_AI' ? 'Future Education OS AI' : 'Team Omega', icon: room.mode === 'SOLO_VS_AI' ? <Bot className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />, color: 'rose' }
                            ].map(({ players, teamKey, label, icon, color }) => (
                                <div key={teamKey} className={`bg-${color}-950/15 border border-${color}-900/35 rounded-3xl p-4.5 shadow-xl`}>
                                    <div className={`text-[10px] font-black uppercase tracking-widest text-${color}-400 mb-3 flex items-center gap-1.5 border-b border-${color}-950/30 pb-2`}>
                                        {icon} {label}
                                        {room.winnerTeam === teamKey && <Crown className="w-3.5 h-3.5 text-yellow-450 ml-auto" />}
                                    </div>
                                    {room.mode === 'SOLO_VS_AI' && teamKey === 'B' ? (
                                        <div className="flex items-center gap-3 bg-slate-900/40 rounded-2xl px-4 py-3">
                                            <Bot className="w-5 h-5 text-rose-450" />
                                            <span className="font-bold text-sm">Future Education OS Bot</span>
                                            <span className="ml-auto text-xs text-slate-500 font-bold">Grade Adaptive AI ({room.aiDifficulty})</span>
                                        </div>
                                    ) : players.map(p => {
                                        const correct = p.answersRecord?.filter(a => a.isCorrect).length ?? 0;
                                        const isMvp = room.mvpPlayerId === p.userId;
                                        return (
                                            <div key={p.userId} className="flex items-center gap-3 bg-slate-900/30 border border-slate-850 rounded-2xl px-4 py-3 mb-2">
                                                <div className={`w-7 h-7 rounded-full bg-${color}-650 flex items-center justify-center text-[11px] font-black flex-shrink-0`}>{p.firstName[0]}</div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-bold flex items-center gap-1.5 text-sm">{p.firstName} {isMvp && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}</div>
                                                    <div className="text-[9px] text-slate-500 font-bold">Class {p.grade} Scholar</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-black text-white text-sm">{p.score} pts</div>
                                                    <div className="text-[10px] text-slate-500 font-bold">{correct} / {p.answersRecord?.length ?? 0} Correct</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => { setView('LOBBY'); setActiveTab('DASHBOARD'); setRoom(null); fetchActiveRooms(); fetchStats(); }}
                                className="flex-1 py-3.5 border border-slate-800 hover:border-slate-700 bg-slate-900/20 rounded-2xl font-bold text-sm transition-colors">
                                Back to Arena Lobby
                            </button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setView('CREATE'); setRoom(null); }}
                                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg shadow-indigo-950/50">
                                Play Again ⚔️
                            </motion.button>
                        </div>

                        {/* ─── WhatsApp Victory Share Card ─── */}
                        {/* ─── WhatsApp Victory Share Card ─── */}
                        {myTeam === room.winnerTeam && (() => {
                            const me = room.players.find(p => ((p.userId as any)?._id || p.userId)?.toString() === user?._id?.toString());
                            const myScore = me?.score || 0;
                            const totalQuestions = me?.answersRecord?.length || 0;
                            const correctQuestions = me?.answersRecord?.filter(a => a.isCorrect).length || 0;

                            return (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                    className="mt-5 bg-gradient-to-br from-emerald-950/40 to-teal-950/30 border border-emerald-800/30 rounded-3xl p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
                                        🏆 Share Your Victory
                                    </div>

                                    {/* Card Preview */}
                                    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 to-[#0e1627] border border-emerald-500/40 rounded-3xl p-5 mb-4 text-left shadow-2xl shadow-emerald-950/20">
                                        {/* Neon Glow Effects */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                        <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-sm">⚔️</div>
                                                <div>
                                                    <div className="text-xs font-black tracking-wider text-emerald-400">QUIZ ARENA BATTLE</div>
                                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Victory Certificate</div>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Winner
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Champion Player</div>
                                                <div className="text-base font-black text-white leading-tight mt-0.5">
                                                    👑 {user?.firstName}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 bg-slate-900/60 border border-slate-850 p-3 rounded-2xl">
                                                <div>
                                                    <div className="text-[9px] text-slate-500 font-bold uppercase">Subject</div>
                                                    <div className="text-xs font-black text-indigo-300">{room.subject}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] text-slate-500 font-bold uppercase">Grade & Mode</div>
                                                    <div className="text-xs font-black text-slate-305 truncate">
                                                        Class {user?.grade || 10} · {room.mode.replace(/_/g, ' ')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 px-3.5 py-2.5 rounded-2xl">
                                                <div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase">Arena Score</div>
                                                    <div className="text-base font-black text-emerald-400">{myScore} PTS</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase">Accuracy</div>
                                                    <div className="text-xs font-black text-slate-205">
                                                        {correctQuestions} / {totalQuestions} Correct
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-dashed border-slate-800/80 flex items-center justify-between">
                                            <div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase">Room Code</div>
                                                <div className="text-xs font-black text-white tracking-widest">{room.roomCode}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-emerald-400 font-bold">{window.location.host}</div>
                                                <div className="text-[8px] text-slate-500 font-medium">Join & challenge me!</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Share Button */}
                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => {
                                            const studentName = user?.firstName || 'A Student';
                                            const grade = user?.grade || 10;
                                            const modeLabel = room.mode.replace(/_/g, ' ');
                                            const subjectLabel = room.subject;
                                            const roomCode = room.roomCode;
                                            const challengeLink = `${window.location.origin}/future-education/quiz-battle?join=${roomCode}`;
                                            
                                            const msg = `\uD83D\uDD25 *QUIZ ARENA BATTLE CONQUERED!* \uD83D\uDD25\n\n\uD83D\uDC51 *${studentName}* (Class *${grade}*) has just DOMINATED the *${subjectLabel}* Arena! \u2694\uFE0F\n\n\uD83C\uDFC6 *Match Stats:*\n- *Mode:* ${modeLabel}\n- *Score:* ${myScore} pts\n- *Accuracy:* ${correctQuestions}/${totalQuestions} Correct\n- *Status:* Unbeaten!\n\n*"मैंने तो मैदान मार लिया! \u26A1 क्या तुझमें दम है मेरा ये स्कोर तोड़ने का? दम है तो आजा! \uD83D\uDE09\uD83D\uDC4A"*\n\n\uD83D\uDD11 *Room Code:* ${roomCode}\n\uD83D\uDC49 *Challenge Link:* ${challengeLink}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-950/40">
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        Share Victory on WhatsApp
                                    </motion.button>
                                </motion.div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* ═══ TEACHER STOPPED VIEW ════════════════════════════════════ */}
                {view === 'TEACHER_STOPPED' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md mx-auto bg-[#090b14]/90 border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
                        
                        <div className="w-20 h-20 mx-auto bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-4xl">🛑</span>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-3">Quiz Terminated</h2>
                        
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            This battle has been stopped by the host teacher. All active participants have been disconnected and the room is closed.
                        </p>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                setView('CREATE');
                            }}
                            className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-rose-950/30"
                        >
                            Return to Dashboard
                        </motion.button>
                    </motion.div>
                )}

                {/* ═══ DEDICATED HISTORY VIEW ════════════════════════════════════ */}
                {view === 'HISTORY' && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="space-y-6 max-w-7xl mx-auto"
                    >
                        {/* Header & Back Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                            <div>
                                <button
                                    onClick={() => {
                                        setView('LOBBY');
                                        setActiveTab('DASHBOARD');
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-indigo-500/20 mb-3 active:scale-95"
                                >
                                    <ArrowLeft size={10} /> Back to Dashboard
                                </button>
                                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                                    <span>⚔️ Battle Arena History</span>
                                    <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-black">
                                        {history.length} Matches
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-400 mt-1">Review your historical knowledge battles, wins, and rival students log.</p>
                            </div>

                            <button onClick={fetchStats} className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition-all">
                                🔄 Refresh Stats & Log
                            </button>
                        </div>

                        {/* Summary Stats Header Block */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#090c15] border border-slate-900 rounded-3xl p-5 shadow-2xl">
                            <div className="text-center p-2.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Games</div>
                                <div className="text-2xl font-black text-white mt-1">{stats?.totalGames ?? history.length}</div>
                            </div>
                            <div className="text-center border-l border-slate-900/60 p-2.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-450">Victory (Wins)</div>
                                <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.wins ?? history.filter(h => h.isWinner).length}</div>
                            </div>
                            <div className="text-center border-l border-slate-900/60 p-2.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">Defeats (Fails)</div>
                                <div className="text-2xl font-black text-rose-400 mt-1">{stats?.losses ?? history.filter(h => !h.isWinner && !h.isDraw).length}</div>
                            </div>
                            <div className="text-center border-l border-slate-900/60 p-2.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draws (Ties)</div>
                                <div className="text-2xl font-black text-slate-300 mt-1">{stats?.draws ?? history.filter(h => h.isDraw).length}</div>
                            </div>
                        </div>

                        {/* Search & Filtering bar */}
                        <div className="flex flex-col sm:flex-row gap-3 bg-[#0a0d1a] border border-slate-905 rounded-2xl p-4 shadow-md">
                            <div className="flex-1 relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by topic or subject..."
                                    value={historySearchQuery}
                                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={historyFilterStatus}
                                    onChange={(e: any) => setHistoryFilterStatus(e.target.value)}
                                    className="bg-black/40 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
                                >
                                    <option value="ALL">All Results 🎭</option>
                                    <option value="WIN">Victory Wins 🏆</option>
                                    <option value="LOSS">Defeats 💀</option>
                                    <option value="DRAW">Draw Matches 🤝</option>
                                </select>
                            </div>
                        </div>

                        {/* History Log Display */}
                        {(() => {
                            const filtered = history.filter(h => {
                                // Status filter
                                if (historyFilterStatus === 'WIN' && !h.isWinner) return false;
                                if (historyFilterStatus === 'LOSS' && (h.isWinner || h.isDraw)) return false;
                                if (historyFilterStatus === 'DRAW' && !h.isDraw) return false;

                                // Search filter
                                if (historySearchQuery.trim()) {
                                    const q = historySearchQuery.toLowerCase();
                                    const subjectMatch = h.subject?.toLowerCase().includes(q);
                                    const topicMatch = h.topic?.toLowerCase().includes(q);
                                    const conceptMatch = h.topicConcept?.toLowerCase().includes(q);
                                    return subjectMatch || topicMatch || conceptMatch;
                                }

                                return true;
                            });

                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 bg-slate-950/10 rounded-3xl">
                                        <div className="text-3xl mb-3">📂</div>
                                        <p className="text-sm font-bold text-slate-400">No matching battle matches found.</p>
                                        <p className="text-xs text-slate-500 mt-1">Try tweaking your search or status filter options.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filtered.map((h, idx) => (
                                        <div key={idx} className="bg-[#0b0e1a]/90 border border-slate-850 hover:border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all relative overflow-hidden group">
                                            {/* Glow on hover */}
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.02),transparent)] pointer-events-none" />

                                            <div>
                                                <div className="flex justify-between items-start gap-3">
                                                    <div>
                                                        <h3 className="font-black text-white text-base leading-snug group-hover:text-indigo-400 transition-colors">
                                                            {h.subject}
                                                        </h3>
                                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                                            📌 {formatTopic(h.topic)}
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0">
                                                        {h.isDraw ? (
                                                            <span className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-black uppercase rounded-lg shadow-md">🤝 Draw</span>
                                                        ) : h.isWinner ? (
                                                            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase rounded-lg shadow-md">🏆 Win</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-450 text-[10px] font-black uppercase rounded-lg shadow-md">💀 Fail</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-slate-500 mt-3 flex flex-wrap items-center gap-2 border-t border-slate-900/60 pt-2.5">
                                                    <span className="bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded font-black uppercase text-[8px] tracking-wider text-indigo-400">
                                                        {h.mode?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-medium text-slate-400">{h.battleStyle === 'ALTERNATING' ? '⚔️ Alternating' : '⚡ Speed Race'}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-505">{new Date(h.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Participants list */}
                                            <div className="bg-black/35 border border-white/[0.01] rounded-2xl p-3 flex flex-col gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-650 block">Players In Battle</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {h.participants && h.participants.map((p: any, pIdx: number) => (
                                                        <span
                                                            key={pIdx}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                                                                p.isSelf
                                                                    ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 font-extrabold shadow-sm shadow-indigo-950'
                                                                    : p.team === 'A'
                                                                        ? 'bg-blue-950/20 border-blue-500/10 text-blue-300'
                                                                        : 'bg-purple-950/20 border-purple-500/10 text-purple-300'
                                                            }`}
                                                        >
                                                            <span>{p.name}</span>
                                                            <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">{p.team === 'A' ? 'Alpha' : 'Omega'}</span>
                                                            <span className="text-[9px] font-black text-indigo-450 ml-0.5">+{p.score}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
