import { Router } from 'express';
import { createProject, getAllProjects } from '../controllers/projectController';

const router = Router();

router.post('/', createProject);
router.get('/', getAllProjects);

export default router;
