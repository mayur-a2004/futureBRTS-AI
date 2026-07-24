import { useState, useEffect } from 'react';
import {
    Save,
    Loader2,
    FileText,
    ExternalLink,
    Mail,
    Share2,
    Globe,
    Bot,
    DollarSign,
    MessageSquare,
    Send
} from 'lucide-react';
import { toast } from 'react-toastify';

interface PageSEOConfig {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
}

interface InquiryItem {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: 'UNREAD' | 'READ' | 'RESPONDED';
    admin_notes?: string;
    createdAt: string;
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
    { path: '/guest-chat', label: 'Guest Chat Page' },
    { path: '/future-education', label: 'Future Education OS Page' }
];

export default function SEOManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'robots_sitemap' | 'ai_indexing' | 'ads_analytics' | 'inquiries'>('global');

    // Global SEO config
    const [seoData, setSeoData] = useState({
        site_title: "Future BRTS | The Ultimate AI Career Architect",
        meta_description: "Transform your human intent into technical roadmaps with the world's most advanced neural career engine.",
        meta_keywords: "career, roadmap, ai, learning, builder, tech, developer, strategic planning",
        og_title: "Build Your Future with Future BRTS",
        og_image_url: "https://futurebrts.com/og-image.jpg",
        google_site_verification: "roISzqS4GivhzIUzQGoZfemy_Wxf5XrJQ5coglwiwpA",
        bing_site_verification: "C8F7354165A3EECF0A0AAB4E7E3A1B86",
        linkedin_url: "https://www.linkedin.com/company/futurebrts",
        instagram_url: "https://www.instagram.com/futurebrts",
        twitter_url: "https://twitter.com/futurebrts",
        facebook_url: "https://facebook.com/futurebrts",
        youtube_url: "https://youtube.com/@futurebrts",
        google_adsense_id: "ca-pub-3246634857996389",
        google_admob_id: "",
        meta_pixel_id: "",
        google_analytics_id: "G-XXXXXXXXXX"
    });

    // Dynamic Robots.txt, Sitemap.xml & LLMs.txt
    const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexBot
Allow: /

User-agent: GrokBot
Allow: /

