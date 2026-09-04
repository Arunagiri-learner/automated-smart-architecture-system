import { Request, Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';
import { BudgetService, DEFAULT_QUALITY_RATES } from '../services/budgetService';

export const getProjectBudget = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = ProjectStore.getById(projectId);

  if (!project) {
    return res.status(404).json({ success: false, error: `Project '${projectId}' not found.` });
  }

  const budget = project.budget || BudgetService.calculateBudget(project.totalAreaSqFt);

  res.json({
    success: true,
    data: {
      projectId: project.id,
      projectName: project.name,
      totalAreaSqFt: project.totalAreaSqFt,
      floorsCount: project.floorsCount,
      roomsCount: project.roomsCount,
      budget,
      qualityRates: DEFAULT_QUALITY_RATES,
    },
  });
};

export const updateProjectBudget = (req: Request, res: Response) => {
  const { projectId } = req.params;
  const updatedProject = ProjectStore.updateProjectBudget(projectId, req.body);

  if (!updatedProject) {
    return res.status(404).json({ success: false, error: `Project '${projectId}' not found.` });
  }

  res.json({
    success: true,
    message: 'Construction budget recalculated and saved successfully.',
    data: updatedProject.budget,
  });
};

export const calculateLiveBudget = (req: Request, res: Response) => {
  const { totalAreaSqFt, assumptions } = req.body;

  if (!totalAreaSqFt || totalAreaSqFt <= 0) {
    return res.status(400).json({ success: false, error: 'Total area must be greater than 0.' });
  }

  const result = BudgetService.calculateBudget(totalAreaSqFt, assumptions);

  res.json({
    success: true,
    data: result,
  });
};
