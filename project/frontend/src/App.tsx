import React, { Suspense, lazy, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { EmergencyLockdownOverlay } from './components/EmergencyLockdownOverlay';

// Lazy Loaded Components
const Layout = lazy(() => import('./components/layout/Layout'));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));
const UniverseBackground = lazy(() => import('./components/ui/UniverseBackground'));

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Pricing = lazy(() => import('./pages/pricing/Pricing'));
const About = lazy(() => import('./pages/about/About'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Careers = lazy(() => import('./pages/careers/Careers'));
const Projects = lazy(() => import('./pages/projects/Projects'));
const ProjectEdit = lazy(() => import('./pages/projects/ProjectEdit'));
const Prediction = lazy(() => import('./pages/prediction/Prediction'));
const SkillGap = lazy(() => import('./pages/growth/SkillGap'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Roadmap = lazy(() => import('./pages/roadmap/Roadmap'));
const TodayTask = lazy(() => import('./pages/tasks/TodayTask'));
const PromptWorkspace = lazy(() => import('./pages/workspace/PromptWorkspace'));
const Resume = lazy(() => import('./pages/resume/Resume'));
const History = lazy(() => import('./pages/history/History'));
const Builder = lazy(() => import('./pages/builder/Builder'));
const BusinessWarRoom = lazy(() => import('./pages/war-room/BusinessWarRoom'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 🎓 Minerva Education Pages (Full Screen — own layout)
const MinervaHome = lazy(() => import('./pages/minerva/MinervaHome'));
const MinervaSessionPage = lazy(() => import('./pages/minerva/MinervaSessionPage'));
const MinervaLearnPage = lazy(() => import('./pages/minerva/MinervaLearnPage'));
const MinervaHomeworkPage = lazy(() => import('./pages/minerva/MinervaHomeworkPage'));
const MinervaExamPage = lazy(() => import('./pages/minerva/MinervaExamPage'));
const MinervaExamListPage = lazy(() => import('./pages/minerva/MinervaExamListPage'));
const MinervaRoadmapsPage = lazy(() => import('./pages/minerva/MinervaRoadmapsPage'));
const MinervaTasksPage = lazy(() => import('./pages/minerva/MinervaTasksPage'));
const MinervaBuilderPage = lazy(() => import('./pages/minerva/MinervaBuilderPage'));
const MinervaResultsPage = lazy(() => import('./pages/minerva/MinervaResultsPage'));
const MinervaDashboardPage = lazy(() => import('./pages/minerva/MinervaDashboardPage'));
const MinervaQuizBattlePage = lazy(() => import('./pages/minerva/MinervaQuizBattlePage'));
const MinervaParentDashboardPage = lazy(() => import('./pages/minerva/MinervaParentDashboardPage'));
const SchoolLeaderboardPage = lazy(() => import('./pages/minerva/SchoolLeaderboardPage'));
const TeacherDashboardPage = lazy(() => import('./pages/minerva/TeacherDashboardPage'));


// Admin Pages
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const RoadmapManager = lazy(() => import('./pages/admin/RoadmapManager'));
const TaskManager = lazy(() => import('./pages/admin/TaskManager'));
const SEOManager = lazy(() => import('./pages/admin/SEOManager'));
const GoogleServices = lazy(() => import('./pages/admin/GoogleServices'));
const NotificationsManager = lazy(() => import('./pages/admin/NotificationsManager'));
const PermissionsManager = lazy(() => import('./pages/admin/PermissionsManager'));
const AdvancedSettings = lazy(() => import('./pages/admin/AdvancedSettings'));
const TrackingLogs = lazy(() => import('./pages/admin/TrackingLogs'));
const IntelligenceDashboard = lazy(() => import('./pages/admin/IntelligenceDashboard'));
const EducationOSAdmin = lazy(() => import('./pages/admin/EducationOSAdmin'));

const Checkout = lazy(() => import('./pages/payment/Checkout'));
const Success = lazy(() => import('./pages/payment/Success'));

// Public Pages
const Services = lazy(() => import('./pages/public/Services'));
const HowItWorks = lazy(() => import('./pages/public/HowItWorks'));
const PublicCareers = lazy(() => import('./pages/public/Careers'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const GuestChat = lazy(() => import('./pages/public/GuestChat'));
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));

// Loading Fallback
const NeuralLoader = () => (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9000]">
        <div className="relative mb-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
            >
                <div className="flex items-center gap-1">
                    <span className="text-4xl font-black italic uppercase tracking-[-0.05em] text-white">Future</span>
                    <span className="text-4xl font-black italic uppercase tracking-[0.1em] text-indigo-500">BRTS</span>
                </div>
                {/* 🧠 Animated Underline */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-1"
                />
            </motion.div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.6em] text-indigo-500/50 animate-pulse ml-2">Synchronizing Neural Core</span>
    </div>
);

// Public Pages
// ...

// ⭐ PROTECTED ROUTE: Unauthenticated users → /auth/login
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <NeuralLoader />;
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

// ⏎ ONBOARDING GUARD: Logged-in users who haven't finished onboarding → /onboarding
const OnboardingGuard = () => {
    const { onboardingCompleted, loading } = useAuth();
    if (loading) return <NeuralLoader />;
    return onboardingCompleted ? <Outlet /> : <Navigate to="/onboarding" replace />;
};

// ⚡ SMART ROOT: ChatGPT-style instant redirect for returning users.
// • Token in localStorage + valid  → go to /dashboard (or /onboarding if not done)
// • No token / invalid            → show LandingPage (normal visitor flow)
const SmartRoot = () => {
    const { isAuthenticated, loading, onboardingCompleted } = useAuth();
    // Show loader only while verifying token with server (returning users only)
    if (loading) return <NeuralLoader />;
    if (isAuthenticated) {
        return <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
    }
    return <LandingPage />;
};

// 🚫 PUBLIC-ONLY ROUTE: Already logged-in users should not see login/register.
// Accessing /auth/login while authenticated → redirected to /dashboard.
const PublicOnlyRoute = () => {
    const { isAuthenticated, loading, onboardingCompleted } = useAuth();
    if (loading) return <NeuralLoader />;
    if (isAuthenticated) {
        return <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
    }
    return <Outlet />;
};

import { useTrafficTracker } from './hooks/useTrafficTracker';

import HeadManager from './components/HeadManager';
import Meta from './components/common/Meta';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ModalProvider } from './context/ModalContext';

const AIConfigPanel = lazy(() => import('./pages/admin/AIConfigPanel'));
const EconomyManager = lazy(() => import('./pages/admin/EconomyManager'));
const ChatMonitor = lazy(() => import('./pages/admin/ChatMonitor'));

const ProjectRegistry = lazy(() => import('./pages/admin/ProjectRegistry'));
const FactoryLiveTracking = lazy(() => import('./pages/projects/FactoryLiveTracking'));

const ExamGenerator = lazy(() => import('./pages/ExamGeneratorPage'));

const MinervaRedirect = () => {
    const target = window.location.pathname.replace(/^\/minerva/, '/future-education');
    return <Navigate to={target + window.location.search} replace />;
};

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function InquiryButton() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    const [isOpen, setIsOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [subject, setSubject] = React.useState('General Inquiry');
    const [message, setMessage] = React.useState('');

    if (!isLandingPage) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoUrl = `mailto:support@futurebuilder.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        )}`;
        window.location.href = mailtoUrl;
        setIsOpen(false);
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[9999] bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)] transition-all hover:scale-110 flex items-center justify-center group border border-white/10"
                aria-label="Send Inquiry"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <span className="absolute right-16 bg-black/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                    Send Inquiry
                </span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
                    <div className="bg-gradient-to-br from-[#1b123a]/90 via-[#0a0718]/95 to-black border border-indigo-500/30 rounded-3xl p-6 shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Send Inquiry</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5">Your Name*</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5">Email Address*</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5">Subject</label>
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-xs shadow-inner"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Feedback">Feedback</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5">Message*</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-xs placeholder:text-gray-700 shadow-inner resize-none"
                                    placeholder="Type your question or request..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-950/50 border-none active:scale-[0.98] cursor-pointer"
                            >
                                Open Mail Client
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function App() {
    useTrafficTracker();
    return (
        <ErrorBoundary>
            <HelmetProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <ModalProvider>
                            <Meta />
                            <HeadManager />
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                pauseOnHover
                                theme="light"
                            />
                            <Router>
                                <ScrollToTop />
                                <Suspense fallback={<NeuralLoader />}>
                                    <EmergencyLockdownOverlay />
                                    {/* GLOBAL BACKGROUND - Applied once for the whole app */}
                                    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 font-inter relative">
                                        {/* Animation Layer */}
                                        <div className="fixed inset-0 z-0 pointer-events-none">
                                            <UniverseBackground intensity={1} />
                                        </div>

                                        {/* App Content - Higher Z-Index */}
                                        <div className="relative z-10">
                                            <Routes>
                                                {/* Public Routes with Shared Layout */}
                                                <Route element={<PublicLayout />}>
                                                    {/* ⚡ SmartRoot: returning users skip landing page entirely */}
                                                    <Route path="/" element={<SmartRoot />} />
                                                    <Route path="/pricing" element={<Pricing />} />
                                                    <Route path="/about" element={<About />} />
                                                    <Route path="/services" element={<Services />} />
                                                    <Route path="/how-it-works" element={<HowItWorks />} />
                                                    <Route path="/careers-public" element={<PublicCareers />} />
                                                    <Route path="/contact" element={<Contact />} />
                                                    <Route path="/privacy" element={<Privacy />} />
                                                    <Route path="/terms" element={<Terms />} />
                                                </Route>

                                                {/* Guest Chat - No Layout, Full Screen */}
                                                <Route path="/guest-chat" element={<GuestChat />} />

                                                {/* Auth Routes */}
                                                <Route path="/auth" element={<AuthLayout />}>
                                                    {/* 🚫 Already logged-in? Redirect away from login/register */}
                                                    <Route element={<PublicOnlyRoute />}>
                                                        <Route path="login" element={<Login />} />
                                                        <Route path="register" element={<Register />} />
                                                    </Route>
                                                    {/* These are fine to visit any time */}
                                                    <Route path="forgot-password" element={<ForgotPassword />} />
                                                    <Route path="reset-password" element={<ResetPassword />} />
                                                </Route>

                                                {/* Onboarding - Mandatory Protected */}
                                                <Route element={<ProtectedRoute />}>
                                                    <Route path="/onboarding" element={<Onboarding />} />

                                                    {/* Dashboard & Workspace - Only after onboarding */}
                                                    <Route element={<OnboardingGuard />}>
                                                        <Route element={<Layout />}>
                                                            <Route path="dashboard" element={<Dashboard />} />
                                                            <Route path="builder" element={<Builder />} />
                                                            <Route path="careers" element={<Careers />} />
                                                            <Route path="projects" element={<Projects />} />
                                                            <Route path="projects/:id" element={<ProjectEdit />} />
                                                            <Route path="projects/live/:id" element={<FactoryLiveTracking />} />
                                                            <Route path="workspace" element={<PromptWorkspace />} />
                                                            <Route path="prediction" element={<Prediction />} />
                                                            <Route path="skill-gap" element={<SkillGap />} />
                                                            <Route path="roadmap" element={<Roadmap />} />
                                                            <Route path="today-task" element={<TodayTask />} />
                                                            <Route path="resume" element={<Resume />} />
                                                            <Route path="history" element={<History />} />
                                                            <Route path="profile" element={<Profile />} />
                                                            <Route path="war-room" element={<BusinessWarRoom />} />
                                                            <Route path="exam-generator" element={<ExamGenerator />} />
                                                            <Route path="settings" element={<Settings />} />
                                                            <Route path="checkout" element={<Checkout />} />
                                                            <Route path="checkout/success" element={<Success />} />

                                                            {/* 🎓 Future Education OS — Nested inside Layout */}
                                                            <Route path="future-education" element={<MinervaHome />} />
                                                            <Route path="future-education/session/:id" element={<MinervaSessionPage />} />
                                                            <Route path="future-education/learn/:id" element={<MinervaLearnPage />} />
                                                            <Route path="future-education/homework" element={<MinervaHomeworkPage />} />
                                                            <Route path="future-education/exams" element={<MinervaExamListPage />} />
                                                            <Route path="future-education/exam/:id" element={<MinervaExamPage />} />
                                                            <Route path="future-education/results" element={<MinervaResultsPage />} />
                                                            <Route path="future-education/roadmaps" element={<MinervaRoadmapsPage />} />
                                                            <Route path="future-education/tasks" element={<MinervaTasksPage />} />
                                                            <Route path="future-education/builder" element={<MinervaBuilderPage />} />
                                                            <Route path="future-education/dashboard" element={<MinervaDashboardPage />} />
                                                            <Route path="future-education/quiz-battle" element={<MinervaQuizBattlePage />} />
                                                            <Route path="future-education/parent-dashboard" element={<MinervaParentDashboardPage />} />
                                                            <Route path="future-education/school-leaderboard" element={<SchoolLeaderboardPage />} />
                                                            <Route path="future-education/teacher-dashboard" element={<TeacherDashboardPage />} />
                                                            
                                                            {/* Redirect old path to new path recursively */}
                                                            <Route path="minerva" element={<Navigate to="/future-education" replace />} />
                                                            <Route path="minerva/*" element={<MinervaRedirect />} />
                                                        </Route>
                                                    </Route>
                                                </Route>

                                                {/* Admin Routes - Protected & Genesis Guarded */}
                                                <Route path="/admin" element={<AdminLayout />}>
                                                    <Route path="dashboard" element={<AdminDashboard />} />
                                                    <Route path="users" element={<UserManager />} />
                                                    <Route path="projects" element={<ProjectRegistry />} />
                                                    <Route path="ai" element={<AIConfigPanel />} />
                                                    <Route path="economy" element={<EconomyManager />} />
                                                    <Route path="chats" element={<ChatMonitor />} />
                                                    <Route path="roadmaps" element={<RoadmapManager />} />
                                                    <Route path="tasks" element={<TaskManager />} />
                                                    <Route path="seo" element={<SEOManager />} />
                                                    <Route path="google" element={<GoogleServices />} />
                                                    <Route path="notifications" element={<NotificationsManager />} />
                                                    <Route path="permissions" element={<PermissionsManager />} />
                                                    <Route path="settings" element={<AdvancedSettings />} />
                                                    <Route path="tracking" element={<TrackingLogs />} />
                                                    <Route path="intelligence" element={<IntelligenceDashboard />} />
                                                    <Route path="education/:tab" element={<EducationOSAdmin />} />
                                                    <Route index element={<Navigate to="dashboard" replace />} />
                                                </Route>

                                                {/* Fallback */}
                                                <Route path="*" element={<NotFound />} />
                                            </Routes>

                                            {/* --- GLOBAL INQUIRY FLOATING BUTTON --- */}
                                            <InquiryButton />
                                        </div>
                                    </div>
                                </Suspense>
                            </Router>
                        </ModalProvider>
                    </ThemeProvider>
                </AuthProvider>
            </HelmetProvider>
        </ErrorBoundary>
    );
}

export default App;
