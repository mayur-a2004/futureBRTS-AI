import { Outlet, useLocation, Link, useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function PublicLayout() {
    const { scrollY } = useScroll();
    const navigate = useNavigate();
    const location = useLocation();

    const headerBg = useTransform(scrollY, [0, 100], ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.9)"]);
    const headerBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

    return (
        <ErrorBoundary>
            <div className="font-sans overflow-x-hidden selection:bg-indigo-500/30 font-inter">
                {/* Global Background is now in App.tsx */}

                {/* --- SHARED HEADER --- */}
                <motion.header style={{ backgroundColor: headerBg, backdropFilter: headerBlur }} className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 py-4">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black">F</div>
                            <span className="text-xl font-black tracking-tighter">FutureBRTS</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8">
                            <NavLink to="/" label="Home" current={location.pathname} />
                            <NavLink to="/about" label="About" current={location.pathname} />
                            <NavLink to="/services" label="Services" current={location.pathname} />
                            <NavLink to="/how-it-works" label="How It Works" current={location.pathname} />
                            <NavLink to="/careers-public" label="Careers" current={location.pathname} />
                            <NavLink to="/contact" label="Contact" current={location.pathname} />
                        </nav>

                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/auth/login')} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</button>
                            <Button onClick={() => navigate('/auth/register')} className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-6 py-2 rounded-full hover:bg-gray-200 transition-all">Get Started</Button>
                        </div>
                    </div>
                </motion.header>

                <main className="relative z-10">
                    <Outlet />
                </main>
            </div>
        </ErrorBoundary>
    )
}

function NavLink({ to, label, current }: { to: string, label: string, current: string }) {
    const isActive = current === to;
    return (
        <Link to={to} className={`text-sm font-black uppercase tracking-widest transition-colors relative group ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
            {label}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
        </Link>
    )
}
