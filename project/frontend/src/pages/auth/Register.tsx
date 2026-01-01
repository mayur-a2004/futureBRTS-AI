import { Button } from "@/components/ui/Button"
import { Link, useNavigate } from "react-router-dom"
import { Github, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { authApi } from "../../api/auth.api"

const DEFAULT_UI = {
    heading: "Initialize Account",
    subtext: "Create your secure identity.",
    labels: { firstName: "First Name", lastName: "Last Name", dob: "Date of Birth", email: "Email", password: "Password" },
    placeholders: { firstName: "John", lastName: "Doe", email: "john@example.com", password: "••••••••" },
    ctaText: "Create Account",
    socialText: { github: "GitHub", google: "Google" },
    footerActionText: "Already have an account?",
    footerLinkText: "Sign In",
    footerLinkPath: "/auth/login"
};

export default function Register() {
    const navigate = useNavigate();
    const { login, initialIntent } = useAuth();
    const [ui, setUi] = useState<any>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [age, setAge] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 👉 Backend se UI content fetch karne ke liye
    useEffect(() => {
        const loadUI = async () => {
            try {
                // 👉 Path: GET /api/auth/ui-content
                const res = await authApi.getUIContent();
                if (res.success) {
                    setUi(res.data.register);
                } else {
                    setUi(DEFAULT_UI);
                }
            } catch (err) {
                console.error("Failed to load register UI content, using default");
                setUi(DEFAULT_UI);
            }
        };
        loadUI();
    }, []);

    // 👉 Janam tarikh badalne par age calculate karna
    useEffect(() => {
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge > 0 ? calculatedAge : 0);
        }
    }, [dob]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 👉 Backend me naya user register karna
            const res = await authApi.register({
                firstName,
                lastName,
                dateOfBirth: dob,
                email,
                password,
                intent: initialIntent // 'fb_intent' from context
            });

            if (res.success) {
                login(res.user, res.token);
                // 👉 Seedha onboarding par redirect karna
                navigate("/onboarding");
            } else {
                setError(res.error || "Registration failed");
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

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.firstName}</label>
                        <input
                            required
                            type="text"
                            placeholder={content.placeholders.firstName}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.lastName}</label>
                        <input
                            required
                            type="text"
                            placeholder={content.placeholders.lastName}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.dob}</label>
                        <input
                            required
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark] font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Current Age</label>
                        <div className="w-full px-6 py-5 bg-white/[0.01] border border-white/5 rounded-2xl text-indigo-400 font-black flex items-center">
                            {age !== null ? `${age} yrs` : '--'}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.email}</label>
                    <input
                        required
                        type="email"
                        placeholder={content.placeholders.email}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">{content.labels.password}</label>
                    <input
                        required
                        type="password"
                        placeholder={content.placeholders.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Creating Roadmap..." : content.ctaText} <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.5em] font-black"><span className="bg-black px-6 text-gray-700">Unified Access</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGithubLogin} className="w-full py-8 rounded-2xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[9px] font-black uppercase tracking-[0.2em]"><Github className="mr-2 h-4 w-4" /> {content.socialText?.github || 'GitHub'}</Button>
                <Button variant="outline" onClick={handleGoogleLogin} className="w-full py-8 rounded-2xl border-white/10 bg-white/[0.01] hover:bg-white/[0.05] transition-all text-[9px] font-black uppercase tracking-[0.2em]"><div className="mr-2 h-4 w-4 rounded-full bg-white flex items-center justify-center text-black font-black text-[8px]">G</div> {content.socialText?.google || 'Google'}</Button>
            </div>

            <div className="mt-10 text-center text-sm text-gray-600 font-medium">
                {content.footerActionText} <Link to={content.footerLinkPath} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">{content.footerLinkText}</Link>
            </div>
        </div>
    )
}
