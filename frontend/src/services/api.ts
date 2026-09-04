import { IProject, IRoom, BuildingType, IBudgetAssumptions, IProjectBudget, ConstructionQuality } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const DEFAULT_QUALITY_RATES: Record<ConstructionQuality, number> = {
  Basic: 1800,
  Standard: 2200,
  Premium: 2800,
  Luxury: 3500,
  Custom: 2200,
};

export const formatINR = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateLocalBudget = (
  totalAreaSqFt: number,
  assumptions?: Partial<IBudgetAssumptions>
): { assumptions: IBudgetAssumptions; breakdown: any } => {
  const baseAssumptions: IBudgetAssumptions = {
    quality: 'Standard',
    ratePerSqFt: 2200,
    materialPercentage: 50,
    labourPercentage: 20,
    electricalPercentage: 5,
    plumbingPercentage: 4,
    finishingPercentage: 6,
    doorsWindowsPercentage: 4,
    paintingPercentage: 3,
    roofingPercentage: 3,
    otherPercentage: 5,
    contingencyPercentage: 5,
    ...assumptions,
  };

  if (assumptions?.quality && assumptions.quality !== 'Custom' && !assumptions.ratePerSqFt) {
    baseAssumptions.ratePerSqFt = DEFAULT_QUALITY_RATES[assumptions.quality];
  }

  const baseCost = Math.round(totalAreaSqFt * baseAssumptions.ratePerSqFt);
  const materialsCostINR = Math.round(baseCost * (baseAssumptions.materialPercentage / 100));
  const labourCostINR = Math.round(baseCost * (baseAssumptions.labourPercentage / 100));
  const electricalCostINR = Math.round(baseCost * (baseAssumptions.electricalPercentage / 100));
  const plumbingCostINR = Math.round(baseCost * (baseAssumptions.plumbingPercentage / 100));
  const finishingCostINR = Math.round(baseCost * (baseAssumptions.finishingPercentage / 100));
  const doorsWindowsCostINR = Math.round(baseCost * (baseAssumptions.doorsWindowsPercentage / 100));
  const paintingCostINR = Math.round(baseCost * (baseAssumptions.paintingPercentage / 100));
  const roofingCostINR = Math.round(baseCost * (baseAssumptions.roofingPercentage / 100));
  const otherCostINR = Math.round(baseCost * (baseAssumptions.otherPercentage / 100));

  const subtotalCostINR =
    materialsCostINR +
    labourCostINR +
    electricalCostINR +
    plumbingCostINR +
    finishingCostINR +
    doorsWindowsCostINR +
    paintingCostINR +
    roofingCostINR +
    otherCostINR;

  const contingencyCostINR = Math.round(subtotalCostINR * (baseAssumptions.contingencyPercentage / 100));
  const totalEstimatedCostINR = subtotalCostINR + contingencyCostINR;

  const items = [
    { category: 'Structural Materials', percentage: baseAssumptions.materialPercentage, costINR: materialsCostINR },
    { category: 'Site Labour & Masonry', percentage: baseAssumptions.labourPercentage, costINR: labourCostINR },
    { category: 'Electrical Works & Wiring', percentage: baseAssumptions.electricalPercentage, costINR: electricalCostINR },
    { category: 'Plumbing & Sanitation', percentage: baseAssumptions.plumbingPercentage, costINR: plumbingCostINR },
    { category: 'Flooring & Tile Finishing', percentage: baseAssumptions.finishingPercentage, costINR: finishingCostINR },
    { category: 'Doors & Window Frames', percentage: baseAssumptions.doorsWindowsPercentage, costINR: doorsWindowsCostINR },
    { category: 'Painting & Plastering', percentage: baseAssumptions.paintingPercentage, costINR: paintingCostINR },
    { category: 'Roofing & Waterproofing', percentage: baseAssumptions.roofingPercentage, costINR: roofingCostINR },
    { category: 'Other Works & Logistics', percentage: baseAssumptions.otherPercentage, costINR: otherCostINR },
    { category: 'Contingency Allowance', percentage: baseAssumptions.contingencyPercentage, costINR: contingencyCostINR },
  ];

  return {
    assumptions: baseAssumptions,
    breakdown: {
      materialsCostINR,
      labourCostINR,
      electricalCostINR,
      plumbingCostINR,
      finishingCostINR,
      doorsWindowsCostINR,
      paintingCostINR,
      roofingCostINR,
      otherCostINR,
      subtotalCostINR,
      contingencyCostINR,
      totalEstimatedCostINR,
      items,
    },
  };
};

export const api = {
  // Fetch all projects
  async getProjects(): Promise<IProject[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('API connection offline, using fallback state:', err);
      const fallback = localStorage.getItem('asas_projects');
      if (fallback) return JSON.parse(fallback);
      return [];
    }
  },

  // Get project by ID
  async getProjectById(id: string): Promise<IProject | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!res.ok) throw new Error('Project not found');
      const data = await res.json();
      return data.data;
    } catch (err) {
      const projects = await this.getProjects();
      return projects.find((p) => p.id === id) || null;
    }
  },

  // Create Project
  async createProject(payload: {
    name: string;
    location: string;
    buildingType: BuildingType;
    description?: string;
  }): Promise<IProject> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      return data.data;
    } catch (err) {
      const newProj: IProject = {
        id: `proj-local-${Date.now()}`,
        name: payload.name,
        location: payload.location,
        buildingType: payload.buildingType,
        description: payload.description || '',
        floorsCount: 0,
        roomsCount: 0,
        totalAreaSqFt: 0,
        totalOccupancy: 0,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rooms: [],
      };
      return newProj;
    }
  },

  // Upload DWG & analyze
  async uploadAndAnalyze(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ project: IProject; isDemo: boolean; message: string }> {
    const formData = new FormData();
    formData.append('floorPlan', file);

    try {
      if (onProgress) onProgress(30);
      const res = await fetch(`${API_BASE_URL}/analysis/${projectId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (onProgress) onProgress(80);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      if (onProgress) onProgress(100);
      const data = await res.json();
      return {
        project: data.data,
        isDemo: data.isDemo,
        message: data.message,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Upload & Analysis failed.');
    }
  },

  // Update Room Details
  async updateRoom(
    projectId: string,
    roomId: string,
    updates: Partial<IRoom>
  ): Promise<IRoom> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update room');
      const data = await res.json();
      return data.room;
    } catch (err) {
      throw new Error('Room update failed');
    }
  },

  // Update Project Budget
  async updateProjectBudget(
    projectId: string,
    assumptions: Partial<IBudgetAssumptions>
  ): Promise<IProjectBudget> {
    try {
      const res = await fetch(`${API_BASE_URL}/budget/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assumptions),
      });
      if (!res.ok) throw new Error('Failed to update budget');
      const data = await res.json();
      return data.data;
    } catch (err) {
      throw new Error('Budget update failed');
    }
  },

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  },

  // Trigger Excel Download
  async downloadExcelReport(projectId: string, projectName: string): Promise<void> {
    const url = `${API_BASE_URL}/reports/${projectId}/download`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Report download failed on server.');
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.download = `${safeName}_ASAS_Complete_Report_${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },
};
