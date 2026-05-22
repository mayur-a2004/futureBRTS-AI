import { Request, Response, NextFunction } from 'express';
import { JobModel } from '../models/job.model'; // Direct DB Access for Asset Creation
import { PythonBridge } from '../services/python.bridge';
import { CommandParser } from '../services/command.parser';
import { logger } from '../shared/utils/logger';

export const uploadController = {
    handleUpload: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { command, sessionId } = req.body;
            const file = req.file;

            logger.info(`Received upload: ${file.originalname} for session: ${sessionId}`);

            // STEP 2: Command Parsing (Intent Extraction)
            const parsedIntent = CommandParser.parse(command || "");
            logger.info(`Parsed Intent: ${JSON.stringify(parsedIntent)}`);

            // STEP 1: Save to DB (Asset Creation)
            // Creating entry in conversation_assets (mapped to JobModel here for simplicity/MVP)
            const job = await JobModel.create({
                session_id: sessionId || 'unknown-session',
                file_path: file.path,
                original_name: file.originalname,
                command: command,
                status: 'pending' // Initial status
            });

            // STEP 3: Trigger Python Worker
            // payload matches Python Worker input contract
            const payload = {
                job_id: job.job_id, // UUID from Schema
                session_id: sessionId,
                file_path: file.path,
                original_name: file.originalname,
                command: command, // Raw command passed, Parser logic could be sent too if Worker needs it
                intent: parsedIntent, // Sending parsed intent might help worker routing
                timestamp: new Date().toISOString()
            };

            // Async Trigger - Do not await completion, just acknowledgment
            // Async Trigger - Handle Completion
            PythonBridge.triggerWorker(payload)
                .then(async (data) => {
                    logger.info(`Worker Success for ${job.job_id}: ${data.status}`);
                    if (data.status === 'completed') {
                        await JobModel.updateOne({ job_id: job.job_id }, {
                            status: 'completed',
                            result_ref: data.result_ref,
                            confidence: data.confidence,
                            extracted_text: data.extracted_text,
                            file_type: data.file_type,
                            result: data.result_preview || {},
                            updated_at: new Date()
                        });

                        // --- NEXT-GEN LEARNING SIGNAL ---
                        const Experience = require('../models/experience.model').default;
                        await Experience.create({
                            userId: (req as any).user?.id,
                            type: 'ANALYSIS_ACCURACY',
                            context: { command, file_type: data.file_type },
                            outcome: { success: true, confidence: data.confidence },
                            learningSignal: data.confidence || 0.8
                        });
                        // --------------------------------
                    } else {
                        // Check if the failure was a security breach
                        if (data.status === 'SECURITY_BLOCK' || data.error_message?.includes('SECURITY')) {
                            const { ProjectGuardian } = require('../services/guardian.service');
                            ProjectGuardian.logIncident('PYTHON_SANDBOX_BREACH', { ip: req.ip, job_id: job.job_id });
                        }

                        // Handle manual failure response
                        await JobModel.updateOne({ job_id: job.job_id }, {
                            status: 'failed',
                            error_message: data.error_message || 'Unknown Error',
                            updated_at: new Date()
                        });
                    }
                })
                .catch(async (err) => {
                    logger.error(`Failed to trigger worker for job ${job.job_id}: ${err.message}`);
                    await JobModel.updateOne({ job_id: job.job_id }, {
                        status: 'failed',
                        error_message: 'Worker Unreachable',
                        updated_at: new Date()
                    });
                });

            res.status(201).json({
                message: 'File uploaded and processing started',
                job_id: job.job_id,
                status: 'processing'
            });

        } catch (error) {
            next(error);
        }
    }
};
