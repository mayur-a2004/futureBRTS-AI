import { Shield, Lock, Eye, Database, RefreshCcw, Activity, Fingerprint, Key, ArrowRight, ShieldCheck, Cpu } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function Privacy() {
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 180]);

    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto space-y-12 md:space-y-16 text-white font-sans overflow-x-hidden relative">

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
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-emerald-500/10 rounded-full -z-10"
                    />
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/10 rounded-full -z-10"
                    />

                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
                            <Shield size={14} className="animate-pulse" /> PRIVACY_PROTOCOL_ACTIVE
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 uppercase italic">
                            DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-indigo-400 animate-gradient-x drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">SHIELD.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-4xl mx-auto border-y border-white/5 py-10 px-10 italic">
                    "At FutureBuilder, your ambition is encrypted. We've engineered a <span className="text-white font-black underline decoration-emerald-500 decoration-4 underline-offset-8">Zero-Knowledge Architecture</span> where your career data remains your exclusive property."
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
            <section className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">INGEST_LOGIC.</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">What variables we synthesize</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <PrivacyCard 
                        icon={<Database />}
                        title="IDENTITY_CORE"
                        desc="Email and Name. Encrypted on ingest. Used strictly for session persistence and identity handshake."
                        id="01"
                        color="emerald"
                    />
                    <PrivacyCard 
                        icon={<Cpu />}
                        title="NEURAL_PATH"
                        desc="Your goals and skill gaps. Processed in isolated AI containers. Never shared with global training sets."
                        id="02"
                        color="cyan"
                        active
                    />
                    <PrivacyCard 
                        icon={<Activity />}
                        title="VITAL_METRICS"
                        desc="Platform usage logic. Anonymized telemetry only. Used to optimize synthesis engines for all builders."
                        id="03"
                        color="indigo"
                    />
                </div>
            </section>

            {/* --- SECTION 3: THE VAULT ARCHITECTURE --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 blur-[150px] group-hover:bg-emerald-600/20 transition-all duration-1000" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10 text-left">
                        <div className="space-y-6 text-left">
                            <h2 className="text-2xl md:text-5xl font-black tracking-tighter italic uppercase text-white leading-none">THE_VAULT.</h2>
                            <div className="h-1 w-32 bg-emerald-500" />
                            <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                Our backend is a fortress. We use military-grade encryption to ensure your strategic career roadmaps never leave Earth-Sector_01 without your explicit signature.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <SecurityStat label="ENCRYPTION_STANDARD" value="AES_256_GCM" />
                            <div className="h-px w-full bg-white/5" />
                            <SecurityStat label="TRANSPORT_PROTOCOL" value="TLS_1.3_V9" />
                            <div className="h-px w-full bg-white/5" />
                            <SecurityStat label="STORAGE_METHOD" value="COLD_VAULT_ISOLATED" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="p-1 rounded-[3.5rem] bg-gradient-to-br from-emerald-500/20 via-white/5 to-cyan-500/20 shadow-2xl">
                            <div className="bg-[#050505] rounded-[2.9rem] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 border border-white/10">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 90, 180, 270, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="relative"
                                >
                                    <ShieldCheck size={100} className="text-emerald-500/30" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Key size={24} className="text-white animate-pulse" />
                                    </div>
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase">ZERO_LEAK_HISTORY</h3>
                                    <p className="text-[9px] text-emerald-400 font-black tracking-[0.4em] uppercase">Uptime Since Inception: 99.998%</p>
                                </div>
                                <Button className="w-full bg-emerald-500 text-white font-[1000] uppercase tracking-[0.2em] text-[10px] py-8 rounded-2xl hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all border-none">
                                    DOWNLOAD_SECURITY_MANIFEST
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: USER SOVEREIGNTY --- */}
            <section className="space-y-12">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                        <RefreshCcw size={14} className="hover:rotate-180 transition-transform duration-700" /> OWNERSHIP_PROTOCOL
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">YOUR RIGHTS.</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <RightCard title="WIPE_ACCOUNT" desc="Permanently erase all identity traces and neural roadmaps from our nodes." icon={<Activity />} />
                    <RightCard title="EXPORT_INTEL" desc="Get a full machine-readable JSON packet of all your data points." icon={<Database />} />
                    <RightCard title="ANONYMIZE" desc="Disconnect your name from your roadmap while keeping the progress." icon={<Eye />} />
                    <RightCard title="OPT_OUT" desc="Sever all non-essential communication channels with the core." icon={<RefreshCcw />} />
                </div>
            </section>

            {/* --- SECTION 5: FINAL TERMINAL --- */}
            <section className="text-center py-20 border-t border-white/5 space-y-12">
                <div className="space-y-4">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em]">LAST_UPDATE_SYNC: 2026_04_25</span>
                    <p className="text-base text-gray-500 max-w-2xl mx-auto italic">
                        Questions about your encryption? Reach out to our Data Shield Architects.
                    </p>
                </div>
                <Button variant="ghost" className="px-12 py-8 rounded-2xl border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all group">
                    <span className="flex items-center gap-4">
                        CONTACT_DATA_SHIELD <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                </Button>

                <div className="flex flex-wrap justify-center gap-12 font-black text-[9px] uppercase tracking-[0.6em] text-gray-800 pt-20">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> CORE_ONLINE</div>
                    <div>ENCR_READY</div>
                    <div>MEM_SECURE</div>
                    <div>SHA_256_STABLE</div>
                </div>
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
            whileHover={{ y: -10 }}
            className={`p-10 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden h-full ${active ? 'bg-emerald-600/5 border-emerald-500/20 shadow-[0_30px_60px_rgba(16,185,129,0.1)]' : 'bg-[#050505] border-white/5 hover:border-emerald-500/40'}`}
        >
            <span className="absolute top-10 right-10 text-[10px] font-black uppercase tracking-widest text-gray-800">VAULT_{id}</span>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 bg-white/[0.03] border border-white/10 ${colors[color]} group-hover:text-white group-hover:scale-110 group-hover:rotate-12`}>
                {icon}
            </div>
            <div className="space-y-6">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-emerald-400 transition-colors text-left">{title}</h3>
                <p className="text-sm font-medium leading-relaxed text-left text-gray-600 group-hover:text-gray-400 transition-colors">
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function SecurityStat({ label, value }: any) {
    return (
        <div className="flex justify-between items-center py-2 px-4 group hover:bg-emerald-500/5 rounded-xl transition-all">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest group-hover:text-emerald-500/50">{label}</span>
            <span className="text-xs font-black text-white italic tracking-widest bg-white/5 px-3 py-1 rounded-lg">{value}</span>
        </div>
    )
}

function RightCard({ title, desc, icon }: any) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-[#050505] border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col items-center text-center space-y-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                {icon}
            </div>
            <h4 className="text-sm font-black italic uppercase tracking-tighter group-hover:text-white">{title}</h4>
            <p className="text-[10px] text-gray-600 font-bold leading-relaxed">{desc}</p>
        </div>
    )
}
