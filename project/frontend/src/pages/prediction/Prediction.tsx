import { useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, Briefcase, Sliders } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/Button";

const data = [
    { year: '2025', salary: 80000, market: 75000 },
    { year: '2026', salary: 95000, market: 82000 },
    { year: '2027', salary: 115000, market: 95000 },
    { year: '2028', salary: 140000, market: 110000 },
    { year: '2029', salary: 175000, market: 130000 },
];

export default function Prediction() {
    const [viewMode, setViewMode] = useState<'salary' | 'role'>('salary');

    return (
        <div className="text-white space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Future Probability Engine</h1>
                    <p className="text-gray-400">AI-forecasted trajectory based on market data and your growth rate.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={viewMode === 'salary' ? 'default' : 'outline'}
                        onClick={() => setViewMode('salary')}
                        className={viewMode === 'salary' ? 'bg-emerald-600' : 'border-gray-700'}
                    >
                        Salary View
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'role' ? 'default' : 'outline'}
                        onClick={() => setViewMode('role')}
                        className={viewMode === 'role' ? 'bg-emerald-600' : 'border-gray-700'}
                    >
                        Role View
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Trajectory Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-6 rounded-2xl relative overflow-hidden flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">
                            {viewMode === 'salary' ? 'Estimated Buying Power' : 'Role Evolution Path'}
                        </h3>
                        <div className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                            +12% vs Market Avg
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" stroke="#4b5563" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#4b5563" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                    formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Annual Compensation']}
                                />
                                <Area type="monotone" dataKey="salary" stroke="#10b981" fillOpacity={1} fill="url(#colorSalary)" strokeWidth={3} />
                                <Area type="monotone" dataKey="market" stroke="#6b7280" fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Key Insights & Assumptions */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900 border border-gray-800 p-6 rounded-xl"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign /></div>
                            <div>
                                <div className="text-sm text-gray-400">Projected Earning Potential</div>
                                <div className="text-3xl font-bold text-white">$175k<span className="text-sm text-gray-500 font-normal">/yr</span></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 border-t border-gray-800 pt-3">
                            Based on reaching <span className="text-white font-bold">Staff Engineer</span> level by 2028.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-900 border border-gray-800 p-6 rounded-xl"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400"><Sliders size={14} /> Model Assumptions</h3>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                                <span className="text-gray-400">Upskilling Rate</span>
                                <span className="text-emerald-400">Aggressive</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                                <span className="text-gray-400">Location</span>
                                <span className="text-white">Tier 1 City (US/Remote)</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                                <span className="text-gray-400">Promotion Cycle</span>
                                <span className="text-white">Every 2 Years</span>
                            </div>
                            <Button size="sm" variant="outline" className="w-full text-xs border-dashed border-gray-700 text-gray-500 mt-2 hover:text-white">Edit Assumptions</Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <section className="bg-gradient-to-r from-emerald-900/10 to-transparent border-t border-gray-800 pt-8 mt-8">
                <div className="flex lg:flex-row flex-col items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Predicted Role Evolution</h3>
                            <p className="text-gray-400 text-sm">Most likely career path based on current dataset.</p>
                        </div>
                    </div>

                    {/* Role Steps Link */}
                    <div className="flex items-center gap-2">
                        {['Junior Dev', 'Senior Engineer', 'Tech Lead', 'Staff Engineer'].map((role, i) => (
                            <div key={role} className="flex items-center">
                                <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${i === 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>
                                    {role}
                                </div>
                                {i < 3 && <div className="w-8 h-0.5 bg-gray-800 mx-1" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
