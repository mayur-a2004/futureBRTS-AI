import { Button } from "@/components/ui/Button"
import { MapPin, Globe, Headphones, ArrowRight, Terminal, Activity, Monitor, Command, Settings, Zap, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Contact() {
    const [isTransmitted, setIsTransmitted] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", objective: "CORE_TECHNICAL_SUPPORT", details: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsTransmitted(true);
    };

    return (
        <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-white font-sans space-y-16 md:space-y-20 overflow-x-hidden relative">

            {/* --- SECTION 1: THE COMMS HEADER --- */}
            <section className="text-center max-w-5xl mx-auto space-y-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/5 blur-[150px] -z-10 animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-purple-500/5 border border-purple-500/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.6em] text-purple-400">
                        <Activity size={12} className="animate-pulse" /> SIGNAL_LIVE_STABLE
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        OPEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-400 animate-gradient-x">PORTS.</span>
                    </h1>
                </motion.div>

                <p className="text-sm md:text-base text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed border-x border-white/5 px-6 italic">
                    "Establish a direct neural handshake with our core team. We monitor all incoming transmissions and optimize for immediate resolution."
                </p>
            </section>

            {/* --- SECTION 2: THE TRANSMISSION TERMINAL (Layout) --- */}
            <div className="grid lg:grid-cols-2 gap-12 items-start relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(168,85,247,0.03)_0%,transparent_70%)] -z-10" />

                {/* Left Side: Intel Matrix */}
                <div className="space-y-16">
                    <div className="space-y-8 text-left">
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">Dedicated Communication Nodes</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">DIRECT_SYNC.</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 pb-8">
                            <CommsSocket
                                icon={<Headphones />}
                                title="CORE_OPS"
                                desc="Technical account recovery, support services, and billing operations."
                                label="+91 7859828561"
                                color="purple"
                            />
                            <CommsSocket
                                icon={<Terminal />}
                                title="PARTNER_X"
                                desc="Enterprise licensing structures and strategic pipeline integration logic."
                                label="partners@futurebrts.com"
                                color="indigo"
                            />
                            <CommsSocket
                                icon={<Globe />}
                                title="INTEL_PRESS"
                                desc="For media assets, press inquiries, and global branding packets."
                                label="press@futurebrts.com"
                                color="emerald"
                            />
                            <CommsSocket
                                icon={<MapPin />}
                                title="PHYSICAL_NODE"
                                desc="Gandhinagar, Gujarat, India. Operational globally via network."
                                label="GANDHINAGAR_IN"
                                color="amber"
                            />
                        </div>
                    </div>

                    {/* FAQ HUD */}
                    <div className="space-y-8 text-left">
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">Frequently Accessed Intel</span>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white leading-none">DATA_QUERY.</h2>
                        </div>
                        <div className="grid gap-4">
                            <RoboFaqItem question="What is your signal latency?" answer="System-level queries are processed instantly by the AI. Human override latency is < 12 hours." />
                            <RoboFaqItem question="Can I request a core demo?" answer="Selective 'Partner' entities can request a deep-dive technical demonstration." />
                            <RoboFaqItem question="Security standards for data?" answer="All communications are encrypted via AES-256 and stored in secure neural vaults." />
                        </div>
                    </div>
                </div>

                {/* Right Side: Transmission Form */}
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#050508] border border-white/5 relative overflow-hidden group/form shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* Industrial Frame Details */}
                    <div className="absolute top-8 right-8 flex gap-3 opacity-45">
                        <Monitor size={14} className="text-purple-500" />
                        <Settings size={14} className="animate-spin-slow" />
                    </div>

                    <div className="space-y-8 relative z-10 text-left">
                        <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">TRANSMIT_PAYLOAD</h3>
                            <p className="text-gray-600 font-black uppercase text-[9px] tracking-[0.4em] flex items-center gap-2.5">
                                <Zap size={8} className="text-purple-500 animate-pulse" /> Protocol: High-Priority Connection
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isTransmitted ? (
                                <motion.form 
                                    className="space-y-6" 
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group/input">
                                            <label className="block text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 group-focus-within/input:text-purple-400 transition-colors">OPERATOR_ID (NAME)</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner italic" 
                                                placeholder="ENTITY_NAME_07" 
                                            />
                                        </div>
                                        <div className="space-y-2 group/input">
                                            <label className="block text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 group-focus-within/input:text-purple-400 transition-colors">SIGNAL_POINT (EMAIL)</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner italic" 
                                                placeholder="COMM_SOCKET@EMAIL.COM" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group/input">
                                        <label className="block text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 group-focus-within/input:text-purple-400 transition-colors">MISSION_OBJECTIVE</label>
                                        <select 
                                            value={formData.objective}
                                            onChange={e => setFormData({ ...formData, objective: e.target.value })}
                                            className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-xs shadow-inner italic appearance-none cursor-pointer"
                                        >
                                            <option value="CORE_TECHNICAL_SUPPORT" className="bg-zinc-955 text-white">CORE_TECHNICAL_SUPPORT</option>
                                            <option value="PARTNER_INTEGRATION" className="bg-zinc-955 text-white">PARTNER_INTEGRATION</option>
                                            <option value="BRAIN_FEEDBACK" className="bg-zinc-955 text-white">BRAIN_FEEDBACK</option>
                                            <option value="OTHER_TRANSMISSION" className="bg-zinc-955 text-white">OTHER_TRANSMISSION</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 group/input">
                                        <label className="block text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 group-focus-within/input:text-purple-400 transition-colors">PAYLOAD_DETAILS</label>
                                        <textarea 
                                            rows={5} 
                                            required
                                            value={formData.details}
                                            onChange={e => setFormData({ ...formData, details: e.target.value })}
                                            className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-purple-600 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner italic resize-none" 
                                            placeholder="DESCRIBE_YOUR_MISSION_PARAMETERS..." 
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <Button type="submit" className="w-full h-16 bg-purple-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white hover:text-purple-600 transition-all shadow-[0_20px_40px_rgba(168,85,247,0.2)] border-none group/send">
                                            <span className="flex items-center justify-center gap-4">
                                                INITIATE_TRANSMISSION <ArrowRight size={18} className="group-hover/send:translate-x-2 transition-transform" />
                                            </span>
                                        </Button>
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div 
                                    className="py-20 text-center space-y-4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="inline-block p-4 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-white uppercase tracking-wider font-mono">TRANSMISSION_COMPLETE</h4>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Dossier sync successfully established with core nodes.</p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsTransmitted(false)} 
                                        variant="ghost" 
                                        className="mt-6 text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 rounded-xl h-10 px-5"
                                    >
                                        TRANSMIT NEW PAYLOAD
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
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
        <div className="p-8 rounded-[2.5rem] bg-[#050508] border border-white/5 hover:border-purple-500/30 transition-all duration-700 group cursor-pointer text-left h-full relative overflow-hidden flex flex-col justify-between">
            <div>
                <div className={`w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 transition-all duration-500 group-hover:text-white group-hover:scale-105 group-hover:-rotate-12 ${colorMap[color]}`}>{icon}</div>
                <div className="space-y-3">
                    <h4 className="font-black text-xl italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed text-left group-hover:text-gray-400">{desc}</p>
                </div>
            </div>
            <div className="pt-6 flex items-center gap-3">
                <div className="h-px w-6 bg-white/5 group-hover:w-full transition-all duration-1000" />
                <span className="text-[9px] font-black font-mono uppercase tracking-widest text-purple-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
            </div>
        </div>
    )
}

function RoboFaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="p-8 rounded-[2rem] bg-[#050508] border border-white/5 hover:border-purple-600/20 transition-all cursor-pointer group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm md:text-base font-black text-gray-500 group-hover:text-white tracking-tighter uppercase transition-colors italic leading-tight">{question}</h4>
                <div className={`text-purple-500 transition-transform duration-500 ${isOpen ? 'rotate-135' : ''}`}>
                    <Command size={16} />
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed pt-6 border-t border-white/5 text-left border-purple-500/10"
                    >
                        {answer}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
