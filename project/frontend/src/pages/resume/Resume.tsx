import { FileText, Download, Share2, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function Resume() {
    return (
        <div className="text-white space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Smart Resume</h1>
                    <p className="text-gray-400">AI-optimized for Applicant Tracking Systems (ATS).</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700 bg-black hover:bg-gray-900"><Share2 className="mr-2 w-4 h-4" /> Share</Button>
                    <Button className="bg-white text-black hover:bg-gray-200"><Download className="mr-2 w-4 h-4" /> PDF</Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Resume Preview */}
                <div className="lg:col-span-2 bg-white text-black p-12 rounded shadow-2xl min-h-[800px] relative overflow-hidden">
                    {/* Header */}
                    <div className="border-b-2 border-gray-800 pb-6 mb-8">
                        <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">Alex Johnson</h1>
                        <p className="text-xl text-indigo-600 font-medium mt-1">Frontend Engineer</p>
                        <div className="flex gap-4 mt-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Mail size={14} /> alex@FutureBRTS.com</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> +1 (555) 012-3456</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> San Francisco, CA</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Summary</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Passionate Frontend Engineer with 3+ years of experience building responsive, user-centric web applications.
                                Expert in React ecosystem and modern UI/UX principles. Proven track record of improving site performance by 40%.
                            </p>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Experience</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between font-bold text-gray-800">
                                        <span>Senior React Developer</span>
                                        <span>2023 - Present</span>
                                    </div>
                                    <div className="text-indigo-600 text-sm font-medium mb-1">TechFlow Inc.</div>
                                    <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                                        <li>Led migration of legacy PHP app to Next.js, reducing load times by 60%.</li>
                                        <li>Mentored 3 junior developers and established code review standards.</li>
                                        <li>Implemented comprehensive component library using Tailwind CSS.</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex justify-between font-bold text-gray-800">
                                        <span>Frontend Developer</span>
                                        <span>2021 - 2023</span>
                                    </div>
                                    <div className="text-indigo-600 text-sm font-medium mb-1">StartUp Rocket</div>
                                    <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                                        <li>Built core dashboard features serving 10k+ daily active users.</li>
                                        <li>Integrated Stripe payment gateway and real-time socket notifications.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                <span className="px-2 py-1 bg-gray-100 rounded">React.js</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">TypeScript</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">Next.js</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">Node.js</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">GraphQL</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">Tailwind CSS</span>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Editor / Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                        <h3 className="font-bold mb-4">AI Suggestions</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                                <FileText className="text-indigo-400 mt-1 shrink-0" size={16} />
                                <div>
                                    <div className="text-sm font-bold text-indigo-200">Missing Keyword</div>
                                    <p className="text-xs text-indigo-300/80 mt-1">Job descriptions for this role often mention "CI/CD pipelines". Consider adding it to skills.</p>
                                    <Button size="sm" className="mt-2 h-7 text-xs bg-indigo-600">Auto-Fix</Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <FileText className="text-red-400 mt-1 shrink-0" size={16} />
                                <div>
                                    <div className="text-sm font-bold text-red-200">Formatting Issue</div>
                                    <p className="text-xs text-red-300/80 mt-1">Your summary is slightly too long. Try cutting 20 words.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                        <h3 className="font-bold mb-4">Templates</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[3/4] bg-gray-800 rounded-lg cursor-pointer hover:ring-2 ring-indigo-500 transition-all opacity-70 hover:opacity-100" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
