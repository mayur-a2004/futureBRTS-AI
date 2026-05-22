// 👉 Ye service Google aur GitHub OAuth redirects handle karti hai
// 👉 Isme logic authorization URL generate karne ka hai

import { logger } from '../../shared/utils/logger';

export const oauthService = {
    getGoogleUrl: () => {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

        // 👉 Architect Requirement: Ensure response_type=code and client_id are valid
        const options = {
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:7001/api/auth/google/callback',
            client_id: process.env.GOOGLE_CLIENT_ID || 'PENDING_CLIENT_ID',
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };

        const qs = new URLSearchParams(options);
        const url = `${rootUrl}?${qs.toString()}`;
        logger.info(`Generated Google OAuth URL: ${url}`);
        return url;
    },

    getGithubUrl: () => {
        const rootUrl = 'https://github.com/login/oauth/authorize';
        const options = {
            client_id: process.env.GITHUB_CLIENT_ID || 'PENDING_CLIENT_ID',
            redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:7001/api/auth/github/callback',
            scope: 'read:user user:email',
            response_type: 'code', // Optional for GitHub but good for consistency
        };
        const qs = new URLSearchParams(options);
        return `${rootUrl}?${qs.toString()}`;
    }
};
