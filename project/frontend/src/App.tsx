import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import UniverseBackground from './components/ui/UniverseBackground';

import LandingPage from './pages/LandingPage';
import Pricing from './pages/pricing/Pricing';
import About from './pages/about/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import Careers from './pages/careers/Careers'; // Dashboard Careers
import Projects from './pages/projects/Projects';
import ProjectEdit from './pages/projects/ProjectEdit';
import Prediction from './pages/prediction/Prediction';
import SkillGap from './pages/growth/SkillGap';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import Roadmap from './pages/builder/Roadmap';
import PromptWorkspace from './pages/workspace/PromptWorkspace';
import Resume from './pages/resume/Resume';
import History from './pages/history/History';
import Builder from './pages/builder/Builder';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

import Checkout from './pages/payment/Checkout';
import Success from './pages/payment/Success';

// Public Pages
import Services from './pages/public/Services';
import HowItWorks from './pages/public/HowItWorks';
import PublicCareers from './pages/public/Careers';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

import PublicLayout from './components/layout/PublicLayout';

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

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ThemeProvider>
                    <Router>
                        {/* GLOBAL BACKGROUND - Applied once for the whole app */}
                        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 font-inter relative">
                            {/* Animation Layer */}
                            <div className="fixed inset-0 z-0 pointer-events-none">
                                <UniverseBackground intensity={0.4} />
                            </div>

                            {/* App Content - Higher Z-Index */}
                            <div className="relative z-10">
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
                                            <Route path="/" element={<Layout />}>
                                                <Route path="dashboard" element={<Dashboard />} />
                                                <Route path="builder" element={<Builder />} />
                                                <Route path="careers" element={<Careers />} />
                                                <Route path="projects" element={<Projects />} />
                                                <Route path="projects/:id" element={<ProjectEdit />} />
                                                <Route path="workspace" element={<PromptWorkspace />} />
                                                <Route path="prediction" element={<Prediction />} />
                                                <Route path="skill-gap" element={<SkillGap />} />
                                                <Route path="roadmap" element={<Roadmap />} />
                                                <Route path="resume" element={<Resume />} />
                                                <Route path="history" element={<History />} />
                                                <Route path="profile" element={<Profile />} />
                                                <Route path="settings" element={<Settings />} />
                                                <Route path="checkout" element={<Checkout />} />
                                                <Route path="checkout/success" element={<Success />} />
                                            </Route>
                                            {/* Fallback redirect to dashboard if user hits / while logged in */}
                                            <Route path="/" element={<Navigate to="/builder" replace />} />
                                        </Route>
                                    </Route>

                                    {/* Fallback */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </div>
                        </div>
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
