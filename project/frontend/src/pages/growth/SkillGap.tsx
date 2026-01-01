import { motion } from "framer-motion"
import { Zap, ExternalLink, TrendingUp, AlertCircle } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/Button";

const data = [
    { subject: 'React', A: 90, B: 85, fullMark: 100 },
    { subject: 'TS', A: 75, B: 90, fullMark: 100 },
    { subject: 'Node', A: 60, B: 80, fullMark: 100 },
    { subject: 'System Design', A: 40, B: 80, fullMark: 100 },
    { subject: 'Testing', A: 50, B: 70, fullMark: 100 },
    { subject: 'UI/UX', A: 85, B: 60, fullMark: 100 },
];

export default function SkillGap() {
    const requiredSkills = [
        { name: "React", current: 90, required: 85, status: "good", priority: "Low" },
        { name: "TypeScript", current: 75, required: 90, status: "gap", priority: "Medium" },
        { name: "Node.js", current: 60, required: 80, status: "gap", priority: "Medium" },
        { name: "System Design", current: 40, required: 80, status: "critical", priority: "High" },
        { name: "Testing", current: 50, required: 70, status: "critical", priority: "High" },
    ];

    const recommendedCourses = [
        { platform: "Udemy", title: "Advanced System Design Patterns", duration: "18h", icon: "🏛️", link: "#" },
        { platform: "Frontend Masters", title: "Enterprise TypeScript", duration: "6h", icon: "📘", link: "#" },
        { platform: "YouTube", title: "Jest & Testing Library Crash Course", duration: "2h", icon: "🧪", link: "#" },
    ];

    return (
        <div className="text-white space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">Skill Gap Analysis</h1>
                    <p className="text-gray-400">Target Role: <span className="text-white font-medium">Senior Frontend Engineer</span></p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-2xl font-bold text-indigo-400">72%</p>
                    <p className="text-xs text-gray-500">Role Readiness</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Visual Chart Area */}
                <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm min-h-[400px] flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> Competency Map
                    </h3>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="You"
                                    dataKey="A"
                                    stroke="#818cf8"
                                    fill="#818cf8"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Target"
                                    dataKey="B"
                                    stroke="#4b5563"
                                    fill="#4b5563"
                                    fillOpacity={0.2}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 pb-4">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 bg-indigo-400/50 border border-indigo-400 rounded-full" /> You
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 bg-gray-600/50 border border-gray-600 rounded-full" /> Market Spec
                        </div>
                    </div>
                </div>

                {/* Gap List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} /> Priority Actions
                    </h3>
                    {requiredSkills.map((skill, idx) => (
                        <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-500/30 transition-all"
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <span className="font-medium mr-2">{skill.name}</span>
                                        {skill.status === 'critical' && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">CRITICAL</span>}
                                        {skill.status === 'gap' && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">GAP</span>}
                                        {skill.status === 'good' && <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">GOOD</span>}
                                    </div>
                                    <span className="text-xs text-gray-500">Target: {skill.required}%</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex relative">
                                    <div className="bg-indigo-500 h-full rounded-full z-10" style={{ width: `${skill.current}%` }} />
                                    {/* Target Marker */}
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-white opacity-50 z-20" style={{ left: `${skill.required}%` }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <section className="pt-8 border-t border-gray-900">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400 w-5 h-5" /> Recommended Actions to Close Gaps
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {recommendedCourses.map((course, idx) => (
                        <div key={idx} className="bg-gray-900/30 border border-gray-800 p-5 rounded-xl hover:border-gray-700 transition-all group cursor-pointer hover:bg-gray-900/60">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-2xl">{course.icon}</span>
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{course.duration}</span>
                            </div>
                            <h4 className="font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{course.title}</h4>
                            <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                                <span>{course.platform}</span>
                                <Button size="sm" variant="ghost" className="h-6 text-xs px-0 hover:bg-transparent hover:text-white">View <ExternalLink className="w-3 h-3 ml-1" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
