// 👉 Ye middleware JWT token verify karta hai
// 👉 Iske bina protected routes access nahi kiye ja sakte

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        logger.error('Auth Middleware Error', err);
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};
