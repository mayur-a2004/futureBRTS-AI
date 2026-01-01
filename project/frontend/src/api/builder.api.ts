// 👉 Frontend API wrapper for Builder Workspace

const BASE_URL = '/api/builder';

export const builderApi = {
    getEntryData: async (token: string) => {
        try {
            const res = await fetch(`${BASE_URL}/entry`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await res.json();
        } catch (err) {
            return { success: false, error: 'Failed to fetch builder data' };
        }
    }
};
