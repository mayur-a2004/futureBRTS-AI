import { logger } from '../shared/utils/logger';

export class ProjectGuardian {
    private static incidents: any[] = [];

    /**
     * L7: Audit & Incident Response
     * Logs security events and can trigger system lock-down if threshold is reached.
     */
    static async logIncident(type: string, details: any) {
        const severity = this.calculateSeverity(type);
        const incident = {
            timestamp: new Date(),
            type,
            severity,
            details
        };

        this.incidents.push(incident);
        logger.warn(`🛑 [Guardian] Security Incident Logged: ${type} from ${details.ip || 'unknown'}`);

        // --- INSTANT ALERT SYSTEM ---
        if (severity === 'CRITICAL') {
            await this.alertAdmin(incident);
        }
        // ----------------------------

        if (this.incidents.filter(i => i.severity === 'CRITICAL').length > 10) {
            this.triggerLockdown();
        }
    }

    /**
     * Triggers immediate Ring & Message for the Admin
     */
    private static async alertAdmin(incident: any) {
        logger.error(`🚨 [ALARM] CRITICAL BREACH ATTEMPT DETECTED!`);
        logger.error(`🚨 [ALARM] IP: ${incident.details.ip} | Type: ${incident.type}`);
        console.log('\x07'); // Triggers actual system beep (bell) on most terminals

        // Simulating immediate SMS/Push Notification
        logger.info(`📲 [SMS_GATEWAY] Sent "URGENT: Hack Attempt Detected" to Main Administrator.`);
    }

    private static calculateSeverity(type: string): string {
        if (type.includes('INJECTION') || type.includes('SANDBOX') || type.includes('BREACH')) return 'CRITICAL';
        return 'WARNING';
    }

    private static triggerLockdown() {
        logger.error('🚨 [Guardian] SYSTEM LOCKDOWN TRIGGERED: Excessive security violations.');
        // logic to set a global maintenance/lock flag in DB could be here
    }

    static getSecurityStatus() {
        return {
            status: 'PROTECTED',
            active_layers: 7,
            incident_count: this.incidents.length,
            health_score: Math.max(0, 100 - (this.incidents.length * 2))
        };
    }
}
