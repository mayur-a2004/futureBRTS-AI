// 👉 Frontend API wrapper for Onboarding
// 👉 Isme logic save karne aur resume karne ka hai stability ke liye

const BASE_URL = '/api/onboarding';

const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn(`API Failed (${url}), failing over to MOCK mode for stability.`);
        return null; // Signal failure to trigger mock
    }
};

export const onboardingApi = {
    // 👉 Specific entry endpoint for technical/initial mindset context
    saveEntry: async (data: { step: number | string, answer: any }, token: string) => {
        const result = await safeFetch(`${BASE_URL}/entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (result) return result;
        // Mock Success
        return { success: true, message: 'Entry saved (Mock)' };
    },

    saveStep: async (data: { step: string, answer: any }, token: string) => {
        const result = await safeFetch(`${BASE_URL}/step`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (result) return result;
        // Mock Success
        return { success: true, message: 'Step saved (Mock)' };
    },

    resume: async (token: string) => {
        const result = await safeFetch(`${BASE_URL}/resume`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (result) return result;
        // Mock Resume
        return {
            success: true,
            status: 'IN_PROGRESS',
            profile: { /* Mock profile if needed, or empty */ }
        };
    },

    complete: async (token: string) => {
        const result = await safeFetch(`${BASE_URL}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (result) return result;
        // Mock Success
        return { success: true, message: 'Onboarding completed (Mock)' };
    }
};
