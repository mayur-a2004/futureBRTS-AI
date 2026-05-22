import { useState, useEffect } from 'react';
import {
    Activity,
    Terminal,
    Clock,
    Trash2,
    Download,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TrackingLogs() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/tracking', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
            }
        } catch (err) {
            console.error(err);
            toast.error("Telemetry link failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'error': return <XCircle size={14} className="text-rose-500" />;
            case 'warn': return <AlertCircle size={14} className="text-amber-500" />;
            default: return <Activity size={14} className="text-indigo-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">System Pulse Monitor</h1>
                    <p className="text-gray-400 mt-1 font-medium">Real-time telemetry and activity logs from across the ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
                        <Download size={20} />
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-rose-500/50 hover:text-rose-400 transition-all">
                        <Trash2 size={20} />
                    </button>
                    <div className="h-10 w-px bg-white/5 mx-2" />
                    <button className="px-6 py-3 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all">
                        Live Stream: ON
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Trace event signature, user ID, or error code..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-medium font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'errors', 'warnings', 'success'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-gray-600 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-[32px] border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Tapping Signal Stream...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left font-mono">
                            <thead className="bg-white/[0.03] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Signal</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Trace Path</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Source</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                {getTypeIcon(log.type)}
                                                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{log.event}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[10px] text-indigo-400/60 font-bold">{log.path}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tight">{log.user}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${log.status >= 500 ? 'text-rose-400 bg-rose-500/10' : log.status >= 400 ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                                <Clock size={12} /> {log.time}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && (
                    <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-center">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest animate-pulse">
                            Listening for new telemetry signals...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
