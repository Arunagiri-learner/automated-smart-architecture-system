import { IProject, IRoom, BuildingType, IProjectBudget, IBudgetAssumptions } from '../types';
import { BudgetService } from '../services/budgetService';

class ProjectStoreService {
  private projects: Map<string, IProject> = new Map();

  constructor() {
    // Real projects start empty. No demo fallbacks in real user store.
  }

  private cleanContaminatedRealProject(project: IProject): IProject {
    if (project.isDemo) return project;

    // Check if real project contains demo room patterns or old hardcoded totals
    const hasDemoRooms =
      (project.rooms &&
        project.rooms.some(
          (r) =>
            r.id.startsWith('rm-') ||
            r.location === 'Main Entrance & Reception' ||
            r.location === 'Executive Boardroom' ||
            r.location === 'Visitor Lounge & Waiting' ||
            r.location.toLowerCase().includes('reception') ||
            r.location.toLowerCase().includes('boardroom')
        )) ||
      project.totalAreaSqFt === 23030 ||
      project.roomsCount === 48 ||
      project.totalOccupancy === 513;

    if (hasDemoRooms) {
      console.log(`🧹 Cleaning contaminated demo rooms from real project '${project.id}'`);
      project.rooms = [];
      project.floorsCount = 0;
      project.roomsCount = 0;
      project.totalAreaSqFt = 0;
      project.totalOccupancy = 0;
      project.status = 'Draft';
      project.isDemo = false;
      project.budget = undefined;
      project.dwgFileName = undefined;
      project.dwgFileSize = undefined;
    }

    return project;
  }

  public getAll(ownerId?: string): IProject[] {
    const all = Array.from(this.projects.values()).map((p) => this.cleanContaminatedRealProject(p));
    if (!ownerId) return all;
    return all.filter((p) => p.ownerId === ownerId);
  }

  public getById(id: string, ownerId?: string): IProject | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;
    if (ownerId && project.ownerId && project.ownerId !== ownerId) {
      return undefined;
    }
    return this.cleanContaminatedRealProject(project);
  }

  public create(
    data: {
      name: string;
      location: string;
      buildingType: BuildingType;
      description?: string;
    },
    ownerId?: string
  ): IProject {
    const id = `proj-${Date.now()}`;
    const newProject: IProject = {
      id,
      ownerId,
      name: data.name,
      location: data.location,
      buildingType: data.buildingType,
      description: data.description || '',
      floorsCount: 0,
      roomsCount: 0,
      totalAreaSqFt: 0,
      totalOccupancy: 0,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rooms: [],
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  public update(id: string, updates: Partial<IProject>, ownerId?: string): IProject | undefined {
    const existing = this.getById(id, ownerId);
    if (!existing) return undefined;

    const updated: IProject = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.rooms) {
      updated.roomsCount = updates.rooms.length;
      updated.totalAreaSqFt = updates.rooms.reduce((sum, r) => sum + r.areaSqFt, 0);
      updated.totalOccupancy = updates.rooms.reduce((sum, r) => sum + r.occupancy, 0);
      const floorsSet = new Set(updates.rooms.map((r) => r.floor));
      updated.floorsCount = floorsSet.size || updated.floorsCount;

      // Recalculate budget if project rooms/areas change
      if (updated.budget) {
        const recalc = BudgetService.calculateBudget(updated.totalAreaSqFt, updated.budget.assumptions);
        updated.budget.breakdown = recalc.breakdown;
        updated.rooms = BudgetService.calculateRoomCosts(updated.rooms, updated.budget.assumptions.ratePerSqFt);
      }
    }

    this.projects.set(id, updated);
    return updated;
  }

  public updateProjectBudget(
    projectId: string,
    assumptions: Partial<IBudgetAssumptions>,
    ownerId?: string
  ): IProject | undefined {
    const project = this.getById(projectId, ownerId);
    if (!project) return undefined;

    const currentAssumptions = project.budget?.assumptions || {};
    const updatedAssumptions = { ...currentAssumptions, ...assumptions };

    const calculated = BudgetService.calculateBudget(project.totalAreaSqFt, updatedAssumptions);

    const historyItem = {
      id: `est-${Date.now()}`,
      quality: calculated.assumptions.quality,
      ratePerSqFt: calculated.assumptions.ratePerSqFt,
      totalEstimatedCostINR: calculated.breakdown.totalEstimatedCostINR,
      savedAt: new Date().toISOString(),
    };

    const newHistory = project.budget?.history || [];

    project.budget = {
      assumptions: calculated.assumptions,
      breakdown: calculated.breakdown,
      history: [historyItem, ...newHistory.slice(0, 4)],
      updatedAt: new Date().toISOString(),
    };

    // Update room costs
    project.rooms = BudgetService.calculateRoomCosts(project.rooms, calculated.assumptions.ratePerSqFt);

    this.projects.set(projectId, project);
    return project;
  }

  public delete(id: string, ownerId?: string): boolean {
    const project = this.getById(id, ownerId);
    if (!project) return false;
    return this.projects.delete(id);
  }

  public updateRoom(
    projectId: string,
    roomId: string,
    updates: Partial<IRoom>,
    ownerId?: string
  ): IRoom | undefined {
    const project = this.getById(projectId, ownerId);
    if (!project) return undefined;

    const roomIndex = project.rooms.findIndex((r) => r.id === roomId);
    if (roomIndex === -1) return undefined;

    const updatedRoom: IRoom = {
      ...project.rooms[roomIndex],
      ...updates,
    };

    project.rooms[roomIndex] = updatedRoom;

    project.totalAreaSqFt = project.rooms.reduce((sum, r) => sum + r.areaSqFt, 0);
    project.totalOccupancy = project.rooms.reduce((sum, r) => sum + r.occupancy, 0);
    project.roomsCount = project.rooms.length;
    project.updatedAt = new Date().toISOString();

    // Recalculate budget breakdown with new total area
    if (project.budget) {
      const recalc = BudgetService.calculateBudget(project.totalAreaSqFt, project.budget.assumptions);
      project.budget.breakdown = recalc.breakdown;
      project.rooms = BudgetService.calculateRoomCosts(project.rooms, project.budget.assumptions.ratePerSqFt);
    }

    this.projects.set(projectId, project);
    return project.rooms[roomIndex];
  }
}

export const ProjectStore = new ProjectStoreService();
