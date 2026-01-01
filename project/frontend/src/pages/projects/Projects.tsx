import { motion } from "framer-motion"
import { Plus, ExternalLink, Globe, Layout, Database } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"

const projects = [
    {
        id: 1,
        title: "E-Commerce Dashboard",
        description: "A full-stack dashboard with React, Node.js, and analytics.",
        icon: <Layout className="w-6 h-6 text-indigo-400" />,
        status: "In Progress",
        completion: 65,
        tech: ["React", "Tailwind", "Node.js"]
    },
    {
        id: 2,
        title: "Portfolio V1",
        description: "Personal portfolio website with dark mode and animations.",
        icon: <Globe className="w-6 h-6 text-green-400" />,
        status: "Completed",
        completion: 100,
        tech: ["React", "Framer Motion"]
    },
    {
        id: 3,
        title: "Task API",
        description: "REST API for task management with authentication.",
        icon: <Database className="w-6 h-6 text-blue-400" />,
        status: "Planned",
        completion: 0,
        tech: ["Express", "MongoDB"]
    }
]

export default function Projects() {
    return (
        <div className="text-white space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Projects</h1>
                    <p className="text-gray-400">Build, deploy, and showcase your work.</p>
                </div>
                <Link to="/projects/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Card */}
                <Link to="/projects/new" className="border border-gray-800 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-white hover:border-gray-600 hover:bg-gray-900/50 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-gray-900 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <div className="font-bold">Create New Project</div>
                        <div className="text-xs">Start from scratch or template</div>
                    </div>
                </Link>

                {projects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-800 rounded-lg">{project.icon}</div>
                            {project.status === "In Progress" && <span className="text-xs bg-indigo-900/20 text-indigo-400 px-2 py-1 rounded font-medium">In Progress</span>}
                            {project.status === "Completed" && <span className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded font-medium">Completed</span>}
                            {project.status === "Planned" && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-medium">Planned</span>}
                        </div>

                        <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-400 mb-6 flex-1">{project.description}</p>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {project.tech.map(t => (
                                    <span key={t} className="text-xs border border-gray-700 rounded px-2 py-0.5 text-gray-400">{t}</span>
                                ))}
                            </div>

                            {project.status === "In Progress" && (
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-gray-500">
                                        <span>Progress</span>
                                        <span>{project.completion}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.completion}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-800 flex gap-2">
                                <Link to={`/projects/${project.id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full border-gray-700 hover:bg-gray-800">Edit</Button>
                                </Link>
                                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 px-3"><ExternalLink className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
