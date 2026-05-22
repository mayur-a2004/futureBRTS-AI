import Experience from '../models/experience.model';
import axios from 'axios';
import { logger } from '../shared/utils/logger';

const WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://127.0.0.1:8000';

export class InnovationSystem {
    private static isEvolving = false;

    /**
     * Triggers a 'Deep Evolution Cycle'
     * Sends the last 100 experience signals to the Python Brain for pattern analysis.
     */
    static async triggerEvolution() {
        if (this.isEvolving) return;
        this.isEvolving = true;

        try {
            logger.info('🚀 Initiating Autonomous Evolution Cycle...');

            const recentSignals = await Experience.find().sort({ createdAt: -1 }).limit(100);

            if (recentSignals.length < 5) {
                logger.info('Evolution deferred: Insufficient signals (minimum 5 required).');
                this.isEvolving = false;
                return;
            }

            const response = await axios.post(`${WORKER_URL}/execute`, {
                job_id: `evo-${Date.now()}`,
                session_id: "system-evolution",
                command: "evolve system intelligence",
                metadata: { 
                    signals: recentSignals,
                    session_id: "system-evolution" 
                },
                file_path: null
            });

            if (response.data && (response.data.status === 'SUCCESS' || response.data.status === 'completed')) {
                const boost = response.data.result?.boost_factor || 'x1.05';
                logger.info(`✨ Evolution Success! System Intelligence Boosted by ${boost}`);

                // Optional: Store the global upgrade status in a System settings collection
            }

        } catch (error: any) {
            logger.error(`Evolution failed: ${error.message || JSON.stringify(error)}`);
        } finally {
            this.isEvolving = false;
        }
    }

    /**
     * Start the Autonomous Loop
     */
    static startHeartbeat() {
        logger.info('💓 Innovation Heartbeat Started (Self-Learning Active).');
        // Trigger evolution every 15 minutes in this environment (scaled for demo)
        setInterval(() => {
            this.triggerEvolution();
        }, 15 * 60 * 1000);

        // Immediate check on start (Temporarily disabled for stability check)
        // this.triggerEvolution();
    }
}
