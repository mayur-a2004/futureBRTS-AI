import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { examGeneratorController } from './exam_generator.controller';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../../uploads/exams');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Routes
router.post('/upload', upload.fields([
    { name: 'pdfFile', maxCount: 1 },
    { name: 'referenceFile', maxCount: 1 }
]), examGeneratorController.generateExam);
router.get('/list', examGeneratorController.getExams);

export default router;
