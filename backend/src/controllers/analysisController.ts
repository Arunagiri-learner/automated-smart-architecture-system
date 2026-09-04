import { Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';
import { floorPlanProcessor } from '../services/floorPlanProcessor';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { checkDbConnection, isProductionOrMongoConfigured } from '../config/db';

export const uploadAndAnalyze = async (req: AuthenticatedRequest, res: Response) => {
  if (isProductionOrMongoConfigured() && !checkDbConnection()) {
    return res.status(503).json({
      success: false,
      error: 'Database connection unavailable. Production environment requires an active MongoDB database connection.',
    });
  }

  const { projectId } = req.params;
  const ownerId = req.user?.id;
  const project = ProjectStore.getById(projectId, ownerId);

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
    const result = await floorPlanProcessor.processFloorPlan(file.path, file.originalname);

    // Update project state with real analysis results
    const updatedProject = ProjectStore.update(projectId, {
      status: 'Analysis Complete',
      dwgFileName: file.originalname,
      dwgFileSize: file.size,
      isDemo: false,
      rooms: result.rooms,
      floorsCount: result.extractedFloorsCount,
      roomsCount: result.extractedRoomsCount,
      totalAreaSqFt: result.extractedTotalArea,
      totalOccupancy: result.rooms.reduce((s, r) => s + r.occupancy, 0),
    }, ownerId);

    res.json({
      success: true,
      message: result.message,
      isDemo: false,
      data: updatedProject,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: `Floor plan analysis failed: ${error.message || 'Unknown processing error'}`,
    });
  }
};

export const getAnalysisByProjectId = async (req: AuthenticatedRequest, res: Response) => {
  if (isProductionOrMongoConfigured() && !checkDbConnection()) {
    return res.status(503).json({
      success: false,
      error: 'Database connection unavailable. Production environment requires an active MongoDB database connection.',
    });
  }

  const { projectId } = req.params;
  const ownerId = req.user?.id;
  const project = ProjectStore.getById(projectId, ownerId);

  if (!project) {
    return res.status(404).json({ success: false, error: `Project '${projectId}' not found.` });
  }

  return res.json({
    success: true,
    data: {
      projectId: project.id,
      name: project.name,
      status: project.status,
      dwgFileName: project.dwgFileName,
      dwgFileSize: project.dwgFileSize,
      isDemo: project.isDemo || false,
      rooms: project.rooms || [],
      floorsCount: project.floorsCount || 0,
      roomsCount: project.roomsCount || 0,
      totalAreaSqFt: project.totalAreaSqFt || 0,
      totalOccupancy: project.totalOccupancy || 0,
      updatedAt: project.updatedAt,
    },
  });
};

