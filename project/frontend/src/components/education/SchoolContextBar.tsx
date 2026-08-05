import React from 'react';
import { School, ShieldCheck, GraduationCap, Lock } from 'lucide-react';

interface SchoolContextBarProps {
  moduleTitle: string;
  selectedClass: string;
  onClassChange: (newClass: string) => void;
  selectedSubject?: string;
  onSubjectChange?: (newSubject: string) => void;
}

export const SchoolContextBar: React.FC<SchoolContextBarProps> = ({
  moduleTitle,
  selectedClass,
  onClassChange,
  selectedSubject = 'Mathematics',
  onSubjectChange
}) => {
  // Read user role strictly from stored session
  const storedUser = localStorage.getItem('fbrts_user') || localStorage.getItem('fbrts_teacher_user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userRole = parsedUser?.role || (localStorage.getItem('fbrts_teacher_token') ? 'TEACHER' : 'STUDENT');

  const teacherName = parsedUser ? `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.name : 'Faculty Teacher';
  const schoolName = parsedUser?.teacherDetails?.schoolName || parsedUser?.schoolName || 'Mount Carmel High School';

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-zinc-950 via-purple-950/40 to-zinc-950 border border-purple-500/20 shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      {/* School Org Title & Module Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-md">
          <School size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest">
              {schoolName} • Education OS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-bold">
              {moduleTitle}
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            {userRole === 'TEACHER' ? `Faculty Workspace — ${teacherName}` : 'Student Learning Hub'}
          </h2>
        </div>
      </div>

      {/* Role Badge & Class Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {/* Role Badge (Fixed, No Demo Switcher Button) */}
        <div className="px-3 py-1.5 rounded-2xl bg-black/60 border border-white/10 text-xs font-bold flex items-center gap-1.5 text-purple-300">
          {userRole === 'TEACHER' ? (
            <>
              <GraduationCap size={14} className="text-purple-400" />
              <span>Verified Teacher Account</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>Registered Student Account</span>
            </>
          )}
        </div>

        {/* Multi-Class Selector Dropdown (Teacher) vs Locked Badge (Student) */}
        {userRole === 'TEACHER' ? (
          <div className="flex items-center gap-2 bg-black/60 border border-purple-500/30 p-1.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-purple-400 pl-2">Active Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                onClassChange(e.target.value);
                if (onSubjectChange) {
                  if (e.target.value === 'CLASS-11B') onSubjectChange('Physics');
                  else if (e.target.value === 'CLASS-12SCI') onSubjectChange('Chemistry');
                  else if (e.target.value === 'CLASS-9A') onSubjectChange('Science');
                  else onSubjectChange('Mathematics');
                }
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {(() => {
                const assigned = parsedUser?.assignedClasses;
                let list = ['CLASS-10A', 'CLASS-9A', 'CLASS-11B', 'CLASS-12SCI'];
                if (Array.isArray(assigned) && assigned.length > 0) {
                  const filtered = assigned.filter((c: string) => 
                    !c.toUpperCase().includes('CLASS-3') && 
                    !c.toUpperCase().includes('SEC_3') &&
                    !c.toUpperCase().includes('CLASS-3_')
                  );
                  if (filtered.length > 0) list = filtered;
                }
                
                const formatLabel = (raw: string) => {
                  if (raw === 'CLASS-10A') return '🏫 Class 10-A (Mathematics)';
                  if (raw === 'CLASS-9A') return '🏫 Class 9-A (Science)';
                  if (raw === 'CLASS-11B') return '🏫 Class 11-B (Physics)';
                  if (raw === 'CLASS-12SCI') return '🏫 Class 12-Science (Chemistry)';
                  let clean = raw.replace(/^CLASS-?/i, '');
                  if (clean.includes('_SEC_')) {
                    const parts = clean.split('_SEC_');
                    const stdNum = parts[0].replace(/[^0-9]/g, '');
                    const rest = parts[1]?.split('_') || [];
                    const sec = rest[0] || 'A';
                    const sub = rest.slice(1).join(' ').toLowerCase();
                    const formattedSub = sub ? sub.charAt(0).toUpperCase() + sub.slice(1) : '';
                    return `🏫 Class ${stdNum || '10'}-${sec}${formattedSub ? ` (${formattedSub})` : ''}`;
                  }
                  return `🏫 Class ${clean}`;
                };

                return list.map(cId => (
                  <option key={cId} value={cId}>
                    {formatLabel(cId)}
                  </option>
                ));
              })()}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-2 rounded-2xl text-xs font-bold text-indigo-300">
            <Lock size={14} className="text-indigo-400" />
            <span>
              Assigned: Class {parsedUser?.standard ? (parsedUser.standard.toString().startsWith('class_') ? parsedUser.standard.replace('class_', '') : parsedUser.standard) : '10'}-{parsedUser?.section || 'A'} {parsedUser?.board ? `(${parsedUser.board.toUpperCase()})` : ''}
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default SchoolContextBar;
