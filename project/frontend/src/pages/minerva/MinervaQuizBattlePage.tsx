import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { Button } from '../../components/ui/Button';
import { Zap, Swords, Trophy, Users, ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MinervaQuizBattlePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showAlert } = useModal();
    const [socket, setSocket] = useState<Socket | null>(null);

    // Lobby states
    const [subject, setSubject] = useState('Physics');
    const [difficulty, setDifficulty] = useState('Medium');
    const [roomCode, setRoomCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [activeRooms, setActiveRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Gameplay states
    const [battleState, setBattleState] = useState<'LOBBY' | 'WAITING_FOR_OPPONENT' | 'ACTIVE' | 'FINISHED'>('LOBBY');
    const [battleData, setBattleData] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    useEffect(() => {
        // Fetch active waiting rooms on load
        fetchActiveRooms();

        // Connect to main API Port Socket
        const newSocket = io('http://localhost:7001');
        setSocket(newSocket);

        newSocket.on('lobby_update', (data: { battle: any }) => {
            setBattleData(data.battle);
        });

        newSocket.on('battle_start', (data: { battle: any }) => {
            setBattleData(data.battle);
            setBattleState('ACTIVE');
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setHasSubmitted(false);
            setLoading(false);
        });

        newSocket.on('battle_update', (data: { battle: any; answeredBy: string; questionIndex: number; isCorrect: boolean }) => {
            setBattleData(data.battle);
        });

        newSocket.on('battle_finished', (data: { battle: any }) => {
            setBattleData(data.battle);
            setBattleState('FINISHED');
            determineWinner(data.battle);
        });

        newSocket.on('battle_forfeit', (data: { battle: any; leftPlayerSocketId: string }) => {
            setBattleData(data.battle);
            setBattleState('FINISHED');
            setResultMessage('Opponent forfeited! You win by default! 🏆 (+300 XP)');
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const fetchActiveRooms = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/future-education/battle/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setActiveRooms(data.battles || []);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    const createBattleRoom = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/future-education/battle/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ subject, difficulty })
            });
            const data = await res.json();
            if (data.success) {
                setRoomCode(data.battle.roomCode);
                setBattleData(data.battle);
                setBattleState('WAITING_FOR_OPPONENT');
                socket?.emit('join_battle_lobby', { roomCode: data.battle.roomCode, userId: user?._id });
            } else {
                showAlert('Error', data.message || 'Failed to create room.');
            }
        } catch (err) {
            showAlert('Error', 'Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const joinBattleRoom = async (code: string) => {
        if (!code) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/future-education/battle/room/${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                if (data.battle.status === 'FINISHED') {
                    showAlert('Expired', 'This battle is already completed.');
                    setLoading(false);
                    return;
                }
                setRoomCode(code);
                setBattleData(data.battle);
                socket?.emit('join_battle_lobby', { roomCode: code, userId: user?._id });
            } else {
                showAlert('Not Found', 'Invalid Room Code or Match Expired.');
            }
        } catch (err) {
            showAlert('Error', 'Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = (optionIdx: number) => {
        if (hasSubmitted) return;
        setSelectedOption(optionIdx);
        setHasSubmitted(true);

        socket?.emit('submit_battle_answer', {
            roomCode,
            userId: user?._id,
            questionIndex: currentQuestionIndex,
            selectedOption: optionIdx
        });

        // Auto transition to next question after both answer, or after 3 seconds
        setTimeout(() => {
            if (currentQuestionIndex < 4) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setHasSubmitted(false);
            } else {
                // If it's the last question, emit finish
                socket?.emit('finish_battle', { roomCode });
            }
        }, 2000);
    };

    const determineWinner = (battle: any) => {
        const isCreator = battle.creatorId._id === user?._id;
        const myScore = isCreator ? battle.creatorScore : battle.opponentScore;
        const oppScore = isCreator ? battle.opponentScore : battle.creatorScore;

        if (myScore > oppScore) {
            setResultMessage('VICTORY! You dominated the arena! 🏆 (+300 XP)');
        } else if (oppScore > myScore) {
            setResultMessage('DEFEAT! Opponent won this battle. Try again! ⚔️ (+100 XP)');
        } else {
            setResultMessage("DRAW! Equal brains matched! 🤝 (+150 XP)");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-inter">
            {/* Glowing Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0 opacity-40"></div>

            <div className="w-full max-w-4xl z-10 relative">
                {/* Header Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/future-education/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </button>
                    <span className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg">
                        <Swords className="w-4 h-4" /> Quiz Arena
                    </span>
                </div>

                {/* State 1: LOBBY */}
                {battleState === 'LOBBY' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* Host Custom Match Card */}
                        <div className="glass-panel p-8 flex flex-col justify-between min-h-[400px]">
                            <div>
                                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-indigo-400">
                                    <Zap className="w-6 h-6 text-yellow-400" /> HOST NEW CHALLENGE
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">Create a dynamic quiz room, select settings, and challenge friends live.</p>

                                {/* Settings Form */}
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Subject</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                        >
                                            <option value="Physics">Physics</option>
                                            <option value="Chemistry">Chemistry</option>
                                            <option value="Biology">Biology</option>
                                            <option value="Mathematics">Mathematics</option>
                                            <option value="History">History</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Difficulty</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Easy', 'Medium', 'Hard'].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setDifficulty(d)}
                                                    className={`py-2 rounded-lg border font-semibold text-sm transition-all duration-200 ${difficulty === d ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={createBattleRoom} className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Host Battle Room'}
                            </Button>
                        </div>

                        {/* Join / Active Match List Card */}
                        <div className="glass-panel p-8 flex flex-col justify-between min-h-[400px]">
                            <div>
                                <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-indigo-400">
                                    <Users className="w-6 h-6 text-indigo-400" /> JOIN LIVE MATCH
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">Enter code shared by a friend, or find open active waiting rooms below.</p>

                                {/* Join Code Inputs */}
                                <div className="flex gap-2 mb-8">
                                    <input
                                        type="text"
                                        placeholder="Enter Room Code (e.g. BATTLE-1234)"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors uppercase font-mono tracking-widest text-center"
                                    />
                                    <Button onClick={() => joinBattleRoom(joinCode)} className="btn-primary px-6 font-bold">
                                        Join
                                    </Button>
                                </div>

                                <div className="border-t border-slate-900 pt-6">
                                    <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Active Open Lobbies</h4>
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                                        {activeRooms.length === 0 ? (
                                            <p className="text-slate-500 text-sm italic py-4 text-center">No open matching rooms found. Host one!</p>
                                        ) : (
                                            activeRooms.map(room => (
                                                <div key={room._id} className="flex items-center justify-between bg-slate-900/40 border border-slate-900 p-3 rounded-lg hover:border-slate-800 transition-all">
                                                    <div>
                                                        <div className="text-xs font-semibold text-indigo-400">{room.subject} • {room.difficulty}</div>
                                                        <div className="text-sm font-bold text-slate-200">Host: {room.creatorId?.firstName}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => joinBattleRoom(room.roomCode)}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Fight ⚔️
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* State 2: WAITING FOR OPPONENT */}
                {battleState === 'WAITING_FOR_OPPONENT' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-12 text-center max-w-lg mx-auto"
                    >
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-black mb-2 text-indigo-400">WAITING FOR CHALLENGER</h2>
                        <p className="text-slate-400 text-sm mb-8">Share this exclusive lobby room code with a classmate or friend to trigger the countdown.</p>

                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-3xl font-black tracking-widest text-indigo-400 mb-6 shadow-inner select-all cursor-pointer">
                            {roomCode}
                        </div>

                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Lobby details: {subject} ({difficulty})</p>
                    </motion.div>
                )}

                {/* State 3: ACTIVE GAMEPLAY */}
                {battleState === 'ACTIVE' && battleData && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Side: Score Board */}
                        <div className="lg:col-span-1 flex flex-col gap-4">
                            {/* Creator Card */}
                            <div className={`glass-panel p-4 border-l-4 ${battleData.creatorId?._id === user?._id ? 'border-l-indigo-500' : 'border-l-slate-800'}`}>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Player 1</div>
                                <div className="text-lg font-black truncate">{battleData.creatorId?.firstName}</div>
                                <div className="text-2xl font-black text-indigo-400 mt-2">{battleData.creatorScore} pts</div>
                            </div>
                            
                            {/* Opponent Card */}
                            <div className={`glass-panel p-4 border-l-4 ${battleData.opponentId?._id === user?._id ? 'border-l-indigo-500' : 'border-l-slate-800'}`}>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Player 2</div>
                                <div className="text-lg font-black truncate">{battleData.opponentId?.firstName || 'Joining...'}</div>
                                <div className="text-2xl font-black text-indigo-400 mt-2">{battleData.opponentScore} pts</div>
                            </div>
                        </div>

                        {/* Center/Right: The Question and Options */}
                        <div className="lg:col-span-3">
                            <div className="glass-panel p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-xs text-slate-500 uppercase font-black tracking-wider">Question {currentQuestionIndex + 1} of 5</span>
                                    <span className="bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-semibold uppercase">{battleData.subject} • {battleData.difficulty}</span>
                                </div>

                                <h3 className="text-xl font-bold mb-8 text-slate-100 min-h-[80px]">
                                    {battleData.questions[currentQuestionIndex]?.question}
                                </h3>

                                <div className="space-y-3">
                                    {battleData.questions[currentQuestionIndex]?.options.map((opt: string, idx: number) => {
                                        const isMySelected = selectedOption === idx;
                                        const isCorrect = battleData.questions[currentQuestionIndex]?.correctAnswer === idx;

                                        let optionStyle = 'border-slate-800 bg-slate-900/30 hover:border-slate-700 text-slate-300';
                                        if (hasSubmitted) {
                                            if (isMySelected) {
                                                optionStyle = isCorrect
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                                    : 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold';
                                            } else if (isCorrect) {
                                                optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
                                            } else {
                                                optionStyle = 'border-slate-900 opacity-40 text-slate-500';
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                disabled={hasSubmitted}
                                                onClick={() => submitAnswer(idx)}
                                                className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between ${optionStyle}`}
                                            >
                                                <span>{opt}</span>
                                                {hasSubmitted && isMySelected && (
                                                    isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {hasSubmitted && (
                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing answers with opponent...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* State 4: FINISHED / RESULTS */}
                {battleState === 'FINISHED' && battleData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-12 text-center max-w-lg mx-auto"
                    >
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                        <h2 className="text-3xl font-black mb-2 text-indigo-400 uppercase">Battle Over</h2>
                        <p className="text-lg font-bold text-slate-100 mb-8">{resultMessage}</p>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                <span>{battleData.creatorId?.firstName}</span>
                                <span>{battleData.creatorScore} pts</span>
                            </div>
                            <div className="h-[1px] bg-slate-800"></div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                                <span>{battleData.opponentId?.firstName}</span>
                                <span>{battleData.opponentScore} pts</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setBattleState('LOBBY');
                                setBattleData(null);
                                fetchActiveRooms();
                            }}
                            className="btn-primary w-full py-3 font-bold"
                        >
                            Return to Lobby
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
