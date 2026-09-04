import { Request, Response } from 'express';
import { ProjectStore } from '../models/ProjectStore';

export const getProjects = (_req: Request, res: Response) => {
  const projects = ProjectStore.getAll();
  res.json({ success: true, count: projects.length, data: projects });
};

export const getProjectById = (req: Request, res: Response) => {
  const { id } = req.params;
  const project = ProjectStore.getById(id);

  if (!project) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, data: project });
};

export const createProject = (req: Request, res: Response) => {
  const { name, location, buildingType, description } = req.body;

  if (!name || !location || !buildingType) {
    return res.status(400).json({
      success: false,
      error: 'Please provide project name, location, and building type.',
    });
  }

  const project = ProjectStore.create({ name, location, buildingType, description });
  res.status(201).json({ success: true, message: 'Project created successfully.', data: project });
};

export const updateProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = ProjectStore.update(id, req.body);

  if (!updated) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, message: 'Project updated successfully.', data: updated });
};

export const deleteProject = (req: Request, res: Response) => {
  const { id } = req.params;
  const success = ProjectStore.delete(id);

  if (!success) {
    return res.status(404).json({ success: false, error: `Project with ID '${id}' not found.` });
  }

  res.json({ success: true, message: 'Project deleted successfully.' });
};

export const updateRoomDetails = (req: Request, res: Response) => {
  const { projectId, roomId } = req.params;
  const updatedRoom = ProjectStore.updateRoom(projectId, roomId, req.body);

  if (!updatedRoom) {
    return res.status(404).json({ success: false, error: 'Project or Room not found.' });
  }

  const project = ProjectStore.getById(projectId);

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
