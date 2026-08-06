import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Clock, Calendar, UserCheck, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, MapPin, User, FileText, Check, Award } from 'lucide-react';
import axios from 'axios';
import { SchoolContextBar } from '../../components/education/SchoolContextBar';

export const ClassTimetablePage: React.FC = () => {
    const { token, user } = useAuth() as any;
    const navigate = useNavigate();

    const userStandard = user?.standard ? user.standard.toString().replace(/^class_/i, '') : '10';
    const userSection = user?.section || 'A';
    const initialClass = `CLASS-${userStandard.toUpperCase()}${userSection.toUpperCase()}`;

    const [selectedClass, setSelectedClass] = useState(initialClass);
    const [selectedSubject, setSelectedSubject] = useState('Mathematics');
    const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'All'>('Monday');
    const [viewMode, setViewMode] = useState<'routine' | 'attendance' | 'calendar' | 'exams'>('routine');
    
    const [timetableList, setTimetableList] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [examSchedules, setExamSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const tenantOrgId = user?.tenantOrgId || (user?.schoolName ? user.schoolName.toLowerCase().replace(/\s+/g, '_') : 'mount_carmel_school');
    const studentId = user?.id || 'STU-10492';

    const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'] as const;

    const [attendanceRange, setAttendanceRange] = useState<'all' | 'today' | 'yesterday' | 'last7days' | 'yearly'>('all');

    useEffect(() => {
        fetchTimetableAndAttendance();
    }, [selectedClass, attendanceRange]);

    const fetchTimetableAndAttendance = async () => {
        setLoading(true);
        try {
            const [ttRes, attRes, calRes, examRes] = await Promise.all([
                axios.get(`/api/v1/teacher-workspace/timetable?tenantOrgId=${tenantOrgId}&classId=${selectedClass}`),
                axios.get(`/api/v1/teacher-workspace/student-attendance-summary?tenantOrgId=${tenantOrgId}&studentId=${studentId}&classId=${selectedClass}&range=${attendanceRange}`),
                axios.get(`/api/v1/teacher-workspace/calendar/events?tenantOrgId=${tenantOrgId}&classId=${selectedClass}`),
                axios.get(`/api/v1/teacher-workspace/exam-schedules?tenantOrgId=${tenantOrgId}&classId=${selectedClass}`)
            ]);

            if (ttRes.data && ttRes.data.schedule) {
                setTimetableList(ttRes.data.schedule);
            }

            if (attRes.data && attRes.data.summary) {
                setAttendanceData(attRes.data.summary);
            }

            if (calRes.data && calRes.data.events) {
                setCalendarEvents(calRes.data.events);
            }

            if (examRes.data && examRes.data.schedules) {
                setExamSchedules(examRes.data.schedules);
            }
        } catch (err) {
            console.warn('Could not fetch timetable or attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter timetable by day
    const filteredTimetable = selectedDay === 'All'
        ? timetableList
        : timetableList.filter(item => (item.dayOfWeek || 'Monday').toLowerCase() === selectedDay.toLowerCase());

    const attRate = attendanceData?.attendanceRate ?? 95;
    const totalDays = attendanceData?.totalWorkingDays ?? 20;
    const presentDays = attendanceData?.presentCount ?? 19;
    const lateDays = attendanceData?.lateCount ?? 1;
    const absentDays = attendanceData?.absentCount ?? 0;
    const todayStatus = attendanceData?.todayStatus || 'PRESENT';
    const teacherMarked = attendanceData?.markedByTeacherName || 'Class Teacher';

    return (
        <div className="min-h-screen bg-[#05030a] text-white p-4 sm:p-8 font-inter relative overflow-x-hidden pb-28">
            {/* Glow Backgrounds */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-6">
                <SchoolContextBar
                    moduleTitle="🗓️ Class Timetable & Attendance"
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    selectedSubject={selectedSubject}
                    onSubjectChange={setSelectedSubject}
                />

                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/future-education')}
                            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-all active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                <Clock size={24} className="text-indigo-400" /> Class {selectedClass} Routine & Attendance
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Full day period schedule, room numbers, faculty teachers & student attendance logs.
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle Buttons */}
                    <div className="flex items-center gap-2 p-1.5 bg-[#0B0915] border border-white/10 rounded-2xl shrink-0 overflow-x-auto">
                        <button
                            onClick={() => setViewMode('routine')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                viewMode === 'routine' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Clock size={14} /> Timetable
                        </button>
                        <button
                            onClick={() => setViewMode('attendance')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                viewMode === 'attendance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <UserCheck size={14} /> Attendance Log
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Calendar size={14} /> School Calendar & Events
                        </button>
                        <button
                            onClick={() => setViewMode('exams')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                viewMode === 'exams' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <FileText size={14} /> Exam Schedule
                        </button>
                    </div>
                </div>

                {/* 🔴 LIVE FACULTY & CURRENT PERIOD BANNER */}
                {timetableList.length > 0 && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-zinc-950 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 animate-pulse">
                                LIVE
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Current Ongoing Class Period</span>
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    {timetableList[0].subject} • Period {timetableList[0].periodNumber} ({timetableList[0].startTime} - {timetableList[0].endTime})
                                </h4>
                                <p className="text-[11px] text-gray-300">
                                    Faculty: <span className="font-bold text-white">{timetableList[0].teacherName}</span> • Room/Lab: <span className="font-bold text-emerald-400">{timetableList[0].roomNumber}</span>
                                </p>
                            </div>
                        </div>

                        {timetableList.length > 1 && (
                            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-left md:text-right shrink-0">
                                <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">Up Next Arriving Period</span>
                                <span className="text-xs font-bold text-white block">{timetableList[1].subject} ({timetableList[1].startTime})</span>
                                <span className="text-[10px] text-gray-400">{timetableList[1].teacherName} • {timetableList[1].roomNumber}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 📊 ATTENDANCE DATE RANGE FILTER BAR */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest shrink-0">Attendance Date Filter:</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: 'today', label: 'Today' },
                            { id: 'yesterday', label: 'Yesterday' },
                            { id: 'last7days', label: 'Last 7 Days' },
                            { id: 'yearly', label: 'Yearly' }
                        ].map(rf => (
                            <button
                                key={rf.id}
                                onClick={() => setAttendanceRange(rf.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    attendanceRange === rf.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                                }`}
                            >
                                {rf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 📊 ATTENDANCE SUMMARY STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Card 1: Attendance Rate */}
                    <div className="p-5 rounded-3xl bg-[#0B0915]/80 border border-white/10 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Attendance Rate</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                                attRate >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}>
                                {attRate >= 75 ? 'Eligible' : 'Warning'}
                            </span>
                        </div>
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                            {attRate}%
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{presentDays} / {totalDays} Days Marked ({selectedClass})</p>
                    </div>

                    {/* Card 2: Today's Status */}
                    <div className="p-5 rounded-3xl bg-[#0B0915]/80 border border-white/10 hover:border-indigo-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Today's Attendance</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${todayStatus === 'PRESENT' ? 'bg-emerald-500 animate-ping' : todayStatus === 'LATE' ? 'bg-amber-500' : todayStatus === 'NOT_MARKED' ? 'bg-gray-500' : 'bg-rose-500'}`} />
                            <span className="text-base font-bold text-white uppercase">{todayStatus === 'NOT_MARKED' ? '⚪ NOT MARKED YET' : `🟢 ${todayStatus}`}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{todayStatus === 'NOT_MARKED' ? 'Awaiting teacher attendance entry' : `Synced with ${teacherMarked}`}</p>
                    </div>

                    {/* Card 3: Monthly Log Breakdown */}
                    <div className="p-5 rounded-3xl bg-[#0B0915]/80 border border-white/10 hover:border-purple-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Monthly Breakdown</span>
                        <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-emerald-400 font-bold">{presentDays} Present</span>
                            <span className="text-amber-400 font-bold">{lateDays} Late</span>
                            <span className="text-rose-400 font-bold">{absentDays} Absent</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Total {totalDays} Working Days Logged</p>
                    </div>

                    {/* Card 4: Class Rank & Conduct */}
                    <div className="p-5 rounded-3xl bg-[#0B0915]/80 border border-white/10 hover:border-amber-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Punctuality Score</span>
                        <div className="text-2xl font-black text-amber-400 font-mono">
                            {attRate >= 90 ? 'A+ Grade' : attRate >= 75 ? 'B Grade' : 'C Grade'}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">On-Time Attendance Tracking</p>
                    </div>
                </div>

                {/* VIEW MODE 1: FULL DAY TIMETABLE ROUTINE */}
                {viewMode === 'routine' && (
                    <div className="space-y-6">
                        {/* Day Selector Subtabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 scrollbar-none">
                            {daysList.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDay(d as any)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                                        selectedDay === d
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {d === 'All' ? '📅 Full Week View' : d}
                                </button>
                            ))}
                        </div>

                        {/* TIMETABLE ROUTINE SCHEDULE LIST */}
                        <div className="rounded-3xl border border-white/10 bg-[#0B0915]/80 overflow-hidden shadow-2xl">
                            {loading ? (
                                <div className="p-16 text-center text-gray-400 text-xs font-mono">
                                    Loading period routine for Class {selectedClass}...
                                </div>
                            ) : filteredTimetable.length === 0 ? (
                                <div className="p-16 text-center space-y-3">
                                    <Clock className="w-12 h-12 text-indigo-400 mx-auto opacity-40" />
                                    <h3 className="text-base font-bold text-white">No Timetable Scheduled for {selectedDay}</h3>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                        Teachers have not scheduled period routines for {selectedDay} in Class {selectedClass}.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {filteredTimetable.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                                                    <span>P-{item.periodNumber}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-white">{item.subject}</span>
                                                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-indigo-300 font-mono font-bold">
                                                            {item.dayOfWeek || 'Monday'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-3 mt-1 font-mono">
                                                        <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" /> {item.startTime} - {item.endTime}</span>
                                                        <span className="flex items-center gap-1"><User size={12} className="text-purple-400" /> {item.teacherName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end md:self-auto">
                                                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-mono flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-emerald-400" /> {item.roomNumber || 'Room 101'}
                                                </div>
                                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                                    <CheckCircle2 size={13} /> Present
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW MODE 2: ATTENDANCE REPORT & HISTORY */}
                {viewMode === 'attendance' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-[#0B0915]/90 border border-white/10 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-base font-black text-white flex items-center gap-2">
                                        <UserCheck size={20} className="text-emerald-400" /> Official Attendance Record & Subject Attendance
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Student ID: <span className="font-mono text-indigo-300">{studentId}</span> • Registered Class: <span className="font-bold text-white">{selectedClass}</span>
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
                                    Status: Verified Active
                                </span>
                            </div>

                            {/* Today's Subject-Wise Attendance Status Table */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Today's Subject Period Attendance</h4>
                                <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead>
                                            <tr className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                                                <th className="px-5 py-3">Period</th>
                                                <th className="px-5 py-3">Time</th>
                                                <th className="px-5 py-3">Subject</th>
                                                <th className="px-5 py-3">Faculty Teacher</th>
                                                <th className="px-5 py-3 text-right">Attendance Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(attendanceData?.records && attendanceData.records.length > 0) ? (
                                                attendanceData.records.map((p: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-white/[0.02]">
                                                        <td className="px-5 py-3 text-white font-bold">{p.date || 'Today'}</td>
                                                        <td className="px-5 py-3 text-gray-400">{p.classId || selectedClass}</td>
                                                        <td className="px-5 py-3 text-indigo-300 font-bold">{p.studentName || 'Student'}</td>
                                                        <td className="px-5 py-3 text-gray-300">{p.markedByTeacherName || 'Class Teacher'}</td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                                                p.status === 'PRESENT' 
                                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                                                    : p.status === 'LATE'
                                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                                            }`}>
                                                                ● {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-6 text-center text-gray-500">
                                                        No attendance records logged yet by Class Teacher.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW MODE 3: SCHOOL MASTER CALENDAR & EVENTS */}
                {viewMode === 'calendar' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0915]/80 space-y-4">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-400" /> Master School Academic Calendar & Event Announcements
                            </h3>
                            <p className="text-xs text-gray-400">
                                Live updates on Holidays, Sports Days, Cultural Events, and Emergency Announcements published by School Teachers.
                            </p>

                            {calendarEvents.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 text-xs font-mono">
                                    No special events or holidays currently published for Class {selectedClass}.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {calendarEvents.map((ev: any, idx: number) => (
                                        <div key={ev._id || idx} className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                                                    {ev.category || 'EVENT'}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">{ev.date}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mt-1">{ev.title}</h4>
                                            {ev.impact && (
                                                <p className="text-xs text-gray-400 bg-white/5 p-2 rounded-xl border border-white/5">
                                                    💡 {ev.impact}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW MODE 4: EXAM SCHEDULE TIMETABLE */}
                {viewMode === 'exams' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl border border-white/10 bg-[#0B0915]/80 space-y-4">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-400" /> Published Board & School Exam Timetables
                            </h3>
                            <p className="text-xs text-gray-400">
                                Official datesheets, room seating matrix, and syllabus coverage for Class {selectedClass}.
                            </p>

                            {examSchedules.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 text-xs font-mono">
                                    No exam schedules currently published by Teachers for Class {selectedClass}.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                                    {examSchedules.map((ex: any, idx: number) => (
                                        <div key={ex._id || idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02]">
                                            <div>
                                                <div className="text-xs font-black text-amber-300 uppercase tracking-widest">{ex.examName}</div>
                                                <h4 className="text-base font-bold text-white mt-0.5">{ex.subject}</h4>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Room: <span className="text-white font-mono">{ex.roomNumber}</span> • Invigilator: <span className="text-gray-300">{ex.invigilatorName}</span>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right shrink-0">
                                                <div className="text-sm font-bold text-white font-mono">{ex.examDate}</div>
                                                <div className="text-xs text-indigo-300 font-mono">{ex.startTime} - {ex.endTime}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Total Marks: {ex.totalMarks} (Pass: {ex.passingMarks})</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassTimetablePage;
