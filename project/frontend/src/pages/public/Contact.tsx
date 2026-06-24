import { Button } from "@/components/ui/Button"
import { MapPin, Globe, Headphones, ArrowRight, Terminal, Activity, Monitor, Command, Settings, Zap } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Contact() {
    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto text-white font-sans space-y-12 md:space-y-16 overflow-x-hidden relative">

            {/* --- SECTION 1: THE COMMS HEADER --- */}
            <section className="text-center max-w-5xl mx-auto space-y-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/5 blur-[150px] -z-10 animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-purple-500/5 border border-purple-500/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.6em] text-purple-400">
                        <Activity size={14} className="animate-pulse" /> SIGNAL_LIVE_STABLE
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        OPEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 animate-gradient-x">PORTS.</span>
                    </h1>
                </motion.div>

                <p className="text-base md:text-lg text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed border-x border-white/5 px-10 italic">
                    "Establish a direct neural handshake with our core team. We monitor all incoming transmissions and optimize for immediate resolution."
                </p>
            </section>

            {/* --- SECTION 2: THE TRANSMISSION TERMINAL (Layout) --- */}
            <div className="grid lg:grid-cols-2 gap-16 items-start relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(168,85,247,0.05)_0%,transparent_70%)] -z-10" />

                {/* Left Side: Intel Matrix */}
                <div className="space-y-24">
                    <div className="space-y-12 text-left">
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none underline decoration-purple-600/20 underline-offset-[20px]">DIRECT_SYNC.</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">Dedicated Communication Nodes</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 pb-12">
                            <CommsSocket
                                icon={<Headphones />}
                                title="CORE_OPS"
                                desc="Technical account recovery and billing operations."
                                label="support@futurebrts.com"
                                color="purple"
                            />
                            <CommsSocket
                                icon={<Terminal />}
                                title="PARTNER_X"
                                desc="Enterprise licenses and strategic integration logic."
                                label="partners@futurebrts.com"
                                color="indigo"
                            />
                            <CommsSocket
                                icon={<Globe />}
                                title="INTEL_PRESS"
                                desc="For media packets and global branding assets."
                                label="press@futurebrts.com"
                                color="emerald"
                            />
                            <CommsSocket
                                icon={<MapPin />}
                                title="PHYSICAL_NODE"
                                desc="San Francisco, CA. Operational globally via network."
                                label="GLOBAL_HUB_01"
                                color="amber"
                            />
                        </div>
                    </div>

                    {/* FAQ HUD */}
                    <div className="space-y-10 text-left">
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none underline decoration-purple-600/20 underline-offset-[20px]">DATA_QUERY.</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">Frequently Accessed Intel</p>
                        </div>
                        <div className="grid gap-6">
                            <RoboFaqItem question="What is your signal latency?" answer="System-level queries are processed instantly by the AI. Human override latency is < 12 hours." />
                            <RoboFaqItem question="Can I request a core demo?" answer="Selective 'Partner' entities can request a deep-dive technical demonstration." />
                            <RoboFaqItem question="Security standards for data?" answer="All communications are encrypted via AES-256 and stored in secure neural vaults." />
                        </div>
                    </div>
                </div>

                {/* Right Side: Transmission Form */}
                <div className="p-8 md:p-12 rounded-[3rem] bg-white/[0.01] border border-white/5 relative overflow-hidden group/form shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Industrial Frame Details */}
                    <div className="absolute top-10 right-10 flex gap-4 opacity-50">
                        <Monitor size={16} className="text-purple-500" />
                        <Settings size={16} className="animate-spin-slow" />
                    </div>

                    <div className="space-y-10 relative z-10 text-left">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">TRANSMIT_PAYLOAD</h3>
                            <p className="text-gray-700 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-3">
                                <Zap size={10} className="text-purple-500 animate-pulse" /> Protocol: High-Priority Connection
                            </p>
                        </div>

                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4 group/input">
                                    <label className="block text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 group-focus-within/input:text-purple-400 transition-colors">OPERATOR_ID (NAME)</label>
                                    <input type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-sm placeholder:text-gray-900 shadow-inner italic" placeholder="ENTITY_NAME_07" />
                                </div>
                                <div className="space-y-4 group/input">
                                    <label className="block text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 group-focus-within/input:text-purple-400 transition-colors">SIGNAL_POINT (EMAIL)</label>
                                    <input type="email" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-sm placeholder:text-gray-900 shadow-inner italic" placeholder="COMM_SOCKET@EMAIL.COM" />
                                </div>
                            </div>

                            <div className="space-y-4 group/input">
                                <label className="block text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 group-focus-within/input:text-purple-400 transition-colors">MISSION_OBJECTIVE</label>
                                <select className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-sm shadow-inner italic appearance-none">
                                    <option className="bg-zinc-900">CORE_TECHNICAL_SUPPORT</option>
                                    <option className="bg-zinc-900">PARTNER_INTEGRATION</option>
                                    <option className="bg-zinc-900">BRAIN_FEEDBACK</option>
                                    <option className="bg-zinc-900">OTHER_TRANSMISSION</option>
                                </select>
                            </div>

                            <div className="space-y-4 group/input">
                                <label className="block text-[9px] font-black uppercase tracking-[0.5em] text-gray-700 group-focus-within/input:text-purple-400 transition-colors">PAYLOAD_DETAILS</label>
                                <textarea rows={6} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-sm placeholder:text-gray-900 shadow-inner italic resize-none" placeholder="DESCRIBE_YOUR_MISSION_PARAMETERS..." />
                            </div>

                            <div className="pt-8">
                                <Button className="w-full h-24 bg-purple-600 text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-3xl hover:bg-white hover:text-purple-600 transition-all shadow-[0_30px_60px_rgba(168,85,247,0.3)] border-none group/send">
                                    <span className="flex items-center justify-center gap-6">
                                        INITIATE_TRANSMISSION <ArrowRight size={24} className="group-hover/send:translate-x-4 transition-transform" />
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- FOOTER STATUS HUD --- */}
            <section className="text-center py-20 border-t border-white/5 space-y-10">
                <div className="flex flex-wrap justify-center gap-12 font-black text-[9px] uppercase tracking-[0.6em] text-gray-800">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" /> UPLINK: ACTIVE</div>
                    <div>SEC_LEVEL: 04</div>
                    <div>THROUGHPUT: OPTIMAL</div>
                    <div>CRC_CHECK: VALID</div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 drop-shadow-lg">
                    Conceptualized by Architect Mayur Savaliya • Built in Earth-Sector_01
                </p>
            </section>
        </div>
    )
}

