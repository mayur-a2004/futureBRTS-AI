import React from 'react';

// 💰 1. Fee Analytics & Collection Summary Card
export interface IFeeData {
  gradeSection: string;
  totalFeeINR: number;
  collectedINR: number;
  pendingINR: number;
  collectionPercentage: number;
  pendingStudentCount: number;
  actionButtons: { label: string; actionType: string }[];
}

export const FeeAnalyticsWidget: React.FC<{ data: IFeeData }> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 my-3 shadow-2xl backdrop-blur-xl text-white space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
            💰 Fee Collection Audit
          </h3>
          <p className="text-xs text-slate-400">{data.gradeSection}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-mono font-bold">
          {data.collectionPercentage}% Collected
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Collected: ₹{data.collectedINR.toLocaleString('en-IN')}</span>
          <span>Pending: ₹{data.pendingINR.toLocaleString('en-IN')}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.collectionPercentage}%` }}></div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-center justify-between">
        <span>⚠️ {data.pendingStudentCount} Students have pending fee installments</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {data.actionButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => alert(`Triggered Action: ${btn.actionType}`)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-md"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ⚡ 2. Actionable Button Row Card
export const ActionableButtonRow: React.FC<{ buttons: { label: string; actionType: string }[] }> = ({ buttons }) => {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={() => alert(`Executed Action: ${btn.actionType}`)}
          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium py-2 px-3 rounded-xl transition-all hover:scale-105"
        >
          ⚡ {btn.label}
        </button>
      ))}
    </div>
  );
};
