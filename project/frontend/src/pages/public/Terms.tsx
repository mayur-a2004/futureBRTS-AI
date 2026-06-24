import { FileText, Scale, ShieldAlert, Gavel, Cpu, Key, Activity, RefreshCcw, ArrowRight, BookOpen, Lock, Terminal } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function Terms() {
    const { scrollYProgress } = useScroll();
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, 180]);

    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto space-y-12 md:space-y-16 text-white font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE LEGAL HERO --- */}
            <section className="relative flex flex-col items-center text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    {/* Rotating Circular HUD Background */}
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-amber-500/10 rounded-full -z-10"
                    />
                    <motion.div
                        style={{ rotate: rotateValue }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-orange-500/10 rounded-full -z-10"
                    />

                    <div className="space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-amber-500/5 border border-amber-500/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.5em] text-amber-400">
                            <Gavel size={14} className="animate-pulse" /> LEGAL_HANDSHAKE_INITIATED
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 uppercase italic">
                            BUILDER <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-700 animate-gradient-x drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">AGREEMENT.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-4xl mx-auto border-y border-white/5 py-10 px-10 italic text-center">
                    "By accessing the FutureBuilder Industrial Engine, you enter a binding <span className="text-white font-black underline decoration-amber-500 decoration-4 underline-offset-8">Execution Protocol</span>. We provide the tools; you provide the integrity."
                </p>
                
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-amber-400">
                        <Scale size={12} /> BINDING_CONTRACT
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-orange-400">
                        <Terminal size={12} /> API_USAGE_POLICY
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: THE TERMS MATRIX --- */}
            <section className="space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">CORE_RULES.</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">The parameters of operation</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TermsCard 
                        icon={<Key />}
                        title="ACCOUNT_SECURITY"
                        desc="You are the sole operator of your credentials. Sharing your neural link leads to immediate termination of service."
                        id="01"
                        color="amber"
                    />
                    <TermsCard 
                        icon={<Cpu />}
                        title="LICENSING_LOGIC"
                        desc="We grant you a non-transferable license to use our AI synthesis engine for personal or business growth."
                        id="02"
                        color="orange"
                        active
                    />
                    <TermsCard 
                        icon={<ShieldAlert />}
                        title="PROHIBITED_ACTS"
                        desc="Reverse engineering our neural logic or using the engine for malevolent automation is strictly forbidden."
                        id="03"
                        color="amber"
                    />
                </div>
            </section>

            {/* --- SECTION 3: INTELLECTUAL PROPERTY HUD --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 blur-[150px] group-hover:bg-amber-600/20 transition-all duration-1000" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-10 text-left">
                        <div className="space-y-6 text-left">
                            <h2 className="text-2xl md:text-5xl font-black tracking-tighter italic uppercase text-white leading-none">OWNERSHIP.</h2>
                            <div className="h-1 w-32 bg-amber-500" />
                            <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                You own the input. We own the engine. The resulting roadmaps are yours to execute, but the underlying algorithmic patterns remain property of the Collective Core.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <SecurityStat label="ENGINE_COPYRIGHT" value="MAYUR_S_2025" />
                            <div className="h-px w-full bg-white/5" />
                            <SecurityStat label="DATA_RESIDENCY" value="EARTH_SECTOR_01" />
                            <div className="h-px w-full bg-white/5" />
                            <SecurityStat label="LIABILITY_SHIELD" value="LIMITED_ENFORCED" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="p-1 rounded-[3.5rem] bg-gradient-to-br from-amber-500/20 via-white/5 to-orange-500/20 shadow-2xl">
                            <div className="bg-[#050505] rounded-[2.9rem] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 border border-white/10">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    <FileText size={80} className="text-amber-500/30" />
                                </motion.div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase">BINDING_SIGNATURE</h3>
                                    <p className="text-[9px] text-amber-400 font-black tracking-[0.4em] uppercase">Status: Legally Enforced v9.4</p>
                                </div>
                                <Button className="w-full bg-amber-500 text-white font-[1000] uppercase tracking-[0.2em] text-[10px] py-8 rounded-2xl hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all border-none">
                                    VIEW_FULL_LEGAL_PACKET
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: TERMINATION & REFUNDS --- */}
            <section className="space-y-12">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                        <RefreshCcw size={14} className="hover:rotate-180 transition-transform duration-700" /> DEPLOYMENT_CYCLE
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">EXIT_LOGIC.</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <RightCard title="CREDIT_POLICY" desc="Energy credits are non-refundable once the synthesis engine has been engaged." icon={<Activity />} />
                    <RightCard title="SERVICE_HALT" desc="We reserve the right to sever the link for any protocol violations." icon={<Lock />} />
                    <RightCard title="REFUND_GAPS" desc="Refunds are handled on a case-by-case basis within 48 hours of txn." icon={<RefreshCcw />} />
                    <RightCard title="UPTIME_PACT" desc="We aim for 99.9% uptime, but zero liability for scheduled neural maintenance." icon={<BookOpen />} />
                </div>
            </section>

            {/* --- SECTION 5: FINAL TERMINAL --- */}
            <section className="text-center py-20 border-t border-white/5 space-y-12">
                <div className="space-y-4">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em]">LAST_HANDSHAKE_UPDATE: 2026_01_15</span>
                    <p className="text-base text-gray-500 max-w-2xl mx-auto italic">
                        Need clarity on these operational parameters? Connect with our Legal Architects.
                    </p>
                </div>
                <Button variant="ghost" className="px-12 py-8 rounded-2xl border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all group">
                    <span className="flex items-center gap-4">
                        CONTACT_LEGAL_TEAM <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                </Button>

                <div className="flex flex-wrap justify-center gap-12 font-black text-[9px] uppercase tracking-[0.6em] text-gray-800 pt-20">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> SYS_STABLE</div>
                    <div>LAWS_SYNCED</div>
                    <div>USER_BOUND</div>
                    <div>CRC_VALID</div>
                </div>
            </section>
        </div>
    )
}

