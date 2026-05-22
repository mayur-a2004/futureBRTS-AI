import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, HelpCircle } from 'lucide-react';

interface ModalOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'confirm' | 'alert' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    confirm: (options: ModalOptions) => Promise<boolean>;
    showAlert: (title: string, message: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modal, setModal] = useState<(ModalOptions & { id: string; resolve: (val: boolean) => void }) | null>(null);

    const confirm = useCallback((options: ModalOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModal({
                ...options,
                id: Math.random().toString(36).substr(2, 9),
                resolve
            });
        });
    }, []);

    const showAlert = useCallback((title: string, message: string) => {
        setModal({
            title,
            message,
            type: 'alert',
            confirmText: 'Okay',
            id: Math.random().toString(36).substr(2, 9),
            resolve: () => { }
        });
    }, []);

    const handleConfirm = () => {
        if (modal) {
            modal.resolve(true);
            if (modal.onConfirm) modal.onConfirm();
            setModal(null);
        }
    };

    const handleCancel = () => {
        if (modal) {
            modal.resolve(false);
            if (modal.onCancel) modal.onCancel();
            setModal(null);
        }
    };

    return (
        <ModalContext.Provider value={{ confirm, showAlert }}>
            {children}
            <AnimatePresence mode="wait">
                {modal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancel}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden glass-morphism p-8"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]" />

                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${modal.type === 'alert' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'} animate-pulse`}>
                                    {modal.type === 'alert' ? <AlertCircle size={32} /> : <HelpCircle size={32} />}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black tracking-tight text-white">{modal.title}</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium px-4">
                                        {modal.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 w-full pt-4">
                                    {modal.type !== 'alert' && (
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            {modal.cancelText || 'Cancel'}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleConfirm}
                                        className={`flex-1 px-6 py-3.5 rounded-2xl ${modal.type === 'alert' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-sm font-black text-white shadow-xl shadow-indigo-500/20 transition-all active:scale-95`}
                                    >
                                        {modal.confirmText || 'Confirm'}
                                    </button>
                                </div>
                            </div>

                            {/* Close cross */}
                            <button
                                onClick={handleCancel}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};
