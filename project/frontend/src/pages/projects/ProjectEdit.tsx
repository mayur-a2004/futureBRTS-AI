import { useState } from "react"
import { ArrowLeft, Save, Play, CheckCircle, Code, Layers, FileText, Lightbulb, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link, useParams } from "react-router-dom"

const TECH_OPTIONS = ["React", "Next.js", "Node.js", "Express", "MongoDB", "Tailwind", "Python", "FastAPI", "TensorFlow", "Framer Motion", "Docker", "AWS"];

export default function ProjectEdit() {
    const { id } = useParams();

    // Mock initial state based on ID (real implementation would fetch)
    const [project, setProject] = useState({
        title: id === 'new' ? "Untitled Project" : "E-Commerce Dashboard",
        overview: "A full-stack dashboard for managing products, orders, and analytics.",
        problem: "Small businesses struggle with complex inventory management tools.",
        techStack: ["React", "Node.js", "Tailwind"] as string[],
        milestones: [
            { id: 1, title: "Setup Project Structure", completed: true },
            { id: 2, title: "Database Schema Design", completed: true },
            { id: 3, title: "API Authentication", completed: false },
            { id: 4, title: "Frontend Dashboard UI", completed: false }
        ],
        learningOutcome: "Mastering State Management and REST API Integration.",
        futureImprovements: "Add real-time socket updates and AI inventory prediction."
    });

    const toggleTech = (tech: string) => {
        if (project.techStack.includes(tech)) {
            setProject({ ...project, techStack: project.techStack.filter(t => t !== tech) });
        } else {
            setProject({ ...project, techStack: [...project.techStack, tech] });
        }
    };

    const toggleMilestone = (mId: number) => {
        setProject({
            ...project,
            milestones: project.milestones.map(m => m.id === mId ? { ...m, completed: !m.completed } : m)
        });
    };

    return (
        <div className="text-white max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-800 pb-6">
                <div className="flex items-center gap-4">
                    <Link to="/projects" className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <input
                            type="text"
                            value={project.title}
                            onChange={(e) => setProject({ ...project, title: e.target.value })}
                            className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder-gray-600 w-full"
                            placeholder="Project Title"
                        />
                        <p className="text-gray-400 text-sm">Status: <span className="text-orange-400">In Progress</span></p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: MAIN EDITOR */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Overview & Problem */}
                    <section className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 font-bold text-gray-300 uppercase tracking-widest text-xs">
                            <FileText size={14} /> Project Details
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Overview</label>
                            <textarea
                                value={project.overview}
                                onChange={(e) => setProject({ ...project, overview: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none min-h-[80px]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Problem Statement</label>
                            <textarea
                                value={project.problem}
                                onChange={(e) => setProject({ ...project, problem: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none min-h-[80px]"
                            />
                        </div>
                    </section>

                    {/* Milestones */}
                    <section className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 font-bold text-gray-300 uppercase tracking-widest text-xs">
                                <CheckCircle size={14} /> Implementation Plan
                            </div>
                            <Button size="sm" variant="ghost" className="text-indigo-400 hover:bg-indigo-900/20 h-7 text-xs">+ Add Step</Button>
                        </div>
                        <div className="space-y-2">
                            {project.milestones.map(m => (
                                <div key={m.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800/50 hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => toggleMilestone(m.id)}>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${m.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                                        {m.completed && <Check size={12} />}
                                    </div>
                                    <span className={`flex-1 text-sm ${m.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m.title}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Code Placeholder */}
                    <section className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 min-h-[200px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 font-bold text-gray-300 uppercase tracking-widest text-xs">
                                <Code size={14} /> Code Repository
                            </div>
                            <Button size="sm" className="h-7 text-xs bg-gray-800 hover:bg-gray-700">Open in Builder</Button>
                        </div>
                        <div className="flex-1 border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-black/20 gap-2">
                            <Code size={32} className="opacity-20" />
                            <p className="text-sm">Link your GitHub repo or use the internal Builder.</p>
                        </div>
                    </section>
                </div>

                {/* RIGHT: META INFO */}
                <div className="space-y-6">
                    {/* Tech Stack */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 font-bold text-gray-300 uppercase tracking-widest text-xs mb-4">
                            <Layers size={14} /> Tech Stack
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TECH_OPTIONS.map(tech => (
                                <button
                                    key={tech}
                                    onClick={() => toggleTech(tech)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${project.techStack.includes(tech)
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                        : 'bg-black/30 border-gray-800 text-gray-500 hover:border-gray-600'
                                        }`}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Learning Outcome */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 font-bold text-gray-300 uppercase tracking-widest text-xs mb-4">
                            <Lightbulb size={14} /> Learning Breakdown
                        </div>
                        <textarea
                            value={project.learningOutcome}
                            onChange={(e) => setProject({ ...project, learningOutcome: e.target.value })}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none min-h-[80px] mb-4"
                            placeholder="What did you learn?"
                        />
                        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-xs text-purple-200">
                            <strong>AI Tip:</strong> "Mention specific challenges you solved with Redux state management to boost your resume value."
                        </div>
                    </div>

                    {/* Action */}
                    <Link to="/builder" className="block w-full">
                        <Button className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20">
                            <Play className="w-5 h-5 mr-2 fill-current" /> Open Work Bench
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}


