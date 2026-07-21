import { useState, useEffect } from 'react';
import {
    Search,
    Save,
    RefreshCcw,
    CheckCircle2,
    BarChart3,
    TrendingUp,
    ChevronUp,
    ChevronDown,
    Loader2,
    Link as LinkIcon,
    Plus,
    Trash2,
    Layers,
    FileText,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

interface PageSEOConfig {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
}

interface BacklinkItem {
    id: string;
    url: string;
    anchorText: string;
    authority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'Active' | 'Broken';
    date: string;
}

interface KeywordItem {
    id: string;
    keyword: string;
    volume: number;
    rank: number;
    target: number;
}

const AVAILABLE_PAGES = [
    { path: '/', label: 'Home Page' },
    { path: '/features', label: 'Features Page' },
    { path: '/pricing', label: 'Pricing Page' },
    { path: '/about', label: 'About Page' },
    { path: '/services', label: 'Services Page' },
    { path: '/how-it-works', label: 'How It Works Page' },
    { path: '/careers-public', label: 'Careers Page' },
    { path: '/contact', label: 'Contact Page' },
    { path: '/guest-chat', label: 'Guest Chat Page' }
];

export default function SEOManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'backlinks' | 'keywords'>('global');
    const [analytics, setAnalytics] = useState<any[]>([]);

    // Global SEO config
    const [seoData, setSeoData] = useState({
        site_title: "Future BRTS | The Ultimate Career Architect",
        meta_description: "Transform your human intent into technical roadmaps with the world's most advanced neural career engine.",
        meta_keywords: "career, roadmap, ai, learning, builder, tech, developer, strategic planning",
        og_title: "Build Your Future with Future BRTS",
        og_image_url: "https://futurebrts.com/og-image.jpg",
        google_site_verification: "",
        bing_site_verification: ""
    });

    // Dynamic Pages config
    const [selectedPagePath, setSelectedPagePath] = useState('/');
    const [pagesConfig, setPagesConfig] = useState<Record<string, PageSEOConfig>>({});
    const [currentPageData, setCurrentPageData] = useState<PageSEOConfig>({
        title: "",
        description: "",
        keywords: "",
        ogImage: ""
    });

    // Backlinks configs
    const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
    const [newBacklink, setNewBacklink] = useState({
        url: '',
        anchorText: '',
        authority: 'Medium' as 'Low' | 'Medium' | 'High'
    });

    // Target Keywords configs
    const [targetKeywords, setTargetKeywords] = useState<KeywordItem[]>([]);
    const [newKeyword, setNewKeyword] = useState({
        keyword: '',
        volume: 1000,
        rank: 99,
        target: 10
    });

    useEffect(() => {
        fetchSettings();
        fetchAnalytics();
    }, []);

    // Sync selected page's SEO fields when selected path changes
    useEffect(() => {
        const config = pagesConfig[selectedPagePath] || {
            title: "",
            description: "",
            keywords: "",
            ogImage: ""
        };
        setCurrentPageData(config);
    }, [selectedPagePath, pagesConfig]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                const settings = data.settings;
                const newSeoData = { ...seoData };
                settings.forEach((s: any) => {
                    if (s.key === 'SEO_SITE_TITLE') newSeoData.site_title = s.value;
                    if (s.key === 'SEO_META_DESCRIPTION') newSeoData.meta_description = s.value;
                    if (s.key === 'SEO_META_KEYWORDS') newSeoData.meta_keywords = s.value;
                    if (s.key === 'SEO_OG_TITLE') newSeoData.og_title = s.value;
                    if (s.key === 'SEO_OG_IMAGE_URL') newSeoData.og_image_url = s.value;
                    if (s.key === 'SEO_GOOGLE_SITE_VERIFICATION') newSeoData.google_site_verification = s.value;
                    if (s.key === 'SEO_BING_SITE_VERIFICATION') newSeoData.bing_site_verification = s.value;
                });
                setSeoData(newSeoData);

                const pagesSetting = settings.find((s: any) => s.key === 'SEO_PAGES_CONFIG');
                if (pagesSetting && pagesSetting.value) {
                    try {
                        const parsed = JSON.parse(pagesSetting.value);
                        setPagesConfig(parsed);
                    } catch (e) {}
                }

                const backlinksSetting = settings.find((s: any) => s.key === 'SEO_BACKLINKS_CONFIG');
                if (backlinksSetting && backlinksSetting.value) {
                    try {
                        const parsed = JSON.parse(backlinksSetting.value);
                        setBacklinks(parsed);
                    } catch (e) {}
                }

                const keywordsSetting = settings.find((s: any) => s.key === 'SEO_TARGET_KEYWORDS_CONFIG');
                if (keywordsSetting && keywordsSetting.value) {
                    try {
                        const parsed = JSON.parse(keywordsSetting.value);
                        setTargetKeywords(parsed);
                    } catch (e) {}
                }
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/seo-analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const rawKeywords = data.currentKeywords || data.analytics || [];
                const mappedKeywords = rawKeywords.map((k: any) => ({
                    keyword: k.keyword || k._id || 'Unknown',
                    volume: k.volume || 0,
                    rank: k.ranking || k.rank || 1,
                    trend: k.trend === 'Increasing' || k.trend === 'up' ? 'up' : 'down',
                    cpc: k.cpc || '1.20'
                }));
                setAnalytics(mappedKeywords);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    // Save current active dynamic page SEO to pagesConfig mapping
    const handleUpdatePageConfig = () => {
        setPagesConfig(prev => ({
            ...prev,
            [selectedPagePath]: currentPageData
        }));
        toast.info(`Updated config for page ${selectedPagePath} in local state. Save to sync.`);
    };

    const handleSave = async () => {
        setIsLoading(true);

        // Auto-apply selected page data to pagesConfig before saving
        const finalPagesConfig = {
            ...pagesConfig,
            [selectedPagePath]: currentPageData
        };

        try {
            const token = localStorage.getItem('fbrts_token');
            const settingsToUpdate = [
                { key: 'SEO_SITE_TITLE', value: seoData.site_title, description: 'SEO Site Title' },
                { key: 'SEO_META_DESCRIPTION', value: seoData.meta_description, description: 'SEO Meta Description' },
                { key: 'SEO_META_KEYWORDS', value: seoData.meta_keywords, description: 'SEO Meta Keywords' },
                { key: 'SEO_OG_TITLE', value: seoData.og_title, description: 'SEO OG Title' },
                { key: 'SEO_OG_IMAGE_URL', value: seoData.og_image_url, description: 'SEO OG Image URL' },
                { key: 'SEO_GOOGLE_SITE_VERIFICATION', value: seoData.google_site_verification, description: 'SEO Google Site Verification' },
                { key: 'SEO_BING_SITE_VERIFICATION', value: seoData.bing_site_verification, description: 'SEO Bing Site Verification' },
                { key: 'SEO_PAGES_CONFIG', value: JSON.stringify(finalPagesConfig), description: 'Dynamic Pages SEO Config Map' },
                { key: 'SEO_BACKLINKS_CONFIG', value: JSON.stringify(backlinks), description: 'SEO Backlinks Tracking Config' },
                { key: 'SEO_TARGET_KEYWORDS_CONFIG', value: JSON.stringify(targetKeywords), description: 'SEO Target Keywords Tracking Config' }
            ];

            const res = await fetch('/api/admin/settings/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ settings: settingsToUpdate })
            });

            const data = await res.json();
            if (data.success) {
                setPagesConfig(finalPagesConfig);
                toast.success("SEO Ecosystem synced successfully.");
            } else {
                toast.error("Failed to sync: " + data.error);
            }
        } catch (err) {
            toast.error("Failed to sync SEO node.");
        } finally {
            setIsLoading(false);
        }
    };

    // Backlinks Handlers
    const addBacklink = () => {
        if (!newBacklink.url || !newBacklink.anchorText) {
            toast.warn('Please fill in URL and Anchor Text');
            return;
        }
        const item: BacklinkItem = {
            id: Date.now().toString(),
            url: newBacklink.url,
            anchorText: newBacklink.anchorText,
            authority: newBacklink.authority,
            status: 'Pending',
            date: new Date().toLocaleDateString()
        };
        setBacklinks([item, ...backlinks]);
        setNewBacklink({ url: '', anchorText: '', authority: 'Medium' });
        toast.info('Backlink added to staging. Press Sync Protocols to save.');
    };

    const removeBacklink = (id: string) => {
        setBacklinks(backlinks.filter(b => b.id !== id));
        toast.info('Backlink removed. Press Sync Protocols to save.');
    };

    // Target Keywords Handlers
    const addTargetKeyword = () => {
        if (!newKeyword.keyword) {
            toast.warn('Please specify a keyword');
            return;
        }
        const item: KeywordItem = {
            id: Date.now().toString(),
            keyword: newKeyword.keyword,
            volume: newKeyword.volume,
            rank: newKeyword.rank,
            target: newKeyword.target
        };
        setTargetKeywords([item, ...targetKeywords]);
        setNewKeyword({ keyword: '', volume: 1000, rank: 99, target: 10 });
        toast.info('Keyword added to staging. Press Sync Protocols to save.');
    };

    const removeTargetKeyword = (id: string) => {
        setTargetKeywords(targetKeywords.filter(k => k.id !== id));
        toast.info('Keyword removed. Press Sync Protocols to save.');
    };

    return (
        <div className="max-w-6xl space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">SEO & Metadata Scraper</h1>
                    <p className="text-gray-400 mt-1 font-medium">Calibrate how the digital world perceives the Future BRTS ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                        Sync Protocols
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <button
                    onClick={() => setActiveTab('global')}
                    className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        activeTab === 'global' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Global SEO
                </button>
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        activeTab === 'pages' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Dynamic Pages SEO
                </button>
                <button
                    onClick={() => setActiveTab('backlinks')}
                    className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        activeTab === 'backlinks' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Backlinks Tracker
                </button>
                <button
                    onClick={() => setActiveTab('keywords')}
                    className={`flex-1 min-w-[120px] py-3.5 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        activeTab === 'keywords' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Keyword Planner
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Tab 1: Global SEO Settings */}
                    {activeTab === 'global' && (
                        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <Search size={20} className="text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">Global Meta Configuration</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site Title Protocol</label>
                                    <input
                                        type="text"
                                        value={seoData.site_title}
                                        onChange={e => setSeoData({ ...seoData, site_title: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                        placeholder="Enter Global Title..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Description Unit</label>
                                    <textarea
                                        rows={4}
                                        value={seoData.meta_description}
                                        onChange={e => setSeoData({ ...seoData, meta_description: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white resize-none"
                                        placeholder="Describe the neural value proposition..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        value={seoData.meta_keywords}
                                        onChange={e => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Social Title (OG)</label>
                                        <input
                                            type="text"
                                            value={seoData.og_title}
                                            onChange={e => setSeoData({ ...seoData, og_title: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Social Image URL</label>
                                        <input
                                            type="text"
                                            value={seoData.og_image_url}
                                            onChange={e => setSeoData({ ...seoData, og_image_url: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Google Verification Code</label>
                                        <input
                                            type="text"
                                            value={seoData.google_site_verification}
                                            onChange={e => setSeoData({ ...seoData, google_site_verification: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                            placeholder="google-site-verification=..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bing Verification Code</label>
                                        <input
                                            type="text"
                                            value={seoData.bing_site_verification}
                                            onChange={e => setSeoData({ ...seoData, bing_site_verification: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                            placeholder="xml code..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Dynamic Page SEO Manager */}
                    {activeTab === 'pages' && (
                        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <Layers size={20} className="text-purple-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">Dynamic Page SEO Settings</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Target Page Path</label>
                                    <select
                                        value={selectedPagePath}
                                        onChange={e => setSelectedPagePath(e.target.value)}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white cursor-pointer animate-none"
                                    >
                                        {AVAILABLE_PAGES.map(p => (
                                            <option key={p.path} value={p.path} className="bg-[#121214] text-white font-bold">{p.label} ({p.path})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="h-px bg-white/5 my-4" />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custom Page Title</label>
                                    <input
                                        type="text"
                                        value={currentPageData.title}
                                        onChange={e => setCurrentPageData({ ...currentPageData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white"
                                        placeholder="Enter Page Title override..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custom Meta Description</label>
                                    <textarea
                                        rows={3}
                                        value={currentPageData.description}
                                        onChange={e => setCurrentPageData({ ...currentPageData, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white resize-none"
                                        placeholder="Enter custom description override..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custom Keywords (Comma Separated)</label>
                                        <input
                                            type="text"
                                            value={currentPageData.keywords}
                                            onChange={e => setCurrentPageData({ ...currentPageData, keywords: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white"
                                            placeholder="feature, ai, roadmap"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custom OG Image URL</label>
                                        <input
                                            type="text"
                                            value={currentPageData.ogImage}
                                            onChange={e => setCurrentPageData({ ...currentPageData, ogImage: e.target.value })}
                                            className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpdatePageConfig}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                                >
                                    Confirm Page Updates
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Backlinks Manager */}
                    {activeTab === 'backlinks' && (
                        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <LinkIcon size={20} className="text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">Backlink Generation Logs</h2>
                            </div>

                            {/* Add new backlink */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Link URL</label>
                                    <input
                                        type="text"
                                        value={newBacklink.url}
                                        onChange={e => setNewBacklink({ ...newBacklink, url: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Anchor Text</label>
                                    <input
                                        type="text"
                                        value={newBacklink.anchorText}
                                        onChange={e => setNewBacklink({ ...newBacklink, anchorText: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                        placeholder="anchor word..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Authority</label>
                                        <select
                                            value={newBacklink.authority}
                                            onChange={e => setNewBacklink({ ...newBacklink, authority: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                        >
                                            <option value="High" className="bg-[#121214] text-white font-bold">High</option>
                                            <option value="Medium" className="bg-[#121214] text-white font-bold">Medium</option>
                                            <option value="Low" className="bg-[#121214] text-white font-bold">Low</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={addBacklink}
                                        className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center h-[42px] transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Backlinks List */}
                            <div className="space-y-4">
                                {backlinks.length === 0 ? (
                                    <div className="py-12 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        No backlinks recorded yet.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500">
                                                    <th className="pb-3">Target URL</th>
                                                    <th className="pb-3">Anchor</th>
                                                    <th className="pb-3">Authority</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3">Date</th>
                                                    <th className="pb-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-xs">
                                                {backlinks.map(b => (
                                                    <tr key={b.id} className="hover:bg-white/[0.01]">
                                                        <td className="py-4 font-bold text-white max-w-[200px] truncate">
                                                            <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 inline-flex items-center gap-1">
                                                                {b.url} <ExternalLink size={10} />
                                                            </a>
                                                        </td>
                                                        <td className="py-4 font-medium text-gray-400">{b.anchorText}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                b.authority === 'High' ? 'bg-indigo-500/10 text-indigo-400' :
                                                                b.authority === 'Medium' ? 'bg-purple-500/10 text-purple-400' :
                                                                'bg-gray-500/10 text-gray-400'
                                                            }`}>{b.authority}</span>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">{b.status}</span>
                                                        </td>
                                                        <td className="py-4 text-gray-500 font-mono text-[10px]">{b.date}</td>
                                                        <td className="py-4 text-right">
                                                            <button
                                                                onClick={() => removeBacklink(b.id)}
                                                                className="text-gray-500 hover:text-rose-500 transition-all p-1"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Target Keywords Planner */}
                    {activeTab === 'keywords' && (
                        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <FileText size={20} className="text-amber-400" />
                                </div>
                                <h2 className="text-xl font-black text-white">Target Keyword Planner</h2>
                            </div>

                            {/* Add new keyword */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Keyword</label>
                                    <input
                                        type="text"
                                        value={newKeyword.keyword}
                                        onChange={e => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                        placeholder="career roadmap..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Est. Search Volume</label>
                                    <input
                                        type="number"
                                        value={newKeyword.volume}
                                        onChange={e => setNewKeyword({ ...newKeyword, volume: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Rank</label>
                                    <input
                                        type="number"
                                        value={newKeyword.target}
                                        onChange={e => setNewKeyword({ ...newKeyword, target: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-xs font-bold text-white"
                                    />
                                </div>
                                <button
                                    onClick={addTargetKeyword}
                                    className="px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center justify-center h-[42px] transition-all text-xs font-black uppercase tracking-wider"
                                >
                                    Add Keyword
                                </button>
                            </div>

                            {/* Keywords List */}
                            <div className="space-y-4">
                                {targetKeywords.length === 0 ? (
                                    <div className="py-12 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        No target keywords defined yet.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500">
                                                    <th className="pb-3">Keyword</th>
                                                    <th className="pb-3">Volume</th>
                                                    <th className="pb-3">Current Rank</th>
                                                    <th className="pb-3">Target Rank</th>
                                                    <th className="pb-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-xs">
                                                {targetKeywords.map(k => (
                                                    <tr key={k.id} className="hover:bg-white/[0.01]">
                                                        <td className="py-4 font-bold text-white">{k.keyword}</td>
                                                        <td className="py-4 font-mono font-medium text-gray-400">{k.volume.toLocaleString()}</td>
                                                        <td className="py-4 font-mono">
                                                            <span className={k.rank <= 10 ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                                                                {k.rank === 99 ? 'NR' : `#${k.rank}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 font-mono font-bold text-indigo-400">#{k.target}</td>
                                                        <td className="py-4 text-right">
                                                            <button
                                                                onClick={() => removeTargetKeyword(k.id)}
                                                                className="text-gray-500 hover:text-rose-500 transition-all p-1"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={18} /> Strategic Directive
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Your SEO configuration is the blueprint for organic user acquisition. Maintain high density of neural-related keywords while ensuring content readability for human subjects.
                        </p>
                    </div>
                </div>

                {/* Intelligence Sidepanel */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[40px] bg-[#0a0a0b] border border-white/10 space-y-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white flex items-center gap-3">
                                <BarChart3 className="text-purple-400" size={20} /> Keyword Intelligence
                            </h2>
                            <button onClick={fetchAnalytics} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                <RefreshCcw size={14} className={isAnalyticsLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isAnalyticsLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="animate-spin text-gray-600" size={24} />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scanning SERPs...</p>
                                </div>
                            ) : analytics.map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black text-white">{item.keyword}</span>
                                        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-gray-500">
                                            Pos: <span className={item.rank <= 3 ? 'text-emerald-400' : 'text-amber-400'}>{item.rank}</span>
                                            {item.trend === 'up' ? <ChevronUp size={10} className="text-emerald-500" /> : <ChevronDown size={10} className="text-rose-500" />}
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${(item.volume / 5000) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Vol: {item.volume.toLocaleString()}</span>
                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">CPC: ${item.cpc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            Full Intelligence Report
                        </button>
                    </div>

                    <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={18} />
                            <span className="text-xs font-black text-white uppercase tracking-widest">System Health</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>INDEX RATIO</span>
                                <span className="text-white">98.4%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>CORE WEB VITALS</span>
                                <span className="text-emerald-400">OPTIMAL</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                <span>SITEMAP.XML</span>
                                <span className="text-white">SYNCED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
