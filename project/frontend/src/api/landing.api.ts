// 👉 Frontend API wrapper for Landing Page
// 👉 Isme logic requests ko try/catch me wrap karne ka hai stability ke liye

const BASE_URL = '/api/landing';

export const landingApi = {
    // 👉 Canonical API to fetch page data by slug
    getPageData: async (slug: string = 'home') => {
        try {
            const res = await fetch(`${BASE_URL}/page?slug=${slug}`);
            if (!res.ok) throw new Error('Failed to fetch landing data');
            return await res.json();
        } catch (err) {
            console.error('Landing API Error:', err);
            // 👉 Frontend fallback logic agar backend fail ho jaye
            return {
                success: true,
                page: { slug: 'home', sections: [] }
            };
        }
    },

    saveIntent: async (text: string, userId?: string) => {
        try {
            const res = await fetch(`${BASE_URL}/intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, userId })
            });
            return await res.json();
        } catch (err) {
            return { success: false, error: 'Failed to save intent' };
        }
    },

    // 👉 Ye function SEO tracking ke liye hai, crash se bachne ke liye safe stub
    postSEOTrack: async () => Promise.resolve(),

    trackVisit: async () => {
        try {
            fetch(`${BASE_URL}/visit`, { method: 'POST' }).catch(() => { });
        } catch (err) { }
    }
};
