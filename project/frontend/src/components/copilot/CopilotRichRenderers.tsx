import React from 'react';

// ⚙️ 1. Multi-Step Live Process Execution Loader
export const StepProcessLoader: React.FC<{ steps: string[] }> = ({ steps }) => {
  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 my-2 text-xs space-y-2 font-mono shadow-lg backdrop-blur-md">
      <div className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
        AI Dual-DB Query Execution Stepper
      </div>
      <div className="space-y-1">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2 text-slate-300 animate-fade-in">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 📊 2. Student 360° Executive Dossier Card
export interface IStudent360Data {
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  attendancePercent: number;
  academicGradeScore: number;
  strongTopics: string[];
  weakTopics: string[];
  recentBattlesWon: number;
  aiTutorHours: number;
}

export const Student360DossierCard: React.FC<{ data: IStudent360Data }> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 my-3 shadow-2xl backdrop-blur-xl text-white space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            🎓 {data.studentName}
            <span className="text-xs font-normal text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {data.grade}-{data.section}
            </span>
          </h3>
          <p className="text-xs text-slate-400">ID: {data.studentId} • Universal Passport Linked</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400">{data.academicGradeScore}/100</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Academic Score</div>
        </div>
      </div>

      {/* KPI Meters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Badge */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold text-sm">
            {data.attendancePercent}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">ERP Attendance</div>
            <div className="text-[10px] text-emerald-400">Regular & Present</div>
          </div>
        </div>

        {/* AI Learning Hours */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/40 text-purple-400 font-bold text-sm">
            ⚡ {data.aiTutorHours}h
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">AI Engagement</div>
            <div className="text-[10px] text-purple-300">{data.recentBattlesWon} Battles Won</div>
          </div>
        </div>
      </div>

      {/* Topic Mastery Chips */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-emerald-400 font-bold mr-2">🟢 Strong Topics:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.strongTopics.map((topic, i) => (
              <span key={i} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md text-[11px]">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-rose-400 font-bold mr-2">🔴 Needs AI Practice:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.weakTopics.map((topic, i) => (
              <span key={i} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded-md text-[11px]">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Trigger Buttons */}
      <div className="pt-2 flex flex-wrap gap-2 border-t border-indigo-500/20">
        <button 
          onClick={() => alert(`Remedial AI Practice set pushed for ${data.studentName}`)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-md hover:shadow-indigo-500/20"
        >
          📤 Push Practice HW
        </button>
        <button 
          onClick={() => alert(`Parent Dossier PDF link generated for ${data.studentName}`)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
        >
          📄 Export PDF
        </button>
      </div>
    </div>
  );
};
