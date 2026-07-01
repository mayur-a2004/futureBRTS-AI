import { MapPin, Github, Linkedin, Mail, BadgeCheck, Globe, Code, Activity, Edit3, Save } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export default function Profile() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const [resendingMail, setResendingMail] = useState(false);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        parentEmail: user?.parentDetails?.parentEmail || '',
        parentPhone: user?.parentDetails?.parentPhone || '',
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

    useEffect(() => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            parentEmail: user?.parentDetails?.parentEmail || '',
            parentPhone: user?.parentDetails?.parentPhone || '',
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
                
                const [statsRes, projRes] = await Promise.all([
                    fetch('/api/builder/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('/api/collage-project/list', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                const statsData = await statsRes.json();
                const projData = await projRes.json();
 
                if (statsData.success) setStats(statsData.stats);
                if (projData.success) setProjects(projData.projects.slice(0, 4));
            } catch (e) {
                console.error("Profile data fetch error", e);
            }
        };
        fetchProfileData();
    }, []);
 
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            
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
                    profile: {
                        ...formData.profile,
                        skills: formData.profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                    }
                })
            });
            const data = await res.json();

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

            if (data.success && parentData.success) {
                setUser({
                    ...data.user,
                    parentDetails: parentData.parentDetails
                });
                setIsEditing(false);
                toast.success("Identity Matrix & Parent Alerts Sync Successful! 🚀");
            } else {
                toast.error(data.error || parentData.error || "Update Failed");
            }
        } catch (e) {
            console.error(e);
            toast.error("Critical System Error during Sync");
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
                    <div className="group relative">
                        <div className="w-40 h-40 rounded-[40px] border-8 border-[#0A0A0A] bg-gray-900 flex items-center justify-center overflow-hidden shadow-3xl transform transition-transform group-hover:scale-105">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Builder'}`} alt="Avatar" className="w-full h-full" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[40px] cursor-pointer">
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

            <div className="grid lg:grid-cols-3 gap-10 px-4">
                {/* Left Column - Meta Data */}
                <div className="space-y-8">
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
                </div>

                {/* Main Content - Activity & Showcase */}
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
        </div>
    )
}

