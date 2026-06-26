import { useState } from "react"
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Twitter, Linkedin, Github, Instagram, Menu, X } from "lucide-react"

export default function PublicLayout() {
    const { scrollY } = useScroll();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const headerBg = useTransform(scrollY, [0, 100], ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.9)"]);
    const headerBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

    return (
        <ErrorBoundary>
            <div className="font-sans overflow-x-hidden selection:bg-indigo-500/30 font-inter">
                {/* Global Background is now in App.tsx */}

                {/* --- SHARED HEADER --- */}
                <motion.header style={{ backgroundColor: headerBg, backdropFilter: headerBlur }} className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 py-4">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}>
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

                        <div className="hidden lg:flex items-center gap-4">
                            <button onClick={() => navigate('/auth/login')} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</button>
                            <Button onClick={() => navigate('/auth/register')} className="bg-white text-black font-black uppercase tracking-widest text-[10px] px-6 py-2 rounded-full hover:bg-gray-200 transition-all">Get Started</Button>
                        </div>

                        {/* Mobile Hamburger toggle */}
                        <div className="flex lg:hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                                className="text-white hover:text-indigo-400 transition-colors p-2 bg-white/5 border border-white/10 rounded-xl"
                            >
                                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </motion.header>

                {/* Mobile Menu Panel */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-x-0 top-[73px] bottom-0 z-40 bg-black/95 backdrop-blur-2xl border-b border-white/10 lg:hidden flex flex-col p-6 space-y-6 overflow-y-auto"
                        >
                            <div className="flex flex-col space-y-4">
                                <Link 
                                    to="/" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Home
                                </Link>
                                <Link 
                                    to="/about" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/about' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    About
                                </Link>
                                <Link 
                                    to="/services" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/services' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Services
                                </Link>
                                <Link 
                                    to="/how-it-works" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/how-it-works' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    How It Works
                                </Link>
                                <Link 
                                    to="/careers-public" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/careers-public' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Careers
                                </Link>
                                <Link 
                                    to="/contact" 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className={`text-base font-black uppercase tracking-[0.2em] py-3 border-b border-white/5 ${location.pathname === '/contact' ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Contact
                                </Link>
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                                <button 
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/auth/login'); }} 
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-center text-sm font-black uppercase tracking-widest text-white transition-all"
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/auth/register'); }} 
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-center text-sm font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                >
                                    Get Started
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="relative z-10">
                    <Outlet />
                </main>

                <Footer />
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

function Footer() {
    const navigate = useNavigate();
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#050505] relative overflow-hidden font-inter text-white mt-12">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.03)_0%,transparent_70%)] blur-[100px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative z-10">
                <div className="space-y-6 col-span-1 md:col-span-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xs not-italic text-white">F</span>
                        FUTURE <span className="text-indigo-500">BRTS</span>
                    </h3>
                    <p className="text-sm text-gray-400 font-medium max-w-sm leading-relaxed text-left">
                        Architecting the future using humanized intelligence and robotic precision. Designed by Mayur Savaliya for industry legends.
                    </p>
                    <div className="flex gap-4">
                        <SocialIcon icon={<Twitter size={16} />} />
                        <SocialIcon icon={<Linkedin size={16} />} />
                        <SocialIcon icon={<Github size={16} />} />
                        <SocialIcon icon={<Instagram size={16} />} />
                    </div>
                </div>

                <div className="space-y-6 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">NAVIGATION</h4>
                    <ul className="space-y-3">
                        <FooterLink label="Explore Modules" onClick={() => navigate('/')} />
                        <FooterLink label="How It Works" onClick={() => navigate('/how-it-works')} />
                        <FooterLink label="Pricing Tiers" onClick={() => navigate('/pricing')} />
                        <FooterLink label="Neural Support" onClick={() => navigate('/contact')} />
                    </ul>
                </div>

                <div className="space-y-6 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">LEGAL_CORE</h4>
                    <ul className="space-y-3 text-left">
                        <FooterLink label="Privacy Protocol" onClick={() => navigate('/privacy')} />
                        <FooterLink label="Terms of Access" onClick={() => navigate('/terms')} />
                        <FooterLink label="Cookie Data" onClick={() => {}} />
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 mt-16 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <div>FUTURE BRTS © 2026. ALL RIGHTS RESERVED.</div>
                <div className="flex items-center gap-4">
                    <span>VERSION: 4.2.0-ULTRA</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }: { icon: any }) {
    return (
        <a href="#" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all">
            {icon}
        </a>
    )
}

function FooterLink({ label, onClick }: { label: string, onClick?: () => void }) {
    return (
        <li>
            <button onClick={onClick} className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider text-left">
                {label}
            </button>
        </li>
    )
}
