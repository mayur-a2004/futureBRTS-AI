import { useState, useEffect } from 'react';
import {
    Search,
    CheckSquare,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    PlayCircle,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TaskManager() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/tasks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTasks(data.tasks);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to query task intelligence.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'doing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'todo': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const filteredTasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Tactical Execution Hub</h1>
                    <p className="text-gray-400 mt-1 font-medium">Manage and optimize every individual unit of progress.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search for tasks, status, or user intent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-sm font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        High Risk Only
                    </button>
                </div>
            </div>

            <div className="rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Parsing Execution Units...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.03] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Objective Units</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Architect</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Difficulty</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Units state</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Verification</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                                    <tr key={task._id} className="group hover:bg-white/[0.02] transition-colors relative">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusStyle(task.status)}`}>
                                                    <CheckSquare size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white leading-tight">{task.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{task.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                                <User size={14} className="text-indigo-500" />
                                                {task.userName || "System"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full ${i < task.difficulty_level ? 'bg-amber-500' : 'bg-white/10'}`}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                                {task.status === 'done' ? <CheckCircle2 size={12} /> :
                                                    task.status === 'doing' ? <PlayCircle size={12} className="animate-pulse" /> :
                                                        <Clock size={12} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{task.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {task.verification?.required ? (
                                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${task.verification?.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    <AlertCircle size={14} />
                                                    {task.verification?.isVerified ? 'Verified' : 'Pending Viva'}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Self-Verified</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-gray-600 italic font-medium">No tactical units identified in the execution layer.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
