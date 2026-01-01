import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const id = searchParams.get('id'); // Assuming backend sends ID in link for finding user quickly

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('ERROR');
            setMsg("Passwords do not match.");
            return;
        }

        setStatus('LOADING');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, token, newPassword: password })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('SUCCESS');
                setTimeout(() => navigate('/auth/login'), 3000);
            } else {
                setStatus('ERROR');
                setMsg(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('ERROR');
            setMsg('Network error. Please try again.');
        }
    };

    if (!token || !id) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative">
                <div className="w-full max-w-md bg-[#09090b]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center">
                    <AlertCircle className="mx-auto text-red-400 mb-4" size={40} />
                    <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
                    <p className="text-gray-400 text-sm mb-6">This recovery link is invalid or has expired.</p>
                    <Link to="/auth/forgot-password">
                        <Button className="bg-white text-black hover:bg-gray-200">Request New Link</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="w-full max-w-md bg-[#09090b]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                {status === 'SUCCESS' ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white mb-2">Password Reset!</h1>
                            <p className="text-gray-400 text-sm">Your secure vault key has been updated.</p>
                        </div>
                        <Button onClick={() => navigate('/auth/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold">
                            Login Now <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 space-y-2 text-center md:text-left">
                            <h1 className="text-2xl font-black tracking-tight text-white">Create New Password</h1>
                            <p className="text-gray-400 text-sm">Secure your workspace with a new key.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        minLength={8}
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
                                {status === 'LOADING' ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
