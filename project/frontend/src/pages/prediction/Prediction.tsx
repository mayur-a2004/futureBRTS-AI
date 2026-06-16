import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UniverseBackground from '@/components/ui/UniverseBackground';

export default function Prediction() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
            <UniverseBackground intensity={0.5} />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl w-full bg-[#080809]/85 border border-white/10 rounded-3xl p-8 md:p-12 text-center backdrop-blur-2xl shadow-[0_0_80px_rgba(34,211,238,0.2)] relative z-10 space-y-8"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 rounded-t-3xl" />
                
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, -180, -360],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap size={40} className="text-cyan-400 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">PROBABILITY_MATRIX :: SYNC</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase leading-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-400 bg-clip-text text-transparent pt-2">
                        Future Forecasting
                    </h1>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                        The Neural Trajectory Engines and Monte Carlo predictive modules are calibrating global sync parameters.
                    </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="font-bold uppercase tracking-widest">Calibration Progress</span>
                        <span className="font-bold text-cyan-400">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "88%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full h-12 bg-white text-black hover:bg-cyan-600 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all border-none"
                    >
                        RETURN_TO_COMMAND
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
