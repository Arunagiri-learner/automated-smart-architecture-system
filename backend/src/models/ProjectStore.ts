import { IProject, IRoom, BuildingType, IProjectBudget, IBudgetAssumptions } from '../types';
import { INITIAL_PROJECTS } from '../data/demoData';
import { BudgetService } from '../services/budgetService';

class ProjectStoreService {
  private projects: Map<string, IProject> = new Map();

  constructor() {
    INITIAL_PROJECTS.forEach((proj) => {
      const copy: IProject = JSON.parse(JSON.stringify(proj));

      // Programmatically calculate initial budget for demo projects
      const calculatedBudget = BudgetService.calculateBudget(copy.totalAreaSqFt);
      copy.budget = {
        assumptions: calculatedBudget.assumptions,
        breakdown: calculatedBudget.breakdown,
        history: [
          {
            id: 'est-001',
            quality: calculatedBudget.assumptions.quality,
            ratePerSqFt: calculatedBudget.assumptions.ratePerSqFt,
            totalEstimatedCostINR: calculatedBudget.breakdown.totalEstimatedCostINR,
            savedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      // Populate room estimated costs
      copy.rooms = BudgetService.calculateRoomCosts(copy.rooms, calculatedBudget.assumptions.ratePerSqFt);

      this.projects.set(copy.id, copy);
    });
  }

  public getAll(): IProject[] {
    return Array.from(this.projects.values());
  }

  public getById(id: string): IProject | undefined {
    return this.projects.get(id);
  }

  public create(data: {
    name: string;
    location: string;
    buildingType: BuildingType;
    description?: string;
  }): IProject {
    const id = `proj-${Date.now()}`;
    const newProject: IProject = {
      id,
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

  public update(id: string, updates: Partial<IProject>): IProject | undefined {
    const existing = this.projects.get(id);
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
    assumptions: Partial<IBudgetAssumptions>
  ): IProject | undefined {
    const project = this.projects.get(projectId);
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

  public delete(id: string): boolean {
    return this.projects.delete(id);
  }

  public updateRoom(projectId: string, roomId: string, updates: Partial<IRoom>): IRoom | undefined {
    const project = this.projects.get(projectId);
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
