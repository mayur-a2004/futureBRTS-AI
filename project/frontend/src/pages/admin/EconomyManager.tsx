import { useState, useEffect } from 'react';
import {
    Coins,
    CreditCard,
    Smartphone,
    QrCode,
    Plus,
    RefreshCcw,
    TrendingUp,
    Search,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function EconomyManager() {
    const [gateways, setGateways] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const [gRes, tRes] = await Promise.all([
                fetch('/api/admin/gateways', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const gData = await gRes.json();
            const tData = await tRes.json();

            if (gData.success) setGateways(gData.gateways || []);
            if (tData.success) setTransactions(tData.transactions || []);
        } catch (err) {
            toast.error("Failed to sync economy stream.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateGateway = async (provider: string, isActive: boolean, upiId?: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings/payment-gateway', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ provider, isActive, upiId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${provider} configuration synchronized.`);
                fetchData();
            }
        } catch (err) {
            toast.error("Gateway update failure.");
        }
    };

    const generateUPIQR = (upiId: string) => {
        if (!upiId) return null;
        const upiLink = `upi://pay?pa=${upiId}&pn=FutureBRTS&am=500&cu=INR&tn=TokenRecharge`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Economy & Finance Hub</h1>
                    <p className="text-gray-400 mt-1 font-medium">Orchestrate payment vectors, recharge flows, and transaction security.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                        <Plus size={18} /> New Package
                    </button>
                    <button onClick={fetchData} className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", val: "₹1,42,000", change: "+12.4%", icon: TrendingUp, color: "emerald" },
                    { label: "Token Circulation", val: "4.2M", change: "+5.1%", icon: Coins, color: "amber" },
                    { label: "Active Transactions", val: "842", change: "+18%", icon: CreditCard, color: "indigo" },
                    { label: "Success Rate", val: "99.4%", change: "+0.2%", icon: Smartphone, color: "purple" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <stat.icon size={20} className={
                                stat.color === 'emerald' ? 'text-emerald-400' :
                                    stat.color === 'amber' ? 'text-amber-400' :
                                        stat.color === 'indigo' ? 'text-indigo-400' :
                                            'text-purple-400'
                            } />
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.color === 'emerald' ? 'text-emerald-400 bg-emerald-400/10' :
                                    stat.color === 'amber' ? 'text-amber-400 bg-amber-400/10' :
                                        stat.color === 'indigo' ? 'text-indigo-400 bg-indigo-400/10' :
                                            'text-purple-400 bg-purple-400/10'
                                }`}>{stat.change}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{stat.val}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gateway Control */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <Smartphone className="text-indigo-400" size={24} /> Payment Vectors
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gateways.map((g) => (
                                <div key={g._id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <CreditCard size={18} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase">{g.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">{g.provider}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateGateway(g.provider, !g.isActive)}
                                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${g.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border border-white/10'}`}
                                        >
                                            {g.isActive ? 'Active' : 'Offline'}
                                        </button>
                                    </div>

                                    {g.provider === 'manual' || g.provider === 'phonepe' || g.provider === 'gpay' ? (
                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-500 uppercase">UPI Identity</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={g.config?.upiId}
                                                        placeholder="VPA: e.g. success@upi"
                                                        className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-indigo-500/50"
                                                        onBlur={(e) => handleUpdateGateway(g.provider, g.isActive, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {g.config?.upiId && (
                                                <div className="flex items-center justify-center p-4 bg-white rounded-xl">
                                                    <img src={generateUPIQR(g.config.upiId) || ''} alt="UPI QR" className="w-32 h-32" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-gray-500 italic">API Integration Live</p>
                                            <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verify Keys</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Registry */}
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                        <h2 className="text-xl font-black text-white flex items-center gap-3">
                            <QrCode className="text-purple-400" size={24} /> Transaction Registry
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Asset</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Provider</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transactions.map(t => (
                                        <tr key={t._id} className="hover:bg-white/[0.01]">
                                            <td className="px-4 py-4">
                                                <p className="text-xs font-black text-white leading-none">{(t.userId as any)?.firstName || 'Guest'}</p>
                                                <p className="text-[9px] text-gray-600 font-bold mt-1">{(t.userId as any)?.email}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-xs font-black text-emerald-400">₹{t.amount}</p>
                                                <p className="text-[9px] text-gray-600 font-bold mt-1">{t.currency}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-black uppercase text-gray-400">{t.provider}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Live Surveillance View (Market) */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[32px] bg-indigo-600/5 border border-indigo-500/20 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white tracking-widest uppercase">Live Pulse</h2>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-white">Active Recharge Signal</p>
                                        <p className="text-[9px] text-gray-500 font-bold">Surat, Gujarat • 2 mins ago</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-emerald-400">+₹1,500</p>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Stripe</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                            Full Analytics <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Search Transactions</h3>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400" size={16} />
                            <input
                                type="text"
                                placeholder="Order ID / Email / UPI..."
                                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/5 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
