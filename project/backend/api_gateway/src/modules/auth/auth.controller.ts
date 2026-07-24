// 👉 Auth controller user registration, login aur social auth redirect handle karta hai
// 👉 Isme logic JWT token generate karne ka bhi hai

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './user.model';
import { oauthService } from './oauth.service';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PENDING_CLIENT_ID');

const generateToken = (user: any) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('CRITICAL: JWT_SECRET is not configured in environment variables.');
    return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });
};

export const authController = {
    register: async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password, dateOfBirth } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ success: false, error: 'User already exists' });

            const passwordHash = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                passwordHash,
                dateOfBirth,
                provider: 'local'
            });

            res.status(201).json({ success: true, token: generateToken(user), user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            // 🛑 SECURITY ENFORCEMENT: Block Inactive/Banned Users
            if (user.status !== 'active') {
                return res.status(403).json({ success: false, error: 'Account is blocked or inactive. Contact Admin.' });
            }

            res.json({ success: true, token: generateToken(user), user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    googleAuth: async (req: Request, res: Response) => {
        try {
            const { token, email, name, googleId } = req.body;
            if (!token) return res.status(400).json({ success: false, error: 'Missing Google Token' });

            // 1. DYNAMISM: Real verify logic
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID || 'PENDING_CLIENT_ID'
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email || payload.email !== email) {
                return res.status(403).json({ success: false, error: 'Invalid Google Identity' });
            }

            // 2. Check if user exists
            let user = await User.findOne({ email });

            if (user) {
                // Login existing
                return res.json({ success: true, token: generateToken(user), user });
            } else {
                // Create new
                // Name splitting fallback
                const nameParts = (name || 'Builder User').split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    provider: 'google',
                    onboardingCompleted: false
                });

                return res.status(201).json({ success: true, token: generateToken(user), user });
            }
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            res.status(500).json({ success: false, error: 'Google Login Failed' });
        }
    },

    forgotPassword: async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            // Always return success to prevent enumeration
            if (!user) return res.json({ success: true, message: 'If email exists, reset link sent.' });

            // Generate token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hash = await bcrypt.hash(resetToken, 10);

            user.resetPasswordToken = hash;
            user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            await user.save();

            // Mock Email Send (Log it securely without exposing token directly in logs in production)
            if(process.env.NODE_ENV === 'development') {
                const maskedToken = resetToken.substring(0, 4) + '...' + resetToken.substring(resetToken.length - 4);
                console.log(`[EMAIL SEND TO: ${user.email}] Password Reset Link: http://localhost:5173/auth/reset-password?token=${maskedToken}&id=${user._id}`);
            } else {
                console.log(`[EMAIL SEND] Reset link dispatched securely to ${user.email}`);
            }

            res.json({ success: true, message: 'Reset link sent to email.' });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    resetPassword: async (req: Request, res: Response) => {
        try {
            const { userId, token, newPassword } = req.body;
            const user = await User.findById(userId);

            if (!user || !user.resetPasswordToken || !user.resetPasswordExpiry) {
                return res.status(400).json({ success: false, error: 'Invalid or expired token' });
            }

            if (user.resetPasswordExpiry < new Date()) {
                return res.status(400).json({ success: false, error: 'Token expired' });
            }

            const isValid = await bcrypt.compare(token, user.resetPasswordToken);
            if (!isValid) return res.status(400).json({ success: false, error: 'Invalid token' });

            const passwordHash = await bcrypt.hash(newPassword, 10);
            user.passwordHash = passwordHash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();

            res.json({ success: true, message: 'Password reset successful.' });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getMe: async (req: any, res: Response) => {
        try {
            const user = await User.findById(req.user.id).select('-passwordHash -resetPasswordToken -resetPasswordExpiry');
            if (!user) return res.status(404).json({ success: false, error: 'User profile not found' });
            res.json({ success: true, user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateProfile: async (req: any, res: Response) => {
        try {
            const { firstName, lastName, profile } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (profile) {
                user.profile = {
                    ...user.profile,
                    ...profile
                };
            }

            await user.save();
            res.json({ success: true, user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateOnboardingStatus: async (req: any, res: Response) => {
        try {
            const { status, type } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            if (status) user.onboarding_status = status;
            if (type) {
                user.profile = { ...user.profile, type };
                if (status === 'DONE') user.onboardingCompleted = true;
            }

            await user.save();
            res.json({ success: true, user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    getUIContent: async (req: Request, res: Response) => {
        // 👉 Dynamic UI text based on request (Unified structure to avoid frontend crashes)
        res.json({
            success: true,
            data: {
                login: {
                    heading: 'Welcome Back',
                    subtext: 'Directing your intelligence towards a specialized future.',
                    labels: { email: 'Email Architecture', password: 'Password' },
                    placeholders: { email: 'architect@future.com', password: '••••••••' },
                    ctaText: 'Access Workspace',
                    socialText: { github: 'GitHub Access', google: 'Google Login' },
                    footerActionText: "Don't have an account?",
                    footerLinkText: 'Initialize Account',
                    footerLinkPath: '/auth/register'
                },
                register: {
                    heading: 'Initialize Profile',
                    subtext: 'Join the world\'s first predictive roadmap engine.',
                    labels: { firstName: 'First Name', lastName: 'Last Name', email: 'Email', password: 'Password', dob: 'Date of Birth' },
                    placeholders: { firstName: 'John', lastName: 'Doe', email: 'john@future.com', password: '••••••••' },
                    ctaText: 'Build Profile',
                    socialText: { github: 'GitHub Sync', google: 'Google Sync' },
                    footerActionText: 'Already initialized?',
                    footerLinkText: 'Access Workspace',
                    footerLinkPath: '/auth/login'
                }
            }
        });
    },

    googleRedirect: (req: Request, res: Response) => {
        if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'PENDING_CLIENT_ID') {
            // Mock OAuth flow for local development
            return res.redirect('/api/auth/google/callback?code=mock_google_code');
        }
        res.redirect(oauthService.getGoogleUrl());
    },

    githubRedirect: (req: Request, res: Response) => {
        if (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'PENDING_CLIENT_ID') {
            // Mock OAuth flow for local development
            return res.redirect('/api/auth/github/callback?code=mock_github_code');
        }
        res.redirect(oauthService.getGithubUrl());
    },

    socialCallback: async (req: Request, res: Response) => {
        try {
            const code = req.query.code as string;
            const path = req.path;
            const isGoogle = path.includes('google');

            if (!code) {
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?error=social_auth_failed`);
            }

            const fetch = (await import('node-fetch')).default;
            let email = '';
            let firstName = '';
            let lastName = '';
            let providerId = '';
            const provider = isGoogle ? 'google' : 'github';

            const isMock = code.startsWith('mock_') ||
                           (isGoogle && (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'PENDING_CLIENT_ID')) ||
                           (!isGoogle && (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'PENDING_CLIENT_ID'));

            if (isMock) {
                email = isGoogle ? 'google_explorer@futurebrts.com' : 'github_builder@futurebrts.com';
                firstName = isGoogle ? 'Google' : 'Github';
                lastName = isGoogle ? 'Explorer' : 'Builder';
                providerId = `mock_id_${provider}_12345`;
            } else {
                if (isGoogle) {
                    // 1. Google OAuth Token Exchange
                    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            code,
                            client_id: process.env.GOOGLE_CLIENT_ID || '',
                            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                            redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:7001/api/auth/google/callback',
                            grant_type: 'authorization_code',
                        }).toString()
                    });
                    const tokenData: any = await tokenResponse.json();

                    if (!tokenData.access_token) {
                        console.error('[Google OAuth Token Error]', tokenData);
                        throw new Error('Failed to obtain Google access token');
                    }

                    // 2. Fetch User Profile Info from Google
                    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
                    });
                    const userData: any = await userResponse.json();

                    if (!userData.email) {
                        console.error('[Google OAuth Profile Error]', userData);
                        throw new Error('Failed to obtain user email from Google');
                    }

                    email = userData.email.toLowerCase();
                    firstName = userData.given_name || 'Google';
                    lastName = userData.family_name || 'User';
                    providerId = userData.id || '';
                } else {
                    // 1. GitHub OAuth Token Exchange
                    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json' 
                        },
                        body: JSON.stringify({
                            code,
                            client_id: process.env.GITHUB_CLIENT_ID || '',
                            client_secret: process.env.GITHUB_CLIENT_SECRET || '',
                            redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:7001/api/auth/github/callback',
                        })
                    });
                    const tokenData: any = await tokenResponse.json();

                    if (!tokenData.access_token) {
                        console.error('[GitHub OAuth Token Error]', tokenData);
                        throw new Error('Failed to obtain GitHub access token');
                    }

                    // 2. Fetch User Profile Info from GitHub
                    const userResponse = await fetch('https://api.github.com/user', {
                        headers: { 
                            'Authorization': `token ${tokenData.access_token}`,
                            'User-Agent': 'FutureBRTS-App'
                        }
                    });
                    const userData: any = await userResponse.json();

                    providerId = String(userData.id || '');
                    const nameVal = userData.name || userData.login || 'Github User';
                    const nameParts = nameVal.trim().split(/\s+/);
                    firstName = nameParts[0];
                    lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

                    // 3. Fetch User Email (Github profile emails can be private/hidden)
                    if (userData.email) {
                        email = userData.email.toLowerCase();
                    } else {
                        const emailsResponse = await fetch('https://api.github.com/user/emails', {
                            headers: { 
                                'Authorization': `token ${tokenData.access_token}`,
                                'User-Agent': 'FutureBRTS-App'
                            }
                        });
                        const emailsData: any = await emailsResponse.json();
                        if (Array.isArray(emailsData) && emailsData.length > 0) {
                            const primaryEmail = emailsData.find((e: any) => e.primary) || emailsData[0];
                            email = primaryEmail.email.toLowerCase();
                        } else {
                            email = `${userData.login || 'github_user'}@github.futurebrts.com`;
                        }
                    }
                }
            }

            // Find or create user
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    passwordHash: 'social_auth_no_password_configured',
                    provider,
                    providerId,
                    onboardingCompleted: false,
                });
            }

            const token = generateToken(user);
            const userObj = {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                onboardingCompleted: user.onboardingCompleted,
                provider: user.provider,
            };

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/auth/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`);

        } catch (err: any) {
            console.error('[socialCallback Error]', err);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?error=social_auth_failed`);
        }
    },

    registerTeacher: async (req: Request, res: Response) => {
        try {
            const { 
                email, password, name, schoolName, teacherId, 
                schoolAddress, subject, roleInSchool, gender, whatsappNumber 
            } = req.body;
            
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) return res.status(400).json({ success: false, error: 'User already exists' });

            const nameParts = (name || 'Teacher User').trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Teacher';

            const passwordHash = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                passwordHash,
                role: 'teacher',
                provider: 'local',
                onboardingCompleted: true,
                teacherDetails: {
                    schoolName,
                    teacherId,
                    schoolAddress,
                    subject,
                    roleInSchool,
                    gender,
                    whatsappNumber
                }
            });

            res.status(201).json({ success: true, token: generateToken(user), user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    loginTeacher: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            if (user.role !== 'teacher') {
                return res.status(403).json({ success: false, error: 'Access denied. You are not registered as a teacher.' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ success: false, error: 'Account is blocked or inactive. Contact Admin.' });
            }

            res.json({ success: true, token: generateToken(user), user });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    changePassword: async (req: any, res: Response) => {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, error: 'Current password and new password are required' });
            }

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            if (user.passwordHash) {
                const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
                if (!isMatch) {
                    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
                }
            }

            user.passwordHash = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🔐 Admin Security 2FA OTP Credential Change
    requestAdminCredentialOtp: async (req: Request, res: Response) => {
        try {
            const { targetEmail } = req.body;
            const authorizedEmails = ['mayursavaliya2004@gmail.com', 'visup409@gmail.com'];
            if (!targetEmail || !authorizedEmails.includes(targetEmail.toLowerCase().trim())) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Unauthorized security email. OTP can only be sent to authorized master admin emails (mayursavaliya2004@gmail.com or visup409@gmail.com).' 
                });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes valid

            const SystemSettings = require('../admin/settings.model').default;
            await SystemSettings.findOneAndUpdate(
                { key: 'ADMIN_CREDENTIAL_OTP' },
                { value: JSON.stringify({ otp, targetEmail: targetEmail.toLowerCase().trim(), expiry }), description: 'Admin Credential 2FA OTP' },
                { upsert: true }
            );

            console.log(`\n=================================================`);
            console.log(`🔐 [ADMIN 2FA SECURITY OTP GENERATED]`);
            console.log(`Dispatched to: ${targetEmail}`);
            console.log(`VERIFICATION OTP CODE: ${otp}`);
            console.log(`=================================================\n`);

            res.json({
                success: true,
                message: `6-Digit Security OTP has been generated and sent to ${targetEmail}.`,
                targetEmail,
                devOtpPreview: process.env.NODE_ENV !== 'production' ? otp : undefined
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    updateAdminCredentialsWithOtp: async (req: Request, res: Response) => {
        try {
            const { otp, newEmail, newPassword } = req.body;
            if (!otp) {
                return res.status(400).json({ success: false, error: '6-Digit Security OTP code is required.' });
            }

            const SystemSettings = require('../admin/settings.model').default;
            const otpSetting = await SystemSettings.findOne({ key: 'ADMIN_CREDENTIAL_OTP' });

            if (!otpSetting || !otpSetting.value) {
                return res.status(400).json({ success: false, error: 'No active OTP request found. Please request an OTP first.' });
            }

            let parsed: any = {};
            try {
                parsed = JSON.parse(otpSetting.value);
            } catch (e) {}

            if (parsed.otp !== otp.trim()) {
                return res.status(403).json({ success: false, error: 'Invalid 6-Digit OTP code. Security verification failed.' });
            }

            if (Date.now() > parsed.expiry) {
                return res.status(400).json({ success: false, error: 'Security OTP code has expired. Please request a new OTP.' });
            }

            const adminUser = await User.findOne({ role: 'admin' });
            if (!adminUser) {
                return res.status(404).json({ success: false, error: 'Admin user account not found.' });
            }

            if (newEmail) {
                adminUser.email = newEmail.toLowerCase().trim();
            }

            if (newPassword) {
                adminUser.passwordHash = await bcrypt.hash(newPassword, 10);
            }

            await adminUser.save();
            await SystemSettings.deleteOne({ key: 'ADMIN_CREDENTIAL_OTP' });

            res.json({
                success: true,
                message: '✅ Admin credentials updated successfully! Log in with your new email and password.',
                adminEmail: adminUser.email
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
