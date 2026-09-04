import { Router } from 'express';
import {
  getProjectBudget,
  updateProjectBudget,
  calculateLiveBudget,
} from '../controllers/budgetController';

const router = Router();

router.get('/:projectId', getProjectBudget);
router.put('/:projectId', updateProjectBudget);
router.post('/calculate', calculateLiveBudget);

export default router;
