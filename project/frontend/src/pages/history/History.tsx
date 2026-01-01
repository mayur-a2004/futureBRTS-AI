// @ts-nocheck
import { Clock, Zap, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function History() {
    const { sessions, setActiveSession } = useAuth();
    const navigate = useNavigate();

    const handleOpenSession = (id: string) => {
        setActiveSession(id);
        navigate("/builder");
    };

    return (
        <div className="text-white space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Your Thinking Sessions</h1>
                    <p className="text-gray-400">Review your past explorations and roadmaps.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {sessions.length > 0 ? (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => handleOpenSession(session.id)}
                            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all cursor-pointer group flex justify-between items-center"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{session.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.timestamp).toLocaleDateString()}</span>
                                        <span>{session.messages.length} messages</span>
                                    </div>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-white/5">
                        <div className="text-gray-600 font-bold uppercase tracking-widest text-xs">No sessions found</div>
                        <p className="text-gray-400 max-w-xs mx-auto">Start your first thinking session to begin building your future roadmap.</p>
                        <button
                            onClick={() => navigate('/builder')}
                            className="px-6 py-2 bg-white text-black font-black rounded-lg text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all"
                        >
                            Start Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
