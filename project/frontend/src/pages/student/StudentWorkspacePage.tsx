import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Calendar, CheckCircle2, Clock, Cpu, Download, Edit3, 
  FileText, GraduationCap, Layers, Plus, RefreshCw, Send, Sparkles, 
  UserCheck, Users, XCircle, Award, Check, Search, ShieldCheck, Flame, Upload
} from 'lucide-react';
import axios from 'axios';

export const StudentWorkspacePage: React.FC = () => {
  const tenantOrgId = 'mount_carmel_school';
  const studentId = 'STU-10492';
  const studentName = 'Aarav Sharma';
  const classId = 'CLASS-10A';

  const [activeTab, setActiveTab] = useState<'homework' | 'attendance' | 'timetable' | 'quiz'>('homework');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetableList, setTimetableList] = useState<any[]>([]);
  const [submittingHw, setSubmittingHw] = useState<any | null>(null);
  const [uploadImageUrl, setUploadImageUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchTimetable();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`/api/v1/teacher-workspace/assignments?tenantOrgId=${tenantOrgId}&classId=${classId}`);
      if (res.data && res.data.assignments) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.warn('Could not fetch assignments:', err);
    }
  };

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`/api/v1/teacher-workspace/timetable?tenantOrgId=${tenantOrgId}&classId=${classId}`);
      if (res.data && res.data.schedule) {
        setTimetableList(res.data.schedule);
      }
    } catch (err) {
      console.warn('Could not fetch timetable:', err);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 👑 STUDENT WORKSPACE TOP HEADER BANNER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-zinc-950 to-purple-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Mount Carmel High School — Student Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <GraduationCap size={36} className="text-indigo-400" /> Welcome back, {studentName}!
            </h1>
            <p className="text-gray-400 text-xs mt-2 max-w-2xl">
              Class 10-A (Roll No: {studentId}) | Upload handwritten homework for instant Vision AI auto-grading, view today's timetable routine, and check attendance history.
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl shrink-0 text-right">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Attendance Rate</span>
            <div className="text-3xl font-black text-emerald-400">94%</div>
            <span className="text-[10px] text-gray-400">Status: Good Academic Standing</span>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto mt-8 pt-6 border-t border-white/10">
          {[
            { id: 'homework', label: '📝 Assigned Homework Submissions', icon: FileText },
            { id: 'attendance', label: '📅 My Attendance History', icon: UserCheck },
            { id: 'timetable', label: '🗓️ Class Timetable Routine', icon: Clock },
            { id: 'quiz', label: '⚔️ Join Live Quiz Battles', icon: Flame }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'}`}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 📝 ASSIGNED HOMEWORK SUBMISSIONS & VISION AI CHECKER */}
      {/* ========================================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText size={22} className="text-indigo-400" /> Pending Homework & Assignments
            </h2>
            <p className="text-xs text-gray-400 mt-1">Upload handwritten notebook images to get instant step-by-step Vision AI grading and feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map(hw => (
              <div key={hw._id || hw.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold uppercase">
                      {hw.subject} • Assigned by {hw.teacherName || 'Mrs. Anjali Mehta'}
                    </span>
                    <h3 className="text-lg font-black text-white mt-2">{hw.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-400">{hw.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock size={12} /> Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      setSubmittingHw(hw);
                      setSubmittedResult(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                  >
                    <Upload size={14} /> Upload & Grade Solution
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT HOMEWORK MODAL */}
          {submittingHw && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-indigo-500/30 space-y-6 mt-8">
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
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-emerald-400">✅ Vision AI Auto-Grading Complete!</h4>
                    <span className="text-lg font-black text-white font-mono bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30">
                      Score: {submittedResult.scoreObtained}/{submittedResult.maxScore || 10}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">{submittedResult.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 📅 MY ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <UserCheck size={22} className="text-emerald-400" /> Attendance History
            </h2>
            <p className="text-xs text-gray-400 mt-1">Class 10-A daily attendance record marked by class teachers.</p>
          </div>

          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-gray-400">Today's Status ({new Date().toLocaleDateString()}):</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ● PRESENT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <span className="text-gray-400">Yesterday's Status:</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ● PRESENT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🗓️ CLASS TIMETABLE ROUTINE */}
      {/* ========================================================================= */}
      {activeTab === 'timetable' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Clock size={22} className="text-indigo-400" /> Class 10-A Period Routine
            </h2>
            <p className="text-xs text-gray-400 mt-1">Weekly subject schedule and assigned classrooms.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ⚔️ JOIN LIVE QUIZ BATTLES */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Flame size={22} className="text-rose-400" /> Active Class 1v1 Quiz Battles
            </h2>
            <p className="text-xs text-gray-400 mt-1">Compete live against your Class 10-A classmates in speed quizzes.</p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-zinc-950 to-indigo-950 border border-rose-500/30 text-center space-y-4">
            <Flame size={48} className="text-rose-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-white">Class 10-A Active Math Speed Quiz</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">Hosted by Mrs. Anjali Mehta. 10 Questions on Quadratic Equations & Discriminants.</p>
            <button
              onClick={() => alert('⚔️ Entered Quiz Battle Arena! Preparing 1v1 Matchmaking...')}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-rose-600/40"
            >
              Enter Quiz Arena Now ⚡
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentWorkspacePage;