function TermsCard({ icon, title, desc, id, color, active }: any) {
    const colors: any = {
        amber: "text-amber-400 group-hover:bg-amber-500",
        orange: "text-orange-400 group-hover:bg-orange-500",
    }
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`p-10 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden h-full ${active ? 'bg-amber-600/5 border-amber-500/20 shadow-[0_30px_60px_rgba(245,158,11,0.1)]' : 'bg-[#050505] border-white/5 hover:border-amber-500/40'}`}
        >
            <span className="absolute top-10 right-10 text-[10px] font-black uppercase tracking-widest text-gray-800">RULE_{id}</span>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 bg-white/[0.03] border border-white/10 ${colors[color]} group-hover:text-white group-hover:scale-110 group-hover:rotate-12`}>
                {icon}
            </div>
            <div className="space-y-6 text-left">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-amber-400 transition-colors">{title}</h3>
                <p className="text-sm font-medium leading-relaxed text-gray-600 group-hover:text-gray-400 transition-colors">
                    {desc}
                </p>
            </div>
        </motion.div>
    )
}

function SecurityStat({ label, value }: any) {
    return (
        <div className="flex justify-between items-center py-2 px-4 group hover:bg-amber-500/5 rounded-xl transition-all">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest group-hover:text-amber-500/50">{label}</span>
            <span className="text-xs font-black text-white italic tracking-widest bg-white/5 px-3 py-1 rounded-lg">{value}</span>
        </div>
    )
}

function RightCard({ title, desc, icon }: any) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-[#050505] border border-white/5 hover:border-amber-500/30 transition-all group flex flex-col items-center text-center space-y-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
                {icon}
            </div>
            <h4 className="text-sm font-black italic uppercase tracking-tighter group-hover:text-white">{title}</h4>
            <p className="text-[10px] text-gray-600 font-bold leading-relaxed">{desc}</p>
        </div>
    )
}
