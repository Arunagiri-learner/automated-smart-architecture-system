import { Request, Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';
import { floorPlanProcessor } from '../services/floorPlanProcessor';

export const uploadAndAnalyze = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = ProjectStore.getById(projectId);

  if (!project) {
    return res.status(404).json({ success: false, error: `Project '${projectId}' not found.` });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'No floor plan file uploaded.' });
  }

  // File validation
  const validation = floorPlanProcessor.validateFile(file);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  try {
    // Process file
    const result = await floorPlanProcessor.processFloorPlan(file.path, file.originalname, true);

    // Update project state with analysis results
    const updatedProject = ProjectStore.update(projectId, {
      status: 'Analysis Complete',
      dwgFileName: file.originalname,
      dwgFileSize: file.size,
      isDemo: result.isDemo,
      rooms: result.rooms,
      floorsCount: result.extractedFloorsCount,
      roomsCount: result.extractedRoomsCount,
      totalAreaSqFt: result.extractedTotalArea,
      totalOccupancy: result.rooms.reduce((s, r) => s + r.occupancy, 0),
    });

    res.json({
      success: true,
      message: result.message,
      isDemo: result.isDemo,
      data: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: `Floor plan analysis failed: ${error.message || 'Unknown processing error'}`,
    });
  }
};
