import { Router } from 'express';
import { createStudent, getAllStudents } from '../controllers/studentController';

const router = Router();

router.post('/', createStudent);
router.get('/', getAllStudents);

export default router;
