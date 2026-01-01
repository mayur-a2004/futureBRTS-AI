// 👉 Ye frontend ke saare API calls handle karta hai
// 👉 Backend ke naye modular structure ke saath synchronized hai

const BASE_URL = '/api';

export const api = {
    // 👉 Landing Page APIs
    landing: {
        // 👉 Dynamic page data fetch karne ke liye
        getPage: async (pageName: string = 'home') => {
            const res = await fetch(`${BASE_URL}/landing/page?page=${pageName}`);
            if (!res.ok) throw new Error('Landing data not found');
            return await res.json();
        },
        // 👉 Intent save karne ke liye
        saveIntent: async (message: string, sessionId?: string) => {
            const res = await fetch(`${BASE_URL}/landing/intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId })
            });
            return await res.json();
        },
        // 👉 Resume chat session from landing intent
        resumeChat: async (token: string) => {
            const res = await fetch(`${BASE_URL}/landing/resume-chat`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        },
        // 👉 Visit track karne ke liye
        trackVisit: async () => {
            const res = await fetch(`${BASE_URL}/landing/visit`, {
                method: 'POST'
            });
            return await res.json();
        },
        // 👉 Old API stub (Fixed error: postSEOTrack is not a function)
        postSEOTrack: () => Promise.resolve({ success: true })
    },

    // 👉 Authentication APIs
    auth: {
        getUI: async (page: string) => {
            const res = await fetch(`${BASE_URL}/auth/ui-content?page=${page}`);
            return await res.json();
        },
        register: async (data: any) => {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        login: async (data: any) => {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        getMe: async (token: string) => {
            const res = await fetch(`${BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        }
    },

    // 👉 Onboarding flow APIs
    onboarding: {
        saveStep: async (data: any, token: string) => {
            const res = await fetch(`${BASE_URL}/onboarding/step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        resume: async (token: string) => {
            const res = await fetch(`${BASE_URL}/onboarding/resume`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        },
        complete: async (token: string) => {
            const res = await fetch(`${BASE_URL}/onboarding/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        }
    },

    // 👉 Builder workspace entry
    builder: {
        getEntry: async (token: string) => {
            const res = await fetch(`${BASE_URL}/builder/entry`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        },
        createSession: async (data: any) => {
            const res = await fetch(`${BASE_URL}/builder/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        },
        sendMessage: async (data: any) => {
            const res = await fetch(`${BASE_URL}/builder/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        }
    }
};
