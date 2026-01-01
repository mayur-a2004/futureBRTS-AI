import { motion } from "framer-motion"
import { Target, Award, Clock, Brain, Briefcase, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const { user } = useAuth();
    const [onboardingData, setOnboardingData] = useState<any>(null);

    useEffect(() => {
        const data = localStorage.getItem('futurebuilder_onboarding');
        if (data) {
            setOnboardingData(JSON.parse(data));
        }
    }, []);

    // Derived States
    const userRole = onboardingData?.userType ? onboardingData.userType.replace('_', ' ').toUpperCase() : 'STUDENT';
    const goal = onboardingData?.goals?.[0] || 'Software Engineer';
    const currentStage = onboardingData?.degree || onboardingData?.stream || 'General';

    // Dynamic stats
    const stats = [
        { label: "Job Matches", value: "12", icon: <Briefcase size={20} className="text-indigo-400" />, change: "+3 today" },
        { label: "Skill Gap", value: "3", icon: <Brain size={20} className="text-purple-400" />, change: "Critical skills" },
        { label: "Applications", value: "0", icon: <Zap size={20} className="text-yellow-400" />, change: "Get started" },
        { label: "Study Hours", value: "0", icon: <Clock size={20} className="text-blue-400" />, change: "Start learning" },
    ];

    return (
        <div className="text-white space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Builder'}</h1>
                    <p className="text-gray-400">
                        You're exploring <strong>{currentStage}</strong> path towards <strong>{goal}</strong>.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-400 mb-1">Profile Strength</div>
                    <div className="text-xl font-bold text-indigo-400">45% Beginner</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl hover:bg-gray-900 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-gray-800 rounded-lg">{stat.icon}</div>
                            <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-0.5 rounded">{stat.change}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Feed / Recommendations */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="text-indigo-400" /> Recommended Actions
                    </h2>

                    {/* Action Card 1: Dynamic based on Goal */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 flex items-center gap-6"
                    >
                        <div className="p-4 bg-indigo-500/10 rounded-full">
                            <Brain className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Master {goal} Skills</h3>
                            <p className="text-sm text-gray-400 mb-3">To reach your goal of "{goal}", you need to build a portfolio project.</p>
                            <div className="flex gap-3">
                                <Link to="/skill-gap">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Check Skills</Button>
                                </Link>
                                <Button size="sm" variant="outline" className="border-gray-700">Dismiss</Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Card 2: Builder Upsell */}
                    <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center gap-6">
                        <div className="p-4 bg-purple-500/10 rounded-full">
                            <Zap className="w-8 h-8 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Build Your First Project</h3>
                            <p className="text-sm text-gray-400 mb-3">Use the AI Builder to generate a project for your portfolio.</p>
                            <div className="flex gap-3">
                                <Link to="/builder">
                                    <Button size="sm" variant="secondary">Open Builder</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div>
                        <div className="flex justify-between items-center mb-4 mt-8">
                            <h2 className="text-xl font-bold">Recent Projects</h2>
                            <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link to="/builder" className="bg-gray-900 border border-gray-800 border-dashed p-4 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all min-h-[150px]">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                                    <span className="text-2xl">+</span>
                                </div>
                                <span className="font-medium">New Project</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Progress */}
                <div className="space-y-6">
                    <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Award className="text-yellow-400" /> Career Path</h3>
                        <div className="relative pl-4 space-y-6 border-l-2 border-gray-800">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                                <div className="text-sm font-bold text-green-400">{userRole}</div>
                                <div className="text-xs text-gray-500">Starting Point</div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-black shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                <div className="text-sm font-bold text-white">{goal}</div>
                                <div className="text-xs text-indigo-400">Target Goal</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-b from-indigo-900/20 to-transparent border border-gray-800 rounded-xl">
                        <h3 className="font-bold mb-2">Upgrade to Pro</h3>
                        <p className="text-sm text-gray-400 mb-4">Get unlimited AI resume scans and career predictions.</p>
                        <Link to="/pricing">
                            <Button size="sm" className="w-full bg-white text-black hover:bg-gray-200">View Plans</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
