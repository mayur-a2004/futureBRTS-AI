import { Button } from "@/components/ui/Button"
import { Link, useNavigate } from "react-router-dom"
import { Github, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { authApi } from "../../api/auth.api"
import { toast } from "react-toastify";


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
    const [error] = useState("");

    // 👉 Backend se UI content fetch karne ke liye useEffect aur social redirection handling
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenVal = params.get("token");
        const userJson = params.get("user");

        if (tokenVal && userJson) {
            try {
                const userData = JSON.parse(decodeURIComponent(userJson));
                login(userData, tokenVal);
                if (userData.onboardingCompleted) {
                    navigate("/builder");
                } else {
                    navigate("/onboarding");
                }
                return;
            } catch (err) {
                console.error("Failed to parse user data from social login redirect", err);
            }
        }

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
    }, [navigate, login]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await authApi.login({ email, password });

        if (res.success) {
            login(res.user, res.token);

            if (res.user.onboardingCompleted) {
                navigate("/builder");
            } else {
                navigate("/onboarding");
            }
        } else {
            // 👇 EXACT requirement
            toast.dismiss(); // 👈 avoid stacking
            toast.error("Invalid Credentials. Please register first");
        }

        setLoading(false);
    };



    // 👉 Social Authentication Handlers
    const handleGoogleLogin = () => authApi.googleLogin();
    const handleGithubLogin = () => authApi.githubLogin();

    const content = ui || DEFAULT_UI;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 mb-6 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight">{content.heading}</h2>
                <p className="text-gray-500 font-medium text-xs md:text-sm">{content.subtext}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 ml-1">{content.labels.email}</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={content.placeholders.email}
                        className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium text-xs md:text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">{content.labels.password}</label>
                        <Link to="#" className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Forgot?</Link>
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={content.placeholders.password}
                        className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium text-xs md:text-sm"
                    />
                </div>

                {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-bold text-center animate-pulse">{error}</div>}

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4.5 md:py-5 text-sm md:text-base bg-white text-black hover:bg-indigo-50 rounded-xl font-black transition-all shadow-xl active:scale-[0.99] group disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? "Verifying..." : content.ctaText} <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>

            <div className="relative my-6 flex items-center gap-3">
                <div className="h-px bg-white/[0.05] flex-1"></div>
                <span className="text-[8px] uppercase tracking-[0.25em] font-black text-gray-700">Encrypted Transition</span>
                <div className="h-px bg-white/[0.05] flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleGithubLogin} className="w-full py-3.5 md:py-4.5 rounded-xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-center"><Github className="mr-2 h-3.5 w-3.5" /> {content.socialText.github}</Button>
                <Button variant="outline" onClick={handleGoogleLogin} className="w-full py-3.5 md:py-4.5 rounded-xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-center"><div className="mr-2 h-3 w-3 rounded-full bg-white flex items-center justify-center text-black font-black text-[7px]">G</div> {content.socialText.google}</Button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 font-medium">
                {content.footerActionText} <Link to={content.footerLinkPath} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">{content.footerLinkText}</Link>
            </div>
        </div>
    );
}
