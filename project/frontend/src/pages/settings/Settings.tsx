import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bell, Shield, Wallet, Lock, Palette, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useTheme } from "@/context/ThemeContext"

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("account")

    const tabs = [
        { id: "account", label: "Account", icon: <User size={18} /> },
        { id: "appearance", label: "Appearance", icon: <Palette size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
        { id: "security", label: "Security", icon: <Shield size={18} /> },
        { id: "billing", label: "Billing", icon: <Wallet size={18} /> },
    ]

    const themes = [
        { id: 'future', name: 'Dark Neon', color: 'bg-indigo-600' },
        { id: 'light', name: 'Minimal Light', color: 'bg-slate-200' },
        { id: 'blue', name: 'Cyber Blue', color: 'bg-blue-500' },
        { id: 'violet', name: 'Glass Violet', color: 'bg-purple-600' }
    ];

    return (
        <div className="text-white space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-gray-800">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut size={18} /> Log Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-gray-900/30 border border-gray-800 rounded-2xl p-8 min-h-[500px]">

                    {activeTab === "account" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Profile Information</h3>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-full h-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Button size="sm" variant="outline" className="border-gray-600">Change Avatar</Button>
                                        <div className="text-xs text-gray-500">JPG, GIF or PNG. Max size 800K</div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                                        <input type="text" defaultValue="Alex Johnson" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                                        <input type="email" defaultValue="alex@futurebuilder.com" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Username</label>
                                        <input type="text" defaultValue="@alex.dev" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-800">
                                <Button className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "appearance" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Theme & Appearance</h3>
                                <p className="text-gray-400 text-sm mb-6">Choose a theme that fits your vibe.</p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id as any)}
                                            className={`relative p-4 rounded-xl border transition-all text-left group ${theme === t.id
                                                ? 'bg-gray-800 border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                                }`}
                                        >
                                            <div className={`w-full h-24 rounded-lg mb-3 ${t.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                            <div className="font-medium">{t.name}</div>
                                            {theme === t.id && (
                                                <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "notifications" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Email Notifications</h3>
                            <div className="space-y-4">
                                {["Job Alerts", "Course Recommendations", "Weekly Digest", "New Features"].map(item => (
                                    <div key={item} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                                        <span className="font-medium">{item}</span>
                                        <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "security" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Security</h3>
                            <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex items-start gap-4">
                                <Lock className="text-indigo-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-indigo-100">2-Factor Authentication</h4>
                                    <p className="text-sm text-indigo-300 mt-1">Make your account extra secure. Along with your password, you'll need to enter a code.</p>
                                    <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700">Enable 2FA</Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="font-bold">Password</h4>
                                <Button variant="outline" className="border-gray-600">Change Password</Button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "billing" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Current Plan</h3>
                            <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Current Subscription</div>
                                    <div className="text-2xl font-bold text-white">Free Plan</div>
                                </div>
                                <Button className="bg-white text-black hover:bg-gray-200">Upgrade to Pro</Button>
                            </div>

                            <h3 className="text-lg font-bold mt-8 mb-4">Payment Methods</h3>
                            <div className="p-4 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 cursor-pointer transition-all">
                                + Add Payment Method
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
