import { Request, Response, NextFunction } from 'express';
import { JobQueue } from '../queue/job.queue';
import { JobModel } from '../models/job.model'; // Need to create model

export const jobController = {
    getJobStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { jobId } = req.params;
            const status = await JobQueue.getJobStatus(jobId);

            if (!status) {
                return res.status(404).json({ error: 'Job not found' });
            }

            // If completed, fetch full result details from DB
            let assetData = null;
            if (status.status === 'completed' || status.status === 'processing') {
                // Return richer data for frontend polling
                const asset = await JobModel.findOne({ job_id: jobId });
                if (asset) {
                    assetData = {
                        extracted_text: asset.extracted_text,
                        result: asset.result,
                        file_path: asset.file_path,
                        file_type: asset.file_type,
                        confidence: asset.confidence
                    };
                }
            }

            res.json({
                jobId,
                status: status.status,
                ...assetData, // Spread full data
                timestamp: status.updatedAt
            });

        } catch (error) {
            next(error);
        }
    }
};
