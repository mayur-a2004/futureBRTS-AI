import { Button } from "@/components/ui/Button"
import { ExternalLink, Hammer, Heart, Zap, Globe, ShieldCheck, Cpu, Terminal, Fingerprint } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function Careers() {
    const { scrollYProgress } = useScroll();
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div className="pt-16 pb-12 px-6 max-w-7xl mx-auto text-center text-white space-y-12 md:space-y-16 font-sans overflow-x-hidden relative">

            {/* --- SECTION 1: THE MISSION CALL --- */}
            <section className="relative space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ opacity: opacityHero }}
                    className="relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] -z-10" />
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400 backdrop-blur-md">
                            <Fingerprint size={14} className="animate-pulse" /> BIOMETRIC_RECRUIT_ACTIVE
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase italic drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                            JOIN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient-x">ARCHITECTS.</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-5xl mx-auto border-y border-white/5 py-10 italic">
                    "We are not looking for passive employees. We are recruiting rogue engineers and elite minds to build the core infrastructure of human achievement. Are you ready for <span className="text-white font-black italic">operational excellence?</span>"
                </p>
            </section>

            {/* --- SECTION 2: THE 3-PROTOCOL VALUES --- */}
            <section className="grid md:grid-cols-3 gap-8 text-left">
                <RoboCultureCard
                    icon={<Hammer />}
                    title="SYSTEM_INTEGRITY"
                    label="VAL_01"
                    desc="We respect the code. We build deterministic, high-uptime architectures that don't fail under load. Quality is a prerequisite."
                    color="indigo"
                />
                <RoboCultureCard
                    icon={<Zap />}
                    title="ABSOLUTE_VELOCITY"
                    label="VAL_02"
                    desc="We iterate in hours, not weeks. Our cycle-time is a competitive weapon. We move as fast as the intelligence we're building."
                    color="purple"
                    active
                />
                <RoboCultureCard
                    icon={<Heart />}
                    title="RADICAL_HONESTY"
                    label="VAL_03"
                    desc="Direct feedback loops are essential for survival. We skip the office politics and focus on solving the objective."
                    color="pink"
                />
            </section>

            {/* --- SECTION 3: THE ENVIRONMENT HUD (Stats & Culture) --- */}
            <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] -z-10 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="text-left space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-white leading-none">WORK_SPECS.</h2>
                            <div className="h-1.5 w-32 bg-purple-500" />
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                Our operational environment is optimized for high-performance output. We provide the tools; you provide the brilliance.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <EnvSpec title="GLOBAL_REMOTE_SYNC" desc="Work from any sector on the planet. Fully asynchronous protocols enabled." />
                            <EnvSpec title="EQUITY_GENESIS" desc="Ownership stake for every core builder. We win as one collective unit." />
                            <EnvSpec title="NEURAL_UPGRADE_FIX" desc="Unlimited learning budget. We fund your specialized certifications." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative">
                        <RoboFeature icon={<Globe />} label="Global_Sync" active />
                        <RoboFeature icon={<Terminal />} label="Async_Ops" />
                        <RoboFeature icon={<Cpu />} label="AI_First" />
                        <RoboFeature icon={<ShieldCheck />} label="Secured" active />
                    </div>
                </div>
            </section>

            {/* --- SECTION 4: THE OPEN PORTS (Job Board) --- */}
            <div className="text-left space-y-20 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">OPEN_PORTS.</h2>
                        <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px] pl-2 border-l border-purple-500">Available units for neural integration</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">ACTIVE_SLOTS: 04</div>
                    </div>
                </div>

                <div className="grid gap-8">
                    <RoboJob
                        role="CORE_SYSTEM_ARCHITECT (PYTHON)"
                        dept="Intelligence Foundation"
                        salary="$140k - $200k"
                        id="SYS_A"
                    />
                    <RoboJob
                        role="NEURAL_INTERFACE_DESIGNER"
                        dept="Visual Experience Layer"
                        salary="$120k - $180k"
                        id="UI_X"
                    />
                    <RoboJob
                        role="DEEP_LEARNING_ENGINEER"
                        dept="Logic Synthesis"
                        salary="$150k - $220k"
                        id="AI_M"
                    />
                    <RoboJob
                        role="STRATEGIC_GROWTH_LEAD"
                        dept="Operational Expansion"
                        salary="$100k - $160k"
                        id="GRW_P"
                    />
                </div>
            </div>

            {/* --- SECTION 5: THE UNKNOWN ENTITY --- */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-16 text-center space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent -z-10" />
                <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">PORTAL_NOT_ACTIVE?</h3>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed italic border-x border-white/5 px-10">
                    "Extraordinary talent is hard to categorize. If you are the outlier we need, transmit your raw data to our core directly."
                </p>
                <div className="pt-6">
                    <Button className="px-20 py-10 bg-white text-black font-black uppercase tracking-[0.4em] text-xs rounded-3xl hover:bg-purple-600 hover:text-white transition-all shadow-2xl border-none">
                        TRANSMIT_DATA_SET
                    </Button>
                </div>
                <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.6em] text-gray-800 pt-6">
                    <div>REPLY_LATENCY: {'<'} 24H</div>
                    <div>PRIORITY: CRITICAL</div>
                </div>
            </div>
        </div>
    )
}

