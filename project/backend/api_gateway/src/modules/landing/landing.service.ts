// 👉 Ye service landing page ke business logic ko handle karti hai
// 👉 Isme DB se data nikalne ka kaam hota hai

import LandingPage from './landing.model';

export const landingService = {
    getPage: async (page: string) => {
        return await LandingPage.findOne({ page });
    }
};
