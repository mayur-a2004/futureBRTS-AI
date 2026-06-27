import { Shield, Lock, Eye, Database, RefreshCcw, Activity, Fingerprint, Key, ArrowRight, ShieldCheck, Cpu } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function Privacy() {
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 180]);

    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16 md:space-y-20 text-white font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE SHIELD HERO --- */}
            <section className="relative flex flex-col items-center text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    {/* Rotating Circular HUD Background */}
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-dashed border-emerald-500/10 rounded-full -z-10"
                    />
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-cyan-500/10 rounded-full -z-10"
                    />

                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
                            <Shield size={12} className="animate-pulse" /> PRIVACY_PROTOCOL_ACTIVE
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-8 uppercase italic">
                            DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-indigo-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">SHIELD.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed max-w-4xl mx-auto border-y border-white/5 py-8 px-6 italic text-center">
                    "At FutureBuilder, your ambition is encrypted. We've engineered a <span className="text-white font-black underline decoration-emerald-500 decoration-2 underline-offset-8">Zero-Knowledge Architecture</span> where your career data remains your exclusive property."
                </p>
                
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                        <Lock size={12} /> GDPR_COMPLIANT
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                        <Fingerprint size={12} /> SOC2_READY
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: DATA INGEST MATRIX --- */}
            <section className="space-y-12">
                <div className="text-center space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 font-mono">What variables we synthesize</span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">INGEST_LOGIC.</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PrivacyCard 
                        icon={<Database />}
                        title="IDENTITY_CORE"
                        desc="Email, profile credentials, and names. Encrypted on ingestion using AES-256. Used strictly for account authorization and secure sessions."
                        id="01"
                        color="emerald"
                    />
                    <PrivacyCard 
                        icon={<Cpu />}
                        title="NEURAL_PATH"
                        desc="Resumes, tech stack specs, and objectives. Evaluated in sandbox containers via stateless LLM APIs. Never used to train public LLM models."
                        id="02"
                        color="cyan"
                        active
                    />
                    <PrivacyCard 
                        icon={<Activity />}
                        title="VITAL_METRICS"
                        desc="Platform performance indicators and telemetry. Processed as anonymized data streams. Strictly used to optimize speed and UI loops."
                        id="03"
                        color="indigo"
                    />
                </div>
            </section>

            {/* --- SECTION 3: THE VAULT ARCHITECTURE --- */}
            <section className="bg-[#020204]/90 border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-[inset_0_0_30px_rgba(16,185,129,0.02)]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 blur-[150px] group-hover:bg-emerald-600/20 transition-all duration-1000" />

                <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8 text-left">
                        <div className="space-y-4 text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">// BACKEND_VAULT</span>
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">THE_VAULT.</h2>
                            <div className="h-1 w-20 bg-emerald-500" />
                            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
                                Our backend is a digital fortress. We enforce strict data storage and routing protocols to ensure your strategic career roadmaps remain private and secure:
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-1.5 pl-4 border-l-2 border-emerald-500/20">
                                <h4 className="text-sm font-black italic uppercase text-white tracking-tighter flex items-center gap-2">
                                    <Lock size={14} className="text-emerald-500" /> AES-256 DATABASE ENCRYPTION
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                                    All documents, profile assets, and structural roadmaps are stored under military-grade AES-256 encryption. Databases are isolated within secured local clusters with strict firewalls preventing external exposure.
                                </p>
                            </div>
                            <div className="space-y-1.5 pl-4 border-l-2 border-emerald-500/20">
                                <h4 className="text-sm font-black italic uppercase text-white tracking-tighter flex items-center gap-2">
                                    <Cpu size={14} className="text-emerald-500" /> STATELESS AI PROCESSING
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                                    Data sent to our cognitive logic nodes is compiled on-the-fly and processed statelessly. External LLM endpoints do not persist payload logs, preserving absolute intellectual confidentiality.
                                </p>
                            </div>
                            <div className="space-y-1.5 pl-4 border-l-2 border-emerald-500/20">
                                <h4 className="text-sm font-black italic uppercase text-white tracking-tighter flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" /> NO CLAIMS & GENERAL LIABILITY WAIVER
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                                    We make every effort to maintain 100% data integrity. By utilizing this website, users acknowledge that no database transmission is entirely infallible. You agree to waive any legal claims, liabilities, lawsuits, or actions against the platform, Mayur Savaliya, and partners for any data events.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 via-white/5 to-cyan-500/20 shadow-2xl">
                            <div className="bg-[#050508] rounded-[2rem] p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6 border border-white/5">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 180, 270, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="relative"
                                >
                                    <ShieldCheck size={80} className="text-emerald-500/30" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Key size={20} className="text-white animate-pulse" />
                                    </div>
                                </motion.div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase">ZERO_LEAK_HISTORY</h3>
                                    <p className="text-[9px] text-emerald-400 font-black tracking-[0.4em] uppercase font-mono">Uptime Since Inception: 99.998%</p>
                                </div>
                                <Button className="w-full h-14 bg-emerald-500 text-white font-[1000] uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all border-none">
                                    DOWNLOAD_SECURITY_MANIFEST
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: USER SOVEREIGNTY --- */}
            <section className="space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 font-mono">
                        <RefreshCcw size={12} className="hover:rotate-180 transition-transform duration-700 text-emerald-400" /> OWNERSHIP_PROTOCOL
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase leading-none">YOUR RIGHTS.</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <RightCard title="WIPE_ACCOUNT" desc="Permanently erase all identity traces and neural roadmaps from our nodes." icon={<Activity />} />
                    <RightCard title="EXPORT_INTEL" desc="Get a full machine-readable JSON packet of all your data points." icon={<Database />} />
                    <RightCard title="ANONYMIZE" desc="Disconnect your name from your roadmap while keeping the progress." icon={<Eye />} />
                    <RightCard title="OPT_OUT" desc="Sever all non-essential communication channels with the core." icon={<RefreshCcw />} />
                </div>
            </section>

            {/* --- SECTION 5: FINAL TERMINAL --- */}
            <section className="text-center py-12 border-t border-white/5 space-y-8">
                <div className="space-y-3">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em] font-mono">LAST_UPDATE_SYNC: 2026_04_25</span>
                    <p className="text-sm text-gray-500 max-w-2xl mx-auto italic">
                        Questions about your encryption? Reach out to our Data Shield Architects.
                    </p>
                </div>
                <Button variant="ghost" className="px-10 py-6 rounded-xl border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all group">
                    <span className="flex items-center gap-3">
                        CONTACT_DATA_SHIELD <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                </Button>
            </section>
        </div>
    )
}

