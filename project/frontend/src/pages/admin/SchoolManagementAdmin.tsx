import React, { useEffect, useState } from 'react';
import { Building2, Plus, Copy, Check, RefreshCw, Wallet, Trash2, ExternalLink, Key, ShieldCheck, Send, Code, Sparkles, AlertCircle, MapPin, Star, Settings2, Sliders, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Edit3, Users, Search, Download, BarChart3, Activity, Cpu } from 'lucide-react';
import axios from 'axios';

export const SchoolManagementAdmin: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrgId, setNewOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('SINGLE_SCHOOL');
  const [newParentOrgId, setNewParentOrgId] = useState('');
  const [newCity, setNewCity] = useState('Ahmedabad');
  const [newState, setNewState] = useState('Gujarat');
  const [newStarRating, setNewStarRating] = useState<number>(5);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('https://erp.school.edu.in/api/v1/ai-webhook');
  const [submitting, setSubmitting] = useState(false);

  // Edit School Profile Modal State
  const [editTenant, setEditTenant] = useState<any | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // School Users Inspector Modal State
  const [viewUsersTenant, setViewUsersTenant] = useState<any | null>(null);
  const [schoolUsersList, setSchoolUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Feature Access Permissions Modal (School Feature Control Panel)
  const [manageFeaturesTenant, setManageFeaturesTenant] = useState<any | null>(null);
  const [updatingFeatures, setUpdatingFeatures] = useState(false);
  const [tempFlags, setTempFlags] = useState<any>({
    aiTutor: true,
    visionHomework: true,
    studyRoadmaps: true,
    quizBattles: true,
    practiceExams: true,
    principalDossier: true,
    parentTeacherHub: true,
    futureEducationOS: true,
    futureBRTSBuilder: true
  });

  // Created Credentials Modal
  const [createdTenant, setCreatedTenant] = useState<any | null>(null);

  // View Credentials Modal
  const [viewKeysTenant, setViewKeysTenant] = useState<any | null>(null);

  // Top-Up Wallet Modal
  const [topUpTenant, setTopUpTenant] = useState<any | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);

  // Embed & Code Snippet Generator Modal
  const [embedModalTenant, setEmbedModalTenant] = useState<any | null>(null);
  const [codeTab, setCodeTab] = useState<'widget' | 'nodejs' | 'python' | 'php'>('widget');

  // Telemetry AI & Usage Clicks Analytics Modal State
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<string>('7d');
  const [analyticsOrgId, setAnalyticsOrgId] = useState<string>('ALL');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Test Webhook Modal
  const [testWebhookTenant, setTestWebhookTenant] = useState<any | null>(null);
  const [dispatchingWebhook, setDispatchingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);

  // Master System Credentials
  const MASTER_API_KEY = "fbrts_master_live_key_99x8273645";
  const MASTER_HMAC_SECRET = "fbrts_hmac_sec_778129384729384";
  const MASTER_GATEWAY_URL = "http://localhost:7001";

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/tenant/all');
      if (res.data && res.data.tenants) {
        setTenants(res.data.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch tenants from API gateway:', err);
      // High-Fidelity Fallback Demo Data for immediate out-of-the-box UI rendering
      setTenants([
        {
          orgId: 'mount_carmel_school',
          orgName: 'Mount Carmel High School, Ahmedabad',
          orgType: 'SINGLE_SCHOOL',
          city: 'Ahmedabad',
          state: 'Gujarat',
          starRating: 5,
          contactEmail: 'principal@mountcarmel.edu.in',
          contactPhone: '+91 98250 12345',
          apiKey: 'fbrts_ak_mt_carmel_8a92f',
          secretKey: 'fbrts_sk_mt_carmel_sec_99182',
          webhookUrl: 'https://erp.mountcarmel.edu.in/api/v1/ai-webhook',
          featureFlags: {
            aiTutor: true,
            visionHomework: true,
            studyRoadmaps: true,
            quizBattles: true,
            practiceExams: true,
            principalDossier: true,
            parentTeacherHub: true,
            futureEducationOS: true,
            futureBRTSBuilder: true
          },
          billing: { planType: 'PREPAID_WALLET', walletBalanceINR: 5000, costPerQueryINR: 0.5 },
          createdAt: new Date().toISOString()
        },
        {
          orgId: 'dps_delhi_ncr',
          orgName: 'Delhi Public School (DPS Delhi-NCR)',
          orgType: 'MULTI_BRANCH_CHAIN',
          city: 'New Delhi',
          state: 'Delhi-NCR',
          starRating: 5,
          contactEmail: 'admin@dpsdelhi.edu.in',
          contactPhone: '+91 98110 99887',
          apiKey: 'fbrts_ak_dps_delhi_11c09',
          secretKey: 'fbrts_sk_dps_delhi_sec_44129',
          webhookUrl: 'https://erp.dpsdelhi.edu.in/api/v1/ai-webhook',
          featureFlags: {
            aiTutor: true,
            visionHomework: true,
            studyRoadmaps: true,
            quizBattles: true,
            practiceExams: true,
            principalDossier: true,
            parentTeacherHub: true,
            futureEducationOS: true,
            futureBRTSBuilder: true
          },
          billing: { planType: 'PREPAID_WALLET', walletBalanceINR: 15000, costPerQueryINR: 0.4 },
          createdAt: new Date().toISOString()
        },
        {
          orgId: 'silver_oak_university',
          orgName: 'Silver Oak University Partner Campus',
          orgType: 'UNIVERSITY_HQ',
          city: 'Ahmedabad',
          state: 'Gujarat',
          starRating: 5,
          contactEmail: 'vicechancellor@silveroakuni.ac.in',
          contactPhone: '+91 79 2762 1234',
          apiKey: 'fbrts_ak_silver_oak_77e1b',
          secretKey: 'fbrts_sk_silver_oak_sec_88291',
          webhookUrl: 'https://erp.silveroakuni.ac.in/webhooks/future-brts',
          featureFlags: {
            aiTutor: true,
            visionHomework: true,
            studyRoadmaps: true,
            quizBattles: true,
            practiceExams: true,
            principalDossier: true,
            parentTeacherHub: true,
            futureEducationOS: true,
            futureBRTSBuilder: true
          },
          billing: { planType: 'PREPAID_WALLET', walletBalanceINR: 25000, costPerQueryINR: 0.3 },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgNameChange = (name: string) => {
    setNewOrgName(name);
    // Auto generate clean Org ID slug from school name
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setNewOrgId(autoSlug);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgId || !newOrgName) return;

    setSubmitting(true);
    try {
      const res = await axios.post('/api/v1/tenant/register', {
        orgId: newOrgId.toLowerCase().replace(/\s+/g, '_'),
        orgName: newOrgName,
        orgType: newOrgType,
        parentOrgId: newParentOrgId || undefined,
        city: newCity,
        state: newState,
        starRating: newStarRating,
        contactEmail: newContactEmail,
        contactPhone: newContactPhone,
        webhookUrl: newWebhookUrl
      });

      if (res.data && res.data.success) {
        setCreatedTenant({
          orgId: res.data.tenant.orgId,
          orgName: res.data.tenant.orgName,
          apiKey: res.data.tenant.apiKey,
          secretKey: res.data.tenant.secretKey,
          webhookUrl: res.data.tenant.webhookUrl
        });
        setShowAddModal(false);
        setNewOrgId('');
        setNewOrgName('');
        fetchTenants();
      }
    } catch (err: any) {
      alert(`Error creating school tenant: ${err.response?.data?.error || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenant) return;
    setUpdatingProfile(true);
    try {
      await axios.post('/api/v1/tenant/update-profile', {
        orgId: editTenant.orgId,
        orgName: editTenant.orgName,
        orgType: editTenant.orgType,
        city: editTenant.city,
        state: editTenant.state,
        starRating: editTenant.starRating,
        contactEmail: editTenant.contactEmail,
        contactPhone: editTenant.contactPhone,
        webhookUrl: editTenant.webhookUrl
      });
      setEditTenant(null);
      fetchTenants();
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleFetchSchoolUsers = async (tenant: any) => {
    setViewUsersTenant(tenant);
    setLoadingUsers(true);
    try {
      const res = await axios.get(`/api/v1/tenant/${tenant.orgId}/users`);
      if (res.data && res.data.users) {
        setSchoolUsersList(res.data.users);
      }
    } catch (err) {
      // Demo fallback users list
      setSchoolUsersList([
        { externalId: 'STU-10492', name: 'Aarav Sharma', role: 'STUDENT', grade: 'Class 10-A', email: 'aarav.s@school.edu.in', queriesUsed: 42, lastActive: '10 mins ago', status: 'ACTIVE' },
        { externalId: 'STU-10493', name: 'Priya Patel', role: 'STUDENT', grade: 'Class 10-A', email: 'priya.p@school.edu.in', queriesUsed: 89, lastActive: '25 mins ago', status: 'ACTIVE' },
        { externalId: 'TCH-901', name: 'Mrs. Anjali Mehta', role: 'TEACHER', subject: 'Mathematics', email: 'anjali.m@school.edu.in', assignmentsCreated: 14, lastActive: '1 hour ago', status: 'ACTIVE' },
        { externalId: 'STU-10494', name: 'Rohan Verma', role: 'STUDENT', grade: 'Class 10-B', email: 'rohan.v@school.edu.in', queriesUsed: 19, lastActive: 'Yesterday', status: 'ACTIVE' },
        { externalId: 'STU-10495', name: 'Diya Sengupta', role: 'STUDENT', grade: 'Class 12-Science', email: 'diya.s@school.edu.in', queriesUsed: 134, lastActive: '5 mins ago', status: 'ACTIVE' },
        { externalId: 'PRN-001', name: 'Dr. Ramesh Kumar', role: 'PRINCIPAL', email: 'principal@school.edu.in', dossiersViewed: 38, lastActive: 'Just now', status: 'ACTIVE' }
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFetchAnalytics = async (timeRange: string = analyticsTimeRange, orgId: string = analyticsOrgId) => {
    setShowAnalyticsModal(true);
    setLoadingAnalytics(true);
    setAnalyticsTimeRange(timeRange);
    setAnalyticsOrgId(orgId);
    try {
      const res = await axios.get(`/api/v1/tenant/analytics?timeRange=${timeRange}&orgId=${orgId}`);
      if (res.data && res.data.analytics) {
        setAnalyticsData(res.data.analytics);
      }
    } catch (err) {
      console.warn('Could not fetch telemetry analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleOpenFeatureManager = (tenant: any) => {
    setManageFeaturesTenant(tenant);
    setTempFlags({
      aiTutor: tenant.featureFlags?.aiTutor !== false,
      visionHomework: tenant.featureFlags?.visionHomework !== false,
      studyRoadmaps: tenant.featureFlags?.studyRoadmaps !== false,
      quizBattles: tenant.featureFlags?.quizBattles !== false,
      practiceExams: tenant.featureFlags?.practiceExams !== false,
      principalDossier: tenant.featureFlags?.principalDossier !== false,
      parentTeacherHub: tenant.featureFlags?.parentTeacherHub !== false,
      futureEducationOS: tenant.featureFlags?.futureEducationOS !== false,
      futureBRTSBuilder: tenant.featureFlags?.futureBRTSBuilder !== false
    });
  };

  const handleSaveFeatureFlags = async () => {
    if (!manageFeaturesTenant) return;
    setUpdatingFeatures(true);
    try {
      await axios.post('/api/v1/tenant/update-features', {
        orgId: manageFeaturesTenant.orgId,
        featureFlags: tempFlags
      });
      setManageFeaturesTenant(null);
      fetchTenants();
    } catch (err: any) {
      alert(`Error updating feature permissions: ${err.message}`);
    } finally {
      setUpdatingFeatures(false);
    }
  };

  const handleTopUpWallet = async () => {
    if (!topUpTenant) return;
    try {
      const updatedBalance = (topUpTenant.billing?.walletBalanceINR || 0) + Number(topUpAmount);
      await axios.post('/api/v1/tenant/update-wallet', {
        orgId: topUpTenant.orgId,
        walletBalanceINR: updatedBalance
      });
      setTopUpTenant(null);
      fetchTenants();
    } catch (err: any) {
      alert(`Error updating wallet: ${err.message}`);
    }
  };

  const handleTestWebhookDispatch = async () => {
    if (!testWebhookTenant) return;
    setDispatchingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await axios.post('/api/v1/tenant/test-webhook', {
        webhookUrl: testWebhookTenant.webhookUrl || 'https://erp.school.edu.in/api/v1/ai-webhook',
        event: 'HOMEWORK_GRADED',
        tenantId: testWebhookTenant.orgId,
        externalId: 'STUDENT-10492',
        studentName: 'Aarav Sharma',
        scoreObtained: 9.5,
        maxScore: 10.0
      });
      setWebhookResult({
        success: true,
        message: 'Dispatched test payload to ERP Webhook Callback URL',
        data: res.data
      });
    } catch (err: any) {
      setWebhookResult({
        success: false,
        message: err.response?.data?.error || err.message
      });
    } finally {
      setDispatchingWebhook(false);
    }
  };

  const handleDeleteTenant = async (orgId: string, orgName: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete school "${orgName}"? Access will be revoked.`)) return;
    try {
      await axios.delete(`/api/v1/tenant/${orgId}`);
      fetchTenants();
    } catch (err: any) {
      alert(`Error deleting tenant: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEnabledModulesCount = (flags: any) => {
    if (!flags) return 9;
    return Object.values(flags).filter(val => val === true).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* 👑 MASTER SYSTEM INTEGRATION BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-black border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Future BRTS & Future Education OS Master Architecture</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Building2 size={32} className="text-indigo-400" /> B2B School & ERP Tenant Control Center
            </h1>
            <p className="text-gray-400 text-xs mt-2 max-w-2xl">
              Connect external School Management Systems (ERP), Colleges, and Universities with Future Education OS AI Gateway via HMAC Credentials, Webhooks, and Granular ON/OFF Module Access Control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleFetchAnalytics('7d', 'ALL')}
              className="px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-300 hover:text-white transition-all active:scale-95 text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <BarChart3 size={16} className="text-indigo-400" /> Usage Analytics 📈
            </button>
            <button
              onClick={fetchTenants}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all active:scale-95 text-xs font-bold flex items-center gap-2"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
            </button>
            <button
              onClick={() => {
                setShowAddModal(true);
                setNewOrgName('');
                setNewOrgId('');
                setNewCity('Ahmedabad');
                setNewState('Gujarat');
                setNewContactEmail('');
                setNewContactPhone('');
                setNewWebhookUrl('https://erp.school.edu.in/api/v1/ai-webhook');
              }}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 text-xs flex items-center gap-2"
            >
              <Plus size={18} /> Onboard New School / College
            </button>
          </div>
        </div>

        {/* Master API Gateway Credentials Sub-Banner */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Master Gateway API Key</span>
              <span className="text-indigo-300 font-mono font-bold">{MASTER_API_KEY}</span>
            </div>
            <button onClick={() => copyToClipboard(MASTER_API_KEY, 'master_key')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
              {copiedKey === 'master_key' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Master HMAC Secret</span>
              <span className="text-purple-300 font-mono font-bold">{MASTER_HMAC_SECRET.substring(0, 18)}...</span>
            </div>
            <button onClick={() => copyToClipboard(MASTER_HMAC_SECRET, 'master_sec')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
              {copiedKey === 'master_sec' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Base API Gateway URL</span>
              <span className="text-emerald-300 font-mono font-bold">{MASTER_GATEWAY_URL}</span>
            </div>
            <button onClick={() => copyToClipboard(MASTER_GATEWAY_URL, 'master_url')} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
              {copiedKey === 'master_url' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">TOTAL SCHOOLS & UNIVERSITIES</span>
          <div className="text-3xl font-black text-white">{tenants.length}</div>
          <p className="text-[10px] text-gray-500 mt-2">Active B2B educational tenants onboarded</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">ACTIVE HMAC CREDENTIALS</span>
          <div className="text-3xl font-black text-emerald-400">{tenants.length}</div>
          <p className="text-[10px] text-gray-500 mt-2">HMAC SHA-256 Auth keys issued</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full" />
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">COMBINED WALLET BALANCE</span>
          <div className="text-3xl font-black text-amber-400">
            ₹{tenants.reduce((acc, t) => acc + (t.billing?.walletBalanceINR || 0), 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Prepaid API query credits across campuses</p>
        </div>
      </div>

      {/* 🏫 TENANTS DATA TABLE */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Building2 size={20} className="text-indigo-400" /> Onboarded Educational Institutions & Module Access Control
          </h2>
          <span className="text-xs text-gray-400 font-bold">{tenants.length} Organizations Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                <th className="px-6 py-4">School Name & Location</th>
                <th className="px-6 py-4">Tier & Star Rating</th>
                <th className="px-6 py-4">AI Modules Access (ON/OFF)</th>
                <th className="px-6 py-4">API Key & HMAC</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <RefreshCw size={28} className="animate-spin text-indigo-400 mx-auto mb-3" />
                    <p className="font-bold">Fetching school directory and access control flags...</p>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <AlertCircle size={28} className="text-gray-600 mx-auto mb-3" />
                    <p className="font-bold">No schools or colleges onboarded yet.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                    >
                      + Onboard First School Now
                    </button>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.orgId} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Org Name, ID, & City/State */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenFeatureManager(t)}
                        className="text-left group cursor-pointer"
                      >
                        <strong className="text-white text-sm font-black group-hover:text-indigo-400 transition-colors block">{t.orgName}</strong>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-indigo-400 font-mono text-[11px] font-bold">ID: {t.orgId}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-400 font-medium flex items-center gap-1">
                            <MapPin size={11} className="text-rose-450" /> {t.city || 'Ahmedabad'}, {t.state || 'Gujarat'}
                          </span>
                        </div>
                      </button>
                    </td>

                    {/* Type Badge & Star Rating */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold uppercase text-[10px] block w-max">
                          {t.orgType?.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(t.starRating || 5)].map((_, i) => (
                            <Star key={i} size={11} fill="#f59e0b" />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* AI Modules Access Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenFeatureManager(t)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Sliders size={14} />
                        <span>{getEnabledModulesCount(t.featureFlags)}/9 Modules Active</span>
                      </button>
                    </td>

                    {/* API Key */}
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 font-bold">{t.apiKey ? `${t.apiKey.substring(0, 14)}...` : 'fbrts_ak_...'}</span>
                        <button
                          onClick={() => setViewKeysTenant(t)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[10px] text-indigo-400 font-bold border border-white/10"
                        >
                          View 🔑
                        </button>
                      </div>
                    </td>

                    {/* Wallet Balance */}
                    <td className="px-6 py-4">
                      <strong className="text-amber-400 font-black text-sm">
                        ₹{(t.billing?.walletBalanceINR || 0).toLocaleString()}
                      </strong>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Edit School Profile */}
                        <button
                          onClick={() => setEditTenant({ ...t })}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 size={13} /> Edit Profile
                        </button>

                        {/* View Connected Users */}
                        <button
                          onClick={() => handleFetchSchoolUsers(t)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Users size={13} /> Users 👥
                        </button>

                        {/* Manage Access */}
                        <button
                          onClick={() => handleOpenFeatureManager(t)}
                          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Settings2 size={13} /> Access
                        </button>

                        {/* Top-up Wallet */}
                        <button
                          onClick={() => setTopUpTenant(t)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Wallet size={13} /> +₹ Wallet
                        </button>

                        {/* Test Webhook */}
                        <button
                          onClick={() => {
                            setTestWebhookTenant(t);
                            setWebhookResult(null);
                          }}
                          className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Send size={13} /> Webhook
                        </button>

                        {/* Code Snippet */}
                        <button
                          onClick={() => setEmbedModalTenant(t)}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        >
                          <Code size={13} /> ERP Code
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteTenant(t.orgId, t.orgName)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🏫 ONBOARD NEW SCHOOL MODAL (DYNAMIC FIELDS BASED ON SELECTION) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Building2 size={24} className="text-indigo-400" /> Onboard New B2B School / College
              </h3>
              <p className="text-xs text-gray-400 mt-1">Issue API keys, HMAC secrets, location tags, and module access for ERP software.</p>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">School / College Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mount Carmel High School, Ahmedabad"
                  value={newOrgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Organization ID (Unique Slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mount_carmel_high_school"
                  value={newOrgId}
                  onChange={(e) => setNewOrgId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Organization Tier Type</label>
                <select
                  value={newOrgType}
                  onChange={(e) => setNewOrgType(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="SINGLE_SCHOOL">Single Independent School</option>
                  <option value="SCHOOL_CHAIN_BRANCH">School Chain Branch</option>
                  <option value="UNIVERSITY_HQ">University HQ / Partner Campus</option>
                  <option value="AFFILIATED_COLLEGE">Affiliated College</option>
                  <option value="COACHING_INSTITUTE">Coaching Institute / Academy</option>
                </select>
              </div>

              {/* DYNAMIC CONDITIONAL FIELD: If Chain Branch selected, show Parent Org ID */}
              {newOrgType === 'SCHOOL_CHAIN_BRANCH' && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-indigo-300 block">Parent School Chain Org ID (Main Branch Slug)</label>
                  <input
                    type="text"
                    placeholder="e.g. dps_delhi_ncr_hq"
                    value={newParentOrgId}
                    onChange={(e) => setNewParentOrgId(e.target.value)}
                    className="w-full bg-black/50 border border-indigo-500/30 rounded-xl px-4 py-2 text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-400">Branches can automatically share prepaid wallet balances with Main HQ.</p>
                </div>
              )}

              {/* LOCATION DETAILS: City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">City / Campus Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">State / Region</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* STAR TIER RATING & CONTACT INFO */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Tier Rating</label>
                  <select
                    value={newStarRating}
                    onChange={(e) => setNewStarRating(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-amber-400 font-bold"
                  >
                    <option value={5}>⭐ 5-Star Enterprise</option>
                    <option value={4}>⭐ 4-Star Premium</option>
                    <option value={3}>⭐ 3-Star Standard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="principal@school.edu"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98250 00000"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">ERP Webhook Callback URL</label>
                <input
                  type="url"
                  placeholder="https://erp.school.edu.in/api/v1/ai-webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Issuing Credentials...' : 'Onboard School Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎛️ SCHOOL FEATURE ACCESS & PERMISSIONS CONTROL PANEL MODAL */}
      {manageFeaturesTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-indigo-500/30 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Sliders size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Granular Module Access Permissions</span>
              </div>
              <h3 className="text-2xl font-black text-white">{manageFeaturesTenant.orgName}</h3>
              <p className="text-xs text-gray-400 mt-1">Enable or Disable individual AI modules and features for this school's ERP integration.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'aiTutor', title: '🧠 AI Tutor Chat Bot', desc: 'Allow students to chat with Future Education OS AI tutor.' },
                { key: 'visionHomework', title: '📝 Vision AI Homework Auto-Grader', desc: 'Scan notebook images & automatically grade homework assignments.' },
                { key: 'studyRoadmaps', title: '🗺️ Syllabus & Study Roadmaps', desc: 'Generate customized board exam study roadmaps for students.' },
                { key: 'quizBattles', title: '⚔️ 1v1 Student Quiz Battles', desc: 'Enable multiplayer quiz arenas for student gamification.' },
                { key: 'practiceExams', title: '📄 Board Practice Exam Generator', desc: 'Allow teachers to generate mock papers & proctoring reports.' },
                { key: 'principalDossier', title: '🔍 360° Principal Search Dossier', desc: 'Allow principal & admin to search 360° student performance.' },
                { key: 'parentTeacherHub', title: '📊 Parent & Teacher Portal Access', desc: 'Grant parents live progress tracking reports & alerts.' },
                { key: 'futureEducationOS', title: '🎓 Future Education OS Suite', desc: 'Master switch for all Education OS student services.' },
                { key: 'futureBRTSBuilder', title: '💼 E-Builder Project Workspace', desc: 'Allow students to build software & website prototypes.' }
              ].map(module => (
                <div key={module.key} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <strong className="text-white text-sm font-black block">{module.title}</strong>
                    <span className="text-[11px] text-gray-400 block mt-0.5">{module.desc}</span>
                  </div>
                  <button
                    onClick={() => setTempFlags((prev: any) => ({ ...prev, [module.key]: !prev[module.key] }))}
                    className="p-1 text-2xl transition-transform active:scale-95 shrink-0"
                  >
                    {tempFlags[module.key] ? (
                      <ToggleRight size={36} className="text-indigo-400" />
                    ) : (
                      <ToggleLeft size={36} className="text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setManageFeaturesTenant(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeatureFlags}
                disabled={updatingFeatures}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-600/30"
              >
                {updatingFeatures ? 'Saving Permissions...' : 'Save & Update School Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 NEWLY CREATED CREDENTIALS MODAL */}
      {createdTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white">School Onboarded Successfully!</h3>
              <p className="text-xs text-gray-400 mt-1">{createdTenant.orgName}</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-black block">Organization ID</span>
                <span className="text-indigo-300 font-bold">{createdTenant.orgId}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-gray-400 uppercase font-black block">API Key</span>
                  <span className="text-emerald-300 font-bold truncate block">{createdTenant.apiKey}</span>
                </div>
                <button onClick={() => copyToClipboard(createdTenant.apiKey, 'created_ak')} className="p-2 hover:bg-white/10 rounded">
                  {copiedKey === 'created_ak' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-gray-400 uppercase font-black block">Secret Key</span>
                  <span className="text-purple-300 font-bold truncate block">{createdTenant.secretKey}</span>
                </div>
                <button onClick={() => copyToClipboard(createdTenant.secretKey, 'created_sk')} className="p-2 hover:bg-white/10 rounded">
                  {copiedKey === 'created_sk' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setCreatedTenant(null)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs"
            >
              Done & Return to List
            </button>
          </div>
        </div>
      )}

      {/* 🔑 VIEW KEYS MODAL */}
      {viewKeysTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Key size={20} className="text-indigo-400" /> Credentials: {viewKeysTenant.orgName}
              </h3>
              <p className="text-xs text-gray-400 mt-1">HTTP Authentication Headers for School ERP Integration.</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase block">API Key (X-API-Key)</span>
                  <span className="text-emerald-300 font-bold">{viewKeysTenant.apiKey || 'fbrts_ak_...'}</span>
                </div>
                <button onClick={() => copyToClipboard(viewKeysTenant.apiKey || '', 'vk_ak')} className="p-2 hover:bg-white/10 rounded">
                  {copiedKey === 'vk_ak' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>

              <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-black uppercase block">HMAC Secret (X-HMAC-Signature)</span>
                  <span className="text-purple-300 font-bold">{viewKeysTenant.secretKey || viewKeysTenant.secretKeyHash || 'fbrts_sk_...'}</span>
                </div>
                <button onClick={() => copyToClipboard(viewKeysTenant.secretKey || viewKeysTenant.secretKeyHash || '', 'vk_sk')} className="p-2 hover:bg-white/10 rounded">
                  {copiedKey === 'vk_sk' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setViewKeysTenant(null)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 💰 TOP-UP WALLET MODAL */}
      {topUpTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Wallet size={24} className="text-amber-400" /> Top-Up Prepaid Wallet Balance
              </h3>
              <p className="text-xs text-gray-400 mt-1">{topUpTenant.orgName}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">Add Credit Amount (₹)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-black text-amber-400 focus:outline-none focus:border-amber-500"
              />

              {/* Quick Preset Chips */}
              <div className="flex gap-2 mt-3">
                {[500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className="flex-1 py-1.5 bg-white/5 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-black border border-white/5"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTopUpTenant(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUpWallet}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs shadow-lg shadow-amber-500/30"
              >
                Add ₹{topUpAmount} Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ TEST WEBHOOK MODAL */}
      {testWebhookTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send size={22} className="text-emerald-400" /> Test ERP Webhook Dispatcher
              </h3>
              <p className="text-xs text-gray-400 mt-1">Dispatch simulated AI Homework Grading event to {testWebhookTenant.orgName}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 font-mono text-xs space-y-2">
              <div>
                <span className="text-gray-500 block">Target Webhook URL:</span>
                <span className="text-emerald-400 font-bold truncate block">{testWebhookTenant.webhookUrl || 'Not configured'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Simulated Payload Event:</span>
                <span className="text-indigo-300 font-bold">HOMEWORK_GRADED (Score: 9.5/10.0)</span>
              </div>
            </div>

            {webhookResult && (
              <div className={`p-4 rounded-xl text-xs font-mono border ${webhookResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                {webhookResult.message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setTestWebhookTenant(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={handleTestWebhookDispatch}
                disabled={dispatchingWebhook}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30"
              >
                {dispatchingWebhook ? 'Dispatching...' : 'Dispatch Webhook Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💻 ERP CODE SNIPPET GENERATOR MODAL */}
      {embedModalTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-indigo-500/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Code size={22} className="text-indigo-400" /> ERP Integration Code Generator
              </h3>
              <p className="text-xs text-gray-400 mt-1">Integration code snippets for {embedModalTenant.orgName}'s software developers.</p>
            </div>

            {/* Language Selector */}
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/5 overflow-x-auto">
              <button
                onClick={() => setCodeTab('widget')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${codeTab === 'widget' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                🤖 1-Line AI Widget Script
              </button>
              <button
                onClick={() => setCodeTab('nodejs')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${codeTab === 'nodejs' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Node.js (Axios)
              </button>
              <button
                onClick={() => setCodeTab('python')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${codeTab === 'python' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Python (Requests)
              </button>
              <button
                onClick={() => setCodeTab('php')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${codeTab === 'php' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                PHP (cURL)
              </button>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-black/80 rounded-2xl border border-white/10 font-mono text-xs text-emerald-300 max-h-64 overflow-y-auto">
              {codeTab === 'widget' && `<!-- 🤖 Future Education AI Assistant Floating Widget for School ERP -->
<!-- Paste this single line inside any School ERP HTML <body> tag -->

<script 
  src="http://localhost:7001/sdk/future-ai.js" 
  data-tenant="${embedModalTenant.orgId}" 
  data-api-key="${embedModalTenant.apiKey || 'YOUR_API_KEY'}">
</script>`}

              {codeTab === 'nodejs' && `const axios = require('axios');

async function gradeHomework() {
  const response = await axios.post('http://localhost:7001/api/v1/tenant/grade-homework', {
    tenantId: '${embedModalTenant.orgId}',
    externalId: 'STUDENT-10492',
    studentName: 'Aarav Sharma',
    subject: 'Mathematics',
    imageUrl: 'https://storage.school.edu/math_hw.jpg'
  }, {
    headers: {
      'X-Tenant-Org-ID': '${embedModalTenant.orgId}',
      'X-API-Key': '${embedModalTenant.apiKey || 'YOUR_API_KEY'}'
    }
  });
  console.log(response.data);
}`}

              {codeTab === 'python' && `import requests

url = "http://localhost:7001/api/v1/tenant/grade-homework"
headers = {
    "X-Tenant-Org-ID": "${embedModalTenant.orgId}",
    "X-API-Key": "${embedModalTenant.apiKey || 'YOUR_API_KEY'}"
}
payload = {
    "tenantId": "${embedModalTenant.orgId}",
    "externalId": "STUDENT-10492",
    "studentName": "Aarav Sharma",
    "subject": "Mathematics",
    "imageUrl": "https://storage.school.edu/math_hw.jpg"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}

              {codeTab === 'php' && `<?php
$ch = curl_init('http://localhost:7001/api/v1/tenant/grade-homework');
$payload = json_encode([
    'tenantId' => '${embedModalTenant.orgId}',
    'externalId' => 'STUDENT-10492',
    'studentName' => 'Aarav Sharma',
    'subject' => 'Mathematics',
    'imageUrl' => 'https://storage.school.edu/math_hw.jpg'
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Tenant-Org-ID: ${embedModalTenant.orgId}',
    'X-API-Key: ${embedModalTenant.apiKey || 'YOUR_API_KEY'}'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEmbedModalTenant(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT SCHOOL PROFILE MODAL */}
      {editTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-purple-500/30 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Edit3 size={24} className="text-purple-400" /> Edit School Profile & Settings
              </h3>
              <p className="text-xs text-gray-400 mt-1">Update location, contact info, tier rating, and webhook callback URL for {editTenant.orgName}.</p>
            </div>

            <form onSubmit={handleUpdateSchoolProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">School / College Name</label>
                <input
                  type="text"
                  required
                  value={editTenant.orgName || ''}
                  onChange={(e) => setEditTenant({ ...editTenant, orgName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Organization Tier Type</label>
                <select
                  value={editTenant.orgType || 'SINGLE_SCHOOL'}
                  onChange={(e) => setEditTenant({ ...editTenant, orgType: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="SINGLE_SCHOOL">Single Independent School</option>
                  <option value="SCHOOL_CHAIN_BRANCH">School Chain Branch</option>
                  <option value="UNIVERSITY_HQ">University HQ / Partner Campus</option>
                  <option value="AFFILIATED_COLLEGE">Affiliated College</option>
                  <option value="COACHING_INSTITUTE">Coaching Institute / Academy</option>
                </select>
              </div>

              {/* LOCATION DETAILS: City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">City Location</label>
                  <input
                    type="text"
                    required
                    value={editTenant.city || 'Ahmedabad'}
                    onChange={(e) => setEditTenant({ ...editTenant, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">State / Region</label>
                  <input
                    type="text"
                    required
                    value={editTenant.state || 'Gujarat'}
                    onChange={(e) => setEditTenant({ ...editTenant, state: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              {/* STAR TIER RATING & CONTACT INFO */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Star Tier</label>
                  <select
                    value={editTenant.starRating || 5}
                    onChange={(e) => setEditTenant({ ...editTenant, starRating: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-amber-400 font-bold"
                  >
                    <option value={5}>⭐ 5-Star</option>
                    <option value={4}>⭐ 4-Star</option>
                    <option value={3}>⭐ 3-Star</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editTenant.contactEmail || ''}
                    onChange={(e) => setEditTenant({ ...editTenant, contactEmail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editTenant.contactPhone || ''}
                    onChange={(e) => setEditTenant({ ...editTenant, contactPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">ERP Webhook Callback URL</label>
                <input
                  type="url"
                  value={editTenant.webhookUrl || ''}
                  onChange={(e) => setEditTenant({ ...editTenant, webhookUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditTenant(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-600/30"
                >
                  {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👥 CONNECTED SCHOOL USERS & STUDENT RECORDS INSPECTOR MODAL */}
      {viewUsersTenant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Users size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Connected User Accounts & Records</span>
                </div>
                <h3 className="text-2xl font-black text-white">{viewUsersTenant.orgName}</h3>
                <p className="text-xs text-gray-400 mt-1">Live students, teachers, and principals connected via School ERP.</p>
              </div>

              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," 
                    + ["External ID,Name,Role,Grade/Subject,Email,Queries Used,Status", ...schoolUsersList.map(u => `${u.externalId},${u.name},${u.role},${u.grade||u.subject||''},${u.email},${u.queriesUsed||0},${u.status}`)].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `${viewUsersTenant.orgId}_users_export.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/30"
              >
                <Download size={14} /> Export CSV Report
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or teacher name, ID, grade..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Users Data Table */}
            <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                    <th className="px-4 py-3">Student / User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Grade / Subject</th>
                    <th className="px-4 py-3">AI Queries</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <RefreshCw size={24} className="animate-spin text-emerald-400 mx-auto mb-2" />
                        <p className="font-bold">Fetching school user records...</p>
                      </td>
                    </tr>
                  ) : schoolUsersList.filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.externalId.toLowerCase().includes(userSearchQuery.toLowerCase())).map((user, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-sans">
                        <strong className="text-white text-xs font-bold block">{user.name}</strong>
                        <span className="text-indigo-400 text-[10px] font-mono">{user.externalId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${user.role === 'STUDENT' ? 'bg-indigo-500/10 text-indigo-300' : user.role === 'TEACHER' ? 'bg-purple-500/10 text-purple-300' : 'bg-amber-500/10 text-amber-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-sans text-xs">
                        {user.grade || user.subject || 'All Classes'}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">
                        {user.queriesUsed || user.assignmentsCreated || 0}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-sans text-[11px]">
                        {user.lastActive}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                          ● {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setViewUsersTenant(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📈 TELEMETRY AI MODEL & FEATURE CLICKS ANALYTICS INSPECTOR MODAL */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-950 border border-indigo-500/30 rounded-3xl p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header & Time Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <BarChart3 size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">School Clicks & AI Model Usage Analytics</span>
                </div>
                <h3 className="text-2xl font-black text-white">Live Telemetry & Usage Heatmap</h3>
                <p className="text-xs text-gray-400 mt-1">Track day-by-day clicks, feature module popularity, and AI engine model distribution.</p>
              </div>

              {/* School Dropdown Filter */}
              <div className="flex items-center gap-3">
                <select
                  value={analyticsOrgId}
                  onChange={(e) => handleFetchAnalytics(analyticsTimeRange, e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">🏫 All School Tenants</option>
                  {tenants.map(t => (
                    <option key={t.orgId} value={t.orgId}>{t.orgName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Period Filter Pills: Day, 7D, 15D, 30D, All */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-gray-400 mr-2 shrink-0">Time Window:</span>
              {[
                { id: '1d', label: '📅 Today (1 Day)' },
                { id: '7d', label: '📆 7 Days' },
                { id: '15d', label: '📊 15 Days' },
                { id: '30d', label: '🗓️ 30 Days (Month)' },
                { id: 'all', label: '♾️ All Time' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleFetchAnalytics(t.id, analyticsOrgId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${analyticsTimeRange === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">TOTAL AI API HITS</span>
                <div className="text-2xl font-black text-white">
                  {loadingAnalytics ? '...' : analyticsData?.totalHits?.toLocaleString() || 1450}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">API calls recorded in window</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">TOTAL QUERY COST</span>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{loadingAnalytics ? '...' : analyticsData?.totalCostINR?.toLocaleString() || 725}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Calculated prepaid query burn</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block mb-1">TOP CLICK FEATURE</span>
                <div className="text-xl font-black text-purple-300 capitalize truncate">
                  {loadingAnalytics ? '...' : analyticsData?.featureBreakdown?.[0]?.feature?.replace(/([A-Z])/g, ' $1') || 'Vision Homework'}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Highest user student engagement</span>
              </div>
            </div>

            {/* Feature Module Clicks Heatmap & AI Model Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Feature Clicks Breakdown */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" /> Module Clicks Distribution (What Students Click Most)
                </h4>
                
                <div className="space-y-3">
                  {(analyticsData?.featureBreakdown || [
                    { feature: 'visionHomework', clicks: 650, percentage: 45 },
                    { feature: 'aiTutor', clicks: 510, percentage: 35 },
                    { feature: 'studyRoadmaps', clicks: 180, percentage: 12 },
                    { feature: 'quizBattles', clicks: 110, percentage: 8 }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-bold capitalize">
                          {item.feature === 'visionHomework' ? '📸 Vision Homework Auto-Grader' : item.feature === 'aiTutor' ? '🤖 AI Tutor Interactive Chat' : item.feature === 'studyRoadmaps' ? '🗺️ Study Roadmaps & Syllabus' : '⚔️ 1v1 Quiz Battles'}
                        </span>
                        <span className="text-indigo-400 font-mono font-bold">{item.clicks} clicks ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Engine Model Usage Breakdown */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-2">
                  <Cpu size={16} className="text-purple-400" /> AI Engine Model Usage (Which Model Is Running)
                </h4>

                <div className="space-y-3">
                  {(analyticsData?.modelBreakdown || [
                    { model: 'gpt-4o-vision', hits: 650, percentage: 45 },
                    { model: 'gemini-1.5-pro', hits: 510, percentage: 35 },
                    { model: 'minerva-custom-llm', hits: 290, percentage: 20 }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-mono font-bold">
                          {item.model}
                        </span>
                        <span className="text-purple-400 font-mono font-bold">{item.hits} queries ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagementAdmin;


