import { Router } from 'express';
import { uploadAndAnalyze, getAnalysisByProjectId } from '../controllers/analysisController';
import { upload } from '../middleware/uploadMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/:projectId', authMiddleware, getAnalysisByProjectId);
router.post('/:projectId/upload', authMiddleware, upload.single('floorPlan'), uploadAndAnalyze);

export default router;
