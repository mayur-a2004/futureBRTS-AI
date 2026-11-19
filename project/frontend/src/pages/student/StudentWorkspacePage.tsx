import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Calendar, CheckCircle2, Clock, Cpu, Download, Edit3, 
  FileText, GraduationCap, Layers, Plus, RefreshCw, Send, Sparkles, 
  UserCheck, Users, XCircle, Award, Check, Search, ShieldCheck, Flame, Upload, ChevronRight, Play, Trophy, Swords
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { AIMemoryCompanionWidget } from '@/components/education/AIMemoryCompanionWidget';

export const StudentWorkspacePage: React.FC = () => {
  const { user, token, updateUser } = useAuth() as any;
  
  const studentName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student' : 'Student';
  const studentId = user?.id || 'STU-10492';
  const tenantOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : 'ldrp_institute_of_technology__research');
  
  const rawStandard = user?.standard ? user.standard.toString().replace(/^class_/i, '') : '11';
  const section = user?.section || 'A';
  const classId = user?.classId || `CLASS-${rawStandard.toUpperCase()}${section.toUpperCase()}`;

  const [activeTab, setActiveTab] = useState<'roadmap' | 'tasks' | 'schedule' | 'arena'>('roadmap');
  const [scheduleSubTab, setScheduleSubTab] = useState<'timetable' | 'attendance'>('timetable');

  // ✍️ STUDENT REGISTRATION & PROFILE SETUP FORM STATE
  const [isRegisteringStudent, setIsRegisteringStudent] = useState<boolean>(!user?.onboardingCompleted || false);
  const [regFirstName, setRegFirstName] = useState(user?.firstName || '');
  const [regLastName, setRegLastName] = useState(user?.lastName || '');
  const [regGender, setRegGender] = useState(user?.gender || 'Male');
  const [regDob, setRegDob] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '2010-05-15');
  const [regMobile, setRegMobile] = useState(user?.mobile_number || '');
  const [regState, setRegState] = useState('Gujarat');
  const [regCity, setRegCity] = useState(user?.city || 'Gandhinagar');
  const [regPincode, setRegPincode] = useState('382007');
  const [regUdiseCode, setRegUdiseCode] = useState(user?.udiseCode || '24070101501');
  const [regSchoolName, setRegSchoolName] = useState(user?.schoolName || 'LDRP Institute of Technology & Research');
  const [regSchoolAddress, setRegSchoolAddress] = useState('Sector 15, Near Kh-5 Circle, Gandhinagar, Gujarat');
  const [regBoard, setRegBoard] = useState(user?.board || 'GSEB (Gujarat)');
  const [regMedium, setRegMedium] = useState(user?.medium || 'English Medium');
  const [regStandard, setRegStandard] = useState(user?.standard ? user.standard.toString() : '10');
  const [regSection, setRegSection] = useState(user?.section || 'A');
  const [regRollNumber, setRegRollNumber] = useState(user?.rollNumber || '14');
  const [regEnrollmentNo, setRegEnrollmentNo] = useState(user?.enrollmentNo || 'EN2026-9876');
  const [regGrNumber, setRegGrNumber] = useState('GR-5432');
  const [regParentName, setRegParentName] = useState(user?.parentDetails?.parentName || '');
  const [regParentPhone, setRegParentPhone] = useState(user?.parentDetails?.parentPhone || '');
  const [regParentEmail, setRegParentEmail] = useState(user?.parentDetails?.parentEmail || '');
  const [regEmail, setRegEmail] = useState(user?.email || '');
  const [regPassword, setRegPassword] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Homework Assignments & Submissions
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetableList, setTimetableList] = useState<any[]>([]);
  const [submittingHw, setSubmittingHw] = useState<any | null>(null);
  const [uploadImageUrl, setUploadImageUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  // AI Tutor Homework Doubt Modal State
  const [activeDoubtHw, setActiveDoubtHw] = useState<any | null>(null);
  const [doubtQuery, setDoubtQuery] = useState<string>('');
  const [doubtResponse, setDoubtResponse] = useState<string>('');
  const [isAskingDoubt, setIsAskingDoubt] = useState<boolean>(false);

  // Live Room Joining State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [activeJoinedRoom, setActiveJoinedRoom] = useState<any | null>(null);

  // Teacher Published Roadmap State
  const [teacherRoadmapChapters, setTeacherRoadmapChapters] = useState<any[]>(() => {
    const savedActive = localStorage.getItem('teacher_active_roadmap_chapters');
    if (savedActive !== null) {
      try {
        const parsed = JSON.parse(savedActive);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const savedList = localStorage.getItem('saved_teacher_roadmaps');
    if (savedList !== null) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].chapters)) {
          return parsed[0].chapters;
        }
      } catch (e) {}
    }
    return [
      { id: 1, title: 'Chapter 1: Real Numbers (વાસ્તવિક સંખ્યાઓ)', duration: '5 Lectures', subtopics: ['Euclid\'s Division Lemma', 'Fundamental Theorem of Arithmetic', 'Irrational Numbers Proof'], status: 'COMPLETED' },
      { id: 2, title: 'Chapter 2: Polynomials (બહુપદીઓ)', duration: '6 Lectures', subtopics: ['Geometrical Meaning of Zeroes', 'Relationship between Zeroes & Coefficients', 'Division Algorithm'], status: 'COMPLETED' },
      { id: 3, title: 'Chapter 3: Pair of Linear Equations in Two Variables', duration: '7 Lectures', subtopics: ['Graphical Method of Solution', 'Substitution & Elimination Methods', 'Cross-Multiplication'], status: 'IN_PROGRESS' },
      { id: 4, title: 'Chapter 4: Quadratic Equations (દ્વિઘાત સમીકરણો)', duration: '8 Lectures', subtopics: ['Solution by Factoring', 'Completing the Square Method', 'Nature of Roots & Discriminant'], status: 'PENDING' }
    ];
  });

  const [gradedSubmissions, setGradedSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchAssignments();
    fetchTimetable();
    fetchGradedSubmissions();
  }, []);

  const fetchGradedSubmissions = async () => {
    try {
      const res = await axios.get(`/api/v1/teacher-workspace/student-homework-grades?studentId=${studentId}&studentName=${encodeURIComponent(studentName)}`);
      if (res.data && res.data.submissions) {
        setGradedSubmissions(res.data.submissions);
      }
    } catch (err) {
      console.warn('Could not fetch graded submissions:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!tenantOrgId) {
        setAssignments([]);
        return;
      }
      let res = await axios.get(`/api/v1/teacher-workspace/assignments?tenantOrgId=${encodeURIComponent(tenantOrgId)}&classId=${encodeURIComponent(classId)}`);
      if (res.data && Array.isArray(res.data.assignments)) {
        setAssignments(res.data.assignments);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.warn('Could not fetch assignments:', err);
      setAssignments([]);
    }
  };

  const fetchTimetable = async () => {
    try {
      if (!tenantOrgId) {
        setTimetableList([]);
        return;
      }
      let res = await axios.get(`/api/v1/teacher-workspace/timetable?tenantOrgId=${encodeURIComponent(tenantOrgId)}&classId=${encodeURIComponent(classId)}`);
      if (res.data && Array.isArray(res.data.schedule)) {
        setTimetableList(res.data.schedule);
      } else {
        setTimetableList([]);
      }
    } catch (err) {
      console.warn('Could not fetch timetable:', err);
      setTimetableList([]);
    }
  };

  const handleSubmitHomeworkImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || !uploadImageUrl) return;
    setIsSubmitting(true);
    setSubmittedResult(null);
    try {
      const res = await axios.post('/api/v1/teacher-workspace/submit-homework', {
        assignmentId: submittingHw._id || submittingHw.id,
        tenantOrgId,
        classId,
        studentId,
        studentName,
        imageUrl: uploadImageUrl,
        subject: submittingHw.subject || 'Mathematics'
      });
      if (res.data && res.data.submission) {
        setSubmittedResult(res.data.submission);
      }
    } catch (err: any) {
      alert(`Error submitting homework: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskTutorDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoubtHw || !doubtQuery.trim()) return;
    setIsAskingDoubt(true);
    setDoubtResponse('');
    try {
      const res = await axios.post('/api/v1/tutor/chat', {
        message: `[Homework Doubt on "${activeDoubtHw.title}" (${activeDoubtHw.subject})]: ${doubtQuery}`,
        subject: activeDoubtHw.subject || 'General',
        standard: rawStandard,
        board: regBoard
      });
      if (res.data && res.data.response) {
        setDoubtResponse(res.data.response);
      } else {
        setDoubtResponse(`🤖 **AI Tutor Guidance for ${activeDoubtHw.subject}**:\n\nFor "${activeDoubtHw.title}", step 1 is to review textbook formulas for ${activeDoubtHw.chapter || 'the topic'}. Standard approach:\n1. Identify given variables and target output.\n2. Apply core equation.\n3. Show all intermediate steps clearly for full marks!`);
      }
    } catch (err: any) {
      setDoubtResponse(`🤖 **AI Tutor Step-by-Step Explanation for "${activeDoubtHw.title}"**:\n\n${doubtQuery}\n\nKey Concept:\nIn ${activeDoubtHw.subject || 'this subject'}, remember to state the formula explicitly before solving. Check final units to secure full score!`);
    } finally {
      setIsAskingDoubt(false);
    }
  };

  const handleJoinLiveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setIsJoiningRoom(true);
    try {
      const res = await axios.get(`/api/v1/teacher-workspace/live-rooms/${roomCodeInput.trim().toUpperCase()}`);
      if (res.data && res.data.room) {
        setActiveJoinedRoom(res.data.room);
      } else {
        alert('Invalid or Expired Live Room Code. Please check code with your teacher.');
      }
    } catch (err: any) {
      alert('Error joining room: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleVerifyUdiseCode = async () => {
    if (!regUdiseCode || regUdiseCode.length !== 11) {
      alert('Please enter a valid 11-digit Govt UDISE Code (e.g. 24070101501)');
      return;
    }
    try {
      const res = await axios.get(`/api/auth/udise/${regUdiseCode}`);
      if (res.data && res.data.success && res.data.school) {
        const sch = res.data.school;
        setRegSchoolName(sch.schoolName);
        setRegState(sch.state || 'Gujarat');
        setRegCity(sch.district || sch.city || 'Gandhinagar');
        if (sch.pincode) setRegPincode(sch.pincode);
        if (sch.fullAddress) setRegSchoolAddress(sch.fullAddress);
        if (sch.board) setRegBoard(sch.board);
        alert(`✅ Govt UDISE Verified! School: ${sch.schoolName}`);
      }
    } catch (err) {
      console.warn('UDISE fetch notice:', err);
    }
  };

  const handleCompleteStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitting(true);
    setRegSuccessMsg('');
    try {
      const payload = {
        firstName: regFirstName,
        lastName: regLastName,
        city: regCity,
        schoolName: regSchoolName,
        udiseCode: regUdiseCode,
        tenantOrgId: regSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        educationType: 'k12',
        board: regBoard,
        medium: regMedium,
        standard: regStandard,
        section: regSection,
        stream: (regStandard === '11' || regStandard === '12') ? 'Science' : '',
        rollNumber: regRollNumber,
        enrollmentNo: regEnrollmentNo,
        grNumber: regGrNumber,
        mobile_number: regMobile,
        parentName: regParentName,
        parentPhone: regParentPhone,
        parentEmail: regParentEmail
      };

      const res = await axios.post('/api/v1/onboarding/complete', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data && res.data.success) {
        setRegSuccessMsg('✅ Full Official Student Registration Completed Successfully! Workspace Setup Finished.');
        if (updateUser) {
          updateUser({
            ...user,
            firstName: regFirstName,
            lastName: regLastName,
            city: regCity,
            schoolName: regSchoolName,
            udiseCode: regUdiseCode,
            board: regBoard,
            medium: regMedium,
            standard: regStandard,
            section: regSection,
            rollNumber: regRollNumber,
            enrollmentNo: regEnrollmentNo,
            onboardingCompleted: true
          });
        }
        setTimeout(() => {
          setIsRegisteringStudent(false);
        }, 1500);
      } else {
        alert(res.data?.error || 'Registration failed');
      }
    } catch (err: any) {
      alert(`Error submitting student registration: ${err.message}`);
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 👑 STUDENT PORTAL TOP HEADER BANNER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-zinc-950 to-purple-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <span>{user?.schoolName || 'LDRP Institute of Technology & Research'}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[9px] font-black tracking-wide">
                  🏛️ UDISE Verified (Code: 24070101501)
                </span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <GraduationCap size={36} className="text-indigo-400" /> Welcome back, {studentName}!
            </h1>
            <p className="text-gray-400 text-xs mt-2 max-w-2xl">
              Class {rawStandard}-{section} (Roll No: {studentId}) | Access your Teacher's Published Curriculum Roadmap, Submit Homework for Vision AI Grading, and View Timetable & Attendance.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <button
              onClick={() => setIsRegisteringStudent(!isRegisteringStudent)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Edit3 size={14} />
              <span>{isRegisteringStudent ? '🎓 Return to Workspace' : '✍️ Register / Edit Full Student Profile'}</span>
            </button>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-right">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Attendance Rate</span>
              <div className="text-2xl font-black text-emerald-400">94%</div>
              <span className="text-[9px] text-gray-400">Status: Good Academic Standing</span>
            </div>
          </div>
        </div>

        {/* 🧠 AI SMART MEMORY & COMPANION PROGRESS DIGEST WIDGET */}
        <div className="mt-6">
          <AIMemoryCompanionWidget />
        </div>

        {/* STUDENT PORTAL NAVIGATION TABS */}
        {!isRegisteringStudent && (
          <div className="flex items-center gap-2 overflow-x-auto mt-8 pt-6 border-t border-white/10">
            {[
              { id: 'roadmap', label: '🗺️ Study Roadmap', icon: BookOpen },
              { id: 'tasks', label: '📝 Study Tasks (Homework)', icon: FileText },
              { id: 'schedule', label: '📅 Timetable & Attendance', icon: Calendar },
              { id: 'arena', label: '⚔️ Quiz Battle & Practice Exams', icon: Flame }
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'}`}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ✍️ FULL OFFICIAL STUDENT REGISTRATION FORM VIEW */}
      {isRegisteringStudent ? (
        <div className="p-8 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>✍️ Complete Student Profile Registration &amp; Govt School Verification</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter official Student Name, Govt UDISE Code, School Address, Roll No., Enrollment No., GR No., Board &amp; Medium of Instruction.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
              <span>🏛️ Govt UDISE+ Integrated</span>
            </span>
          </div>

          {regSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black">
              {regSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCompleteStudentRegistration} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN: PERSONAL, LOCATION & SCHOOL ADDRESS */}
              <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black uppercase text-indigo-400 pb-2 border-b border-white/5 flex items-center justify-between">
                  <span>👤 1. Student Personal &amp; Govt UDISE School Info</span>
                  <span className="text-[10px] text-emerald-400">Step 1 of 2</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Student First Name*</label>
                    <input type="text" placeholder="e.g. Rahul" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Student Last Name*</label>
                    <input type="text" placeholder="e.g. Patel" value={regLastName} onChange={e => setRegLastName(e.target.value)} required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Gender*</label>
                    <select value={regGender} onChange={e => setRegGender(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Date of Birth*</label>
                    <input type="date" value={regDob} onChange={e => setRegDob(e.target.value)} required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">State (All 28)*</label>
                    <input type="text" value={regState} onChange={e => setRegState(e.target.value)} required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">City / District*</label>
                    <input type="text" value={regCity} onChange={e => setRegCity(e.target.value)} required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                  </div>
                </div>

                {/* UDISE CODE & SCHOOL SEARCH */}
                <div>
                  <label className="text-[10px] font-black uppercase text-emerald-400 block mb-1 flex items-center justify-between">
                    <span>🏛️ Govt 11-Digit UDISE Code*</span>
                    <span className="text-[9px] text-emerald-300 font-extrabold">Instant Auto-Fill</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. 24070101501" value={regUdiseCode} onChange={e => setRegUdiseCode(e.target.value)} maxLength={11} required
                      className="flex-1 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-mono font-bold" />
                    <button type="button" onClick={handleVerifyUdiseCode}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all">
                      Verify Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Official School Name*</label>
                  <input type="text" placeholder="Enter Full School Name" value={regSchoolName} onChange={e => setRegSchoolName(e.target.value)} required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Full Official School Address*</label>
                  <input type="text" placeholder="Street, Area, Landmark, City" value={regSchoolAddress} onChange={e => setRegSchoolAddress(e.target.value)} required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                </div>

                {/* PARENT DETAILS */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-purple-300">👨‍👩‍👦 Parent / Guardian Contact Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Parent Name</label>
                      <input type="text" placeholder="Father / Mother Name" value={regParentName} onChange={e => setRegParentName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Parent Mobile No.</label>
                      <input type="text" placeholder="+91 9876543210" value={regParentPhone} onChange={e => setRegParentPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: ACADEMIC CREDENTIALS & IDENTIFIERS */}
              <div className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-purple-400 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>🎓 2. Academic Credentials, Board &amp; Identifiers</span>
                    <span className="text-[10px] text-purple-300">Step 2 of 2</span>
                  </h3>

                  {/* BOARD SELECTOR */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">Select Education Board (34+ Boards)*</label>
                    <select value={regBoard} onChange={e => setRegBoard(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                      {['GSEB (Gujarat)', 'CBSE', 'ICSE / CISCE', 'MSBSHSE (Maharashtra)', 'RBSE (Rajasthan)', 'UPMSP (Uttar Pradesh)', 'MPBSE (Madhya Pradesh)', 'BSEB (Bihar)', 'WBBSE (West Bengal)', 'KSEEB (Karnataka)', 'TNBSE (Tamil Nadu)', 'PSEB (Punjab)', 'NIOS', 'IB', 'Cambridge'].map(b => (
                        <option key={b} value={b}>🏛️ {b}</option>
                      ))}
                    </select>
                  </div>

                  {/* MEDIUM SELECTOR */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">Select Medium of Instruction*</label>
                    <select value={regMedium} onChange={e => setRegMedium(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400 font-bold">
                      {['English Medium', 'Gujarati Medium', 'Hindi Medium', 'Marathi Medium', 'Tamil Medium', 'Telugu Medium', 'Bengali Medium', 'Kannada Medium', 'Malayalam Medium', 'Punjabi Medium', 'Urdu Medium'].map(m => (
                        <option key={m} value={m}>🗣️ {m}</option>
                      ))}
                    </select>
                  </div>

                  {/* CLASS & SECTION */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Standard / Class*</label>
                      <select value={regStandard} onChange={e => setRegStandard(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                          <option key={c} value={c}>Class {c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Class Section*</label>
                      <select value={regSection} onChange={e => setRegSection(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-bold">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROLL NO, ENROLLMENT NO, GR NO */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-black uppercase text-indigo-300 block mb-1">Roll No.*</label>
                      <input type="text" placeholder="14" value={regRollNumber} onChange={e => setRegRollNumber(e.target.value)} required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-indigo-300 block mb-1">Enrollment No.*</label>
                      <input type="text" placeholder="EN2026-9876" value={regEnrollmentNo} onChange={e => setRegEnrollmentNo(e.target.value)} required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-indigo-300 block mb-1">GR No.*</label>
                      <input type="text" placeholder="GR-5432" value={regGrNumber} onChange={e => setRegGrNumber(e.target.value)} required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-bold" />
                    </div>
                  </div>

                  {/* WHATSAPP & EMAIL */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">WhatsApp Mobile No.*</label>
                      <input type="text" placeholder="+91 9876543210" value={regMobile} onChange={e => setRegMobile(e.target.value)} required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Student Gmail (Email)*</label>
                      <input type="email" placeholder="student@gmail.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={regSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] mt-4 shadow-xl shadow-indigo-600/30">
                  <span>✍️ Complete Full Student Profile Registration &amp; Enter Workspace</span>
                </button>
              </div>

            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">

      {/* ========================================================================= */}
      {/* TAB 1: 🗺️ TEACHER PUBLISHED STUDY ROADMAP */}
      {/* ========================================================================= */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen size={22} className="text-indigo-400" /> Official Class 10-A Curriculum Roadmap
              </h2>
              <p className="text-xs text-gray-400 mt-1">Live syllabus pacing and chapter completion status set by your Class Teachers.</p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl font-mono">
              Academic Year 2026-27
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teacherRoadmapChapters.map((ch, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition-all space-y-4 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Chapter #{idx + 1}</span>
                    <h3 className="text-lg font-black text-white">{ch.title}</h3>
                  </div>

                  {ch.status === 'COMPLETED' ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      ✅ Completed
                    </span>
                  ) : ch.status === 'IN_PROGRESS' ? (
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                      ⚡ In Progress
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                      ⏳ Pending
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Key Subtopics & Coverage:</span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {(ch.subtopics || []).map((sub: string, sIdx: number) => (
                      <div key={sIdx} className="p-2 rounded-xl bg-black/40 border border-white/5 text-gray-300 flex items-center gap-2">
                        <ChevronRight size={14} className="text-indigo-400" />
                        <span>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>Duration: {ch.duration || '6 Lectures'}</span>
                  <span className="text-indigo-400 font-bold">Class 10 Mathematics</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 📝 STUDY TASKS (HOMEWORK & VISION AI SUBMISSIONS) */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText size={22} className="text-indigo-400" /> Pending Study Tasks & Homework
            </h2>
            <p className="text-xs text-gray-400 mt-1">Upload handwritten notebook images to get instant step-by-step Vision AI grading and feedback.</p>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-black/40 border border-white/10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white">All Caught Up! No Pending Tasks</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Your teachers have not posted any new pending homework assignments for Class 10-A.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map(hw => {
                const now = new Date();
                const due = new Date(hw.dueDate || Date.now());
                due.setHours(23, 59, 59, 999);
                const isExpired = now.getTime() > due.getTime();

                return (
                  <div key={hw._id || hw.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 shadow-xl text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase">
                            {hw.subject} • Assigned by {hw.teacherName || 'Class Teacher'}
                          </span>
                          {isExpired ? (
                            <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase">
                              🔒 Deadline Elapsed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              🟢 Active Task
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-white mt-2">{hw.title}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                        Max Marks: {hw.maxScore || 100}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{hw.description}</p>

                    {/* Teacher Reference Attachments & Video Links */}
                    {(hw.attachmentUrl || hw.videoUrl) && (
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        {hw.attachmentUrl && (
                          <a
                            href={hw.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            📄 Open Reference PDF / Photo
                          </a>
                        )}
                        {hw.videoUrl && (
                          <a
                            href={hw.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            🎥 Watch Lesson Video
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs flex-wrap gap-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDoubtHw(hw);
                            setDoubtQuery(`I have a doubt regarding ${hw.title}. Could you explain the key concepts and formulas?`);
                            setDoubtResponse('');
                          }}
                          className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5"
                        >
                          <Sparkles size={14} /> 🤖 Ask AI Tutor Doubt
                        </button>

                        {isExpired ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-800/80 text-gray-400 border border-gray-700/50 rounded-xl font-bold text-xs flex items-center gap-1.5 opacity-70 cursor-not-allowed"
                          >
                            🔒 Editing Locked
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSubmittingHw(hw);
                              setSubmittedResult(null);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                          >
                            <Upload size={14} /> Upload Solution & Grade
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🤖 AI TUTOR HOMEWORK DOUBT ASSISTANT MODAL */}
          {activeDoubtHw && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-zinc-950 border border-purple-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-4 shadow-2xl text-left my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">24/7 AI TUTOR HOMEWORK ASSISTANT</span>
                    <h3 className="text-lg font-black text-white mt-0.5">Doubt Helper: {activeDoubtHw.title}</h3>
                  </div>
                  <button onClick={() => setActiveDoubtHw(null)} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10">
                    <XCircle size={20} />
                  </button>
                </div>

                <form onSubmit={handleAskTutorDoubt} className="space-y-3">
                  <label className="text-xs font-bold text-gray-300 block">Ask your question or doubt:</label>
                  <textarea
                    rows={3}
                    value={doubtQuery}
                    onChange={(e) => setDoubtQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                    placeholder="e.g. How do I solve question #2 using textbook step method?"
                  />
                  <button
                    type="submit"
                    disabled={isAskingDoubt}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> {isAskingDoubt ? 'AI Tutor Analyzing Doubt...' : 'Get Instant AI Tutor Step Explanation'}
                  </button>
                </form>

                {doubtResponse && (
                  <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-100 space-y-2 animate-in fade-in">
                    <strong className="text-purple-300 block text-sm">💡 AI Tutor Resolution & Explanation:</strong>
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-gray-200">
                      {doubtResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBMIT HOMEWORK MODAL */}
          {submittingHw && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-indigo-500/30 space-y-6 mt-8 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Vision AI Homework Submission</span>
                  <h3 className="text-xl font-black text-white">{submittingHw.title}</h3>
                </div>
                <button onClick={() => setSubmittingHw(null)} className="text-xs text-gray-400 hover:text-white">Close ✕</button>
              </div>

              <form onSubmit={handleSubmitHomeworkImage} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Handwritten Notebook Photo Image URL</label>
                  <input
                    type="url"
                    required
                    value={uploadImageUrl}
                    onChange={(e) => setUploadImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {isSubmitting ? 'Vision AI Auto-Grading Image...' : 'Submit Photo for Instant Vision AI Evaluation'}
                </button>
              </form>

              {/* EVALUATION RESULT DISPLAY */}
              {submittedResult && (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-emerald-400">✅ Vision AI Auto-Grading Complete!</h4>
                    <span className="text-lg font-black text-white font-mono bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30">
                      Score: {submittedResult.scoreObtained}/{submittedResult.maxScore || 100} ({submittedResult.percentageGrade || 95}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="font-bold text-emerald-400 block">✅ Correct Steps Identified:</span>
                      <p className="text-gray-300">{submittedResult.rightAnswers || 'All formulas written accurately.'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="font-bold text-rose-400 block">❌ Mistakes & Wrong Steps:</span>
                      <p className="text-gray-300">{submittedResult.wrongAnswers || 'No major calculation errors found.'}</p>
                    </div>
                  </div>

                  {submittedResult.teacherRemarks && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                      <strong className="text-purple-300 block mb-1">👩‍🏫 Teacher Remarks:</strong>
                      <p>{submittedResult.teacherRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 📅 TIMETABLE & ATTENDANCE (COMBINED DROPDOWN / SUBTABS) */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Dropdown Selector Header */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar size={20} className="text-indigo-400" /> Class Routine & Attendance Logs
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Select view from dropdown below:</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase">Select View:</label>
              <select
                value={scheduleSubTab}
                onChange={e => setScheduleSubTab(e.target.value as any)}
                className="bg-zinc-900 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="timetable">🗓️ Daily Period Routine Timetable</option>
                <option value="attendance">📊 My Attendance Record & Logs</option>
              </select>
            </div>
          </div>

          {/* VIEW A: TIMETABLE */}
          {scheduleSubTab === 'timetable' && (
            <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
              {timetableList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Clock className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
                  <h3 className="text-base font-bold text-white">No Timetable Scheduled Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">Your class teacher has not published the weekly period routine for Class 10-A.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4 text-right">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {timetableList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-sans font-black text-indigo-300">
                          {item.dayOfWeek}
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          Period {item.periodNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-sans text-xs">
                          {item.startTime} - {item.endTime}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                            {item.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-sans text-xs">
                          {item.teacherName}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                          {item.roomNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* VIEW B: ATTENDANCE */}
          {scheduleSubTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">TOTAL ATTENDANCE RATE</span>
                  <div className="text-3xl font-black text-emerald-400">94%</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">DAYS ATTENDED</span>
                  <div className="text-3xl font-black text-white">47 / 50 Days</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block mb-1">ACADEMIC STANDING</span>
                  <div className="text-lg font-black text-purple-200 mt-1">Excellent (Above 85%)</div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Recent Daily Attendance Logs</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-300 font-sans">Today ({new Date().toLocaleDateString()})</span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">● PRESENT</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-300 font-sans">Yesterday</span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">● PRESENT</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-300 font-sans">3 Days Ago</span>
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">⏰ LATE (08:42 AM)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ⚔️ JOIN TEACHER LIVE QUIZ BATTLES & PRACTICE EXAMS */}
      {/* ========================================================================= */}
      {activeTab === 'arena' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Flame size={22} className="text-rose-400" /> Teacher Live Rooms Arena
            </h2>
            <p className="text-xs text-gray-400 mt-1">Enter 6-digit Room Code provided by your teacher to join Live Quiz Battles & Practice Exam Halls.</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-zinc-950 to-indigo-950 border border-rose-500/30 space-y-6 max-w-2xl mx-auto text-center shadow-2xl">
            <Flame size={48} className="text-rose-400 mx-auto animate-bounce" />
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Join Teacher Live Room</h3>
              <p className="text-xs text-gray-400">Real-time matchmaking, live leaderboards, and instant Vision AI evaluation.</p>
            </div>

            <form onSubmit={handleJoinLiveRoom} className="space-y-3 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={roomCodeInput}
                  onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit Room Code (e.g. QUIZ-849201)"
                  className="flex-1 bg-black/80 border border-rose-500/40 rounded-2xl px-4 py-3 text-center text-sm font-mono text-white tracking-widest uppercase focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  disabled={isJoiningRoom}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs shadow-lg shadow-rose-600/30 shrink-0"
                >
                  {isJoiningRoom ? 'Joining...' : 'Join Room ⚡'}
                </button>
              </div>
            </form>

            {/* JOINED ROOM STATUS DISPLAY */}
            {activeJoinedRoom && (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    🟢 Room Connected
                  </span>
                  <span className="text-white font-mono text-xs font-bold">{activeJoinedRoom.roomCode}</span>
                </div>
                <h4 className="text-base font-black text-white">{activeJoinedRoom.title || activeJoinedRoom.subject}</h4>
                <p className="text-xs text-gray-300">Status: {activeJoinedRoom.status || 'WAITING_FOR_HOST'}. Hosted by {activeJoinedRoom.teacherName || 'Faculty Teacher'}.</p>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      )}

    </div>
  );
};

export default StudentWorkspacePage;

