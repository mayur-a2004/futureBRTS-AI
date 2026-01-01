import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('LOADING');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('SUCCESS');
                setMsg(data.message || 'Check your email for instructions.');
            } else {
                setStatus('ERROR');
                setMsg(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('ERROR');
            setMsg('Network error. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="w-full max-w-md bg-[#09090b]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                <Link to="/auth/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Login
                </Link>

                <div className="mb-6 space-y-2">
                    <h1 className="text-2xl font-black tracking-tight text-white">Reset Password</h1>
                    <p className="text-gray-400 text-sm">Enter your registered email architecture to receive vault recovery protocols.</p>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center space-y-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-green-400 font-bold mb-1">Link Sent</h3>
                            <p className="text-gray-400 text-xs">{msg}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Email Architecture</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                    placeholder="architect@future.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {status === 'ERROR' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-xs font-medium">
                                <AlertCircle size={16} />
                                {msg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={status === 'LOADING'}
                            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold uppercase tracking-wider"
                        >
                            {status === 'LOADING' ? 'Sending Protocol...' : 'Send Recovery Link'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
