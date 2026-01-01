
// This file acts as a placeholder for FutureBuilder Phase 2 Backend Integration
// All major actions currently route through here but return mock promises

export const API_BASE_URL = "/api";

export const MockAPI = {
    auth: {
        login: async (email: string, password: string) => {
            console.log(`[MOCK API] POST ${API_BASE_URL}/auth/login`, { email, password });
            return new Promise<any>(resolve => setTimeout(() => resolve({ token: "mock_token_xyz", user: { id: "u1", name: "Test User", email } }), 800));
        },
        register: async (data: any) => {
            console.log(`[MOCK API] POST ${API_BASE_URL}/auth/register`, data);
            return new Promise<any>(resolve => setTimeout(() => resolve({ token: "mock_token_abc", user: { id: "u2", name: data.firstName, email: data.email } }), 1000));
        }
    },
    onboarding: {
        save: async (data: any) => {
            console.log(`[MOCK API] POST ${API_BASE_URL}/onboarding/save`, data);
            return new Promise<any>(resolve => setTimeout(() => resolve({ success: true }), 500));
        }
    },
    dashboard: {
        getStats: async () => {
            console.log(`[MOCK API] GET ${API_BASE_URL}/dashboard`);
            return {
                jobMatches: 12,
                skillGap: "Critical",
                studyHours: 124,
                applicationStatus: "Active"
            }
        }
    },
    builder: {
        saveProject: async (projectData: any) => {
            console.log(`[MOCK API] POST ${API_BASE_URL}/builder/save`, projectData);
            return new Promise<any>(resolve => setTimeout(() => resolve({ id: "proj_123", status: "saved" }), 600));
        }
    },
    payment: {
        createIntent: async (planId: string) => {
            console.log(`[MOCK API] POST ${API_BASE_URL}/payment/create-intent`, { planId });
            return new Promise<any>(resolve => setTimeout(() => resolve({ clientSecret: "pi_mock_secret_12345" }), 1000));
        }
    }
}
