import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * L1: Perimeter Defense - Rate Limiting
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10000, 
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1',
    message: { 
        status: 'error', 
        message: 'Too many requests - Security system paused your connection.',
        error_code: 'RATE_LIMIT_EXCEEDED'
    }
});

/**
 * L2: Identity Protection - Header Verification
 */
export const securityShield = (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious headers
    const userAgent = req.headers['user-agent'];
    if (!userAgent || userAgent.includes('sqlmap') || userAgent.includes('nikto')) {
        try {
            const { ProjectGuardian } = require('../../services/guardian.service');
            ProjectGuardian.logIncident('BOT_ATTEMPT', { ip: req.ip, userAgent });
        } catch (e) { }
        return res.status(403).json({ error: 'Security violation detected' });
    }

    // Chat and Builder routes often contain technical keywords like "select", "update", "delete", "../"
    // We should skip these checks for AI conversation routes to allow technical discussion.
    const skipCheckRoutes = ['/api/auth/', '/api/builder/', '/api/roadmap/', '/api/tasks/', '/api/guest/'];
    const isSkipRoute = skipCheckRoutes.some(route => req.originalUrl.startsWith(route));

    if (!isSkipRoute) {
        // 🛡️ MEMORY ESCALATION PROTECTION: 
        // Do NOT stringify massive bodies (could trigger OOM/Crash). 
        // We only scan payloads < 1MB for technical injection patterns.
        const contentLength = parseInt(req.headers['content-length'] || '0');

        if (contentLength < 1048576) { // 1MB Limit
            const input = JSON.stringify(req.body) + JSON.stringify(req.query);
            const sqlInjectionPattern = /('|--|truncate|drop|select|update|delete|union|sleep\(|benchmark\()/i;
            const xssPattern = /<script|javascript:|onerror|eval\(|document\.cookie/i;
            const traversalPattern = /\.\.\/|\.\.\\/i;

            if (sqlInjectionPattern.test(input) || xssPattern.test(input) || traversalPattern.test(input)) {
                try {
                    const { ProjectGuardian } = require('../../services/guardian.service');
                    ProjectGuardian.logIncident('CRITICAL_INJECTION_PROBE', { ip: req.ip, input: 'masked' });
                } catch (e) { }
                console.warn(`🛡️ Security Block on ${req.originalUrl} from IP ${req.ip}`);
                return res.status(400).json({ error: 'Invalid characters in request' });
            }
        }
    }

    next();
};

/**
 * L3: Environment Hardening
 */
export const hardenedHelmet = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "http://127.0.0.1:8000", "http://localhost:7001"]
        }
    }
});
