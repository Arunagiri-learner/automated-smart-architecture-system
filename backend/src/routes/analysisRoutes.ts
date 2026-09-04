import { Router } from 'express';
import { uploadAndAnalyze } from '../controllers/analysisController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/:projectId/upload', upload.single('floorPlan'), uploadAndAnalyze);

export default router;
