export type BuildingType = 'Office' | 'Hospital' | 'School' | 'Hotel' | 'Residential' | 'Commercial' | 'Other';

export type ConstructionQuality = 'Basic' | 'Standard' | 'Premium' | 'Luxury' | 'Custom';

export type UserRole = 'Architect' | 'Construction Manager' | 'Facility Manager';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  isDemo?: boolean;
  createdAt?: string;
}

export interface IRoom {
  id: string;
  slNo: number;
  floor: string;
  floorIndex: number;
  location: string;
  areaSqFt: number;
  heightFt: number;
  occupancy: number;
  status: 'Analyzed' | 'Pending' | 'Verified';
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  polygon?: number[][];
  features?: string[];
  // Calculated room cost field
  estimatedCostINR?: number;
}

export interface IFloorSummary {
  floorName: string;
  floorIndex: number;
  totalAreaSqFt: number;
  roomCount: number;
  totalOccupancy: number;
  estimatedCostINR?: number;
}

export interface ICategoryBreakdownItem {
  category: string;
  percentage: number;
  costINR: number;
}

export interface IBudgetBreakdown {
  materialsCostINR: number;
  labourCostINR: number;
  electricalCostINR: number;
  plumbingCostINR: number;
  finishingCostINR: number;
  doorsWindowsCostINR: number;
  paintingCostINR: number;
  roofingCostINR: number;
  otherCostINR: number;
  subtotalCostINR: number;
  contingencyCostINR: number;
  totalEstimatedCostINR: number;
  items: ICategoryBreakdownItem[];
}

export interface IBudgetAssumptions {
  quality: ConstructionQuality;
  ratePerSqFt: number;
  materialPercentage: number;
  labourPercentage: number;
  electricalPercentage: number;
  plumbingPercentage: number;
  finishingPercentage: number;
  doorsWindowsPercentage: number;
  paintingPercentage: number;
  roofingPercentage: number;
  otherPercentage: number;
  contingencyPercentage: number;
}

export interface IBudgetHistoryItem {
  id: string;
  quality: ConstructionQuality;
  ratePerSqFt: number;
  totalEstimatedCostINR: number;
  savedAt: string;
}

export interface IProjectBudget {
  assumptions: IBudgetAssumptions;
  breakdown: IBudgetBreakdown;
  history: IBudgetHistoryItem[];
  updatedAt: string;
}

export interface IProject {
  id: string;
  ownerId?: string;
  name: string;
  location: string;
  buildingType: BuildingType;
  description?: string;
  floorsCount: number;
  roomsCount: number;
  totalAreaSqFt: number;
  totalOccupancy: number;
  status: 'Draft' | 'Processing' | 'Analysis Complete' | 'Archived';
  dwgFileName?: string;
  dwgFileSize?: number;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  rooms: IRoom[];
  budget?: IProjectBudget;
}

export interface IReportMetadata {
  id: string;
  projectId: string;
  projectName: string;
  generatedAt: string;
  fileFormat: 'xlsx';
  downloadUrl?: string;
}

declare module 'dxf-parser';

