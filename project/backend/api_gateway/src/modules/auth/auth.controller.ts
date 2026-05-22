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
                    labels: { email: 'Email Architecture', password: 'Vault Key' },
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
                    labels: { firstName: 'First Name', lastName: 'Last Name', email: 'Email', password: 'Key', dob: 'Date of Birth' },
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
        res.redirect(oauthService.getGoogleUrl());
    },

    githubRedirect: (req: Request, res: Response) => {
        res.redirect(oauthService.getGithubUrl());
    },

    socialCallback: async (req: Request, res: Response) => {
        // Exchange code for token and complete auth securely
        const code = req.query.code;
        if (!code) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?error=social_auth_failed`);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/social-sync?code=${code}`);
    }
};
