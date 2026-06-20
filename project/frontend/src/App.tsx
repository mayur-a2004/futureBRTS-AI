import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