function RoboCultureCard({ icon, title, desc, label, color, active }: any) {
    const colorMap: any = {
        indigo: "text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-600",
        purple: "text-purple-400 border-purple-500/20 group-hover:bg-purple-600",
        pink: "text-pink-400 border-pink-500/20 group-hover:bg-pink-600",
    }
    return (
        <div className={`p-12 rounded-[3.5rem] bg-[#050505] border border-white/5 transition-all duration-700 group h-full relative overflow-hidden flex flex-col items-start ${active ? 'shadow-[0_40px_80px_rgba(168,85,247,0.1)] border-purple-500/30' : 'hover:bg-white/[0.02]'}`}>
            <span className="absolute top-10 right-10 text-[9px] font-black font-mono text-gray-800">{label}</span>
            <div className={`w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-10 transition-all duration-500 group-hover:text-white group-hover:scale-110 ${colorMap[color]}`}>
                {icon}
            </div>
            <div className="space-y-6 flex-1">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase group-hover:text-white transition-colors">{title}</h3>
                <p className="text-base font-medium leading-relaxed text-gray-600 group-hover:text-gray-400 transition-colors">
                    {desc}
                </p>
            </div>
            <div className="pt-10 w-full opacity-10 group-hover:opacity-100 transition-opacity">
                <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
                    <div className={`h-full bg-current w-0 group-hover:w-full transition-all duration-[1500ms] ${colorMap[color] && colorMap[color].replace('text-', 'bg-')}`} />
                </div>
            </div>
        </div>
    )
}

function EnvSpec({ title, desc }: any) {
    return (
        <div className="space-y-2 group cursor-default">
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(168,85,247,1)]" />
                <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{title}</h4>
            </div>
            <p className="text-gray-600 font-medium text-base pl-6 text-left group-hover:text-gray-400 transition-colors">{desc}</p>
        </div>
    )
}

function RoboFeature({ icon, label, active }: any) {
    return (
        <div className={`p-10 aspect-square rounded-[3rem] border flex flex-col items-center justify-center text-center space-y-4 transition-all duration-700 hover:scale-[1.05] group ${active ? 'bg-purple-600 border-purple-500 text-white shadow-2xl' : 'bg-[#020202] border-white/5 text-gray-700 hover:border-white/10'}`}>
            <div className="group-hover:rotate-12 transition-transform">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    )
}

function RoboJob({ role, dept, salary, id }: any) {
    return (
        <div className="p-10 md:p-14 rounded-[3.5rem] bg-[#050505] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.02] transition-all duration-700 cursor-pointer group flex flex-col md:flex-row justify-between items-start md:items-center gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
            <div className="space-y-6">
                <div className="flex items-center gap-6">
                    <span className="text-[11px] font-black px-4 py-1 bg-white/5 rounded-lg text-gray-600 group-hover:text-purple-400 transition-colors font-mono">{id}</span>
                    <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white group-hover:text-purple-400 transition-colors leading-none">{role}</h3>
                </div>
                <div className="flex flex-wrap gap-x-10 gap-y-4 text-[10px] font-bold text-gray-700 uppercase tracking-[0.3em] pl-2 border-l-2 border-white/5">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,1)]" /> {dept}</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]" /> Remote_Async</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,1)]" /> {salary}</span>
                </div>
            </div>
            <Button className="w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-purple-600 group-hover:border-purple-600 transition-all duration-500 border-none shrink-0 shadow-inner">
                <ExternalLink size={32} />
            </Button>
        </div>
    )
}
