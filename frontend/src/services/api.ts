import { IProject, IRoom, BuildingType, IBudgetAssumptions, IProjectBudget, ConstructionQuality } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://automated-smart-architecture-system.onrender.com/api'
    : '/api');

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

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('asas_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async register(payload: { name: string; email: string; password: string; role?: string }): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe(): Promise<{ user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session expired');
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      // Ignore network errors on logout
    }
  },

  // Fetch all projects belonging to current user
  async getProjects(): Promise<IProject[]> {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Unable to load projects from server.');
    }
    const data = await res.json();
    return data.data || [];
  },

  // Get project by ID
  async getProjectById(id: string): Promise<IProject | null> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to load project details.');
    }
    const data = await res.json();
    return data.data;
  },

  // Create Project
  async createProject(payload: {
    name: string;
    location: string;
    buildingType: BuildingType;
    description?: string;
  }): Promise<IProject> {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create project.');
    }
    const data = await res.json();
    return data.data;
  },

  // Upload DWG & analyze
  async uploadAndAnalyze(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ project: IProject; isDemo: boolean; message: string }> {
    const formData = new FormData();
    formData.append('floorPlan', file);

    const token = localStorage.getItem('asas_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (onProgress) onProgress(30);
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/analysis/${projectId}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (netErr: any) {
      throw new Error(`Network Connection Error: Unable to establish connection to backend at '${API_BASE_URL}'. Please check your network or backend availability.`);
    }

    if (onProgress) onProgress(80);
    if (!res.ok) {
      let message = `Server returned HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) message = errorData.error;
      } catch (e) {
        if (res.status === 400) message = 'Bad Request: Invalid file upload request.';
        else if (res.status === 401) message = 'Session expired or unauthenticated. Please sign in again.';
        else if (res.status === 403) message = 'Access forbidden. You do not own this project.';
        else if (res.status === 404) message = `Project '${projectId}' not found on server.`;
        else if (res.status === 413) message = 'Uploaded file payload is too large (exceeds server limit).';
        else if (res.status === 500) message = 'Internal server error processing floor plan.';
        else if (res.status === 502) message = 'Bad Gateway: Backend server encountered a crash or timeout during processing.';
        else if (res.status === 503) message = 'Service or database unavailable. Please try again in a moment.';
      }
      throw new Error(message);
    }

    if (onProgress) onProgress(100);
    const data = await res.json();
    return {
      project: data.data,
      isDemo: false,
      message: data.message,
    };
  },

  // Update Room Details
  async updateRoom(
    projectId: string,
    roomId: string,
    updates: Partial<IRoom>
  ): Promise<IRoom> {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/rooms/${roomId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update room details.');
    const data = await res.json();
    return data.room;
  },

  // Update Project Budget
  async updateProjectBudget(
    projectId: string,
    assumptions: Partial<IBudgetAssumptions>
  ): Promise<IProjectBudget> {
    const res = await fetch(`${API_BASE_URL}/budget/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(assumptions),
    });
    if (!res.ok) throw new Error('Failed to update project budget.');
    const data = await res.json();
    return data.data;
  },

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // Trigger Excel Download
  async downloadExcelReport(projectId: string, projectName: string): Promise<void> {
    const url = `${API_BASE_URL}/reports/${projectId}/download`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
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
