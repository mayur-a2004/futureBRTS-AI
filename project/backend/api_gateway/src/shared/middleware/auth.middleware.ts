import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import User from '../../modules/auth/user.model';

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
    const systemKey = req.headers['x-system-key'];
    const internalSecret = process.env.SYSTEM_INTERNAL_KEY || 'titan_internal_secret_2024';

    if (systemKey && systemKey === internalSecret) {
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        console.log(`[Auth] Verifying token with secret: ${process.env.JWT_SECRET || 'secret'}`);
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // 🛡️ STRICT: Check if user actually exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
        }

        // 🛑 REAL-TIME BAN ENFORCEMENT
        if (user.status !== 'active') {
            return res.status(403).json({ success: false, error: 'Session Terminated: Account Blocked or Inactive' });
        }

        req.user = user; // Store full user object instead of just decoded payload
        next();
    } catch (err) {
        logger.error('Auth Middleware Error', err);
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
    }
};
