import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Pricing = () => {
    const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: "Master Builder",
            description: "For professionals who need unlimited high-speed intelligence.",
            inr: billingCycle === 'monthly' ? "999" : "9990",
            usd: billingCycle === 'monthly' ? "12" : "120",
            tokens: "50,000 Tokens / Mo",
            features: [
                "100% Ad-Free Experience",
                "Priority AI Processing",
                "Advanced PDF/DOC Generation",
                "5,000 Daily Auto-Refresh",
                "Cloud Roadmap Sync"
            ],
            isPopular: true
        }
    ];

    const handleSubscribe = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tier: billingCycle === 'monthly' ? 'monthly' : 'yearly' })
            });
            const data = await res.json();
            if (data.success) {
                alert("Success! Welcome to Pro.");
                window.location.href = '/dashboard';
            }
        } catch (e) { }
    };

    return (
        <div className="min-h-full bg-transparent p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="text-center max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
                    <Sparkles size={12} /> Elite Access
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Choose Your Speed.</h1>
                <p className="text-gray-500 text-lg">Scale your engineering workflow with elite AI. No limits. No ads. Just pure intelligence.</p>
            </div>

            {/* Currency & Billing Toggles */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12 animate-in fade-in duration-1000">
                <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setCurrency('INR')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        INR (₹)
                    </button>
                    <button
                        onClick={() => setCurrency('USD')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        USD ($)
                    </button>
                </div>

                <div className="flex bg-[#121212] p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Yearly <span className="ml-1 text-[10px] text-indigo-500">(-20%)</span>
                    </button>
                </div>
            </div>

            {/* Pricing Card */}
            <div className="w-full max-w-4xl grid grid-cols-1 gap-8 animate-in zoom-in duration-500">
                {plans.map((plan) => (
                    <div key={plan.name} className="relative group overflow-hidden bg-[#0A0A0A] border-2 border-indigo-500/20 rounded-[32px] p-8 md:p-12 shadow-2xl hover:border-indigo-500/50 transition-all flex flex-col md:flex-row gap-12">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                        <div className="flex-1 space-y-8">
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2">{plan.name}</h3>
                                <p className="text-gray-500 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="space-y-4">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="p-1 rounded-full bg-emerald-500/20">
                                            <Check size={12} className="text-emerald-500" />
                                        </div>
                                        <span className="text-gray-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-[350px] bg-white/5 rounded-3xl p-8 flex flex-col justify-between border border-white/5 backdrop-blur-xl relative z-10">
                            <div>
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{plan.tokens}</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">{currency === 'INR' ? '₹' : '$'}{currency === 'INR' ? plan.inr : plan.usd}</span>
                                    <span className="text-gray-500 font-bold">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-12">
                                <Button
                                    onClick={() => handleSubscribe()}
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-500/20 group/btn"
                                >
                                    Activate Pro <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">Secure Checkout Powered by Stripe</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Free vs Pro Table */}
            <div className="mt-24 w-full max-w-2xl text-center">
                <h4 className="text-xl font-bold text-white mb-8">Compare Plans</h4>
                <div className="rounded-2xl border border-white/5 bg-[#0D0D0D] overflow-hidden">
                    <div className="grid grid-cols-3 p-4 border-b border-white/5 bg-white/5">
                        <div className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500">Feature</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Pro</div>
                    </div>
                    {[
                        ["AI Ads", "Displayed", "None"],
                        ["Daily Refresh", "700", "5,000"],
                        ["Generation", "Limited", "Priority"],
                        ["Key Access", "Public", "Dedicated"],
                    ].map(([f, free, pro]) => (
                        <div key={f as string} className="grid grid-cols-3 p-4 border-b border-white/5">
                            <div className="text-left text-xs text-gray-400">{f}</div>
                            <div className="text-xs text-gray-600">{free}</div>
                            <div className="text-xs text-white font-bold">{pro}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
