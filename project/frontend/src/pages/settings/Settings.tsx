import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Shield, Wallet, Palette, LogOut, Download, Receipt, History, Zap, Sparkles, CreditCard, Smartphone, Globe, X, QrCode, Play, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import Profile from "../profile/Profile"
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { logout, user, setTokenBalance } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("billing")
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Billing Logic State
    const [userData, setUserData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [activeGateways, setActiveGateways] = useState<any[]>([]);

    // UI State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'upi_qr' | 'ad_serving'>('select');
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [adProgress, setAdProgress] = useState(0);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const tabs = [
        { id: "billing", label: "Billing", icon: <Wallet size={16} /> },
        { id: "profile", label: "Profile", icon: <User size={16} /> },
        { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
        { id: "security", label: "Security", icon: <Shield size={16} /> },
    ]

    const themes = [
        { id: 'future', name: 'Dark Neon', color: 'bg-indigo-600' },
        { id: 'light', name: 'Minimal Light', color: 'bg-slate-200' },
        { id: 'blue', name: 'Cyber Blue', color: 'bg-blue-500' },
        { id: 'violet', name: 'Glass Violet', color: 'bg-purple-600' }
    ];

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/economy/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setActiveGateways(data.activeGateways);
                setUserData(data.wallet);
                setHistory(data.history);
                setInvoices(data.invoices);
            }
        } catch (e) { }
    };

    const handleSelectPlan = (tier: string) => {
        setSelectedTier(tier);
        setIsPaymentModalOpen(true);
        setPaymentStep('select');
    };

    const handleInitiatePayment = async (gatewayProvider: string) => {
        if (gatewayProvider === 'phonepe' || gatewayProvider === 'gpay') {
            setPaymentStep('upi_qr');
        } else {
            finalizeSubscription(gatewayProvider, `TEST_TXN_${Date.now()}`);
        }
    };

    const finalizeSubscription = async (gatewayProvider: string, txnId: string) => {
        const token = localStorage.getItem('fbrts_token');
        const res = await fetch('/api/economy/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ tier: selectedTier, gatewayProvider, transactionId: txnId })
        });
        const data = await res.json();
        if (data.success) {
            setIsPaymentModalOpen(false);
            fetchAccountData();
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
            fetchAccountData();
        }
    };

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current) return;

        setIsDownloading(true);
        try {
            const element = invoiceRef.current;
            const opt = {
                margin: 0,
                filename: `Invoice_${selectedInvoice.invoiceNumber}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            // Capture the element for PDF
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF Download failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const formatInvoiceDate = (date: any) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "PERMANENT ACCESS";
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="text-white space-y-8 max-w-6xl mx-auto pb-24 px-4 sm:px-0 scroll-smooth">
            {/* 🏗️ System Header Bar */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-10 bg-[#0A0A0A] border border-white/5 rounded-[40px] shadow-3xl overflow-hidden relative group transition-all ${selectedInvoice ? 'blur-md grayscale pointer-events-none' : ''}`}>
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={150} className="text-indigo-500" /></div>

                <div className="space-y-1 relative z-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Command Center</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">System v2.4.0 • Node Active</p>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[22px] border border-white/5 relative z-10 backdrop-blur-xl overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-[16px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-white"}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ⚡ Dynamic Viewport */}
            <div className={`min-h-[600px] animate-in fade-in duration-500 transition-all ${selectedInvoice ? 'blur-md grayscale opacity-20 pointer-events-none' : ''}`}>
                <AnimatePresence mode="wait">
                    {activeTab === "billing" && (
                        <motion.div key="billing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">

                            {/* Detailed Current Plan & Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 p-10 rounded-[40px] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 relative overflow-hidden flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30"><Zap size={24} /></div>
                                            <div>
                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">{userData?.isPremium ? `${userData.subscriptionTier} Elite` : 'Basic Builder'}</h3>
                                                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">CURRENT ACTIVE FREQUENCY</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                                            Your system is currently operating on {userData?.isPremium ? 'unrestricted' : 'community'} bandwith.
                                            Building with full energy allows for <strong>instant code generation</strong> and <strong>high-priority neural processing</strong>.
                                        </p>
                                    </div>

                                    <div className="mt-10 flex flex-wrap gap-4">
                                        <Button onClick={() => navigate('/pricing')} className="bg-white text-black font-black hover:bg-gray-200 h-14 rounded-2xl px-10 shadow-2xl">Upgrade Membership</Button>
                                        <Button onClick={() => handleSelectPlan('ad')} variant="outline" className="border-white/10 hover:bg-white/5 h-14 rounded-2xl px-10 font-black text-xs uppercase tracking-widest">Farm energy (Ads)</Button>
                                    </div>
                                </div>

                                <div className="p-10 rounded-[40px] bg-[#0A0A0A] border border-white/5 flex flex-col items-center justify-center text-center space-y-4 shadow-3xl">
                                    <div className="text-7xl font-black italic tracking-tighter text-indigo-400">{userData?.tokenBalance?.toLocaleString()}</div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black uppercase italic text-white tracking-widest">Available Energy</div>
                                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Ready for Generation</div>
                                    </div>
                                    <div className="w-full pt-6 border-t border-white/5">
                                        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase px-2 mb-2">
                                            <span>Daily Refresh</span>
                                            <span className="text-white">+700</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 w-[70%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Activity & Invoices Combined */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                {/* 📜 Detailed Activity Feed */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4 text-xs font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><History size={16} className="text-indigo-400" /> Neural Logs</div>
                                        <span className="text-gray-600">Live Feed</span>
                                    </div>
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {history.map((tx: any, i: number) => (
                                            <div key={i} className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/5 flex justify-between items-center group hover:border-indigo-500/20 transition-all cursor-default relative overflow-hidden">
                                                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/[0.02] transition-colors" />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`p-2.5 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'} transition-all`}>
                                                        {tx.amount > 0 ? <CheckCircle2 size={14} className="text-white" /> : <Zap size={14} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white italic tracking-tight leading-none">{tx.description}</p>
                                                        <p className="text-[10px] text-gray-600 font-bold mt-2 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-black italic relative z-10 ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 🧾 Detailed Invoice System */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4 text-xs font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Receipt size={16} className="text-indigo-400" /> Digital Invoices</div>
                                        <span className="text-gray-600">Financial Vault</span>
                                    </div>
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {invoices.map((inv: any, i: number) => (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="p-6 rounded-[32px] bg-[#0A0A0A] border border-white/5 hover:border-indigo-500/40 transition-all flex justify-between items-center group cursor-pointer shadow-xl hover:shadow-indigo-500/5"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-white/5 rounded-2xl text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                        <Download size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-md font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase tracking-widest leading-none">{inv.invoiceNumber}</p>
                                                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-600 uppercase mt-2">
                                                            <span>{inv.gateway}</span>
                                                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                                            <span className="text-white">₹{inv.amount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="hidden sm:block text-right">
                                                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Valid Until</div>
                                                        <div className="text-[10px] font-black text-indigo-400 mt-0.5">{formatInvoiceDate(inv.expiresAt)}</div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-gray-700 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                        {invoices.length === 0 && <div className="p-16 border-2 border-dashed border-white/5 rounded-[40px] text-center text-gray-600 font-black uppercase text-xs tracking-widest opacity-50">Empty Transaction Vault</div>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "profile" && <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><Profile /></motion.div>}

                    {activeTab === "appearance" && (
                        <motion.div key="appearance" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                            <header className="px-4"><h2 className="text-3xl font-black italic uppercase tracking-tighter">System Aesthetic</h2><p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Synchronize the visual frequency</p></header>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {themes.map((t) => (
                                    <button key={t.id} onClick={() => setTheme(t.id as any)} className={`relative group p-6 rounded-[40px] border transition-all text-left ${theme === t.id ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/10 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                                        <div className={`w-full h-40 rounded-[30px] mb-4 ${t.color} opacity-60 group-hover:opacity-100 transition-all shadow-inner`} />
                                        <div className="font-black italic uppercase tracking-[0.2em] text-[11px] flex items-center justify-between text-white">
                                            {t.name}
                                            {theme === t.id && <Sparkles size={14} className="text-indigo-400" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "security" && (
                        <motion.div key="security" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                            <header className="px-4 text-center md:text-left"><h2 className="text-3xl font-black italic uppercase tracking-tighter">Identity Core</h2><p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Encrypted authentication layer</p></header>
                            <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-[40px] flex flex-col md:flex-row items-center gap-10 shadow-3xl">
                                <div className="p-8 rounded-3xl bg-red-500/10 text-red-500 animate-pulse"><Shield size={64} strokeWidth={1} /></div>
                                <div className="flex-1 space-y-4">
                                    <div className="inline-flex px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest">High Priority</div>
                                    <h4 className="text-2xl font-black italic uppercase tracking-tight">Biometric Neural Guard</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md">Activate end-to-end identity encryption. This secures your intellectual properties, neuron history, and energy credits from unauthorized sync attempts.</p>
                                    <Button className="bg-red-500 hover:bg-red-600 h-14 px-10 rounded-2xl font-black italic uppercase text-xs mt-4">Initialize Defender</Button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-white/5 mx-4">
                                <div className="space-y-4">
                                    <h4 className="font-black italic uppercase text-[11px] tracking-widest text-gray-500">Master Secret</h4>
                                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 rounded-2xl h-16 px-8 font-black uppercase text-xs justify-between group">
                                        Rotate Password <ChevronRight size={16} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black italic uppercase text-[11px] tracking-widest text-gray-500">Session Hijack Control</h4>
                                    <Button onClick={logout} className="w-full bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-2xl h-16 px-8 font-black uppercase text-xs flex items-center gap-3">
                                        <LogOut size={16} /> Force Terminate All Sessions
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 🧾 Detailed Invoice Modal (Fixed Overlay & A4 Ready) */}
            <AnimatePresence>
                {selectedInvoice && (
                    <div className="fixed inset-0 z-[99999] flex items-start justify-center p-0 md:p-4 overflow-y-auto bg-black/95 backdrop-blur-3xl custom-scrollbar py-2 md:py-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)} className="fixed inset-0 cursor-zoom-out" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="w-full max-w-[850px] bg-white text-black relative shadow-6xl flex flex-col min-h-fit md:rounded-[40px] overflow-hidden mb-10 z-10 mx-auto"
                        >
                            {/* Control Bar (Hidden in Print) */}
                            <div className="p-6 md:p-8 bg-[#020202] text-white flex justify-between items-center print:hidden border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-[15px] flex items-center justify-center font-black text-xl">FB</div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">Invoice Control</h2>
                                </div>
                                <div className="flex gap-4">
                                    <Button disabled={isDownloading} onClick={handleDownloadInvoice} size="sm" className="bg-white text-black hover:bg-gray-200 rounded-[12px] h-12 px-8 gap-2 font-black italic uppercase text-[11px] tracking-widest shadow-xl disabled:opacity-50">
                                        {isDownloading ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" /> : <Download size={16} />}
                                        {isDownloading ? 'Working...' : 'Download Invoice'}
                                    </Button>
                                    <button onClick={() => setSelectedInvoice(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95"><X size={24} /></button>
                                </div>
                            </div>

                            {/* 📄 Real A4 Content (Captured for Download) */}
                            <div id="invoice-download-root" ref={invoiceRef} className="p-10 md:p-14 space-y-12 bg-white print:p-0 print:m-0 print:w-full font-sans invoice-page block overflow-hidden relative">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @media print {
                                        @page { size: A4; margin: 0; }
                                        html, body { 
                                            margin: 0 !important; 
                                            padding: 0 !important; 
                                            overflow: hidden !important;
                                        }
                                        body * { display: none !important; }
                                        .invoice-page, .invoice-page * { display: block !important; visibility: visible !important; }
                                    }
                                `}} />

                                {/* Branded Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none watermark">
                                    <Zap size={500} strokeWidth={4} />
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">ORIGIN</div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Future BRTS</h3>
                                        <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-wider">
                                            Neural Grid Complex • Node 707<br />
                                            Silicon Hills, CA 94025<br />
                                            VAT: FB-GRID-99002211
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right space-y-4">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">RECIPIENT</div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{selectedInvoice.billingDetails.name}</h3>
                                        <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-wider">
                                            {selectedInvoice.billingDetails.email}<br />
                                            Entity ID: {user?._id.slice(-10).toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y-4 border-black/5 relative z-10">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Ref</div>
                                        <div className="text-[13px] font-black italic uppercase text-indigo-600">{selectedInvoice.invoiceNumber}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Issued Date</div>
                                        <div className="text-[13px] font-black italic uppercase">{formatInvoiceDate(selectedInvoice.issuedAt)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Expiry Sync</div>
                                        <div className="text-[13px] font-black italic uppercase">{formatInvoiceDate(selectedInvoice.expiresAt)}</div>
                                    </div>
                                    <div className="space-y-1 md:text-right">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment Status</div>
                                        <div className="text-[11px] inline-flex font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase italic tracking-widest border border-emerald-100/50">Finalized Paid</div>
                                    </div>
                                </div>

                                <div className="space-y-8 min-h-[300px] relative z-10 flex-1">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b-4 border-black italic">
                                                <th className="pb-4 text-[11px] font-black text-black uppercase tracking-[0.2em]">Neural Provision Description</th>
                                                <th className="pb-4 text-[11px] font-black text-black uppercase tracking-[0.2em] text-right">Quota</th>
                                                <th className="pb-4 text-[11px] font-black text-black uppercase tracking-[0.2em] text-right">Premium Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-gray-100">
                                            <tr>
                                                <td className="py-10">
                                                    <div className="text-2xl font-black italic uppercase leading-tight tracking-tighter">System Access: {selectedInvoice.planTier} Elite</div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-wider">High-Priority Grid Access • Strategic Roadmaps • 75k Energy Credits</div>
                                                </td>
                                                <td className="py-10 text-right text-xs font-black text-black">01 Slot</td>
                                                <td className="py-10 text-right text-3xl font-black italic tracking-tighter">₹{selectedInvoice.amount}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col items-end space-y-6 border-t-[8px] border-black relative z-10 pb-4">
                                    <div className="flex flex-col gap-4 w-full md:w-[350px]">
                                        <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            <span>Subtotal Provision</span>
                                            <span className="text-black">₹{selectedInvoice.amount}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            <span>Platform Sync Surcharge (0%)</span>
                                            <span className="text-black">₹0.00</span>
                                        </div>
                                        <div className="flex justify-between pt-8 mt-4 border-t-[3px] border-indigo-600/5 items-center">
                                            <div className="text-4xl font-black italic uppercase tracking-tighter leading-none">Grand Total</div>
                                            <div className="text-5xl font-black italic text-indigo-600 tracking-tighter leading-none">₹{selectedInvoice.amount}</div>
                                        </div>
                                    </div>

                                    <div className="w-full pt-16 flex flex-col md:flex-row justify-between items-end border-t border-gray-100 gap-10">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Corporate Authorization Identity</div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-48 h-12 grayscale opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e1/Signature_of_Bill_Gates.svg')] bg-contain bg-no-repeat" />
                                                <div className="w-12 h-12 rounded-full border-2 border-indigo-600/20 flex items-center justify-center font-black text-indigo-600 text-[6px] uppercase text-center leading-none">OFFICIAL<br />GRID<br />SEAL</div>
                                            </div>
                                        </div>
                                        <div className="max-w-md text-right">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] leading-relaxed italic">
                                                Cryptographically secured digital document. Generated on FutureBilder Neural Network. No physical signature required.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-gray-50 flex justify-center items-center gap-8 print:hidden border-t-2 border-gray-100">
                                <span className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]"><Shield size={16} /> Encrypted Sync</span>
                                <span className="w-2 h-2 rounded-full bg-indigo-200" />
                                <span className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]"><Globe size={16} /> Grid Compliant</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 💳 Payment Selector (Used only in Settings) */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[40px] overflow-hidden shadow-6xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedTier === 'ad' ? 'Energy Boost' : 'System Upgrade'}</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Initializing Payment Protocol</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95"><X size={24} className="text-gray-500" /></button>
                        </div>
                        <div className="p-10">
                            {paymentStep === 'select' ? (
                                <div className="space-y-4">
                                    {selectedTier === 'ad' ? (
                                        <button onClick={handleWatchAdFlow} className="w-full p-10 rounded-[35px] bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all flex flex-col items-center gap-6 text-center group shadow-2xl">
                                            <div className="p-6 rounded-3xl bg-indigo-600 text-white group-hover:scale-110 transition-transform shadow-xl shadow-indigo-600/30"><Play size={40} className="fill-current" /></div>
                                            <div><span className="block text-2xl font-black text-white italic uppercase tracking-tighter">Play Brand Video</span><span className="block text-[11px] text-indigo-400 font-black uppercase tracking-widest mt-2">+50 Energy Credits</span></div>
                                        </button>
                                    ) : (
                                        activeGateways.map((gw) => (
                                            <button key={gw.provider} onClick={() => handleInitiatePayment(gw.provider)} className="w-full p-6 rounded-[30px] bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08] transition-all flex items-center gap-5 text-left group">
                                                <div className="p-5 rounded-2xl bg-white/5 group-hover:bg-indigo-600 group-hover:text-white text-gray-500 transition-all shadow-xl">
                                                    {gw.provider === 'razorpay' ? <CreditCard size={28} /> : gw.provider === 'stripe' ? <Globe size={28} /> : <Smartphone size={28} />}
                                                </div>
                                                <div><span className="block text-xl font-black text-white leading-none uppercase italic tracking-tighter">{gw.metadata.label}</span><span className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 italic opacity-60">Zero Lag Activation</span></div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : paymentStep === 'upi_qr' ? (
                                <div className="text-center space-y-10 py-6">
                                    <div className="bg-white p-10 rounded-[45px] inline-block shadow-6xl border-[15px] border-white ring-1 ring-black/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-indigo-500/5 group-hover:animate-pulse pointer-events-none" />
                                        <QrCode size={220} className="text-black relative z-10" />
                                    </div>
                                    <div className="space-y-4 px-6">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Scan with any UPI App</p>
                                        <Button onClick={() => finalizeSubscription('upi-test', `TXN_${Date.now()}`)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black w-full h-16 rounded-[22px] text-[11px] uppercase tracking-widest italic shadow-xl shadow-emerald-600/20">Confirm Manual Sync Successful</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center space-y-10">
                                    <div className="relative w-36 h-36">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 - (402 * adProgress) / 100} className="text-indigo-500 transition-all duration-300" />
                                        </svg>
                                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-3"><h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Syncing Neural Credits</h3><p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black opacity-60">Memory Allocation in Progress</p></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
