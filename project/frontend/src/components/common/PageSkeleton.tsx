import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#05060b] text-white p-6 md:p-12 animate-pulse space-y-8">
      {/* Top Header Shell */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/10 rounded-xl" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-white/10 rounded-xl" />
          <div className="h-10 w-10 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Grid Stat Cards Shell */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-8 w-16 bg-white/15 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Content Area Shell */}
      <div className="p-8 rounded-3xl bg-black/50 border border-white/5 space-y-6">
        <div className="h-6 w-56 bg-white/10 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-white/5 rounded-2xl border border-white/5 col-span-2" />
          <div className="h-44 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
