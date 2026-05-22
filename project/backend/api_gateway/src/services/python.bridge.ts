import axios from 'axios';
import { logger } from '../shared/utils/logger';

const WORKER_URL = 'http://127.0.0.1:8000/execute';

export class PythonBridge {
    static async triggerWorker(payload: any) {
        try {
            logger.info(`Bridge: Triggering Python Worker for Job ${payload.job_id}`);

            const response = await axios.post(WORKER_URL, payload, {
                headers: { 'Connection': 'close' },
                timeout: 60000
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Bridge Error: ${error.message}`);
            throw new Error("Python Worker Unavailable");
        }
    }
}
