import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Loader2, CheckCircle, GitMerge } from 'lucide-react';

export const OmegaDependencyTree = ({ projectId }: { projectId: string }) => {
    const [registry, setRegistry] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistry = async () => {
            try {
                const token = localStorage.getItem('fbrts_token');
                const res = await fetch(`/api/collage-project/${projectId}/registry`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRegistry(data.registry || []);
                }
            } catch (err) {
                console.error("Failed to load Omega File Registry:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistry();
        const interval = setInterval(fetchRegistry, 3000);
        return () => clearInterval(interval);
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 text-[#818cf8]">
                <Loader2 className="animate-spin mr-3" size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">Initializing Omega Tracker...</span>
            </div>
        );
    }

    return (
        <div className="bg-[#030304]/80 backdrop-blur-xl border border-[#ffffff]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-[#ffffff]/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 flex items-center justify-center border border-[#6366f1]/50">
                        <GitMerge className="text-[#818cf8]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase text-white tracking-widest">Omega File Matrix</h2>
                        <p className="text-[10px] text-[#ffffff]/40 uppercase tracking-[0.2em] font-bold">Topological Dependency Resolution</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-[#10b981]">{registry.filter(f => f.status === 'completed').length} <span className="text-sm text-[#ffffff]/30">/ {registry.length || '...'}</span></div>
                    <p className="text-[9px] uppercase tracking-widest text-[#ffffff]/40 font-bold">Files Compiled</p>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                {registry.map((file, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={file._id} 
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${file.status === 'completed' ? 'bg-[#10b981]/5 border-[#10b981]/20' : file.status === 'generating' ? 'bg-[#f59e0b]/5 border-[#f59e0b]/20' : 'bg-[#16161e] border-[#ffffff]/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            {file.status === 'completed' ? <CheckCircle className="text-[#10b981]" size={16} /> : file.status === 'generating' ? <Loader2 className="text-[#f59e0b] animate-spin" size={16} /> : <FileCode className="text-[#ffffff]/20" size={16} />}
                            <div>
                                <h4 className="text-xs font-bold text-white tracking-wide">{file.filePath}</h4>
                                {file.dependsOn?.length > 0 && (
                                    <p className="text-[9px] text-[#ffffff]/40 font-mono mt-1">Depends on: {file.dependsOn.length} nodes</p>
                                )}
                            </div>
                        </div>
                        <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${file.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' : file.status === 'generating' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ffffff]/5 text-[#ffffff]/30'}`}>
                            {file.status}
                        </div>
                    </motion.div>
                ))}
                
                {registry.length === 0 && (
                    <div className="text-center p-8 text-[#ffffff]/30 text-xs font-bold uppercase tracking-widest border border-dashed border-[#ffffff]/10 rounded-xl">
                        Awaiting Architect Blueprint...
                    </div>
                )}
            </div>
        </div>
    );
};
