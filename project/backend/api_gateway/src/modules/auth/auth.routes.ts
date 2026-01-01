// 👉 Auth routes mapping
// 👉 Isme local aur social routes list kiye gaye hain

import express from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authMiddleware, authController.getMe);
router.get('/ui-content', authController.getUIContent);

router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.socialCallback);
router.get('/github', authController.githubRedirect);
router.get('/github/callback', authController.socialCallback);

export default router;
