import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Briefcase, Sparkles, Building2, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useState, useMemo } from "react"

const initialJobs = [
    {
        id: 1,
        title: "Principal Frontend Architect",
        company: "FUTURE CORE",
        location: "Earth_Sector_01 (Remote)",
        type: "Full-time Protocol",
        salary: "$180k - $240k",
        match: 98,
        logo: "FC",
        tags: ["React 19", "Three.js", "Neural UI"],
        category: "ENGINEERING"
    },
    {
        id: 2,
        title: "ML Engineering Lead",
        company: "NEURAL GRID",
        location: "Silicon Valley / Hybrid",
        type: "Strategic Core",
        salary: "$210k - $300k",
        match: 94,
        logo: "NG",
        tags: ["PyTorch", "LLM Ops", "CUDA"],
        category: "DATA_SCIENCE"
    },
    {
        id: 3,
        title: "Product Design Specialist",
        company: "AURA DESIGN",
        location: "London, UK / Remote",
        type: "Contract Sync",
        salary: "$140k - $190k",
        match: 86,
        logo: "AD",
        tags: ["Figma", "Spatial UX", "Motion"],
        category: "DESIGN"
    },
    {
        id: 4,
        title: "Cloud Infrastructure Engineer",
        company: "SKY NET",
        location: "Tokyo, JP",
        type: "Full-time Protocol",
        salary: "$160k - $210k",
        match: 72,
        logo: "SN",
        tags: ["AWS", "K8s", "Terraform"],
        category: "ENGINEERING"
    }
]

export default function Careers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    const filteredJobs = useMemo(() => {
        return initialJobs.filter(job => {
            const matchesSearch = (job.title + job.company + job.tags.join(" ")).toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab = activeTab === "ALL" || job.category === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [searchQuery, activeTab]);

    return (
        <div className="text-white space-y-10 animate-in fade-in duration-700 pb-20">
            {/* 🏗️ Career Header */}
            <div className="relative p-10 bg-[#0A0A0A] border border-white/5 rounded-[40px] shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                    <Briefcase size={150} className="text-indigo-500" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex gap-3 items-center mb-2">
                            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 italic">Neural Opportunity Engine</div>
                            <div className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20 italic animate-pulse">DEMO MODE</div>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">Career Explorer</h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] ml-1">Decoding {filteredJobs.length} Strategic Placements</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" className="bg-white/5 hover:bg-white/10 px-8 rounded-2xl h-14 font-black uppercase italic tracking-widest text-[11px] border border-white/5">Saved Artifacts</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 rounded-2xl h-14 shadow-2xl shadow-indigo-600/30 gap-3 text-[11px] italic tracking-widest">
                            <Sparkles size={18} /> AUTO-DEPLOY (PRO)
                        </Button>
                    </div>
                </div>
            </div>

            {/* 🔍 Search & Filter Command Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-center px-4">
                <div className="relative w-full lg:flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-[22px] h-14 pl-14 pr-6 text-sm font-medium focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all outline-none"
                        placeholder="Search by role, company, or neural skill-match..."
                    />
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-[22px] border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                    {["ALL", "ENGINEERING", "DATA_SCIENCE", "DESIGN", "PRODUCT"].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-5 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === cat ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-gray-500 hover:text-white"}`}
                        >
                            {cat.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📦 Jobs Feed */}
            <div className="grid gap-6 px-4">
                <AnimatePresence mode="popLayout">
                    {filteredJobs.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-2xl"
                        >
                            <div className="flex flex-col xl:flex-row justify-between gap-10">
                                <div className="flex flex-col md:flex-row items-start gap-8 flex-1">
                                    <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-[28px] flex items-center justify-center font-black text-2xl text-indigo-400 group-hover:scale-110 transition-transform shadow-inner group-hover:border-indigo-500/40">
                                        {job.logo}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                                {job.match > 90 && (
                                                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                                                        <Sparkles className="text-indigo-400 w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{job.match}% MATCH</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-widest italic">
                                                <div className="flex items-center gap-2"><Building2 size={16} className="text-gray-700" /> {job.company}</div>
                                                <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-700" /> {job.location}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {job.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl text-gray-400 group-hover:border-indigo-500/20 group-hover:text-gray-200 transition-all">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row xl:flex-col justify-between items-start md:items-center xl:items-end gap-6 min-w-[200px] border-t xl:border-t-0 xl:border-l border-white/5 pt-8 xl:pt-0 xl:pl-10">
                                    <div className="space-y-4 w-full md:w-auto">
                                        <div className="flex md:flex-col gap-4 md:gap-1 items-center md:items-end">
                                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Protocol Type</div>
                                            <div className="text-sm font-black text-white italic uppercase tracking-tighter">{job.type}</div>
                                        </div>
                                        <div className="flex md:flex-col gap-4 md:gap-1 items-center md:items-end">
                                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Energy Yield</div>
                                            <div className="text-2xl font-black text-emerald-400 italic uppercase tracking-tighter leading-none">{job.salary}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="ghost" className="flex-1 md:flex-none px-6 rounded-[20px] h-14 font-black uppercase italic tracking-widest text-[11px] text-gray-500 hover:text-white bg-white/5 border border-white/5">Preview</Button>
                                        <Button className="flex-[2] md:flex-none px-10 rounded-[20px] h-14 font-black uppercase italic tracking-widest text-[11px] bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5 transition-all active:scale-95">Initial Sync</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Bottom Bar */}
                            <div className="h-1 bg-indigo-500/0 group-hover:bg-indigo-500/20 absolute bottom-0 left-0 right-0 transition-all duration-700" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredJobs.length === 0 && (
                <div className="py-40 text-center space-y-6">
                    <div className="p-8 bg-white/5 rounded-full inline-block text-gray-700"><SlidersHorizontal size={40} /></div>
                    <div className="space-y-2">
                        <p className="text-gray-500 font-black italic uppercase tracking-[0.5em] text-sm">No Strategic Opportunities Identified</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Shift your neural focus or refine the parameters.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
