import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, School, Users, Zap, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


interface SchoolEntry {
    rank: number;
    schoolName: string;
    city: string;
    totalXP: number;
    studentCount: number;
    totalBattles: number;
    totalWins: number;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function SchoolLeaderboardPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<SchoolEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
    const [cityFilter, setCityFilter] = useState('Gandhinagar');
    const [cities, setCities] = useState<string[]>(['Gandhinagar']);
    const [searchInput, setSearchInput] = useState('');

    const fetchCities = async () => {
        try {
            const res = await fetch('/api/minerva/school/cities');
            const data = await res.json();
            if (data.success) {
                const uniqueCities = (data.cities || []).filter(Boolean);
                if (!uniqueCities.some((c: string) => c.toLowerCase() === 'gandhinagar')) {
                    uniqueCities.push('Gandhinagar');
                }
                setCities(uniqueCities);
            }
        } catch (e) {
            console.error('Cities list fetch failed', e);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ period });
            if (cityFilter && cityFilter !== 'all') params.append('city', cityFilter);
            const res = await fetch(`/api/minerva/school/leaderboard?${params}`);

            const data = await res.json();
            if (data.success) setLeaderboard(data.leaderboard);
        } catch (e) {
            console.error('Leaderboard fetch failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (user?.city) {
            setCityFilter(user.city);
            setCities(prev => {
                if (!prev.some(c => c.toLowerCase() === user.city.toLowerCase())) {
                    return [...prev, user.city];
                }
                return prev;
            });
        }
    }, [user?.city]);

    useEffect(() => {
        fetchLeaderboard();
    }, [period, cityFilter]);


    const filtered = leaderboard.filter(s =>
        !searchInput || s.schoolName.toLowerCase().includes(searchInput.toLowerCase()) ||
        s.city.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#05060b] text-white p-4 md:p-8">
            {/* Header */}
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-yellow-400 text-xs font-black tracking-widest uppercase mb-4">
                        <Trophy className="w-3.5 h-3.5" /> School Battle Leaderboard
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Which School Reigns Supreme?
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Real-time XP rankings from Quiz Battle victories</p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {/* Period */}
                    <div className="flex bg-slate-900/60 border border-slate-800 rounded-2xl p-1 gap-1">
                        {(['all', 'weekly', 'monthly'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {p === 'all' ? 'All Time' : p === 'weekly' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>

                    {/* City Search */}
                    <div className="flex-1 min-w-[180px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Search school or city..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    {/* City Filter Select */}
                    <select
                        value={cityFilter}
                        onChange={e => setCityFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none w-44 cursor-pointer"
                    >
                        <option value="all">🌍 All Cities</option>
                        {cities.map(c => (
                            <option key={c} value={c}>📍 {c}</option>
                        ))}
                    </select>
                    <button onClick={fetchLeaderboard}
                        className="p-2 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>


                {/* Top 3 Podium */}
                {!loading && filtered.length >= 3 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-end justify-center gap-3 mb-8 h-36">
                        {/* 2nd */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-2xl mb-1">🥈</div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-center w-full">
                                <div className="text-xs font-black text-slate-300 truncate">{filtered[1].schoolName}</div>
                                <div className="text-xs text-slate-500">{filtered[1].city}</div>
                                <div className="text-sm font-black text-slate-200 mt-1">{filtered[1].totalXP.toLocaleString()} XP</div>
                            </div>
                        </div>
                        {/* 1st */}
                        <div className="flex-1 flex flex-col items-center -mb-4">
                            <div className="text-3xl mb-1">🥇</div>
                            <div className="bg-gradient-to-b from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center w-full shadow-lg shadow-yellow-950/30">
                                <div className="text-xs font-black text-yellow-300 truncate">{filtered[0].schoolName}</div>
                                <div className="text-xs text-yellow-600">{filtered[0].city}</div>
                                <div className="text-base font-black text-yellow-400 mt-1">{filtered[0].totalXP.toLocaleString()} XP</div>
                                <div className="text-[9px] text-yellow-600 mt-0.5">{filtered[0].studentCount} Warriors</div>
                            </div>
                        </div>
                        {/* 3rd */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="text-2xl mb-1">🥉</div>
                            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-center w-full">
                                <div className="text-xs font-black text-slate-300 truncate">{filtered[2].schoolName}</div>
                                <div className="text-xs text-slate-500">{filtered[2].city}</div>
                                <div className="text-sm font-black text-slate-200 mt-1">{filtered[2].totalXP.toLocaleString()} XP</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Full List */}
                <div className="space-y-2.5">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-16 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-600">
                            <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-bold">No schools found yet.</p>
                            <p className="text-sm mt-1">Students need to add their school name in profile settings.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filtered.map((school, i) => (
                                <motion.div key={school.schoolName + school.city}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                                        ${i === 0 ? 'bg-yellow-500/5 border-yellow-500/20' :
                                          i === 1 ? 'bg-slate-500/5 border-slate-600/20' :
                                          i === 2 ? 'bg-amber-700/5 border-amber-700/20' :
                                          'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}>
                                    {/* Rank */}
                                    <div className="w-10 text-center flex-shrink-0">
                                        {i < 3
                                            ? <span className="text-xl">{RANK_MEDALS[i]}</span>
                                            : <span className="text-lg font-black text-slate-500">#{school.rank}</span>
                                        }
                                    </div>

                                    {/* School Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-sm text-white truncate">{school.schoolName}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            <span>📍 {school.city}</span>
                                            <span>•</span>
                                            <span><Users className="w-3 h-3 inline" /> {school.studentCount} students</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-black text-sm text-indigo-300">
                                            <Zap className="w-3.5 h-3.5 inline text-yellow-400" /> {school.totalXP.toLocaleString()} XP
                                        </div>
                                        <div className="text-[10px] text-slate-600 mt-0.5">
                                            {school.totalBattles} battles · {school.totalWins} wins
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="mt-10 text-center bg-gradient-to-r from-indigo-950/40 to-violet-950/40 border border-indigo-900/30 rounded-3xl p-6">
                    <div className="text-2xl mb-2">🏫</div>
                    <p className="font-black text-sm text-white mb-1">Is your school not on the list?</p>
                    <p className="text-xs text-slate-400 mb-4">Add your school name in Profile Settings and start earning XP in Quiz Battles!</p>
                    <button onClick={() => window.location.href = '/minerva/battle'}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-sm font-black hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-950/40">
                        ⚔️ Join a Battle Now
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