function CommsSocket({ icon, title, desc, label, color }: any) {
    const colorMap: any = {
        purple: "text-purple-400 group-hover:bg-purple-600",
        indigo: "text-indigo-400 group-hover:bg-indigo-600",
        emerald: "text-emerald-400 group-hover:bg-emerald-600",
        amber: "text-amber-400 group-hover:bg-amber-600",
    }
    return (
        <div className="p-10 rounded-[3rem] bg-[#050505] border border-white/5 hover:border-purple-500/30 transition-all duration-700 group cursor-pointer text-left h-full relative overflow-hidden">
            <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 transition-all duration-500 group-hover:text-white group-hover:scale-110 group-hover:-rotate-12 ${colorMap[color]}`}>{icon}</div>
            <div className="space-y-4">
                <h4 className="font-black text-2xl italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed text-left group-hover:text-gray-400">{desc}</p>
            </div>
            <div className="pt-8 flex items-center gap-3">
                <div className="h-0.5 w-10 bg-white/5 group-hover:w-full transition-all duration-1000" />
                <span className="text-[9px] font-black font-mono uppercase tracking-widest text-purple-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
            </div>
        </div>
    )
}

function RoboFaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="p-10 rounded-[2.5rem] bg-[#050505] border border-white/5 hover:border-purple-600/20 transition-all cursor-pointer group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-6">
                <h4 className="text-base font-black text-gray-600 group-hover:text-white tracking-tighter uppercase transition-colors italic leading-tight">{question}</h4>
                <div className={`text-purple-500 transition-transform duration-500 ${isOpen ? 'rotate-135' : ''}`}>
                    <Command size={20} />
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-sm text-gray-500 font-medium leading-relaxed pt-8 border-t border-white/5 text-left border-purple-500/10"
                    >
                        {answer}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