function PrivacyCard({ icon, title, desc, id, color, active }: any) {
    const colors: any = {
        emerald: "text-emerald-400 group-hover:bg-emerald-500",
        cyan: "text-cyan-400 group-hover:bg-cyan-500",
        indigo: "text-indigo-400 group-hover:bg-indigo-500",
    }
    return (
        <motion.div
            whileHover={{ y: -6 }}
            className={`p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-700 group relative overflow-hidden h-full ${active ? 'bg-emerald-600/5 border-emerald-500/20 shadow-[0_30px_60px_rgba(16,185,129,0.06)]' : 'bg-[#050508] border-white/5 hover:border-emerald-500/40'}`}
        >
            <span className="absolute top-8 right-8 text-[9px] font-black uppercase tracking-widest text-gray-800 font-mono">VAULT_{id}</span>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 bg-white/[0.02] border border-white/5 ${colors[color]} group-hover:text-white group-hover:scale-105 group-hover:rotate-12`}>
                {icon}
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-emerald-400 transition-colors text-left">{title}</h3>
                <p className="text-xs md:text-sm font-medium leading-relaxed text-left text-gray-500 group-hover:text-gray-400 transition-colors">
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function RightCard({ title, desc, icon }: any) {
    return (
        <div className="p-6 md:p-8 rounded-[2rem] bg-[#050508] border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col items-center text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                {icon}
            </div>
            <h4 className="text-xs md:text-sm font-black italic uppercase tracking-tighter group-hover:text-white">{title}</h4>
            <p className="text-[9px] text-gray-600 font-bold leading-relaxed">{desc}</p>
        </div>
    )
}
