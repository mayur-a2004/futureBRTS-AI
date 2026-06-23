import { useState } from 'react';
import {
    Globe,
    BarChart3,
    Code,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function GoogleServices() {
    const [isLoading, setIsLoading] = useState(false);
    const [configs, setConfigs] = useState({
        ga_id: "G-XXXXXXXXXX",
        gsc_id: "sc-domain:futurebrts.com",
        maps_api_key: "",
        adsense_client_id: "pub-xxxxxxxxxxxxxxxx",
        tag_manager_id: "GTM-XXXXXXX",
        facebook_pixel_id: "XXXXXXXXXXXXXXXX",
        google_ads_id: "AW-XXXXXXXXX"
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('fbrts_token');
            const settingsToUpdate = [
                { key: 'GOOGLE_ANALYTICS_ID', value: configs.ga_id, description: 'Google Analytics 4 Measurement ID' },
                { key: 'GOOGLE_TAG_MANAGER_ID', value: configs.tag_manager_id, description: 'Google Tag Manager ID' },
                { key: 'GOOGLE_ADSENSE_CLIENT_ID', value: configs.adsense_client_id, description: 'Google AdSense Publisher ID' },
                { key: 'GOOGLE_SEARCH_CONSOLE_ID', value: configs.gsc_id, description: 'Search Console Property Trace ID' },
                { key: 'FACEBOOK_PIXEL_ID', value: configs.facebook_pixel_id, description: 'Meta/Facebook Ads Pixel ID' },
                { key: 'GOOGLE_ADS_ID', value: configs.google_ads_id, description: 'Google Ads Conversion ID' }
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
                toast.success("Marketing Ecosystem Integration Synced and Verified.");
            } else {
                toast.error("Ecosystem sync failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            toast.error("Critical connection failure to Genesis Core.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Marketing Ecosystem Integration</h1>
                    <p className="text-gray-400 mt-1 font-medium">Coordinate Google Cloud, Meta Pixel, AdSense & Marketing services with the Genesis Core.</p>
                </div>
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <Globe className="text-indigo-400" size={28} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analytics */}
                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <BarChart3 size={20} className="text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-black text-white">Analytics Intelligence</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Measurement ID (GA4)</label>
                            <input
                                type="text"
                                value={configs.ga_id}
                                onChange={e => setConfigs({ ...configs, ga_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tag Manager ID (GTM)</label>
                            <input
                                type="text"
                                value={configs.tag_manager_id}
                                onChange={e => setConfigs({ ...configs, tag_manager_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                placeholder="GTM-XXXXXXX"
                            />
                        </div>
                    </div>
                </div>

                {/* Adsense & Monetization */}
                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Code size={20} className="text-amber-400" />
                        </div>
                        <h2 className="text-lg font-black text-white">Monetization Unit</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">AdSense Client ID</label>
                            <input
                                type="text"
                                value={configs.adsense_client_id}
                                onChange={e => setConfigs({ ...configs, adsense_client_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                placeholder="pub-xxxxxxxxxxxxxxxx"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">
                            <AlertCircle size={12} /> Auto-ads enabled in landing grid
                        </div>
                    </div>
                </div>

                {/* Paid Advertising & Tracking Pixels */}
                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Globe size={20} className="text-purple-400" />
                        </div>
                        <h2 className="text-lg font-black text-white">Ads & Retargeting</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta (Facebook) Pixel ID</label>
                            <input
                                type="text"
                                value={configs.facebook_pixel_id}
                                onChange={e => setConfigs({ ...configs, facebook_pixel_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                placeholder="16-digit Pixel ID..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Google Ads Conversion ID</label>
                            <input
                                type="text"
                                value={configs.google_ads_id}
                                onChange={e => setConfigs({ ...configs, google_ads_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                                placeholder="AW-XXXXXXXXX"
                            />
                        </div>
                    </div>
                </div>

                {/* Search Console */}
                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-black text-white">Search Console Identity</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Property Trace ID</label>
                            <input
                                type="text"
                                value={configs.gsc_id}
                                onChange={e => setConfigs({ ...configs, gsc_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-sm font-bold text-white"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-xs text-gray-500 leading-relaxed font-bold">Verify your site ownership using Google Search Console.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Sync Ecosystem integration
                </button>
            </div>
        </div>
    );
}
