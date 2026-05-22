import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Clock, Calendar, Globe, X, QrCode, CreditCard, Play, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const { setTokenBalance } = useAuth();
    const navigate = useNavigate();
    const [activeGateways, setActiveGateways] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upi_qr' | 'ad_serving'>('select');
    const [adProgress, setAdProgress] = useState(0);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setActiveGateways(data.activeGateways);
                setPlans(data.activePlans);
            }
        } catch (e) { }
        finally { setLoading(false); }
    };

    const handleSelectPlan = (tier: string) => {
        setSelectedTier(tier);
        setIsPaymentModalOpen(true);
        setPaymentStep('select');
    };

    const handleInitiatePayment = async (gatewayProvider: string) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tier: selectedTier, gatewayProvider })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            if (gatewayProvider === 'razorpay') {
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Future BRTS",
                    description: `Plan: ${selectedTier}`,
                    order_id: data.orderId,
                    handler: async (response: any) => {
                        await verifyAndFinalize(gatewayProvider, {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            tier: selectedTier
                        });
                    },
                    prefill: data.prefill,
                    theme: { color: "#4f46e5" }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
            else if (gatewayProvider === 'stripe') {
                window.location.href = data.url;
            }
            else if (gatewayProvider === 'phonepe' || gatewayProvider === 'gpay') {
                window.open(data.upiUrl, '_blank');
                setPaymentStep('upi_qr');
            }
        } catch (err: any) {
            alert("Payment failed: " + err.message);
        }
    };

    const verifyAndFinalize = async (provider: string, payload: any) => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...payload, provider })
            });
            const data = await res.json();
            if (data.success) {
                setTokenBalance(data.newBalance);
                setIsPaymentModalOpen(false);
                navigate('/builder');
            } else {
                alert("Verification failed: " + data.error);
            }
        } catch (e) {
            alert("Critical verification error.");
        }
    };

    const handleWatchAdFlow = () => {
        setPaymentStep('ad_serving');
        setAdProgress(0);
        window.open('https://google.com/adsense', '_blank');
        const interval = setInterval(() => {
            setAdProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    finalizeAdReward();
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    const finalizeAdReward = async () => {
        const token = localStorage.getItem('fbrts_token');
        const res = await fetch('/api/economy/reward-ad', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setTokenBalance(data.newBalance);
            setIsPaymentModalOpen(false);
            navigate('/builder');
        }
    };

    const finalizeSubscription = async (gatewayProvider: string, txnId: string) => {
        await verifyAndFinalize(gatewayProvider, { paymentId: txnId, tier: selectedTier });
    };

    const getIconForTier = (tier: string) => {
        switch (tier) {
            case 'day': return <Clock className="text-orange-400" />;
            case 'week': return <Zap className="text-yellow-400" />;
            case 'monthly': return <Sparkles className="text-indigo-400" />;
            case '3_month': return <Calendar className="text-emerald-400" />;
            default: return <Globe className="text-purple-400" />;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-500 font-black italic uppercase italic tracking-widest animate-pulse">Syncing Plans...</div>;

    return (
        <div className="min-h-full bg-transparent p-4 md:p-12">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Upgrade Your System</h1>
                    <p className="text-gray-500 text-lg font-medium">Select a dynamic power frequency to accelerate your builds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((p) => (
                        <div key={p.tier} className={`group relative p-10 rounded-[40px] border-2 transition-all hover:scale-[1.02] flex flex-col justify-between ${p.isPopular ? 'bg-indigo-600/5 border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'}`}>
                            {p.isPopular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">Most Stable</div>}
                            <div className="space-y-6">
                                <div className="p-4 w-fit rounded-2xl bg-white/5 border border-white/5 group-hover:border-indigo-500/30 transition-all">{getIconForTier(p.tier)}</div>
                                <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{p.name}</h3>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-xs text-indigo-400 font-black uppercase tracking-widest"><Zap size={14} /> {p.tokens.toLocaleString()} Credits</div>
                                    {p.features.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-xs text-gray-500 font-bold"><Check size={14} className="text-emerald-500" /> {f}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-12 space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">₹{p.price}</span>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">/ {p.duration}</span>
                                </div>
                                <Button onClick={() => handleSelectPlan(p.tier)} className={`w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${p.isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-black hover:bg-gray-200'}`}>Purchase Slot</Button>
                            </div>
                        </div>
                    ))}

                    <div className="p-10 rounded-[40px] border-2 border-dashed border-white/10 bg-[#0A0A0A] hover:bg-indigo-600/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="p-4 w-fit rounded-2xl bg-white/5 border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Play size={24} /></div>
                            <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase leading-none tracking-tighter">Community Fuel</h3>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed">Lack of capital? Watch a brand sponsor video to earn building energy credits instantly.</p>
                            <div className="flex items-center gap-3 text-xs text-indigo-400 font-black uppercase tracking-widest pt-2"><Sparkles size={14} /> Dynamic Energy Boost</div>
                        </div>
                        <Button onClick={() => handleSelectPlan('ad')} variant="outline" className="mt-12 w-full h-16 rounded-2xl font-black uppercase text-xs tracking-widest border-white/10 hover:bg-white/5 group-hover:border-indigo-500/50">Farm energy</Button>
                    </div>
                </div>
            </div>

            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[40px] overflow-hidden shadow-6xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{selectedTier === 'ad' ? 'Energy Boost' : 'Checkout'}</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Initializing Secure Sync</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="p-8">
                            {paymentStep === 'select' ? (
                                <div className="space-y-3">
                                    {selectedTier === 'ad' ? (
                                        <button onClick={handleWatchAdFlow} className="w-full p-8 rounded-[32px] bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all flex flex-col items-center gap-4 text-center group">
                                            <div className="p-4 rounded-2xl bg-indigo-600 text-white group-hover:scale-110 transition-transform"><Play size={32} /></div>
                                            <span className="block text-xl font-black text-white italic uppercase">Play Video</span>
                                        </button>
                                    ) : (
                                        activeGateways.map((gw) => (
                                            <button key={gw.provider} onClick={() => handleInitiatePayment(gw.provider)} className="w-full p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all flex items-center gap-4 text-left group">
                                                <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-indigo-600 group-hover:text-white text-gray-500 transition-all shadow-inner">
                                                    {gw.provider === 'razorpay' ? <CreditCard size={24} /> : gw.provider === 'stripe' ? <Globe size={24} /> : <Smartphone size={24} />}
                                                </div>
                                                <div><span className="block text-lg font-black text-white italic uppercase">{gw.metadata.label}</span><span className="block text-[10px] text-gray-500 font-black uppercase tracking-widest">Instant Activation</span></div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : paymentStep === 'upi_qr' ? (
                                <div className="text-center space-y-8 py-4">
                                    <div className="bg-white p-8 rounded-[40px] inline-block shadow-6xl"><QrCode size={200} className="text-black" /></div>
                                    <p className="text-gray-400 text-sm font-bold">Scan QR or Pay on UPI App</p>
                                    <Button onClick={() => finalizeSubscription('phonepe', `TXN_${Date.now()}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black w-full h-16 rounded-2xl text-xs uppercase tracking-widest">Confirm Payment Successful</Button>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center space-y-8">
                                    <div className="relative w-28 h-28">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                                            <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * adProgress) / 100} className="text-indigo-500 transition-all duration-300" />
                                        </svg>
                                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase">Syncing...</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pricing;
