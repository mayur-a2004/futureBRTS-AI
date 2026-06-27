import { Suspense, lazy, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

// Protected Route Component
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

// Onboarding Guard component
const OnboardingGuard = () => {
    const { onboardingCompleted } = useAuth();
    return onboardingCompleted ? <Outlet /> : <Navigate to="/onboarding" replace />;
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
                                {/* GLOBAL BACKGROUND - Applied once for the whole app */}
                                <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 font-inter relative">
                                    {/* Animation Layer */}
                                    <div className="fixed inset-0 z-0 pointer-events-none">
                                        <UniverseBackground intensity={1} />
                                    </div>

                                    {/* App Content - Higher Z-Index */}
                                    <div className="relative z-10">
                                        <Suspense fallback={<NeuralLoader />}>
                                            <Routes>
                                                {/* Public Routes with Shared Layout */}
                                                <Route element={<PublicLayout />}>
                                                    <Route path="/" element={<LandingPage />} />
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
                                                    <Route path="login" element={<Login />} />
                                                    <Route path="register" element={<Register />} />
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
                                                            <Route path="future-education/roadmaps" element={<MinervaRoadmapsPage />} />
                                                            <Route path="future-education/tasks" element={<MinervaTasksPage />} />
                                                            <Route path="future-education/builder" element={<MinervaBuilderPage />} />
                                                            
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
                                                    <Route index element={<Navigate to="dashboard" replace />} />
                                                </Route>

                                                {/* Fallback */}
                                                <Route path="*" element={<NotFound />} />
                                            </Routes>
                                        </Suspense>

                                        {/* --- GLOBAL WHATSAPP FLOATING BUTTON --- */}
                                        <a
                                            href="https://wa.me/917859828561?text=Hello! I would like to make an inquiry about FutureBRTS."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.5)] transition-all hover:scale-110 flex items-center justify-center group"
                                            aria-label="Contact on WhatsApp"
                                        >
                                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 2.012 14.07 1.002 11.477 1.002c-5.434 0-9.858 4.37-9.863 9.8-.001 1.762.47 3.487 1.364 5.014L1.938 20.16l4.709-1.006zM17.52 14.54c-.31-.155-1.833-.895-2.112-.996-.28-.1-.483-.15-.683.15-.2.3-.777.97-.953 1.17-.176.2-.352.223-.662.068-1.036-.52-1.782-.916-2.483-2.115-.175-.3-.175-.589-.025-.74.135-.135.31-.355.465-.53.155-.175.207-.3.31-.5.104-.2.052-.375-.026-.53-.078-.155-.683-1.62-.936-2.225-.246-.59-.497-.51-.683-.52-.176-.01-.377-.01-.579-.01-.202 0-.53.075-.807.375-.278.3-.965.945-.965 2.305 0 1.36.99 2.67 1.13 2.855.14.186 1.947 2.94 4.72 4.115 1.77.75 2.49.8 3.39.67.507-.075 1.564-.63 1.782-1.24.218-.61.218-1.13.154-1.24-.064-.11-.242-.2-.552-.35z"/>
                                            </svg>
                                            {/* Tooltip */}
                                            <span className="absolute right-16 bg-black/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
                                                Inquire on WhatsApp
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </Router>
                        </ModalProvider>
                    </ThemeProvider>
                </AuthProvider>
            </HelmetProvider>
        </ErrorBoundary>
    );
}

export default App;
