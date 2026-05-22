import React, { useEffect } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';

interface AdSenseDisplayProps {
    slotId: string;
    format?: string;
    // publisherId is now optional or overrideable
    publisherId?: string;
}

const AdSenseDisplay: React.FC<AdSenseDisplayProps> = ({ slotId, format = 'auto', publisherId }) => {
    // 🧠 Fetch Global AdSense ID from Admin Config
    const { value: systemPublisherId, loading } = useSystemSettings('GOOGLE_ADSENSE_ID');
    const finalPublisherId = publisherId || systemPublisherId;

    useEffect(() => {
        if (finalPublisherId) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.warn('AdSense Execution Inhibited');
            }
        }
    }, [finalPublisherId]); // Run when ID is ready

    if (loading && !publisherId) return null; // Wait for config
    if (!finalPublisherId) return null; // No ID configured in Admin Panel

    return (
        <div className="w-full flex justify-center py-4 bg-black/20 rounded-2xl border border-white/5 overflow-hidden my-4 relative group">
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-[10px] text-gray-500 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Sponsored
            </div>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', minWidth: '250px' }}
                data-ad-client={finalPublisherId}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdSenseDisplay;
