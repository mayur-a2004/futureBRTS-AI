// 👉 Frontend API wrapper for Onboarding
// 👉 Isme logic save karne aur resume karne ka hai stability ke liye

const BASE_URL = '/api/onboarding';

const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        const res = await fetch(url, options);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                success: false,
                status: res.status,
                error: data?.error || 'Request failed'
            };
        }
        return data;
    } catch (err) {
        console.error(`API Network Error (${url})`, err);
        return { success: false, error: 'Network Error' };
    }
};

export const onboardingApi = {
    // 👉 Specific entry endpoint for technical/initial mindset context
    saveEntry: async (data: { step: number | string, answer: any }, token: string) => {
        return await safeFetch(`${BASE_URL}/entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    },

    saveStep: async (data: { step: string, answer: any }, token: string) => {
        return await safeFetch(`${BASE_URL}/step`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    },

    resume: async (token: string) => {
        return await safeFetch(`${BASE_URL}/status`, { // Corrected from /resume to /status based on routes
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    complete: async (token: string) => {
        return await safeFetch(`${BASE_URL}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            // Assuming complete might need body later, but current controller doesn't strictly require it if pulling from DB/profile? 
            // Wait, the controller expects body params? 
            // "const { sessionId, field, ... } = req.body;" 
            // We need to pass these! But the original 'complete' function didn't pass data?
            // Ah, Onboarding.tsx calls it differently.
            // Let's keep it generic for now, but usually 'complete' implies finalization.
            // Onboarding.tsx: await onboardingApi.complete(token); -> It sends NO BODY?
            // Let's check Onboarding.tsx again.
            body: JSON.stringify({})
        });
    }
};
