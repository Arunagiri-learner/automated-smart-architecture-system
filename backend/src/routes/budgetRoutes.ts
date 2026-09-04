import { Router } from 'express';
import {
  getProjectBudget,
  updateProjectBudget,
  calculateLiveBudget,
} from '../controllers/budgetController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/calculate', calculateLiveBudget);
router.get('/:projectId', authMiddleware, getProjectBudget);
router.put('/:projectId', authMiddleware, updateProjectBudget);

export default router;
