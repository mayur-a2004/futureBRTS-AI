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
                            <span className="text-xl font-black tracking-tighter">FutureBuilder</span>
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

                {/* --- SHARED FOOTER --- */}
                <footer className="py-20 px-6 border-t border-white/5 bg-[#080808] relative z-10">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-indigo-500" />
                                <span className="text-lg font-black tracking-tighter">FutureBuilder</span>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Building the future, today.</p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Company</h4>
                            <ul className="space-y-3 font-medium text-gray-400 text-left text-sm">
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/careers-public" className="hover:text-white transition-colors">Careers</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Legal</h4>
                            <ul className="space-y-3 font-medium text-gray-400 text-left text-sm">
                                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Stay Updated</h4>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Enter email" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all" />
                                <Button className="bg-indigo-600 text-[10px] uppercase font-black px-4 py-2 hover:bg-indigo-700">Join</Button>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-gray-600 text-xs font-bold uppercase tracking-[0.5em]">
                        © 2025 FutureBuilder Inc.
                    </div>
                </footer>
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
