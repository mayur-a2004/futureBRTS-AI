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
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MODES = [
    { id: 'SOLO_VS_AI',    label: 'Solo vs AI',    icon: '🤖', desc: 'Battle Minerva AI' },
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
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Science', 'English', 'Social Studies'];
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MinervaQuizBattlePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [socket, setSocket] = useState<Socket | null>(null);

    // Views
    const [view, setView] = useState<'LOBBY' | 'CREATE' | 'JOIN' | 'WAITING' | 'BATTLE' | 'RESULTS'>('LOBBY');

    // Onboarding / Tutorial State
    const [showTraining, setShowTraining] = useState<boolean>(() => {
        return !localStorage.getItem('fb_arena_trained');
    });
    const [trainingStep, setTrainingStep] = useState<number>(0);

    // Create form state
    const [selMode, setSelMode] = useState('SOLO_VS_SOLO');
    const [selSubject, setSelSubject] = useState('Geography');
    const [selDiff, setSelDiff] = useState('Medium');
    const [selAiDiff, setSelAiDiff] = useState('SCHOLAR');
    const [totalRounds, setTotalRounds] = useState(10);
    const [selGrade, setSelGrade] = useState<number>(user?.grade || 10);

    // Room state
    const [room, setRoom] = useState<ArenaRoom | null>(null);
    const [activeRooms, setActiveRooms] = useState<ArenaRoom[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinTeam, setJoinTeam] = useState<'A' | 'B'>('B');

    // Battle state
    const [currentRound, setCurrentRound] = useState(0);
    const [myQuestion, setMyQuestion] = useState<ArenaQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [timerFrozen, setTimerFrozen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [damageEventsA, setDamageEventsA] = useState<{ id: number; amount: number }[]>([]);
    const [damageEventsB, setDamageEventsB] = useState<{ id: number; amount: number }[]>([]);
    const [shakeA, setShakeA] = useState(false);
    const [shakeB, setShakeB] = useState(false);
    const [comboMsg, setComboMsg] = useState<string | null>(null);
    const [roundComplete, setRoundComplete] = useState(false);
    const [teammateWrong, setTeammateWrong] = useState<{ wrongOption: number } | null>(null);
    const [battleFeed, setBattleFeed] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ─── Auto-submit on timeout ───────────────────────────────────────────────
    const autoSubmitTimeout = useCallback(() => {
        if (hasSubmitted || !room) return;
        setHasSubmitted(true);
        setSelectedOption(-1); // special value for timeout
        socket?.emit('submit_arena_answer', {
            roomCode: room.roomCode,
            userId: user?._id,
            roundIndex: currentRound,
            selectedOption: -1, // timeout
            timeMs: 15000
        });
    }, [room, currentRound, hasSubmitted, socket, user]);

    const startTimer = useCallback(() => {
        clearInterval(timerRef.current!);
        setTimeLeft(15);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    autoSubmitTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [autoSubmitTimeout]);

    // ─── Socket Setup ─────────────────────────────────────────────────────────
    useEffect(() => {
        fetchActiveRooms();
        const s = io('http://localhost:7001');
        setSocket(s);

        s.on('arena_lobby_update', (d: { room: ArenaRoom }) => setRoom(d.room));

        s.on('arena_started', (d: { room: ArenaRoom }) => {
            setRoom(d.room);
            setView('BATTLE');
            resetBattleState();
            setCurrentRound(0);
            setBattleFeed([`⚔️ The battle has begun! Show your knowledge!`]);
            loadQuestion(d.room, 0);
            startTimer();
        });

        s.on('arena_update', (d: {
            room: ArenaRoom; team: string; isCorrect: boolean;
            damage: number; selfDamage: number; roundComplete: boolean;
            event: string; answeredBy: string; playerName?: string; xpDeducted?: number;
            shieldUsed?: boolean;
        }) => {
            setRoom(d.room);

            // Add detailed battle feed activity message
            if (d.event === 'AI_ANSWER') {
                const msg = d.isCorrect
                    ? `🤖 Minerva AI answered CORRECTLY! Dealt ${d.damage} damage to Team Alpha.`
                    : `💥 Minerva AI got it WRONG! Minerva took ${d.damage} self-damage.`;
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
                    startTimer();
                }, 1800);
            }
        });

        s.on('arena_finished', (d: { room: ArenaRoom }) => { setRoom(d.room); setView('RESULTS'); clearInterval(timerRef.current!); });
        s.on('arena_forfeit', (d: { room: ArenaRoom }) => { setRoom(d.room); setView('RESULTS'); clearInterval(timerRef.current!); });

        s.on('arena_combo', (d: { message: string }) => {
            setComboMsg(d.message);
            setTimeout(() => setComboMsg(null), 3000);
        });

        s.on('arena_teammate_wrong', (d: { roundIndex: number; wrongOption: number }) => {
            if (!hasSubmitted) setTeammateWrong({ wrongOption: d.wrongOption });
        });

        s.on('arena_powerup_used', (d: { effect: string; duration?: number; hideIndices?: number[] }) => {
            if (d.effect === 'TIMER_FROZEN') {
                setTimerFrozen(true);
                clearInterval(timerRef.current!);
                setTimeout(() => { setTimerFrozen(false); startTimer(); }, d.duration || 10000);
            } else if (d.effect === 'HIDE_OPTIONS' && d.hideIndices) {
                setHiddenOptions(d.hideIndices);
            }
        });

        s.on('arena_answer_ack', (d: { alreadyClaimed: boolean }) => {
            if (d.alreadyClaimed) setHasSubmitted(true);
        });

        return () => { s.disconnect(); clearInterval(timerRef.current!); };
    }, [user, startTimer]);

    const resetBattleState = useCallback(() => {
        setSelectedOption(null);
        setHasSubmitted(false);
        setHiddenOptions([]);
        setTimerFrozen(false);
        setTeammateWrong(null);
        setBattleFeed([]);
    }, []);

    const loadQuestion = (r: ArenaRoom, roundIdx: number) => {
        const uid = String(user?._id ?? '');
        const qs = r.playerQuestions?.[uid] || (r.playerQuestions as any)?.[uid];
        setMyQuestion(qs?.[roundIdx] ?? null);
    };

    // ─── API ──────────────────────────────────────────────────────────────────
    const token = () => localStorage.getItem('fbrts_token') || '';

    const fetchActiveRooms = async () => {
        try {
            const res = await fetch('/api/future-education/battle/rooms', { headers: { Authorization: `Bearer ${token()}` } });
            const d = await res.json();
            if (d.success) setActiveRooms(d.rooms || []);
        } catch { /* silent */ }
    };

    const createRoom = async () => {
        resetBattleState();
        setLoading(true);
        try {
            const res = await fetch('/api/future-education/battle/room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({
                    mode: selMode,
                    subject: selSubject,
                    difficulty: selDiff,
                    totalRounds,
                    grade: selGrade,
                    aiDifficulty: selMode === 'SOLO_VS_AI' ? selAiDiff : undefined
                })
            });
            const d = await res.json();
            if (d.success) {
                setRoom(d.room);
                setView('WAITING');
                socket?.emit('join_arena_lobby', { roomCode: d.room.roomCode, userId: user?._id });
            } else showAlert('Error', d.message || 'Failed to create room');
        } catch { showAlert('Error', 'Connection failed'); }
        finally { setLoading(false); }
    };

    const joinRoom = async () => {
        if (!joinCode) return;
        resetBattleState();
        setLoading(true);
        try {
            const res = await fetch('/api/future-education/battle/room/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ roomCode: joinCode.toUpperCase(), team: joinTeam })
            });
            const d = await res.json();
            if (d.success) {
                setRoom(d.room);
                setView('WAITING');
                socket?.emit('join_arena_lobby', { roomCode: joinCode.toUpperCase(), userId: user?._id });
            } else showAlert('Error', d.message || 'Room not found or full');
        } catch { showAlert('Error', 'Connection failed'); }
        finally { setLoading(false); }
    };

    const startMatch = () => {
        if (!room) return;
        socket?.emit('start_arena_match', { roomCode: room.roomCode, userId: user?._id });
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
    const myPlayer = room?.players.find(p => p.userId === String(user?._id ?? ''));
    const myTeam = myPlayer?.team as 'A' | 'B' | undefined;
    const teamAPlayers = room?.players.filter(p => p.team === 'A') ?? [];
    const teamBPlayers = room?.players.filter(p => p.team === 'B') ?? [];
    const isHost = room && (String(room.hostId) === String(user?._id) || String(room.hostId?._id) === String(user?._id));
    const isReady = room && (room.mode === 'SOLO_VS_AI' || room.players.length >= (room.teamASizeTarget + room.teamBSizeTarget));

    // Training steps array
    const tutorialSteps = [
        {
            title: "Welcome to the Quiz Arena! ⚔️",
            desc: "The Quiz Arena is an RPG battle simulator where knowledge is your ultimate weapon. You'll compete against other students or our intelligent Minerva Bot using standard curriculum-aligned questions.",
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
        <div className="w-full min-h-full bg-[#05070f] text-white relative font-inter pb-12">
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
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <div className="flex items-center gap-2">
                                <Swords className="w-6 h-6 text-indigo-400" />
                                <span className="text-xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent tracking-tight">QUIZ ARENA</span>
                            </div>
                            <button onClick={() => { setTrainingStep(0); setShowTraining(true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/40 text-xs font-bold transition-all">
                                <HelpCircle className="w-3.5 h-3.5" /> How to Play
                            </button>
                        </div>

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
                                            <div className="font-mono text-sm text-indigo-400 font-black tracking-wider">{r.roomCode}</div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{r.subject} • {r.mode?.replace(/_/g, ' ')}</div>
                                        </div>
                                        <button onClick={() => { setJoinCode(r.roomCode); setView('JOIN'); }}
                                            className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-950/50 transition-all active:scale-95">
                                            <Swords className="w-3 h-3" /> Fight
                                        </button>
                                    </motion.div>
                                ))}
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

                        {/* Standard Selector + Subject + Difficulty */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Class / Standard</div>
                                <select value={selGrade} onChange={e => setSelGrade(+e.target.value)}
                                    className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                    {[5, 6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Class {g}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Subject</div>
                                <select value={selSubject} onChange={e => setSelSubject(e.target.value)}
                                    className="w-full bg-[#0a0c16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Difficulty</div>
                                <div className="flex gap-1.5 h-10">
                                    {DIFFICULTIES.map(d => (
                                        <button key={d} onClick={() => setSelDiff(d)}
                                            className={`flex-1 rounded-xl text-xs font-bold border transition-all ${selDiff === d ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-850 text-slate-500 hover:border-slate-800'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Minerva AI Difficulty</div>
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
                        <div className="text-center mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{room.subject} • {room.mode?.replace(/_/g, ' ')}</div>
                            <h1 className="text-2xl font-black mb-3 tracking-tight">Match Lobby Arena</h1>
                            <div className="inline-flex items-center gap-3 bg-[#0a0d18] border border-slate-800 rounded-2xl px-5 py-3 shadow-lg">
                                <span className="font-mono text-xl font-black text-indigo-400 tracking-widest">{room.roomCode}</span>
                                <button onClick={copyCode} className="text-slate-400 hover:text-white transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="text-xs text-slate-500 mt-2 font-medium">Share this code with other students to fill the teams!</div>
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
                                    {room.mode === 'SOLO_VS_AI' ? `Minerva AI Bot` : `Team Omega (${teamBPlayers.length} / {room.teamBSizeTarget})`}
                                </div>
                                <div className="space-y-2">
                                    {room.mode === 'SOLO_VS_AI' ? (
                                        <div className="flex items-center gap-3 bg-[#1d080c]/60 border border-rose-950/30 px-3.5 py-2.5 rounded-2xl">
                                            <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                                            <span className="font-bold text-sm">Minerva Bot</span>
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
                                <div className="flex flex-wrap gap-1 mt-2.5 border-t border-indigo-950/40 pt-2">
                                    {teamAPlayers.map(p => (
                                        <span key={p.userId} className="text-[9px] bg-indigo-550/20 border border-indigo-500/10 text-indigo-350 px-2 py-0.5 rounded-full font-bold">
                                            {p.firstName}{p.streakCount >= 2 ? ` 🔥 x${p.streakCount}` : ''}
                                        </span>
                                    ))}
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
                                            {room.mode === 'SOLO_VS_AI' ? 'Minerva AI' : 'Team Omega'}
                                        </div>
                                        <div className="text-[9px] text-slate-500 truncate">
                                            {room.mode === 'SOLO_VS_AI' ? `${room.aiDifficulty} Cyborg` : 'Challengers'}
                                        </div>
                                    </div>
                                </div>
                                <HpBar current={room.teamB.hp} max={room.teamB.maxHp} />
                                <div className="flex flex-wrap gap-1 mt-2.5 border-t border-rose-950/40 pt-2">
                                    {room.mode === 'SOLO_VS_AI' ? (
                                        <span className="text-[9px] bg-rose-950/40 border border-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                                            🤖 AI BOT
                                        </span>
                                    ) : teamBPlayers.map(p => (
                                        <span key={p.userId} className="text-[9px] bg-rose-550/20 border border-rose-500/10 text-rose-350 px-2 py-0.5 rounded-full font-bold">
                                            {p.firstName}{p.streakCount >= 2 ? ` 🔥 x${p.streakCount}` : ''}
                                        </span>
                                    ))}
                                </div>
                                {damageEventsB.map(d => <DamageFloat key={d.id} amount={d.amount} isHeal={false} />)}
                            </motion.div>
                        </div>

                        {/* Question Card */}
                        <div className="flex-1 bg-[#090b14]/90 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-2xl relative">
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.03),transparent)] pointer-events-none rounded-3xl" />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Round {currentRound + 1} / {room.totalRounds}</span>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${timerFrozen ? 'border-blue-500/30 bg-blue-900/20 text-blue-400' : timeLeft <= 5 ? 'border-rose-500/40 bg-rose-900/20 text-rose-400 animate-pulse' : 'border-slate-800 bg-[#06080e] text-slate-350'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {timerFrozen ? 'TIMER FROZEN' : `${timeLeft} Seconds`}
                                </div>
                            </div>

                            {teammateWrong && !hasSubmitted && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mb-4 text-[11px] bg-amber-900/20 border border-amber-500/20 text-amber-400 rounded-xl px-3 py-2.5 font-medium relative z-10 flex items-center gap-1.5">
                                    <span>⚠️</span> Teammate chose Option {String.fromCharCode(65 + teammateWrong.wrongOption)} (WRONG!). Choose another option!
                                </motion.div>
                            )}

                            {myQuestion ? (
                                <div className="relative z-10 flex flex-col flex-1">
                                    <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">Class {myPlayer?.grade} • {room.subject} Syllabus</div>
                                    <h3 className="text-base font-bold text-white mb-6 leading-relaxed">{myQuestion.question}</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {myQuestion.options?.map((opt, idx) => {
                                            if (hiddenOptions.includes(idx)) return null;
                                            const isSelected = selectedOption === idx;
                                            const isCorrect = myQuestion.correctAnswer === idx;
                                            const isTeammateWrong = teammateWrong?.wrongOption === idx;

                                            let cls = 'border-slate-800 bg-[#06080e]/40 hover:border-indigo-500/40 hover:bg-indigo-950/10 text-slate-300 cursor-pointer';
                                            if (hasSubmitted) {
                                                if (isSelected && isCorrect) cls = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 cursor-default';
                                                else if (isSelected) cls = 'border-rose-500 bg-rose-950/40 text-rose-350 cursor-default';
                                                else if (isCorrect) cls = 'border-emerald-500/40 bg-emerald-950/15 text-emerald-400 cursor-default';
                                                else cls = 'border-slate-900 opacity-25 cursor-default';
                                            } else if (isTeammateWrong) {
                                                cls = 'border-amber-900/30 bg-amber-950/5 text-slate-650 cursor-not-allowed';
                                            }

                                            return (
                                                <motion.button key={idx}
                                                    whileHover={!hasSubmitted && !isTeammateWrong ? { scale: 1.005 } : {}}
                                                    whileTap={!hasSubmitted && !isTeammateWrong ? { scale: 0.99 } : {}}
                                                    disabled={hasSubmitted || isTeammateWrong}
                                                    onClick={() => submitAnswer(idx)}
                                                    className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center gap-3 ${cls}`}>
                                                    <span className="w-5.5 h-5.5 flex-shrink-0 rounded-full border border-current flex items-center justify-center text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>
                                                    <span className="flex-1">{opt}</span>
                                                    {isTeammateWrong && <span className="text-[9px] shrink-0 text-amber-500 font-bold">Team ✗</span>}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Detailed Wrong/Right Feedback with Real Answer & XP deduction */}
                                    {hasSubmitted && selectedOption !== null && selectedOption !== myQuestion.correctAnswer && (
                                        <div className="mt-4 text-xs bg-rose-950/30 border border-rose-800/40 text-rose-455 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                                            <span>❌</span>
                                            <div>
                                                Incorrect answer. The correct answer was: <span className="underline text-rose-300 font-black">{myQuestion.options[myQuestion.correctAnswer]}</span>.
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
                              { players: room.mode === 'SOLO_VS_AI' ? [] : teamBPlayers, teamKey: 'B', label: room.mode === 'SOLO_VS_AI' ? 'Minerva AI' : 'Team Omega', icon: room.mode === 'SOLO_VS_AI' ? <Bot className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />, color: 'rose' }
                            ].map(({ players, teamKey, label, icon, color }) => (
                                <div key={teamKey} className={`bg-${color}-950/15 border border-${color}-900/35 rounded-3xl p-4.5 shadow-xl`}>
                                    <div className={`text-[10px] font-black uppercase tracking-widest text-${color}-400 mb-3 flex items-center gap-1.5 border-b border-${color}-950/30 pb-2`}>
                                        {icon} {label}
                                        {room.winnerTeam === teamKey && <Crown className="w-3.5 h-3.5 text-yellow-450 ml-auto" />}
                                    </div>
                                    {room.mode === 'SOLO_VS_AI' && teamKey === 'B' ? (
                                        <div className="flex items-center gap-3 bg-slate-900/40 rounded-2xl px-4 py-3">
                                            <Bot className="w-5 h-5 text-rose-450" />
                                            <span className="font-bold text-sm">Minerva Bot</span>
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
                            <button onClick={() => { setView('LOBBY'); setRoom(null); fetchActiveRooms(); }}
                                className="flex-1 py-3.5 border border-slate-800 hover:border-slate-700 bg-slate-900/20 rounded-2xl font-bold text-sm transition-colors">
                                Back to Arena Lobby
                            </button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setView('CREATE'); setRoom(null); }}
                                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg shadow-indigo-950/50">
                                Play Again ⚔️
                            </motion.button>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
