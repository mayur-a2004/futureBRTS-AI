import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, School, BookOpen, GraduationCap, CheckCircle2, ChevronRight, Sparkles, Loader2, X, Plus } from 'lucide-react';
import axios from 'axios';

interface StudentRegistrationModalProps {
    isOpen: boolean;
    onClose?: () => void;
    onCompleted?: (userData: any) => void;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
    isOpen,
    onClose,
    onCompleted
}) => {
    const { token, user, updateUser } = useAuth() as any;

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    
    // Step 1 State: Location
    const [city, setCity] = useState(user?.city || 'Ahmedabad');
    const [citiesList, setCitiesList] = useState<string[]>([]);
    const [detectingGps, setDetectingGps] = useState(false);

    // Step 2 State: School
    const [schoolName, setSchoolName] = useState(user?.schoolName || 'Mount Carmel High School');
    const [tenantOrgId, setTenantOrgId] = useState(user?.tenantOrgId || 'mount_carmel_school');
    const [schoolsList, setSchoolsList] = useState<any[]>([]);
    const [isCustomSchool, setIsCustomSchool] = useState(false);
    const [customSchoolName, setCustomSchoolName] = useState('');

    // Step 3 State: Education Track & Board
    const [educationType, setEducationType] = useState<'k12' | 'higher_ed' | 'competitive'>(user?.educationType || 'k12');
    const [board, setBoard] = useState(user?.board || 'CBSE');

    // Step 4 State: Standard, Section, Stream
    const [standard, setStandard] = useState(user?.standard || '10');
    const [section, setSection] = useState(user?.section || 'A');
    const [stream, setStream] = useState(user?.stream || 'Science');
    const [branch, setBranch] = useState(user?.branch || '');
    const [semester, setSemester] = useState(user?.semester || '');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCities();
            fetchSchools(city);
        }
    }, [isOpen]);

    useEffect(() => {
        if (city) {
            fetchSchools(city);
        }
    }, [city]);

    const fetchCities = async () => {
        try {
            const res = await axios.get('/api/v1/onboarding/cities');
            if (res.data && res.data.cities) {
                setCitiesList(res.data.cities);
            }
        } catch (e) {
            setCitiesList(['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Mumbai', 'Delhi', 'Pune', 'Bangalore']);
        }
    };

    const fetchSchools = async (targetCity: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/onboarding/schools?city=${encodeURIComponent(targetCity)}`);
            if (res.data && res.data.schools) {
                setSchoolsList(res.data.schools);
                if (res.data.schools.length > 0 && !isCustomSchool) {
                    setSchoolName(res.data.schools[0].schoolName);
                    setTenantOrgId(res.data.schools[0].tenantOrgId);
                    setBoard(res.data.schools[0].board || 'CBSE');
                }
            }
        } catch (e) {
            console.warn('Could not fetch schools:', e);
        } finally {
            setLoading(false);
        }
    };

    // Auto GPS Location Detector
    const handleDetectGps = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setDetectingGps(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    if (res.data && res.data.address) {
                        const detectedCity = res.data.address.city || res.data.address.town || res.data.address.state_district || 'Ahmedabad';
                        setCity(detectedCity);
                    }
                } catch (err) {
                    setCity('Ahmedabad');
                } finally {
                    setDetectingGps(false);
                }
            },
            (err) => {
                setDetectingGps(false);
                alert('Location permission denied or unavailable. Please select your city manually.');
            }
        );
    };

    // Handle Custom School Registration
    const handleSelectSchool = (val: string) => {
        if (val === 'OTHER_CUSTOM') {
            setIsCustomSchool(true);
            setSchoolName('');
            setTenantOrgId('');
        } else {
            setIsCustomSchool(false);
            const found = schoolsList.find(s => s.tenantOrgId === val || s.schoolName === val);
            if (found) {
                setSchoolName(found.schoolName);
                setTenantOrgId(found.tenantOrgId);
                if (found.board) setBoard(found.board);
            } else {
                setSchoolName(val);
                setTenantOrgId(val.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
            }
        }
    };

    // Final Submission
    const handleSubmitRegistration = async () => {
        setErrorMsg('');
        setSubmitting(true);

        try {
            let finalSchool = schoolName;
            let finalOrgId = tenantOrgId;

            // If custom school added, register it first
            if (isCustomSchool && customSchoolName.trim()) {
                finalSchool = customSchoolName.trim();
                const regRes = await axios.post('/api/v1/onboarding/register-school', {
                    city,
                    schoolName: finalSchool,
                    board
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (regRes.data && regRes.data.school) {
                    finalOrgId = regRes.data.school.tenantOrgId;
                } else {
                    finalOrgId = finalSchool.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                }
            }

            const payload = {
                city,
                schoolName: finalSchool,
                tenantOrgId: finalOrgId,
                educationType,
                board,
                standard,
                section,
                stream,
                branch,
                semester
            };

            const res = await axios.post('/api/v1/onboarding/complete', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                if (updateUser) {
                    updateUser({
                        ...user,
                        city,
                        schoolName: finalSchool,
                        tenantOrgId: finalOrgId,
                        educationType,
                        board,
                        standard,
                        section,
                        stream,
                        onboardingCompleted: true
                    });
                }

                if (onCompleted) {
                    onCompleted(res.data.user);
                }

                if (onClose) {
                    onClose();
                }
            } else {
                setErrorMsg(res.data?.error || 'Failed to complete registration');
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.error || err.message || 'Error completing registration');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#090714] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white space-y-6">
                {/* Glow Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Optional Close Button if user is already onboarded */}
                {user?.onboardingCompleted && onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-20"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Header */}
                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                            Future Education OS • Registration
                        </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <GraduationCap className="text-indigo-400" size={26} /> Student Profile & School Mapping
                    </h2>
                    <p className="text-xs text-gray-400">
                        Select your city and school to automatically sync class timetables, homework & AI roadmaps.
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    {[
                        { id: 1, title: 'Location' },
                        { id: 2, title: 'School' },
                        { id: 3, title: 'Track & Board' },
                        { id: 4, title: 'Class & Section' }
                    ].map(s => (
                        <div key={s.id} className="space-y-1.5">
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${
                                step >= s.id ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/30' : 'bg-white/10'
                            }`} />
                            <span className={`text-[10px] font-bold block truncate ${
                                step === s.id ? 'text-indigo-300' : step > s.id ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                {s.id}. {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* STEP 1: CITY & LOCATION */}
                {step === 1 && (
                    <div className="space-y-5 relative z-10 animate-in fade-in">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                                📍 1. Select Your Current City / Location
                            </label>
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Type your city (e.g. Ahmedabad, Mumbai)..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono"
                                />
                                <button
                                    onClick={handleDetectGps}
                                    disabled={detectingGps}
                                    className="px-4 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    {detectingGps ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                    Auto GPS
                                </button>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Popular Cities in India:</span>
                            <div className="flex flex-wrap gap-2">
                                {['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Jaipur', 'Indore'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCity(c)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                            city.toLowerCase() === c.toLowerCase()
                                                ? 'bg-indigo-600 text-white font-bold shadow-md'
                                                : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!city.trim()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                            >
                                Next: Select School <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SCHOOL SELECTION */}
                {step === 2 && (
                    <div className="space-y-5 relative z-10 animate-in fade-in">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                                🏫 2. Registered Schools in {city}
                            </label>

                            {loading ? (
                                <div className="p-8 text-center text-xs text-gray-400 font-mono">
                                    Loading registered schools for {city}...
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <select
                                        value={isCustomSchool ? 'OTHER_CUSTOM' : tenantOrgId}
                                        onChange={(e) => handleSelectSchool(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 transition-all font-mono"
                                    >
                                        {schoolsList.map((s) => (
                                            <option key={s.tenantOrgId} value={s.tenantOrgId}>
                                                {s.schoolName} ({s.board || 'CBSE'})
                                            </option>
                                        ))}
                                        <option value="OTHER_CUSTOM">➕ Other / Add New School Manually</option>
                                    </select>

                                    {isCustomSchool && (
                                        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                                            <label className="text-[11px] font-bold text-purple-300 block">
                                                Enter Custom School Name:
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={customSchoolName}
                                                onChange={(e) => setCustomSchoolName(e.target.value)}
                                                placeholder="e.g. Sunshine International School..."
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-purple-400 font-mono"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={isCustomSchool && !customSchoolName.trim()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                            >
                                Next: Education Track <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: EDUCATION TRACK & BOARD */}
                {step === 3 && (
                    <div className="space-y-5 relative z-10 animate-in fade-in">
                        {/* Education Track Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                                🎓 3. Select Education Track
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { id: 'k12', title: 'K-12 Schooling', desc: 'Class 1 to Class 12', icon: BookOpen },
                                    { id: 'higher_ed', title: 'Higher Education', desc: 'B.Tech, BCA, B.Sc, MBA', icon: GraduationCap },
                                    { id: 'competitive', title: 'Competitive Prep', desc: 'JEE, NEET, UPSC, GATE', icon: Sparkles }
                                ].map(t => {
                                    const Icon = t.icon;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setEducationType(t.id as any)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                                                educationType === t.id
                                                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                                                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            <Icon size={18} className={educationType === t.id ? 'text-indigo-400' : 'text-gray-500'} />
                                            <div className="text-xs font-bold text-white">{t.title}</div>
                                            <div className="text-[10px] text-gray-400">{t.desc}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Board Selector */}
                        {educationType === 'k12' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                                    Select Education Board
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['CBSE', 'ICSE', 'GSEB (Gujarat)', 'State Board', 'IB', 'Cambridge'].map(b => (
                                        <button
                                            key={b}
                                            onClick={() => setBoard(b)}
                                            className={`p-3 rounded-xl text-xs font-bold transition-all text-center ${
                                                board === b
                                                    ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md'
                                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5 flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                            >
                                Next: Standard & Section <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: STANDARD, SECTION & STREAM */}
                {step === 4 && (
                    <div className="space-y-5 relative z-10 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Standard / Grade */}
                            <div>
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                                    Standard / Grade
                                </label>
                                <select
                                    value={standard}
                                    onChange={(e) => setStandard(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                                >
                                    {['6', '7', '8', '9', '10', '11', '12'].map(g => (
                                        <option key={g} value={g}>Class {g}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                                    Class Section
                                </label>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                                >
                                    {['A', 'B', 'C', 'D', 'E'].map(s => (
                                        <option key={s} value={s}>Section {s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stream (Class 11-12) */}
                            {(standard === '11' || standard === '12') && (
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                                        Academic Stream
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Science', 'Commerce', 'Arts'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => setStream(st)}
                                                className={`p-3 rounded-xl text-xs font-bold transition-all text-center ${
                                                    stream === st
                                                        ? 'bg-indigo-600 text-white border border-indigo-400'
                                                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Summary Badge */}
                        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1 font-mono">
                            <div className="text-indigo-300 font-bold">📋 Profile Summary:</div>
                            <div className="text-gray-300">
                                School: <span className="text-white font-bold">{isCustomSchool ? customSchoolName : schoolName}</span> ({city})
                            </div>
                            <div className="text-gray-300">
                                Class ID: <span className="text-emerald-400 font-bold">CLASS-{standard}{section}</span> ({board} Board)
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between">
                            <button
                                onClick={() => setStep(3)}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmitRegistration}
                                disabled={submitting}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black rounded-2xl text-xs transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-95"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                Complete Student Registration & Sync Workspace
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentRegistrationModal;
