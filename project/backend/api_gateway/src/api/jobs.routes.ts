import express from 'express';
import { jobController } from '../controllers/job.controller';

const router = express.Router();

router.get('/:jobId', jobController.getJobStatus);

export default router;
