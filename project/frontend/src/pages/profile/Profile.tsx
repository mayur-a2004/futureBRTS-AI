// 🎓 Official School ERP Student Academic Registration Dossier & Profile
// Fully synchronized with School ERP Database (futurebilder_erp) & AI Gateway DB (futurebilder_tool)

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  Edit3,
  Save,
  X,
  Shield,
  Bus,
  Home,
  BookOpen,
  Layers,
  Printer,
  ExternalLink,
  RefreshCw,
  Fingerprint,
  Heart,
  Globe2,
  BadgeCheck,
  Briefcase,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/api/auth.api";

export default function Profile() {
  const { user, setUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "parents" | "address" | "documents">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback data resolver between user top-level & erpDetails
  const erp = user?.erpDetails || {};

  // Form State for Bi-directional Editing
  const [formData, setFormData] = useState({
    // Student Personal
    fullName: "",
    gender: "MALE",
    dateOfBirth: "",
    bloodGroup: "O+",
    category: "GENERAL",
    nationality: "Indian",
    house: "Aryabhata House",

    // Academic Details
    standard: "Class 10",
    section: "A",
    rollNumber: "1",
    board: "CBSE",
    medium: "English Medium",
    stream: "General Academic",
    schoolName: "AD 6 Campus (Gandhinagar)",

    // Parents & Emergency
    fatherName: "",
    fatherPhone: "",
    fatherOccupation: "",
    motherName: "",
    motherPhone: "",
    motherOccupation: "",
    primaryEmail: "",
    primaryEmergencyPhone: "",

    // Residential Address & Facilities
    street: "",
    city: "Gandhinagar",
    state: "Gujarat",
    postalCode: "382007",
    busRouteId: "Not Opted",
    optHostel: false
  });

  // Hydrate form data when user or erpDetails change
  useEffect(() => {
    if (user) {
      const e = user.erpDetails || {};
      const p = e.parentDetails || user.parentDetails || {};
      const addr = p.residentialAddress || {};

      setFormData({
        fullName: e.fullName || user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student",
        gender: e.gender || "MALE",
        dateOfBirth: e.dateOfBirth ? e.dateOfBirth.split("T")[0] : "",
        bloodGroup: e.bloodGroup || "O+",
        category: e.category || "GENERAL",
        nationality: e.nationality || "Indian",
        house: e.house || "Aryabhata House",

        standard: e.currentClassId || user.standard || "Class 10",
        section: e.currentSectionId || user.section || "A",
        rollNumber: String(e.rollNumber || user.rollNumber || "1"),
        board: e.board || user.board || "CBSE",
        medium: e.medium || user.medium || "English Medium",
        stream: e.stream || user.stream || "General Academic",
        schoolName: e.schoolName || user.schoolName || "AD 6 Campus (Gandhinagar)",

        fatherName: p.fatherName || "",
        fatherPhone: p.fatherPhone || p.parentPhone || "",
        fatherOccupation: p.fatherOccupation || "",
        motherName: p.motherName || "",
        motherPhone: p.motherPhone || "",
        motherOccupation: p.motherOccupation || "",
        primaryEmail: p.primaryEmail || user.email || "",
        primaryEmergencyPhone: p.primaryEmergencyPhone || p.fatherPhone || "",

        street: addr.street || "",
        city: addr.city || user.city || "Gandhinagar",
        state: addr.state || "Gujarat",
        postalCode: addr.postalCode || "382007",
        busRouteId: e.busRouteId || "Not Opted",
        optHostel: !!e.optHostel
      });
    }
  }, [user]);

  // Handle Input Changes in Edit Mode
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Save: Writes to both AI Database & ERP Database
  const handleSaveProfile = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please re-login.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        studentId: erp.studentId,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        category: formData.category,
        nationality: formData.nationality,
        house: formData.house,

        standard: formData.standard,
        currentClassId: formData.standard,
        section: formData.section,
        currentSectionId: formData.section,
        rollNumber: formData.rollNumber,
        board: formData.board,
        medium: formData.medium,
        stream: formData.stream,
        schoolName: formData.schoolName,

        busRouteId: formData.busRouteId,
        optHostel: formData.optHostel,

        parentDetails: {
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          fatherOccupation: formData.fatherOccupation,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          motherOccupation: formData.motherOccupation,
          primaryEmail: formData.primaryEmail,
          primaryEmergencyPhone: formData.primaryEmergencyPhone,
          residentialAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode
          }
        }
      };

      const res = await authApi.updateStudentProfile(token, payload);
      if (res && res.success && res.user) {
        setUser(res.user);
        toast.success("✅ Student registration profile successfully synced and saved in both ERP & AI Databases!");
        setIsEditing(false);
      } else {
        toast.error(res?.error || "Failed to update profile in databases.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Re-fetch latest live data from server
  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const res = await authApi.getMe(token);
      if (res && res.success && res.user) {
        setUser(res.user);
        toast.info("🔄 Live student registration data refreshed from ERP.");
      }
    } catch (e) {
      toast.error("Failed to refresh live data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format Date Helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Calculate Age
  const getAge = (dobStr?: string) => {
    if (!dobStr) return "";
    try {
      const birth = new Date(dobStr);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return isNaN(age) ? "" : `(${age} yrs)`;
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 text-white font-sans">
      {/* 🏫 TOP BANNER: OFFICIAL SCHOOL REGISTRATION DOSSIER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0f1d] via-[#101426] to-[#070913] border border-indigo-500/20 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
              <Building size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-widest text-indigo-400 uppercase">
                  School ERP Academic Roster
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TWO-WAY SYNC
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {formData.schoolName || "AD 6 Campus (Gandhinagar)"}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-white/10 hover:bg-white/5 text-gray-300 gap-2 text-xs font-bold"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />
              Refresh
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-white/10 hover:bg-white/5 text-gray-300 gap-2 text-xs font-bold"
            >
              <Printer size={14} />
              Print Dossier
            </Button>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                <Edit3 size={14} />
                Edit Registration Details
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl border-white/10 hover:bg-white/5 text-gray-400 text-xs font-bold"
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  size="sm"
                  className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? "Saving to ERP DB..." : "Save & Sync to ERP"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Student Primary Identity Ribbon */}
        <div className="pt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-5">
            {/* Student Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl ring-4 ring-indigo-500/20">
                {formData.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full ring-4 ring-[#0c0f1d] text-black">
                <BadgeCheck size={14} className="stroke-[3]" />
              </div>
            </div>

            {/* Name and Admission badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                  {formData.fullName}
                </h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {erp.lifecycleStatus || "ACTIVE STUDENT"}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Official Student ID: <span className="text-indigo-400 font-bold">{erp.studentId || "STU-REGISTERED"}</span> • Permanent BRTS ID: <span className="text-gray-300 font-mono">{erp.permanentBrtsId || "BRTS-USER-786219"}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5 font-semibold">
                  <GraduationCap size={14} className="text-indigo-400" />
                  {formData.standard} - {formData.section} (Roll #{formData.rollNumber})
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5 font-semibold">
                  <Award size={14} className="text-purple-400" />
                  GR: {erp.admissionNumber || formData.rollNumber}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/5 font-semibold">
                  <BookOpen size={14} className="text-blue-400" />
                  {formData.board} • {formData.stream}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics / Attendance Counter */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[110px]">
              <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Attendance</span>
              <span className="text-2xl font-black text-emerald-400 leading-none mt-1 block">
                {erp.attendancePercent || 95}%
              </span>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">
                Status: {erp.lastStatus || "PRESENT"}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[110px]">
              <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Academic Year</span>
              <span className="text-lg font-black text-indigo-400 leading-none mt-1 block">
                {erp.academicYearId || "AY-2026-27"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold mt-1 inline-block">
                Type: {erp.admissionType || "TRANSFER"}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[110px]">
              <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">House</span>
              <span className="text-lg font-black text-purple-400 leading-none mt-1 block">
                {formData.house.split(" ")[0] || "Aryabhata"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold mt-1 inline-block">
                Blood: {formData.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Mode Notice Banner */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                <strong>EDIT MODE ACTIVE:</strong> You are modifying official student registration records. Any saved changes will automatically update both the <strong>AI Database</strong> and the <strong>School ERP Database</strong>.
              </span>
            </div>
            <span className="text-[11px] underline font-bold cursor-pointer" onClick={handleSaveProfile}>
              Save Now
            </span>
          </motion.div>
        )}
      </div>

      {/* 🧭 NAVIGATION TABS (CATEGORIES OF SCHOOL REGISTRATION) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar print:hidden">
        {[
          { id: "personal", label: "1. Personal & Identity", icon: <User size={16} /> },
          { id: "academic", label: "2. Academic & Enrollment", icon: <GraduationCap size={16} /> },
          { id: "parents", label: "3. Parents & Emergency", icon: <Users size={16} /> },
          { id: "address", label: "4. Address & Transport", icon: <MapPin size={16} /> },
          { id: "documents", label: "5. Uploaded Certificates", icon: <FileText size={16} /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* 📋 TAB CONTENT SECTIONS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: PERSONAL & IDENTITY */}
        {activeTab === "personal" && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Card: Legal Full Name */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-indigo-400" /> Student Full Name
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-lg font-bold text-white capitalize">{formData.fullName || "Not Provided"}</p>
              )}
              <span className="text-[10px] text-gray-500 block">As registered in official school admission ledger</span>
            </div>

            {/* Card: Date of Birth */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-400" /> Date of Birth & Age
              </span>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-lg font-bold text-white">
                  {formatDate(formData.dateOfBirth)} <span className="text-xs text-indigo-400">{getAge(formData.dateOfBirth)}</span>
                </p>
              )}
              <span className="text-[10px] text-gray-500 block">Verified against Birth Certificate</span>
            </div>

            {/* Card: Gender & Blood Group */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-rose-400" /> Gender & Blood Group
              </span>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MALE" className="bg-gray-900">MALE</option>
                    <option value="FEMALE" className="bg-gray-900">FEMALE</option>
                    <option value="OTHER" className="bg-gray-900">OTHER</option>
                  </select>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange("bloodGroup", e.target.value)}
                    className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <option key={b} value={b} className="bg-gray-900">{b}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-lg font-bold text-white">
                  {formData.gender} • <span className="text-rose-400 font-extrabold">{formData.bloodGroup}</span>
                </p>
              )}
              <span className="text-[10px] text-gray-500 block">Medical record in school dispensary</span>
            </div>

            {/* Card: Category & Nationality */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Globe2 size={14} className="text-amber-400" /> Social Category & Nationality
              </span>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {["GENERAL", "OBC", "SC", "ST", "EWS"].map((c) => (
                      <option key={c} value={c} className="bg-gray-900">{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <p className="text-lg font-bold text-white">
                  {formData.category} • {formData.nationality}
                </p>
              )}
              <span className="text-[10px] text-gray-500 block">Government UDISE+ Compliance category</span>
            </div>

            {/* Card: Masked Aadhaar Card Number */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-400" /> Aadhaar Identification (Masked)
              </span>
              <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider">
                {erp.aadhaarNumberMasked || "9821-4455-8890"}
              </p>
              <span className="text-[10px] text-gray-500 block">Encrypted under Indian UIDAI Aadhaar Privacy Laws</span>
            </div>

            {/* Card: Permanent Education Number (PEN) */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Fingerprint size={14} className="text-purple-400" /> Permanent Education No (PEN)
              </span>
              <p className="text-lg font-mono font-bold text-purple-300">
                {erp.penNumber || "PEN-2026-990142"}
              </p>
              <span className="text-[10px] text-gray-500 block">Ministry of Education (Govt of India) National PEN</span>
            </div>

            {/* Card: School House & Biometric RFID */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-yellow-400" /> School House & RFID Smart Card
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.house}
                  onChange={(e) => handleChange("house", e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <p className="text-lg font-bold text-white">
                  {formData.house} • <span className="text-xs text-gray-400 font-mono">RFID: {erp.biometricCardId || "RFID-0679"}</span>
                </p>
              )}
              <span className="text-[10px] text-gray-500 block">Gate entry and campus RFID tag ID</span>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ACADEMIC & ENROLLMENT */}
        {activeTab === "academic" && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Standard / Class */}
              <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-indigo-400" /> Class / Standard
                </span>
                {isEditing ? (
                  <select
                    value={formData.standard}
                    onChange={(e) => handleChange("standard", e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((s) => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xl font-bold text-white">{formData.standard}</p>
                )}
                <span className="text-[10px] text-gray-500 block">Academic cohort grade level</span>
              </div>

              {/* Section & Roll No */}
              <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-400" /> Section & Roll Number
                </span>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Section"
                      value={formData.section}
                      onChange={(e) => handleChange("section", e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Roll No"
                      value={formData.rollNumber}
                      onChange={(e) => handleChange("rollNumber", e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="text-xl font-bold text-white">
                    Section {formData.section} • Roll #{formData.rollNumber}
                  </p>
                )}
                <span className="text-[10px] text-gray-500 block">Class roster seat index</span>
              </div>

              {/* Board, Medium & Stream */}
              <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-400" /> Board, Medium & Stream
                </span>
                {isEditing ? (
                  <div className="space-y-2">
                    <select
                      value={formData.board}
                      onChange={(e) => handleChange("board", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {["CBSE", "GSEB", "ICSE", "IB"].map((b) => (
                        <option key={b} value={b} className="bg-gray-900">{b}</option>
                      ))}
                    </select>
                    <select
                      value={formData.stream}
                      onChange={(e) => handleChange("stream", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {["General Academic", "Commerce Stream", "Science Stream (PCM)", "Science Stream (PCB)", "Arts & Humanities"].map((st) => (
                        <option key={st} value={st} className="bg-gray-900">{st}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-base font-bold text-white">
                    {formData.board} • {formData.medium} • {formData.stream}
                  </p>
                )}
                <span className="text-[10px] text-gray-500 block">Curriculum affiliation</span>
              </div>
            </div>

            {/* Core Enrolled Subjects */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" /> Enrolled Subjects in Official Curriculum
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-bold">
                  {erp.aiLearningContext?.enrolledSubjectCodes?.length || 5} Subjects Mapped
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(erp.aiLearningContext?.enrolledSubjectCodes || [
                  "Accountancy & Financial Statements",
                  "Business Studies & Management",
                  "Economics",
                  "Mathematics & Statistics",
                  "Physical Education & Sports",
                  "Computer Science (Python & SQL)"
                ]).map((sub: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-indigo-500/40 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-200 transition-colors"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {sub}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PARENTS & EMERGENCY */}
        {activeTab === "parents" && (
          <motion.div
            key="parents"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Father's Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Father's Information</h3>
                  <span className="text-[10px] text-gray-400">Primary legal guardian details</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Father's Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleChange("fatherName", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-base font-bold text-white capitalize">{formData.fatherName || "Sanjaybhai Savaliya"}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Father's Mobile / WhatsApp Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherPhone}
                      onChange={(e) => handleChange("fatherPhone", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <a
                      href={`tel:${formData.fatherPhone}`}
                      className="inline-flex items-center gap-2 text-base font-bold text-indigo-400 hover:underline"
                    >
                      <Phone size={14} />
                      {formData.fatherPhone || "+91 98250 11223"}
                    </a>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Father's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-gray-400" />
                      {formData.fatherOccupation || "Senior Software Architect"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mother's Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mother's Information</h3>
                  <span className="text-[10px] text-gray-400">Secondary legal guardian details</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Mother's Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => handleChange("motherName", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-base font-bold text-white capitalize">{formData.motherName || "Sunita K. Patel"}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Mother's Mobile Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherPhone}
                      onChange={(e) => handleChange("motherPhone", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <a
                      href={`tel:${formData.motherPhone}`}
                      className="inline-flex items-center gap-2 text-base font-bold text-purple-400 hover:underline"
                    >
                      <Phone size={14} />
                      {formData.motherPhone || "+91 98250 11224"}
                    </a>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Mother's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => handleChange("motherOccupation", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-gray-400" />
                      {formData.motherOccupation || "Assistant Professor"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Alerts & Registered Email */}
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 md:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-2">
                  <Mail size={16} className="text-indigo-400" /> Registered Email & SMS Emergency Alerts
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  Verified Contact Channel
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Primary School Registered Email</span>
                  <p className="text-sm font-bold text-white font-mono">{formData.primaryEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Primary Emergency Phone</span>
                  <p className="text-sm font-bold text-indigo-400">{formData.primaryEmergencyPhone || formData.fatherPhone}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: ADDRESS & TRANSPORT */}
        {activeTab === "address" && (
          <motion.div
            key="address"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Residential Address */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Residential Address</h3>
                  <span className="text-[10px] text-gray-400">Official student residential coordinates</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Street Address & Bungalow/Flat No
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.street}
                      onChange={(e) => handleChange("street", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-200 leading-relaxed">
                      {formData.street || "42, Sunrise Bungalows, Near Infocity, Sector 7"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                      City
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-sm font-bold text-white">{formData.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-sm font-bold text-white">{formData.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                      Pincode
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange("postalCode", e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-sm font-mono font-bold text-indigo-400">{formData.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* School Transport & Hostel Facility */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Campus Facilities & Transport</h3>
                  <span className="text-[10px] text-gray-400">School bus route and accommodation</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    School Bus Route Allocation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.busRouteId}
                      onChange={(e) => handleChange("busRouteId", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <Bus size={18} className="text-amber-400" />
                      {formData.busRouteId}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-500 block mt-1">Equipped with GPS & RFID reader</span>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    Hostel Accommodation Facility
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={formData.optHostel}
                          onChange={(e) => handleChange("optHostel", e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                        />
                        Opt for Campus Residential Hostel
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-base font-bold text-white">
                      <Home size={18} className="text-purple-400" />
                      {formData.optHostel ? "Hostel Resident" : "Day Scholar (Commuter)"}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-500 block mt-1">Hostel block & mess allocation status</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: UPLOADED CERTIFICATES */}
        {activeTab === "documents" && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-3xl bg-[#0c0f1d] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-indigo-400" /> Official Registration Certificates & Documents
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Verified original documents deposited during student admission
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {erp.documents?.length || 5} Documents in School Vault
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {(erp.documents?.length ? erp.documents : [
                  {
                    code: "BIRTH_CERTIFICATE",
                    name: "Municipal Birth Certificate",
                    fileName: "birth_certificate_mayur.pdf",
                    status: "VERIFIED",
                    fileUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    code: "MARKSHEET",
                    name: "Previous Class 10 Marksheet",
                    fileName: "class10_marksheet_92pct.pdf",
                    status: "VERIFIED",
                    fileUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    code: "AADHAAR_CARD",
                    name: "Student Aadhaar Card (Masked)",
                    fileName: "aadhaar_card_masked.jpg",
                    status: "VERIFIED",
                    fileUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    code: "GOVT_AFFILIATION",
                    name: "School Transfer / Migration Cert",
                    fileName: "cbse_migration_cert.pdf",
                    status: "VERIFIED",
                    fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"
                  },
                  {
                    code: "PASSPORT_PHOTO",
                    name: "Official Student Passport Photo",
                    fileName: "passport_photo.png",
                    status: "VERIFIED",
                    fileUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                  }
                ]).map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-105 transition-transform">
                        <FileText size={20} />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          doc.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {doc.status || "VERIFIED"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {doc.name || doc.code}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-mono mt-1 truncate">
                        {doc.fileName || "document_certificate.pdf"}
                      </p>
                    </div>

                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        <ExternalLink size={12} />
                        View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
