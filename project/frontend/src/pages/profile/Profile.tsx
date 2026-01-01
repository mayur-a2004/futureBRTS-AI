import { MapPin, Link as LinkIcon, Github, Linkedin, Mail, BadgeCheck, Globe, Code, Activity } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function Profile() {
    return (
        <div className="text-white space-y-8">
            {/* Header / Cover */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 right-4">
                        <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white">Edit Cover</Button>
                    </div>
                </div>

                <div className="px-8 flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full" />
                    </div>
                    <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold">Alex Johnson</h1>
                            <BadgeCheck className="text-blue-500 w-6 h-6" fill="currentColor" />
                        </div>
                        <p className="text-gray-400">Frontend Engineer • React Enthusiast • Building FutureBuilder</p>
                    </div>
                    <div className="pb-2 flex gap-3">
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="rounded-full bg-gray-900/50 border border-gray-700 hover:bg-gray-800"><Github size={18} /></Button>
                            <Button size="icon" variant="ghost" className="rounded-full bg-gray-900/50 border border-gray-700 hover:bg-gray-800"><Linkedin size={18} /></Button>
                            <Button size="icon" variant="ghost" className="rounded-full bg-gray-900/50 border border-gray-700 hover:bg-gray-800"><Globe size={18} /></Button>
                        </div>
                        <Button>Share Profile</Button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 px-4">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                        <h3 className="font-bold mb-4">About</h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            Passionate developer aimed at creating intuitive and dynamic user experiences. Currently mastering Advanced React patterns and System Design.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 text-sm text-gray-400">
                            <div className="flex items-center gap-2"><MapPin size={16} /> San Francisco, CA</div>
                            <div className="flex items-center gap-2"><Mail size={16} /> alex@futurebuilder.com</div>
                            <div className="flex items-center gap-2"><LinkIcon size={16} /> alex.dev</div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl">
                        <h3 className="font-bold mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {["React", "TypeScript", "Node.js", "TailwindCSS", "PostgreSQL", "Figma", "AWS"].map(skill => (
                                <span key={skill} className="text-xs bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-gray-300 hover:bg-gray-700 transition-colors cursor-default">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Portfolio Grid */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Code className="text-indigo-400" /> Featured Projects</h2>
                            <span className="text-sm text-indigo-400 cursor-pointer">View All</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 relative">
                                    <div className="h-40 bg-gray-800 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                                    </div>
                                    <div className="p-4 relative">
                                        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">E-Commerce Platform</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-3">Next.js, Stripe, Tailwind</p>
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-xs text-gray-400">Live</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Activity Feed */}
                    <section>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Activity className="text-green-400" /> Recent Activity</h2>
                        <div className="space-y-6 pl-4 border-l-2 border-gray-800">
                            {[
                                { title: "Completed 'Advanced React' Course", time: "2 days ago", type: "Course" },
                                { title: "Deployed 'Portfolio V2'", time: "4 days ago", type: "Project" },
                                { title: "Earned 'Bug Hunter' Badge", time: "1 week ago", type: "Award" },
                            ].map((act, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-900" />
                                    <h4 className="text-sm font-bold text-gray-200">{act.title}</h4>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                        <span>{act.type}</span> • <span>{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

