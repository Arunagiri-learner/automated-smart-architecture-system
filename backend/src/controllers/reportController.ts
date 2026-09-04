import { Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';
import { ExcelService } from '../services/excelService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { checkDbConnection, isProductionOrMongoConfigured } from '../config/db';

export const downloadExcelReport = async (req: AuthenticatedRequest, res: Response) => {
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

  try {
    const buffer = await ExcelService.generateProjectReport(project);

    const safeName = project.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${safeName}_ASAS_Report_${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    res.send(buffer);
  } catch (error: any) {
    console.error('❌ Excel generation error:', error);
    res.status(500).json({ success: false, error: `Report generation failed: ${error.message}` });
  }
};

export const getReportSummary = (req: AuthenticatedRequest, res: Response) => {
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

  // Calculate floor summaries programmatically
  const floorSummariesMap = new Map<string, { floorName: string; areaSqFt: number; roomCount: number; occupancy: number }>();

  project.rooms.forEach(r => {
    const existing = floorSummariesMap.get(r.floor) || {
      floorName: `${r.floor} Floor`,
      areaSqFt: 0,
      roomCount: 0,
      occupancy: 0,
    };

    existing.areaSqFt += r.areaSqFt;
    existing.roomCount += 1;
    existing.occupancy += r.occupancy;

    floorSummariesMap.set(r.floor, existing);
  });

  res.json({
    success: true,
    data: {
      projectId: project.id,
      projectName: project.name,
      location: project.location,
      buildingType: project.buildingType,
      floorsCount: project.floorsCount,
      roomsCount: project.roomsCount,
      totalAreaSqFt: project.totalAreaSqFt,
      totalOccupancy: project.totalOccupancy,
      status: project.status,
      floorBreakdown: Array.from(floorSummariesMap.values()),
      generatedAt: new Date().toISOString(),
    },
  });
};
