import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Clock, ShieldAlert, ArrowRight, CheckCircle, Swords, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AIMemoryCompanionWidget: React.FC = () => {
  const navigate = useNavigate();
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        const token = localStorage.getItem('fbrts_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:7001';
        const res = await axios.get(`${API_URL}/api/minerva/student-digest`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.success && res.data?.digest) {
          setDigest(res.data.digest);
        }
      } catch (err) {
        console.error("Failed to load student digest", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDigest();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6 rounded-3xl bg-black/40 border border-white/10 animate-pulse space-y-4">
        <div className="h-6 w-64 bg-white/10 rounded-lg" />
        <div className="h-20 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const pendingHomework = digest?.pendingHomework || [];
  const dueReviews = digest?.dueReviews || [];
  const activeRoadmap = digest?.activeRoadmap;
  const upcomingExams = digest?.upcomingExams || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0c0e1a] via-[#090b14] to-black border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              AI Smart Memory & Progress Companion
            </h3>
            <p className="text-xs text-gray-400">Daily intelligent recap of your homework, SM-2 revision curve & live exams</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">SM-2 Memory Active</span>
        </div>
      </div>

      {/* Dynamic Summary Nudge Bar */}
      {digest?.summary && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🤖</span>
            <p className="text-xs md:text-sm font-semibold text-indigo-200 leading-snug">
              {digest.summary}
            </p>
          </div>
          <button
            onClick={() => navigate('/future-education/learn')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex-shrink-0 flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Quick Practice</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Interactive Progress Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 📌 Module 1: 🚨 Priority School & Teacher Homework */}
        <div className="p-5 rounded-2xl bg-black/60 border border-rose-500/30 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert size={14} className="animate-pulse" /> 🚨 Priority Teacher & School Homework
            </span>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {pendingHomework.length} Due
            </span>
          </div>

          {pendingHomework.length > 0 ? (
            <div className="space-y-2">
              {pendingHomework.slice(0, 2).map((hw: any) => (
                <div key={hw.id} className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white line-clamp-1">{hw.title}</p>
                    <span className="text-[10px] text-gray-400">{hw.subject} • Priority Focus</span>
                  </div>
                  <button
                    onClick={() => navigate('/future-education/tasks')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition-all"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-white/5 text-xs text-gray-400">
              ✅ All priority homework submitted! Great work.
            </div>
          )}
        </div>

        {/* 🧠 Module 2: 🔮 SM-2 Spaced Repetition Revision Nudge */}
        <div className="p-5 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Clock size={14} /> 🔮 SM-2 Spaced Memory Revisions
            </span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {dueReviews.length} Due Today
            </span>
          </div>

          {dueReviews.length > 0 ? (
            <div className="space-y-2">
              {dueReviews.slice(0, 2).map((rev: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white line-clamp-1">{rev.topic}</p>
                    <span className="text-[10px] text-indigo-300">{rev.subject} • {rev.dueSinceDays} days ago</span>
                  </div>
                  <button
                    onClick={() => navigate('/future-education/learn')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition-all"
                  >
                    2-Min Quiz
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-white/5 text-xs text-gray-400">
              ✨ Memory retention at 100%! No revisions due today.
            </div>
          )}
        </div>

        {/* 🗺️ Module 3: 🚀 Active Roadmap Progress */}
        {activeRoadmap && (
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen size={14} /> 🗺️ Curriculum Roadmap
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">{activeRoadmap.progressPercent}%</span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all" style={{ width: `${activeRoadmap.progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="line-clamp-1 font-semibold">{activeRoadmap.nextTopic}</span>
                <button
                  onClick={() => navigate('/future-education/roadmaps')}
                  className="text-emerald-400 hover:underline font-bold text-xs flex items-center gap-0.5 flex-shrink-0"
                >
                  Resume <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ⚔️ Module 4: 🏆 Live Quiz & Exam Battles */}
        <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Swords size={14} /> ⚔️ Live Quiz & Exam Arena
            </span>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Live Battle
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Live Class Chemistry Battle</p>
              <span className="text-[10px] text-purple-300">Tomorrow at 5:00 PM • Arena Hall</span>
            </div>
            <button
              onClick={() => navigate('/future-education/quiz-battle')}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-[11px] rounded-lg transition-all"
            >
              Join Arena
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AIMemoryCompanionWidget;
