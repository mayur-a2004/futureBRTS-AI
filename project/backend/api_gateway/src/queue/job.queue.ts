import { JobModel } from '../models/job.model';
import axios from 'axios'; // We talk to Python Worker via HTTP
import { logger } from '../shared/utils/logger';

const WORKER_URL = 'http://127.0.0.1:8000/execute'; // Python Worker URL

export const JobQueue = {
    addJob: async (data: { filePath: String, originalName: String, command: String, sessionId: String }) => {
        // 1. Create DB Record
        const job = await JobModel.create({
            session_id: data.sessionId,
            file_path: data.filePath,
            original_name: data.originalName,
            command: data.command,
            status: 'pending'
        });

        // 2. Trigger Python Worker Async (Fire & Forget logic for Node, but tracked via DB)
        // In a real queue (RabbitMQ/Redis), we push here. For now, direct HTTP call async.

        triggerWorker(job.job_id, data);

        return { jobId: job.job_id };
    },

    getJobStatus: async (jobId: string) => {
        const job = await JobModel.findOne({ job_id: jobId });
        if (!job) return null;
        return {
            status: job.status,
            resultRef: job.result_ref,
            updatedAt: job.updated_at,
            error: job.error_message // Expose error for debugging
        };
    }
};

import { SocketService } from '../services/socket.service';

const triggerWorker = async (jobId: string, data: any) => {
    try {
        await JobModel.updateOne({ job_id: jobId }, { status: 'processing', updated_at: new Date() });
        SocketService.emit('job_update', { jobId, status: 'processing' });

        // Call Python
        const payload = {
            job_id: jobId,
            session_id: data.sessionId,
            file_path: data.filePath,
            original_name: data.originalName,
            command: data.command,
            requested_by: 'node',
            timestamp: new Date().toISOString()
        };

        logger.info(`Sending payload to Python worker: ${WORKER_URL}`);
        const response = await axios.post(WORKER_URL, payload, {
            headers: { 'Connection': 'close' },
            timeout: 60000 // 60s timeout
        });
        logger.info(`Worker responded with status: ${response.data.status}`);

        if (response.data.status === 'completed') {
            try {
                logger.info(`Updating Job ${jobId} to completed...`);
                await JobModel.updateOne({ job_id: jobId }, {
                    status: 'completed',
                    result_ref: response.data.result_ref,
                    confidence: response.data.confidence,
                    extracted_text: response.data.extracted_text,
                    file_type: response.data.file_type,
                    result: response.data.result_preview || {},
                    updated_at: new Date()
                });
                logger.info(`Job ${jobId} marked as completed in DB.`);
                SocketService.emit('job_update', {
                    jobId,
                    status: 'completed',
                    result: response.data.result_preview,
                    extractedText: response.data.extracted_text
                });

            } catch (dbError: any) {
                logger.error(`Failed to update Job ${jobId} in DB: ${dbError.message}`);
            }
        } else {
            await JobModel.updateOne({ job_id: jobId }, {
                status: 'failed',
                error_message: response.data.error || 'Unknown worker error',
                updated_at: new Date()
            });
            SocketService.emit('job_update', { jobId, status: 'failed', error: response.data.error });
        }

    } catch (error: any) {
        logger.error(`Worker Trigger Failed for ${jobId}:`, error.message);
        await JobModel.updateOne({ job_id: jobId }, {
            status: 'failed',
            error_message: 'Worker connection failed',
            updated_at: new Date()
        });
        SocketService.emit('job_update', { jobId, status: 'failed', error: 'Worker connection failed' });
    }
};
