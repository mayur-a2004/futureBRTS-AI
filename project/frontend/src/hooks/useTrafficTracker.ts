
import { useEffect } from 'react';

const ADMIN_API_PATH = '/api/admin';

export const useTrafficTracker = () => {
    useEffect(() => {
        const track = async () => {
            try {
                // Get basic info
                const ua = navigator.userAgent;
                const path = window.location.pathname;
                const referrer = document.referrer;

                // Detect device/OS/etc
                const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : 'Other';
                const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'MacOS' : 'Other';
                const device = /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';

                // Report to Admin Nexus
                await fetch(`${ADMIN_API_PATH}/track-visitor`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        browser,
                        os,
                        device,
                        path,
                        referrer,
                        location: {
                            city: 'Auto-Detecting',
                            country: 'Live'
                        }
                    })
                });
            } catch (err) {
                console.warn('Traffic Nexus Reporting Inhibited');
            }
        };

        track();
    }, []);
};
