// 👉 Frontend API wrapper for Auth
// 👉 Local aur social auth redirects yaha se trigger hote hain

const BASE_URL = '/api/auth';

const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        const res = await fetch(url, options);
        // Backend often returns JSON even on error, so try to parse
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
        return {
            success: false,
            error: 'Network error. Please check your connection.'
        };
    }
};

export const authApi = {
    getUIContent: async () => {
        // UI Content is optional enhancement, keep it soft fail if needed but no mock data
        const data = await safeFetch(`${BASE_URL}/ui-content`);
        if (data && data.success) return data;
        return { success: false, error: 'Used Default UI' };
    },

    login: async (credentials: any) => {
        return await safeFetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
    },

    register: async (data: any) => {
        return await safeFetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    getMe: async (token: string) => {
        return await safeFetch(`${BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    googleLogin: () => {
        window.location.href = `${BASE_URL}/google`;
    },

    githubLogin: () => {
        window.location.href = `${BASE_URL}/github`;
    }
};
