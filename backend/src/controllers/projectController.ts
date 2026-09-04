import { Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getProjects = (req: AuthenticatedRequest, res: Response) => {
  const ownerId = req.user?.id;
  const projects = ProjectStore.getAll(ownerId);
  res.json({ success: true, count: projects.length, data: projects });
};

export const getProjectById = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user?.id;
  const project = ProjectStore.getById(id, ownerId);

  if (!project) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, data: project });
};

export const createProject = (req: AuthenticatedRequest, res: Response) => {
  const { name, location, buildingType, description } = req.body;
  const ownerId = req.user?.id;

  if (!name || !location || !buildingType) {
    return res.status(400).json({
      success: false,
      error: 'Please provide project name, location, and building type.',
    });
  }

  const project = ProjectStore.create({ name, location, buildingType, description }, ownerId);
  res.status(201).json({ success: true, message: 'Project created successfully.', data: project });
};

export const updateProject = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user?.id;
  const updated = ProjectStore.update(id, req.body, ownerId);

  if (!updated) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, message: 'Project updated successfully.', data: updated });
};

export const deleteProject = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user?.id;
  const success = ProjectStore.delete(id, ownerId);

  if (!success) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, message: 'Project deleted successfully.' });
};

export const updateRoomDetails = (req: AuthenticatedRequest, res: Response) => {
  const { projectId, roomId } = req.params;
  const ownerId = req.user?.id;
  const updatedRoom = ProjectStore.updateRoom(projectId, roomId, req.body, ownerId);

  if (!updatedRoom) {
    return res.status(404).json({ success: false, error: 'Project or Room not found.' });
  }

  const project = ProjectStore.getById(projectId, ownerId);

  res.json({
    success: true,
    message: 'Room details updated and building totals recalculated.',
    room: updatedRoom,
    projectTotals: {
      totalAreaSqFt: project?.totalAreaSqFt,
      totalOccupancy: project?.totalOccupancy,
      roomsCount: project?.roomsCount,
    },
  });
};
