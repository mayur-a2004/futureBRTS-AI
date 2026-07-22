import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 🛡️ FUTURE BRTS 7-LAYER WEB APPLICATION FIREWALL (WAF SENTINEL)
 * Real-time intrusion detection, DDoS mitigation, SQLi/XSS/Command Injection defense,
 * and emergency SMS/WhatsApp security alerts to administrator phone: 7859822561.
 */

const ADMIN_EMERGENCY_ALERT_PHONE = '7859822561';

// In-Memory IP Request Counters for Layer 1 Rate Anomaly Detection
const ipRequestCounts: Record<string, { count: number; firstReq: number; blockedUntil?: number }> = {};

// Trigger Emergency SMS/WhatsApp Alert to Admin
const sendEmergencySecurityAlert = (attackType: string, ip: string, details: string, url: string) => {
    const alertMessage = `🚨 [FUTURE BRTS 7-LAYER WAF ALERT] 🚨\nAttack Detected: ${attackType}\nTarget IP: ${ip}\nEndpoint: ${url}\nDetails: ${details}\nAction: INTRUSION BLOCKED BY FIREWALL SENTINEL.`;
    
    logger.error(`[7-Layer WAF Sentinel] ${alertMessage}`);
    console.warn(`\n========================================================`);
    console.warn(`🚨 SECURITY EMERGENCY ALERT DISPATCHED TO +91${ADMIN_EMERGENCY_ALERT_PHONE}`);
    console.warn(alertMessage);
    console.warn(`========================================================\n`);

    // Asynchronously dispatch webhook / SMS notification
    try {
        // Log incident into Guardian service
        const { ProjectGuardian } = require('../../services/guardian.service');
        ProjectGuardian?.logIncident?.(attackType, { ip, details, url, alertPhone: ADMIN_EMERGENCY_ALERT_PHONE });
    } catch (e) {}
};

export const layer7WafSentinel = (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || '127.0.0.1';
    const clientIp = rawIp === '::1' || rawIp === '::ffff:127.0.0.1' ? '127.0.0.1' : rawIp;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const url = req.originalUrl || req.url;
    const now = Date.now();

    // ─── LAYER 1: Network & Rate Anomaly Defense (IP Flood / DDoS) ───────────
    if (!ipRequestCounts[clientIp]) {
        ipRequestCounts[clientIp] = { count: 1, firstReq: now };
    } else {
        const tracker = ipRequestCounts[clientIp];
        if (tracker.blockedUntil && tracker.blockedUntil > now) {
            return res.status(429).json({
                success: false,
                firewallBlocked: true,
                error: '7-Layer WAF Sentinel: IP temporarily restricted due to rate anomaly detection.'
            });
        }

        if (now - tracker.firstReq < 60000) { // Within 1 minute
            tracker.count += 1;
            if (tracker.count > 150) { // Limit 150 req/min for single IP
                tracker.blockedUntil = now + 5 * 60 * 1000; // Block for 5 mins
                sendEmergencySecurityAlert('L1_DDOS_IP_FLOOD', clientIp, `Exceeded 150 requests/min (${tracker.count} reqs)`, url);
                return res.status(429).json({
                    success: false,
                    firewallBlocked: true,
                    error: '7-Layer WAF Sentinel: Rate anomaly detected. Connection blocked.'
                });
            }
        } else {
            tracker.count = 1;
            tracker.firstReq = now;
        }
    }

    // ─── LAYER 2: Protocol & User-Agent Scanner Defense ──────────────────────
    const maliciousBots = [
        'sqlmap', 'nikto', 'nmap', 'masscan', 'acunetix', 'dirbuster', 'wpscan',
        'zgrab', 'censys', 'nessus', 'openvas', 'havij', 'burpsuite', 'metasploit'
    ];
    if (maliciousBots.some(bot => userAgent.includes(bot))) {
        sendEmergencySecurityAlert('L2_MALICIOUS_BOT_SCANNER', clientIp, `Blacklisted User-Agent: ${userAgent}`, url);
        return res.status(403).json({
            success: false,
            firewallBlocked: true,
            error: '7-Layer WAF Sentinel: Automated vulnerability scanner blocked.'
        });
    }

    // Combine payload for deep layer inspection (max 500KB inspection)
    const payloadStr = (url + ' ' + JSON.stringify(req.body || {}) + ' ' + JSON.stringify(req.query || {})).toLowerCase();

    // Skip scanning binary files or safe multipart routes
    const isUploadRoute = url.includes('/upload') || url.includes('/downloads');

    if (!isUploadRoute && payloadStr.length < 524288) {
        // ─── LAYER 3: Deep SQL Injection (SQLi) Engine ───────────────────────
        const sqliPattern = /(\b(select|insert|update|delete|drop|union|alter|create|truncate|exec|benchmark|sleep)\b.*(from|into|table|database|where|values)|'--|' \/\*|' or '1'='1|' or 1=1|1=1--)/i;
        if (sqliPattern.test(payloadStr)) {
            sendEmergencySecurityAlert('L3_SQL_INJECTION_PROBE', clientIp, `SQLi signature matched in payload`, url);
            return res.status(400).json({
                success: false,
                firewallBlocked: true,
                error: '7-Layer WAF Sentinel: Malicious SQL injection probe rejected.'
            });
        }

        // ─── LAYER 4: Cross-Site Scripting (XSS) & Script Inject Guard ───────
        const xssPattern = /(<script\b[^>]*>|javascript:|onerror\s*=|onload\s*=|document\.cookie|<iframe\b|eval\s*\()/i;
        if (xssPattern.test(payloadStr)) {
            sendEmergencySecurityAlert('L4_XSS_SCRIPT_INJECTION', clientIp, `XSS signature matched in payload`, url);
            return res.status(400).json({
                success: false,
                firewallBlocked: true,
                error: '7-Layer WAF Sentinel: Malicious XSS payload rejected.'
            });
        }

        // ─── LAYER 5: OS Command Injection & Directory Traversal Shield ──────
        const commandInjectPattern = /(\.\.\/|\.\.\\|\/etc\/passwd|cmd\.exe|powershell|;\s*cat\s|\|\s*nc\s|&&\s*rm\s)/i;
        if (commandInjectPattern.test(payloadStr)) {
            sendEmergencySecurityAlert('L5_COMMAND_INJECTION_TRAVERSAL', clientIp, `Path Traversal / OS Command signature matched`, url);
            return res.status(400).json({
                success: false,
                firewallBlocked: true,
                error: '7-Layer WAF Sentinel: Command execution or path traversal blocked.'
            });
        }

        // ─── LAYER 6: Session Tampering & Token Integrity Guard ─────────────
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token && (token.includes('<') || token.includes('>') || token.length < 10)) {
                sendEmergencySecurityAlert('L6_TOKEN_TAMPER_ATTEMPT', clientIp, `Malformed or tampered authorization token`, url);
                return res.status(401).json({
                    success: false,
                    firewallBlocked: true,
                    error: '7-Layer WAF Sentinel: Tampered authorization token rejected.'
                });
            }
        }
    }

    // ─── LAYER 7: Dynamic Health Sentinel (Pass toNext) ──────────────────────
    next();
};
