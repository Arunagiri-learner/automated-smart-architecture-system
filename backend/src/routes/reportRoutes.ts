import { Router } from 'express';
import { downloadExcelReport, getReportSummary } from '../controllers/reportController';

const router = Router();

router.get('/:projectId/download', downloadExcelReport);
router.get('/:projectId/summary', getReportSummary);

export default router;
