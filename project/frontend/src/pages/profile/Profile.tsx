import { MapPin, Github, Linkedin, Mail, BadgeCheck, Globe, Code, Activity, Edit3, Save, ShieldCheck, GraduationCap, Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { BOARDS, STANDARDS } from '../minerva/MinervaQuizBattlePage'

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'security'>('overview');
    const [stats, setStats] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const [deletingAccount, setDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [detectingGps, setDetectingGps] = useState(false);

    const [resendingMail, setResendingMail] = useState(false);

    const handleDetectGpsLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setDetectingGps(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    const detectedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || data.address?.county || 'Ahmedabad';
                    setFormData(prev => ({ ...prev, state: detectedCity }));
                    toast.success(`📍 GPS City Detected: ${detectedCity}! 🎯`);
                } catch (e) {
                    toast.error("Could not resolve city name from GPS coordinates");
                } finally {
                    setDetectingGps(false);
                }
            },
            (err) => {
                setDetectingGps(false);
                toast.error("Location permission denied or GPS unavailable");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        parentEmail: user?.parentDetails?.parentEmail || '',
        parentPhone: user?.parentDetails?.parentPhone || '',
        school_name: user?.schoolName || '',
        grade_level: user?.standard ? (user.standard.toString().startsWith('class_') ? user.standard : `class_${user.standard}`) : 'class_10',
        board: user?.board || 'cbse',
        state: user?.city || '',
        medium: user?.medium || 'english',
        mobile_number: user?.mobile_number || '',
        section: user?.section || 'A',
        stream: user?.stream || 'Science',
        rollNumber: user?.rollNumber || '',
        enrollmentNo: user?.enrollmentNo || '',
        isSchoolStudent: user?.isSchoolStudent ?? true,
        avatarUrl: user?.avatarUrl || user?.avatar || '',
        profile: {
            bio: user?.profile?.bio || '',
            location: user?.profile?.location || '',
            skills: user?.profile?.skills?.join(', ') || '',
            socialLinks: {
                github: user?.profile?.socialLinks?.github || '',
                linkedin: user?.profile?.socialLinks?.linkedin || '',
                twitter: user?.profile?.socialLinks?.twitter || '',
                website: user?.profile?.socialLinks?.website || ''
            }
        }
    });

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            parentEmail: user?.parentDetails?.parentEmail || '',
            parentPhone: user?.parentDetails?.parentPhone || '',
            school_name: user?.schoolName || prev.school_name || '',
            grade_level: user?.standard ? (user.standard.toString().startsWith('class_') ? user.standard : `class_${user.standard}`) : prev.grade_level,
            board: user?.board || prev.board || 'cbse',
            state: user?.city || prev.state || '',
            medium: user?.medium || prev.medium || 'english',
            mobile_number: user?.mobile_number || prev.mobile_number || '',
            section: user?.section || prev.section || 'A',
            stream: user?.stream || prev.stream || 'Science',
            rollNumber: user?.rollNumber || prev.rollNumber || '',
            enrollmentNo: user?.enrollmentNo || prev.enrollmentNo || '',
            isSchoolStudent: user?.isSchoolStudent ?? prev.isSchoolStudent ?? true,
            avatarUrl: user?.avatarUrl || user?.avatar || prev.avatarUrl || '',
            profile: {
                bio: user?.profile?.bio || '',
                location: user?.profile?.location || '',
                skills: user?.profile?.skills?.join(', ') || '',
                socialLinks: {
                    github: user?.profile?.socialLinks?.github || '',
                    linkedin: user?.profile?.socialLinks?.linkedin || '',
                    twitter: user?.profile?.socialLinks?.twitter || '',
                    website: user?.profile?.socialLinks?.website || ''
                }
            }
        }));
    }, [user]);

    const handleResendParentVerification = async () => {
        setResendingMail(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/minerva/parent/resend-verification', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Verification email resent successfully! ✉️");
            } else {
                toast.error(data.error || "Failed to resend verification.");
            }
        } catch (e) {
            toast.error("Error connecting to notification server.");
        } finally {
            setResendingMail(false);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('fbrts_token');
                if (!token) return;
                
                const [statsRes, projRes, minervaProfileRes] = await Promise.all([
                    fetch('/api/builder/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/collage-project/list', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/future-education/profile', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                const statsData = await statsRes.json();
                const projData = await projRes.json();
                const minervaData = await minervaProfileRes.json();
 
                if (statsData.success) setStats(statsData.stats);
                if (projData.success) setProjects(projData.projects.slice(0, 4));
                if (minervaData.success && minervaData.profile) {
                    setFormData(prev => ({
                        ...prev,
                        school_name: minervaData.profile.school_name || user?.schoolName || prev.school_name,
                        grade_level: minervaData.profile.grade_level || (user?.standard ? (user.standard.toString().startsWith('class_') ? user.standard : `class_${user.standard}`) : prev.grade_level),
                        board: minervaData.profile.board || user?.board || prev.board,
                        state: minervaData.profile.state || user?.city || prev.state,
                        medium: minervaData.profile.medium || user?.medium || prev.medium,
                        mobile_number: minervaData.profile.mobile_number || user?.mobile_number || prev.mobile_number
                    }));
                }
            } catch (e) {
                console.error("Profile data fetch error", e);
            }
        };
        fetchProfileData();
    }, [user]);
 
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            
            const rawStandard = formData.grade_level.replace('class_', '');
            
            // Save core profile
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    city: formData.state,
                    schoolName: formData.school_name,
                    board: formData.board,
                    standard: rawStandard,
                    section: formData.section,
                    stream: formData.stream,
                    medium: formData.medium,
                    mobile_number: formData.mobile_number,
                    rollNumber: formData.rollNumber,
                    enrollmentNo: formData.enrollmentNo,
                    isSchoolStudent: formData.isSchoolStudent,
                    avatarUrl: formData.avatarUrl,
                    avatar: formData.avatarUrl,
                    profile: {
                        ...formData.profile,
                        skills: formData.profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                    }
                })
            });
            const data = await res.json();

            // Save School Roster Profile Sync
            const classId = `CLASS-${rawStandard.toUpperCase()}${formData.section.toUpperCase()}`;
            await fetch('/api/v1/teacher-workspace/student-school-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    externalId: user?.id || user?._id || 'STU-10492',
                    tenantOrgId: formData.isSchoolStudent && formData.school_name ? formData.school_name.toLowerCase().replace(/\s+/g, '_') : 'independent_student',
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: user?.email || '',
                    isSchoolStudent: formData.isSchoolStudent,
                    schoolName: formData.school_name,
                    classId,
                    rollNumber: formData.rollNumber,
                    enrollmentNo: formData.enrollmentNo
                })
            });

            // Save parent details
            const parentRes = await fetch('/api/minerva/parent/details', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    parentEmail: formData.parentEmail,
                    parentPhone: formData.parentPhone
                })
            });
            const parentData = await parentRes.json();

            // Save Minerva academic/school profile details
            const minervaRes = await fetch('/api/future-education/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    school_name: formData.school_name,
                    grade_level: formData.grade_level,
                    board: formData.board,
                    state: formData.state,
                    medium: formData.medium,
                    mobile_number: formData.mobile_number,
                    learning_style: 'mixed',
                    daily_time_minutes: 60,
                    language_preference: 'english'
                })
            });
            const minervaProfileData = await minervaRes.json();

            if (data.success && parentData.success && minervaProfileData.success) {
                setUser({
                    ...data.user,
                    parentDetails: parentData.parentDetails
                });
                if (minervaProfileData.profile) {
                    setFormData(prev => ({
                        ...prev,
                        school_name: minervaProfileData.profile.school_name || '',
                        grade_level: minervaProfileData.profile.grade_level || 'class_10',
                        board: minervaProfileData.profile.board || 'cbse',
                        state: minervaProfileData.profile.state || '',
                        medium: minervaProfileData.profile.medium || 'english',
                        mobile_number: minervaProfileData.profile.mobile_number || ''
                    }));
                }
                setIsEditing(false);
                toast.success("Identity Matrix & School Profile Sync Successful! 🚀");
            } else {
                toast.error(data.error || parentData.error || minervaProfileData.error || "Update Failed");
            }
        } catch (e) {
            console.error(e);
            toast.error("Critical System Error during Sync");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setPasswordChanging(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Vault password updated successfully! 🔒");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordSection(false);
            } else {
                toast.error(data.error || "Failed to change password");
            }
        } catch (e) {
            toast.error("Failed to connect to authentication server");
        } finally {
            setPasswordChanging(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Your account and data have been permanently deleted.");
                if (logout) logout();
                localStorage.clear();
                navigate('/login', { replace: true });
            } else {
                toast.error(data.error || "Failed to delete account");
            }
        } catch (e) {
            toast.error("Error connecting to server to delete account");
        } finally {
            setDeletingAccount(false);
        }
    };

    return (
        <div className="text-white space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Cover */}
            <div className="relative">
                <div className="h-56 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 rounded-[40px] overflow-hidden relative border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-white/[0.02]" style={{ backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                </div>

                <div className="px-8 flex flex-col md:flex-row items-end -mt-20 gap-8 relative z-10">
                    <div className="group relative cursor-pointer" onClick={() => setIsEditing(true)}>
                        <div className="w-40 h-40 rounded-[40px] border-8 border-[#0A0A0A] bg-gray-900 flex items-center justify-center overflow-hidden shadow-3xl transform transition-transform group-hover:scale-105">
                            {(formData.avatarUrl || user?.avatarUrl || user?.avatar) ? (
                                <img
                                    src={formData.avatarUrl || user?.avatarUrl || user?.avatar}
                                    alt="Profile Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as any).style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-6xl uppercase italic select-none shadow-inner">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[40px]">
                            <Edit3 className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                                {user?.firstName} {user?.lastName}
                            </h1>
                            <div className="p-1 px-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                                <BadgeCheck className="text-indigo-400 w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Verified Identity</span>
                            </div>
                        </div>
                        <p className="text-gray-500 font-bold text-[11px] uppercase tracking-[0.4em] italic">
                            {user?.subscriptionTier ? `${user.subscriptionStatus || 'Tier-1'} Access` : 'General Node'} • Future Architect_01
                        </p>
                    </div>

                    <div className="pb-6 flex gap-4">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 px-8 rounded-2xl h-14 font-black uppercase italic tracking-widest gap-2 shadow-xl shadow-indigo-600/20"
                            >
                                <Edit3 size={18} /> Edit DNA
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <Button onClick={() => setIsEditing(false)} variant="ghost" className="bg-white/5 hover:bg-white/10 px-6 rounded-2xl h-14 font-black uppercase italic tracking-widest text-gray-400">Cancel</Button>
                                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 px-8 rounded-2xl h-14 font-black uppercase italic tracking-widest gap-2 shadow-xl shadow-emerald-600/20">
                                    <Save size={18} /> Save Sync
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-white/5 pb-px gap-8 px-4">
                {[
                    { id: 'overview', name: 'Overview', icon: <Activity size={16} /> },
                    { id: 'academic', name: 'Academic Profile', icon: <GraduationCap size={16} /> },
                    { id: 'security', name: 'Security & Parent Alerts', icon: <ShieldCheck size={16} /> }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'text-indigo-400 font-extrabold' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t.icon}
                        {t.name}
                        {activeTab === t.id && (
                            <motion.div 
                                layoutId="activeProfileTabLine" 
                                className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 rounded-full" 
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="px-4">
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Left Column: Bio & Skills */}
                        <div className="space-y-8">
                            {/* Neural Biography */}
                            <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4 italic">Neural Biography</h3>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Core Identity</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                    placeholder="First Name"
                                                />
                                                <input
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                    placeholder="Last Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Bio Blueprint</label>
                                            <textarea
                                                value={formData.profile.bio}
                                                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, bio: e.target.value } })}
                                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:border-indigo-500 outline-none resize-none"
                                                placeholder="Explain your architectural purpose..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Node Location</label>
                                            <input
                                                value={formData.profile.location}
                                                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, location: e.target.value } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="e.g. Earth_Sector_01"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-md text-gray-300 leading-relaxed font-medium italic">"{user?.profile?.bio || 'Future Architect & Innovation Specialist.'}"</p>
                                        <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                            <div className="flex items-center gap-3 text-sm text-gray-400 font-bold">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><MapPin size={16} /></div>
                                                {user?.profile?.location || 'Digital Nomad'}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-400 font-bold">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Mail size={16} /></div>
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Skill Inventory */}
                            <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4 italic">Skill Inventory</h3>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Comma Separated Skills</label>
                                        <input
                                            value={formData.profile.skills}
                                            onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, skills: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="React, ML, Strategy..."
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(user?.profile?.skills?.length ? user.profile.skills : ["Strategic Planning", "Problem Solving", "Growth Architecture"]).map((skill: string) => (
                                            <span key={skill} className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl text-gray-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-default">{skill}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Neural Links (when editing) */}
                            {isEditing && (
                                <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4 italic">Neural Links</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl text-gray-400"><Github size={18} /></div>
                                            <input
                                                value={formData.profile.socialLinks.github}
                                                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, socialLinks: { ...formData.profile.socialLinks, github: e.target.value } } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-indigo-500 outline-none"
                                                placeholder="GitHub Handle"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl text-gray-400"><Linkedin size={18} /></div>
                                            <input
                                                value={formData.profile.socialLinks.linkedin}
                                                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, socialLinks: { ...formData.profile.socialLinks, linkedin: e.target.value } } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-indigo-500 outline-none"
                                                placeholder="LinkedIn URL"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white/5 rounded-xl text-gray-400"><Globe size={18} /></div>
                                            <input
                                                value={formData.profile.socialLinks.website}
                                                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, socialLinks: { ...formData.profile.socialLinks, website: e.target.value } } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-indigo-500 outline-none"
                                                placeholder="Portfolio URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Stats & System Showcase */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Social Stats Strip */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Artifacts', value: projects.length.toString().padStart(2, '0') || '00', icon: <Code size={16} /> },
                                    { label: 'Roadmaps', value: stats?.activeRoadmaps?.toString().padStart(2, '0') || '00', icon: <MapPin size={16} /> },
                                    { label: 'Credits', value: user?.tokenBalance?.toLocaleString() || '1,000', icon: <Activity size={16} /> },
                                    { label: 'Level', value: user?.subscriptionTier === 'monthly' || user?.subscriptionTier === 'yearly' ? 'Pro' : 'Core', icon: <BadgeCheck size={16} /> },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] text-center space-y-2 group hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all">
                                        <div className="flex justify-center text-gray-600 group-hover:text-indigo-400 transition-colors">{stat.icon}</div>
                                        <div className="text-2xl font-black italic tracking-tighter uppercase leading-none">{stat.value}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* System Showcase */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center px-4">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                        <Code className="text-indigo-400" /> System Showcase
                                    </h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 cursor-pointer hover:underline">Sync All Deployment</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {projects.length > 0 ? projects.map((proj, i) => (
                                        <div key={i} onClick={() => navigate(`/projects/live/${proj._id}`)} className="group cursor-pointer overflow-hidden rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-3xl relative p-8 hover:border-indigo-500/30 transition-all shadow-3xl">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><Code size={24} /></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">{proj.status === 'COMPLETED' ? 'Active' : 'Deploying'}</span>
                                            </div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors line-clamp-1" title={proj.title}>{proj.title || "Experimental Node"}</h3>
                                            <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-[0.2em]">{proj.category?.replace(/_/g, ' ') || 'Architecture'}</p>
                                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">{new Date(proj.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 text-center py-20 bg-white/[0.02] border border-white/5 p-6 rounded-[32px]">
                                            <Code size={40} className="mx-auto text-gray-600 mb-4" />
                                            <div className="text-lg font-black uppercase text-gray-500 tracking-widest">No Projects Found</div>
                                            <div className="text-[10px] uppercase text-gray-600 mt-2 tracking-widest">Launch Builder to create your first architecture</div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'academic' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* School & Academic Details Card */}
                        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                    <GraduationCap size={18} /> Academic profile details
                                </h3>
                                {!isEditing && (
                                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                                        Education OS Active
                                    </span>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-6">
                                    {/* 🏫 Dual Mode Toggle & Avatar URL */}
                                    <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="profileIsSchoolStudent"
                                                checked={formData.isSchoolStudent}
                                                onChange={(e) => setFormData({ ...formData, isSchoolStudent: e.target.checked })}
                                                className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                                            />
                                            <label htmlFor="profileIsSchoolStudent" className="text-xs font-bold text-white cursor-pointer select-none">
                                                🏫 Enrolled School Student (Roster & Timetable Sync Active)
                                            </label>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                                            formData.isSchoolStudent ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }`}>
                                            {formData.isSchoolStudent ? 'School Sync On' : 'Independent Self-Study'}
                                        </span>
                                    </div>

                                    {/* Profile Avatar Photo URL */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Profile Photo Avatar URL (Image Link)</label>
                                        <input
                                            value={formData.avatarUrl}
                                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none font-mono"
                                            placeholder="https://example.com/my-photo.jpg"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">School / Academy Name</label>
                                            <input
                                                value={formData.school_name}
                                                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="e.g. Divine Buds School"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Mobile Number</label>
                                            <input
                                                value={formData.mobile_number}
                                                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="e.g. 9876543210"
                                            />
                                        </div>
                                    </div>

                                    {/* 🆔 Roll Number & Enrollment GR Number inputs */}
                                    <div className="grid md:grid-cols-2 gap-6 bg-cyan-950/20 p-5 rounded-2xl border border-cyan-500/30">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-cyan-300 uppercase tracking-widest ml-1">Class Roll Number (e.g. 14, 02)</label>
                                            <input
                                                value={formData.rollNumber}
                                                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                                className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm font-bold font-mono text-cyan-200 focus:border-cyan-400 outline-none"
                                                placeholder="e.g. 14"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-cyan-300 uppercase tracking-widest ml-1">Enrollment / GR Number (e.g. 12-ER-2026-1001)</label>
                                            <input
                                                value={formData.enrollmentNo}
                                                onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                                                className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-sm font-bold font-mono text-cyan-200 focus:border-cyan-400 outline-none"
                                                placeholder="e.g. 12-ER-2026-1001"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Standard/Grade</label>
                                             <select
                                                 value={formData.grade_level}
                                                 onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                                 className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none"
                                             >
                                                 {STANDARDS.map(g => (
                                                     <option key={g.id} value={g.id.startsWith('class_') ? g.id : `class_${g.id}`}>{g.name}</option>
                                                 ))}
                                             </select>
                                         </div>

                                         <div className="space-y-2">
                                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Board / Council</label>
                                              <select
                                                  value={formData.board}
                                                  onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                                  className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none"
                                              >
                                                  {BOARDS.map(b => (
                                                      <option key={b.id} value={b.id.toLowerCase()}>{b.name}</option>
                                                  ))}
                                              </select>
                                         </div>

                                        <div className="space-y-2">
                                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Section</label>
                                             <select
                                                 value={formData.section}
                                                 onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                                 className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none"
                                             >
                                                 <option value="A">Section A</option>
                                                 <option value="B">Section B</option>
                                                 <option value="C">Section C</option>
                                                 <option value="D">Section D</option>
                                                 <option value="E">Section E</option>
                                             </select>
                                        </div>

                                        <div className="space-y-2">
                                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stream / Field</label>
                                             <select
                                                 value={formData.stream}
                                                 onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                                 className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none"
                                             >
                                                 <option value="Science">Science (PCM/PCB)</option>
                                                 <option value="Commerce">Commerce</option>
                                                 <option value="Arts">Arts / Humanities</option>
                                                 <option value="General">General Studies</option>
                                             </select>
                                        </div>

                                        <div className="space-y-2">
                                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Medium / Language</label>
                                             <select
                                                 value={formData.medium}
                                                 onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                                                 className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none"
                                             >
                                                 <option value="english">English (English)</option>
                                                 <option value="hindi">Hindi (हिंदी)</option>
                                                 <option value="gujarati">Gujarati (ગુજરાતી)</option>
                                                 <option value="marathi">Marathi (मराठी)</option>
                                                 <option value="bengali">Bengali (বাংলা)</option>
                                                 <option value="tamil">Tamil (தமிழ்)</option>
                                                 <option value="telugu">Telugu (తెలుగు)</option>
                                                 <option value="kannada">Kannada (કન્નડ)</option>
                                                 <option value="malayalam">Malayalam (മലയാളം)</option>
                                                 <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                                                 <option value="urdu">Urdu (اردو)</option>
                                             </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Location</label>
                                            <button
                                                type="button"
                                                onClick={handleDetectGpsLocation}
                                                disabled={detectingGps}
                                                className="text-[10px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1 rounded-xl transition-all"
                                            >
                                                {detectingGps ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                                                {detectingGps ? 'Detecting City...' : '📍 Auto Detect GPS City'}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="e.g. Ahmedabad, Surat, Vadodara, Mumbai..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleDetectGpsLocation}
                                                disabled={detectingGps}
                                                className="px-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                                            >
                                                {detectingGps ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                                GPS Location
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    <div className="bg-white/[0.01] p-5 rounded-[24px] border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">School Name & Mode</span>
                                        <span className="text-white font-extrabold block text-base flex items-center gap-2">
                                            {formData.school_name || user?.schoolName || 'Not Configured'}
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                                                formData.isSchoolStudent ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}>
                                                {formData.isSchoolStudent ? 'School Student' : 'Self Study'}
                                            </span>
                                        </span>
                                    </div>

                                    {/* 🆔 Roll Number & Enrollment GR Number Displays */}
                                    <div className="bg-cyan-950/20 p-5 rounded-[24px] border border-cyan-500/30 space-y-1">
                                        <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">Class Roll No & GR Number</span>
                                        <div className="text-cyan-200 font-extrabold block text-base font-mono flex items-center gap-3">
                                            <span>Roll #{formData.rollNumber || user?.rollNumber || 'Not Set'}</span>
                                            <span className="text-gray-500">•</span>
                                            <span>GR: {formData.enrollmentNo || user?.enrollmentNo || 'Auto'}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.01] p-5 rounded-[24px] border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">City / Location</span>
                                        <span className="text-white font-extrabold block text-base">
                                            {(formData.state || user?.city) ? ((formData.state || user?.city || '').charAt(0).toUpperCase() + (formData.state || user?.city || '').slice(1)) : 'Not Provided'}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.01] p-5 rounded-[24px] border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Board / Standard / Class</span>
                                        <span className="text-white font-extrabold block text-base uppercase">
                                            {(formData.board || user?.board || 'N/A').toUpperCase()} • Class {(formData.grade_level || user?.standard || '10').toString().replace(/^class_/i, '')}-{formData.section || user?.section || 'A'} {(formData.stream || user?.stream) ? `(${formData.stream || user?.stream})` : ''}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.01] p-5 rounded-[24px] border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Medium / Language</span>
                                        <span className="text-white font-extrabold block text-base capitalize">
                                            {formData.medium || user?.medium || 'English'}
                                        </span>
                                    </div>
                                    <div className="bg-white/[0.01] p-5 rounded-[24px] border border-white/5 space-y-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Student Mobile</span>
                                        <span className="text-indigo-400 font-extrabold block text-base">{formData.mobile_number || user?.mobile_number || 'Not Configured'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                        {/* Parent Alerts Card */}
                        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4 italic">Parent Alerts 👨‍👩‍👦</h3>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Parent Email</label>
                                        <input
                                            value={formData.parentEmail}
                                            onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="parent@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Parent Phone (WhatsApp)</label>
                                        <input
                                            value={formData.parentPhone}
                                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="e.g. 919876543210"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Parent Email</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-300">{user?.parentDetails?.parentEmail || 'Not Configured'}</span>
                                            {user?.parentDetails?.parentEmail && (
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${user.parentDetails.parentEmailVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    {user.parentDetails.parentEmailVerified ? 'Verified 🟢' : 'Pending Verification 🟡'}
                                                </span>
                                            )}
                                        </div>
                                        {user?.parentDetails?.parentEmail && !user.parentDetails.parentEmailVerified && (
                                            <button
                                                onClick={handleResendParentVerification}
                                                disabled={resendingMail}
                                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase text-left mt-2 underline"
                                            >
                                                {resendingMail ? 'Resending...' : 'Resend Verification Mail'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Parent WhatsApp</span>
                                        <span className="text-sm font-bold text-gray-300">{user?.parentDetails?.parentPhone || 'Not Configured'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security Credentials Card */}
                        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-3xl space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4 italic">Security Credentials 🔒</h3>
                            {!showPasswordSection ? (
                                <Button
                                    onClick={() => setShowPasswordSection(true)}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-xs border border-white/10"
                                >
                                    Change Vault Password
                                </Button>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowPasswordSection(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            variant="ghost"
                                            className="w-full bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl h-10 text-xs font-black uppercase"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={passwordChanging}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 text-xs font-black uppercase"
                                        >
                                            {passwordChanging ? 'Syncing...' : 'Sync Key'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Danger Zone: Permanent Account Deletion Card */}
                        <div className="bg-rose-950/20 backdrop-blur-3xl border border-rose-500/20 p-8 rounded-[40px] shadow-3xl space-y-4 md:col-span-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-400 border-b border-rose-500/20 pb-4 italic flex items-center gap-2">
                                🚨 Danger Zone • Account Deletion
                            </h3>
                            <p className="text-xs text-gray-400">
                                Permanently delete your Future BRTS account, AI learning profile, and associated platform data. This action cannot be undone.
                            </p>
                            
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-6 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 active:scale-95"
                                >
                                    🗑️ Delete My Account Permanently
                                </button>
                            ) : (
                                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 space-y-3">
                                    <div className="text-xs font-bold text-rose-200">
                                        Are you 100% sure you want to delete your account? All progress, XP, and roadmaps will be lost forever.
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deletingAccount}
                                            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 disabled:opacity-50"
                                        >
                                            {deletingAccount ? 'Deleting Account...' : 'Yes, Delete My Account Now'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

