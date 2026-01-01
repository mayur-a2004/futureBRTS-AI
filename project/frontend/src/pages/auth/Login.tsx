import { Button } from "@/components/ui/Button"
import { Link, useNavigate } from "react-router-dom"
import { Github, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { authApi } from "../../api/auth.api"

const DEFAULT_UI = {
    heading: "Welcome Back",
    subtext: "Resume your journey to the future.",
    labels: { email: "Email Address", password: "Password" },
    placeholders: { email: "you@example.com", password: "••••••••" },
    ctaText: "Sign In",
    socialText: { github: "GitHub", google: "Google" },
    footerActionText: "Don't have an account?",
    footerLinkText: "Create Account",
    footerLinkPath: "/auth/register"
};

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [ui, setUi] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 👉 Backend se UI content fetch karne ke liye useEffect
    useEffect(() => {
        const loadUI = async () => {
            try {
                // 👉 Path: GET /api/auth/ui-content
                const res = await authApi.getUIContent();
                if (res.success) {
                    setUi(res.data.login);
                } else {
                    setUi(DEFAULT_UI);
                }
            } catch (err) {
                console.error("Failed to load login UI content, using default");
                setUi(DEFAULT_UI);
            }
        };
        loadUI();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 👉 Backend me user login request
            const res = await authApi.login({ email, password });
            if (res.success) {
                login(res.user, res.token);

                // 👉 Login ke baad user status check karke redirect karna
                if (res.user.onboardingCompleted) {
                    navigate("/builder");
                } else {
                    navigate("/onboarding");
                }
            } else {
                setError(res.error || "Login failed");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    // 👉 Social Authentication Handlers
    const handleGoogleLogin = () => authApi.googleLogin();
    const handleGithubLogin = () => authApi.githubLogin();

    const content = ui || DEFAULT_UI;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3 mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">{content.heading}</h2>
                <p className="text-gray-500 font-medium text-lg">{content.subtext}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.email}</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={content.placeholders.email}
                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{content.labels.password}</label>
                        <Link to="#" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Forgot?</Link>
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.placeholders.password}
                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium"
                    />
                </div>

                {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold text-center animate-pulse">{error}</div>}

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-9 text-lg bg-white text-black hover:bg-indigo-50 rounded-2xl font-black transition-all shadow-2xl shadow-white/5 active:scale-[0.98] group disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : content.ctaText} <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>

            <div className="relative my-12">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.5em] font-black"><span className="bg-black px-6 text-gray-700">Encrypted Transition</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGithubLogin} className="w-full py-8 rounded-2xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[9px] font-black uppercase tracking-[0.2em]"><Github className="mr-2 h-4 w-4" /> {content.socialText.github}</Button>
                <Button variant="outline" onClick={handleGoogleLogin} className="w-full py-8 rounded-2xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[9px] font-black uppercase tracking-[0.2em]"><div className="mr-2 h-4 w-4 rounded-full bg-white flex items-center justify-center text-black font-black text-[8px]">G</div> {content.socialText.google}</Button>
            </div>

            <div className="mt-12 text-center text-sm text-gray-600 font-medium">
                {content.footerActionText} <Link to={content.footerLinkPath} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">{content.footerLinkText}</Link>
            </div>
        </div>
    )
}
