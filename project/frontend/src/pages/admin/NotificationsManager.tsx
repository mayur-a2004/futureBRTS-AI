import { useState } from 'react';
import {
    Bell,
    Send,
    Users,
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function NotificationsManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [notificationType, setNotificationType] = useState('system');
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');

    const handleSend = async () => {
        if (!title || !message) {
            toast.error("Protocol error: Title and Message are mandatory.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, message, type: notificationType })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Broadcast Signal Dispatched Successfully.");
                setTitle('');
                setMessage('');
            } else {
                toast.error(data.error || "Broadcast failed.");
            }
        } catch (err) {
            toast.error("Network error during broadcast.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">Global Broadcast Center</h1>
                <p className="text-gray-400 mt-1 font-medium">Communicate directly with the entire user base via the neural notification layer.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <Send size={20} className="text-rose-400" />
                            </div>
                            <h2 className="text-lg font-black text-white">Broadcast Protocol</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setNotificationType('system')}
                                    className={`p-4 rounded-2xl border transition-all text-left ${notificationType === 'system' ? 'bg-indigo-600/10 border-indigo-500/50 text-white' : 'bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Zap size={18} className={notificationType === 'system' ? 'text-indigo-400' : 'text-gray-600'} />
                                        <span className="text-xs font-black uppercase tracking-widest">System Alert</span>
                                    </div>
                                    <p className="text-[10px] font-bold leading-tight opacity-60">High-priority system-wide announcements and updates.</p>
                                </button>
                                <button
                                    onClick={() => setNotificationType('marketing')}
                                    className={`p-4 rounded-2xl border transition-all text-left ${notificationType === 'marketing' ? 'bg-purple-600/10 border-purple-500/50 text-white' : 'bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Bell size={18} className={notificationType === 'marketing' ? 'text-purple-400' : 'text-gray-600'} />
                                        <span className="text-xs font-black uppercase tracking-widest">Promotion</span>
                                    </div>
                                    <p className="text-[10px] font-bold leading-tight opacity-60">Engagement signals, feature reveals, and pricing events.</p>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Signal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                    placeholder="Enter Broadcast Title..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Message Body (Markdown Supported)</label>
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white resize-none"
                                    placeholder="Translate your intent into a user-facing broadcast..."
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Dispatch Global Signal
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white tracking-tight">Signal Analysis</h2>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Users size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Audience</p>
                                <p className="text-lg font-black text-white">4,281 Identities</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                </div>
                                <p className="text-xs text-gray-400 leading-tight font-bold">Email dispatch protocols verified.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                </div>
                                <p className="text-xs text-gray-400 leading-tight font-bold">In-app UI toast layer synchronized.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-0.5">
                                    <AlertTriangle size={14} className="text-amber-400" />
                                </div>
                                <p className="text-xs text-gray-400 leading-tight font-bold">Push notification tokens mapped (82% coverage).</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recent Broadcasts</h3>
                            <div className="space-y-3">
                                {[
                                    { title: "v1.2.0 Deploy", time: "2h ago", type: "system" },
                                    { title: "Weekend Sprint", time: "1d ago", type: "marketing" },
                                ].map((b, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Clock size={12} className="text-gray-600" />
                                            <span className="text-xs font-bold text-gray-300">{b.title}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-600 uppercase transition-colors group-hover:text-indigo-400">{b.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