Sitemap: https://futurebrts.com/sitemap.xml`);

    const [sitemapXml, setSitemapXml] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://futurebrts.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://futurebrts.com/features</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://futurebrts.com/future-education</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://futurebrts.com/future-education/roadmaps</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://futurebrts.com/pricing</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://futurebrts.com/contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`);

    const [llmsTxt, setLlmsTxt] = useState(`# Future BRTS - Neural Career Architect & AI Education OS
> The world's most advanced AI-powered career roadmap builder, full-stack app generator, and virtual science lab ecosystem.

## Canonical URLs
- Home: https://futurebrts.com/
- Features: https://futurebrts.com/features
- Education OS: https://futurebrts.com/future-education
- Roadmaps: https://futurebrts.com/future-education/roadmaps
- Pricing: https://futurebrts.com/pricing
`);

    // Inquiries State
    const [inquiries, setInquiries] = useState<InquiryItem[]>([]);

    // Dynamic Pages config
    const [selectedPagePath, setSelectedPagePath] = useState('/');
    const [pagesConfig, setPagesConfig] = useState<Record<string, PageSEOConfig>>({});
    const [currentPageData, setCurrentPageData] = useState<PageSEOConfig>({
        title: "",
        description: "",
        keywords: "",
        ogImage: ""
    });

    useEffect(() => {
        fetchSettings();
        fetchInquiries();
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
            if (data.success && Array.isArray(data.settings)) {
                const map: Record<string, string> = {};
                data.settings.forEach((s: any) => { map[s.key] = s.value; });

                setSeoData(prev => ({
                    ...prev,
                    site_title: map['SEO_SITE_TITLE'] || prev.site_title,
                    meta_description: map['SEO_META_DESCRIPTION'] || prev.meta_description,
                    meta_keywords: map['SEO_META_KEYWORDS'] || prev.meta_keywords,
                    og_title: map['SEO_OG_TITLE'] || prev.og_title,
                    og_image_url: map['SEO_OG_IMAGE_URL'] || prev.og_image_url,
                    google_site_verification: map['SEO_GOOGLE_SITE_VERIFICATION'] || prev.google_site_verification,
                    bing_site_verification: map['SEO_BING_SITE_VERIFICATION'] || prev.bing_site_verification,
                    linkedin_url: map['SEO_LINKEDIN_URL'] || prev.linkedin_url,
                    instagram_url: map['SEO_INSTAGRAM_URL'] || prev.instagram_url,
                    twitter_url: map['SEO_TWITTER_URL'] || prev.twitter_url,
                    facebook_url: map['SEO_FACEBOOK_URL'] || prev.facebook_url,
                    youtube_url: map['SEO_YOUTUBE_URL'] || prev.youtube_url,
                    google_adsense_id: map['SEO_GOOGLE_ADSENSE_ID'] || prev.google_adsense_id,
                    google_admob_id: map['SEO_GOOGLE_ADMOB_ID'] || prev.google_admob_id,
                    meta_pixel_id: map['SEO_META_PIXEL_ID'] || prev.meta_pixel_id,
                    google_analytics_id: map['SEO_GOOGLE_ANALYTICS_ID'] || prev.google_analytics_id,
                }));

                if (map['SEO_ROBOTS_TXT']) setRobotsTxt(map['SEO_ROBOTS_TXT']);
                if (map['SEO_SITEMAP_XML']) setSitemapXml(map['SEO_SITEMAP_XML']);
                if (map['SEO_LLMS_TXT']) setLlmsTxt(map['SEO_LLMS_TXT']);

                if (map['SEO_PAGES_CONFIG']) {
                    try {
                        setPagesConfig(JSON.parse(map['SEO_PAGES_CONFIG']));
                    } catch (e) {
                        console.error('Error parsing SEO_PAGES_CONFIG', e);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load SEO settings:', err);
        }
    };



    const fetchInquiries = async () => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch('/api/admin/inquiries', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.inquiries)) {
                setInquiries(data.inquiries);
            }
        } catch (err) {
            console.error('Failed to load inquiries:', err);
        }
    };

    const handleSaveGlobal = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const payload = [
                { key: 'SEO_SITE_TITLE', value: seoData.site_title, description: 'Global Site Title' },
                { key: 'SEO_META_DESCRIPTION', value: seoData.meta_description, description: 'Global Meta Description' },
                { key: 'SEO_META_KEYWORDS', value: seoData.meta_keywords, description: 'Global Meta Keywords' },
                { key: 'SEO_OG_TITLE', value: seoData.og_title, description: 'Global OpenGraph Title' },
                { key: 'SEO_OG_IMAGE_URL', value: seoData.og_image_url, description: 'Global OpenGraph Image' },
                { key: 'SEO_GOOGLE_SITE_VERIFICATION', value: seoData.google_site_verification, description: 'Google Search Console Tag' },
                { key: 'SEO_BING_SITE_VERIFICATION', value: seoData.bing_site_verification, description: 'Bing Webmaster Tag' },
                { key: 'SEO_LINKEDIN_URL', value: seoData.linkedin_url, description: 'LinkedIn Profile URL' },
                { key: 'SEO_INSTAGRAM_URL', value: seoData.instagram_url, description: 'Instagram Profile URL' },
                { key: 'SEO_TWITTER_URL', value: seoData.twitter_url, description: 'Twitter Profile URL' },
                { key: 'SEO_FACEBOOK_URL', value: seoData.facebook_url, description: 'Facebook Profile URL' },
                { key: 'SEO_YOUTUBE_URL', value: seoData.youtube_url, description: 'YouTube Channel URL' },
                { key: 'SEO_GOOGLE_ADSENSE_ID', value: seoData.google_adsense_id, description: 'Google AdSense Publisher ID' },
                { key: 'SEO_GOOGLE_ADMOB_ID', value: seoData.google_admob_id, description: 'Google AdMob App ID' },
                { key: 'SEO_META_PIXEL_ID', value: seoData.meta_pixel_id, description: 'Meta Facebook Pixel ID' },
                { key: 'SEO_GOOGLE_ANALYTICS_ID', value: seoData.google_analytics_id, description: 'Google Analytics GA4 ID' },
                { key: 'SEO_ROBOTS_TXT', value: robotsTxt, description: 'Dynamic Robots.txt File' },
                { key: 'SEO_SITEMAP_XML', value: sitemapXml, description: 'Dynamic Sitemap.xml File' },
                { key: 'SEO_LLMS_TXT', value: llmsTxt, description: 'Dynamic LLMs.txt AI Crawler File' },
            ];

            const res = await fetch('/api/admin/settings/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ settings: payload })
            });

            const result = await res.json();
            if (result.success) {
                toast.success('Global SEO, Social Links, Crawlers & Ads settings updated!');
            } else {
                toast.error('Failed to save settings: ' + result.error);
            }
        } catch (err: any) {
            toast.error('Error saving settings: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePingSitemap = () => {
        window.open('https://www.google.com/ping?sitemap=https://futurebrts.com/sitemap.xml', '_blank');
        toast.success('Google Sitemap ping initiated!');
    };

    const handleUpdateInquiryStatus = async (id: string, status: 'UNREAD' | 'READ' | 'RESPONDED') => {
        try {
            const token = localStorage.getItem('fbrts_token');
            const res = await fetch(`/api/admin/inquiries/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Inquiry marked as ${status}`);
                fetchInquiries();
            }
        } catch (err: any) {
            toast.error('Error updating inquiry status');
        }
    };

    return (
        <div className="space-y-6 text-white pb-12">
            
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <div>
                    <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-3">
                        <span>🔍 SEO Growth, AI Indexing & Inquiry Command Center</span>
                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                            Live Crawler Active
                        </span>
                    </h1>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Manage Google/Bing verification, dynamic sitemap.xml, robots.txt, LLMs.txt AI indexing, Adsense/Admob IDs & Contact Inquiries.
                    </p>
                </div>
                
                <button
                    onClick={handleSaveGlobal}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg shrink-0"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save All Changes</span>
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                {[
                    { id: 'global', label: '🌐 Global Meta & Social', icon: Globe },
                    { id: 'pages', label: '📄 Per-Page Meta', icon: FileText },
                    { id: 'robots_sitemap', label: '🤖 Robots & Sitemap.xml', icon: Bot },
                    { id: 'ai_indexing', label: '🧠 AI Indexing (LLMs.txt)', icon: Share2 },
                    { id: 'ads_analytics', label: '💰 Ads & Webmaster IDs', icon: DollarSign },
                    { id: 'inquiries', label: `📬 Contact Inquiries (${inquiries.filter(i => i.status === 'UNREAD').length})`, icon: MessageSquare }
                ].map(t => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                                activeTab === t.id
                                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400/30'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Icon size={14} />
                            <span>{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: Global Meta & Social Links */}
            {activeTab === 'global' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h2 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                            <span>🔍 Global Website Meta Tags</span>
                        </h2>
                        
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Global Site Title</label>
                            <input
                                type="text"
                                value={seoData.site_title}
                                onChange={e => setSeoData({ ...seoData, site_title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meta Description</label>
                            <textarea
                                rows={3}
                                value={seoData.meta_description}
                                onChange={e => setSeoData({ ...seoData, meta_description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meta Keywords</label>
                            <input
                                type="text"
                                value={seoData.meta_keywords}
                                onChange={e => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Social Media Profile Links */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h2 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                            <span>📲 Official Social Media Profile Links</span>
                        </h2>

                        {[
                            { key: 'linkedin_url', label: 'LinkedIn Profile / Page URL' },
                            { key: 'instagram_url', label: 'Instagram Handle URL' },
                            { key: 'twitter_url', label: 'Twitter / X Profile URL' },
                            { key: 'facebook_url', label: 'Facebook Page URL' },
                            { key: 'youtube_url', label: 'YouTube Channel URL' }
                        ].map(s => (
                            <div key={s.key}>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{s.label}</label>
                                <input
                                    type="text"
                                    value={(seoData as any)[s.key]}
                                    onChange={e => setSeoData({ ...seoData, [s.key]: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: Per-Page Meta */}
            {activeTab === 'pages' && (
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-300">Select Target Page:</label>
                        <select
                            value={selectedPagePath}
                            onChange={e => setSelectedPagePath(e.target.value)}
                            className="bg-black/60 border border-white/10 rounded-2xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                        >
                            {AVAILABLE_PAGES.map(p => (
                                <option key={p.path} value={p.path}>{p.label} ({p.path})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Page Title Tag</label>
                            <input
                                type="text"
                                value={currentPageData.title}
                                onChange={e => setCurrentPageData({ ...currentPageData, title: e.target.value })}
                                placeholder="Future BRTS | Page Title"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Page Meta Description</label>
                            <textarea
                                rows={2}
                                value={currentPageData.description}
                                onChange={e => setCurrentPageData({ ...currentPageData, description: e.target.value })}
                                placeholder="Page description..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Dynamic Robots.txt & Sitemap.xml */}
            {activeTab === 'robots_sitemap' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dynamic Robots.txt */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-indigo-300">🤖 Dynamic robots.txt Live Editor</h2>
                            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                View Live <ExternalLink size={12} />
                            </a>
                        </div>
                        <textarea
                            rows={14}
                            value={robotsTxt}
                            onChange={e => setRobotsTxt(e.target.value)}
                            className="w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none leading-relaxed"
                        />
                    </div>

                    {/* Dynamic Sitemap.xml */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-indigo-300">🗺️ Dynamic sitemap.xml Live Editor</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePingSitemap} className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 hover:bg-indigo-500/40 transition-all">
                                    Ping Google
                                </button>
                                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                    View Live <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                        <textarea
                            rows={14}
                            value={sitemapXml}
                            onChange={e => setSitemapXml(e.target.value)}
                            className="w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none leading-relaxed"
                        />
                    </div>
                </div>
            )}

            {/* TAB 4: AI Indexing (LLMs.txt & AI Crawlers) */}
            {activeTab === 'ai_indexing' && (
                <div className="space-y-6">
                    {/* Active AI Crawlers Badge Grid */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
                        <h2 className="font-bold text-sm text-indigo-300 mb-4 flex items-center gap-2">
                            <span>🧠 Multi-AI Engine Crawler Status (ChatGPT, Gemini, Grok, Claude, Perplexity)</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {[
                                { name: 'ChatGPT (GPTBot)', status: 'Allowed ✅' },
                                { name: 'Google Gemini', status: 'Allowed ✅' },
                                { name: 'xAI Grok', status: 'Allowed ✅' },
                                { name: 'Anthropic Claude', status: 'Allowed ✅' },
                                { name: 'Perplexity AI', status: 'Allowed ✅' },
                                { name: 'Bing & DuckDuckGo', status: 'Allowed ✅' }
                            ].map(c => (
                                <div key={c.name} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
                                    <div className="font-bold text-xs text-gray-200">{c.name}</div>
                                    <div className="text-[10px] text-emerald-400 font-semibold">{c.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LLMs.txt Live Editor */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-indigo-300">📄 Dynamic llms.txt Config Editor (/llms.txt)</h2>
                            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                View /llms.txt <ExternalLink size={12} />
                            </a>
                        </div>
                        <textarea
                            rows={12}
                            value={llmsTxt}
                            onChange={e => setLlmsTxt(e.target.value)}
                            className="w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none leading-relaxed"
                        />
                    </div>
                </div>
            )}

            {/* TAB 5: Monetization, Ads & Webmaster Verification */}
            {activeTab === 'ads_analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h2 className="font-bold text-sm text-indigo-300">💰 Google AdSense & AdMob IDs</h2>
                        
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Google AdSense Publisher ID</label>
                            <input
                                type="text"
                                value={seoData.google_adsense_id}
                                onChange={e => setSeoData({ ...seoData, google_adsense_id: e.target.value })}
                                placeholder="ca-pub-3246634857996389"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Google AdMob App ID</label>
                            <input
                                type="text"
                                value={seoData.google_admob_id}
                                onChange={e => setSeoData({ ...seoData, google_admob_id: e.target.value })}
                                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h2 className="font-bold text-sm text-indigo-300">📊 Analytics & Webmaster Tags</h2>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Google Analytics GA4 Measurement ID</label>
                            <input
                                type="text"
                                value={seoData.google_analytics_id}
                                onChange={e => setSeoData({ ...seoData, google_analytics_id: e.target.value })}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meta / Facebook Pixel ID</label>
                            <input
                                type="text"
                                value={seoData.meta_pixel_id}
                                onChange={e => setSeoData({ ...seoData, meta_pixel_id: e.target.value })}
                                placeholder="XXXXXXXXXXXXXXXX"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: Contact Inquiries Manager */}
            {activeTab === 'inquiries' && (
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h2 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                        <span>📬 User Contact Inquiries & Support Submissions</span>
                    </h2>

                    {inquiries.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs font-medium">
                            No contact inquiries found yet. Submissions from the Contact Us form will appear here live!
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {inquiries.map(inq => (
                                <div key={inq._id} className="py-4 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-bold text-sm text-white">{inq.name}</span>
                                            <span className="text-xs text-indigo-300">{inq.email}</span>
                                            {inq.phone && <span className="text-xs text-gray-400">({inq.phone})</span>}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                                inq.status === 'UNREAD' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                                inq.status === 'RESPONDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                            }`}>
                                                {inq.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-300 bg-black/30 p-3 rounded-2xl border border-white/5 leading-relaxed font-medium">
                                        <span className="text-indigo-400 font-bold">Subject: {inq.subject || 'General Inquiry'}</span>
                                        <p className="mt-1 text-gray-200">{inq.message}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <a
                                            href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Future BRTS Inquiry')}&body=Hi ${encodeURIComponent(inq.name)},\n\nThank you for reaching out to Future BRTS!`}
                                            onClick={() => handleUpdateInquiryStatus(inq._id, 'RESPONDED')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                        >
                                            <Mail size={12} /> Reply via Email
                                        </a>

                                        {inq.phone && (
                                            <a
                                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(inq.name)},%20thank%20you%20for%20contacting%20Future%20BRTS!`}
                                                onClick={() => handleUpdateInquiryStatus(inq._id, 'RESPONDED')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                            >
                                                <Send size={12} /> Reply via WhatsApp
                                            </a>
                                        )}

                                        {inq.status === 'UNREAD' && (
                                            <button
                                                onClick={() => handleUpdateInquiryStatus(inq._id, 'READ')}
                                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
