// 👉 Builder Workspace Page
// 👉 Isme user ka aggregated profile, onboarding insights aur captured intent dikhta hai

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { builderApi } from "../api/builder.api";
import UniverseBackground from "../components/ui/UniverseBackground";
import { SafeRender } from "../components/SafeRender";
import { motion } from "framer-motion";

export default function Builder() {
    const navigate = useNavigate();
    const { isAuthenticated, onboardingCompleted } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('fb_token');

    useEffect(() => {
        // 👉 Pehle auth aur onboarding status check karna
        if (!isAuthenticated) return navigate('/auth/login');
        if (!onboardingCompleted) return navigate('/onboarding');

        const loadBuilderData = async () => {
            try {
                // 👉 Path: GET /api/builder/entry
                const res = await builderApi.getEntryData(token || "");
                if (res.success) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Failed to load builder data");
            } finally {
                setLoading(false);
            }
        };
        loadBuilderData();
    }, [isAuthenticated, onboardingCompleted, token, navigate]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Initializing Workspace...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-10 font-sans">
            <UniverseBackground intensity={0.2} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-12 relative z-10"
            >
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black">Builder Workspace</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Specialized Roadmap Engine v2.0</p>
                    </div>
                </header>

                <SafeRender data={data} fallback={<div className="text-gray-500">No data found in workspace.</div>}>
                    {(workspace: any) => (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Profile Sidebar */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">User Profile</h2>
                                    <div className="space-y-4">
                                        <p className="text-lg font-bold">{workspace.profile?.firstName} {workspace.profile?.lastName}</p>
                                        <p className="text-gray-500">{workspace.profile?.email}</p>
                                        <div className="pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">Age / DOB</span>
                                            <p className="font-bold">{workspace.profile?.age} Years</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">Strategic Intent Captured</h2>
                                    <p className="text-2xl font-black italic">"{workspace.capturedIntent?.text || workspace.capturedIntent || 'No intent captured'}"</p>
                                </div>

                                <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl">
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">Onboarding Summary</h2>
                                    <div className="space-y-4">
                                        {workspace.onboarding?.map((step: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02]">
                                                <span className="text-gray-500 font-bold">{step.step}</span>
                                                <span className="font-black text-indigo-400">Completed</span>
                                            </div>
                                        )) || <p className="text-gray-500">No onboarding steps found.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SafeRender>
            </motion.div>
        </div>
    );
}
