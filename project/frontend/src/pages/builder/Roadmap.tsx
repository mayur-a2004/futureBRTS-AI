import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, PlayCircle, Loader2, Target, Download } from "lucide-react";

export default function Roadmap() {
    const navigate = useNavigate();
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        const token = localStorage.getItem('fb_token');
        try {
            const res = await fetch('/api/roadmap', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setRoadmaps(data.roadmaps);
            }
        } catch (e) { } finally { setLoading(false); }
    };

    const generateRoadmap = async () => {
        setGenerating(true);
        const token = localStorage.getItem('fb_token');

        // Find latest session
        const sessionRes = await fetch('/api/builder/sessions', { headers: { 'Authorization': `Bearer ${token}` } });
        const sessionData = await sessionRes.json();
        const latestSessionId = sessionData.sessions?.[0]?._id;

        if (latestSessionId) {
            const res = await fetch('/api/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ sessionId: latestSessionId })
            });
            const data = await res.json();
            if (data.success) {
                await fetchRoadmaps();
            }
        }
        setGenerating(false);
    }

    const convertToTasks = async (roadmapId: string) => {
        const token = localStorage.getItem('fb_token');
        await fetch('/api/roadmap/convert-tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ roadmapId })
        });
        alert("Tasks Created! Check Dashboard.");
    }

    if (loading) return <div className="h-screen flex items-center justify-center text-white bg-black">Loading Strategy...</div>;

    const activeRoadmap = roadmaps[0];

    return (
        <div className="flex flex-col h-screen overflow-hidden text-white bg-transparent">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-[#09090b]/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/builder')}>
                        <ArrowLeft size={18} /> Back to Builder
                    </Button>
                    <span className="font-bold">Strategic Roadmap</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                {!activeRoadmap ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <Target size={64} className="text-gray-600" />
                        <h2 className="text-2xl font-bold">No Roadmap Found</h2>
                        <p className="text-gray-400 max-w-md text-center">Your strategy hasn't been crystallized yet. Generate one from your latest architectural session.</p>
                        <Button onClick={generateRoadmap} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-6 rounded-full font-bold">
                            {generating ? <Loader2 className="animate-spin" /> : <PlayCircle className="mr-2" />}
                            Generate Strategy
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black">{activeRoadmap.title}</h1>
                                <p className="text-gray-400">Generated Strategy Plan</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={() => alert("Downloading PDF... (Mock)")}>
                                    <Download size={16} className="mr-2" /> PDF
                                </Button>
                                <Button onClick={() => convertToTasks(activeRoadmap._id)} variant="outline" className="border-white/20 hover:bg-white/10">
                                    <CheckCircle size={16} className="mr-2" /> Convert to Tasks
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activeRoadmap.steps.map((step: any, i: number) => (
                                <div key={i} className="group bg-[#09090b]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 font-black text-xl text-gray-500 group-hover:text-white transition-colors">
                                            {step.stepNumber}
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{step.title}</h3>
                                            <p className="text-gray-400 leading-relaxed">{step.why}</p>

                                            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                                                <div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Action</div>
                                                    <div className="text-sm text-gray-300">{step.whatToDo}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Outcome</div>
                                                    <div className="text-sm text-gray-300">{step.expectedOutcome}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Risk</div>
                                                    <div className="text-sm text-gray-300">{step.risk}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
