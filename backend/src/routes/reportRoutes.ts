import { Router } from 'express';
import { downloadExcelReport, getReportSummary } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/:projectId/download', downloadExcelReport);
router.get('/:projectId/summary', getReportSummary);

export default router;
