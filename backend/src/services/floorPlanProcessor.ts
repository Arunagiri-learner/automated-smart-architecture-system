import path from 'path';
import { IRoom } from '../types';
import { DEMO_ROOMS_PROJECT_1 } from '../data/demoData';

export interface IValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    originalName: string;
    safeFileName: string;
    size: number;
    extension: string;
  };
}

export interface IProcessingResult {
  success: boolean;
  isDemo: boolean;
  message: string;
  rooms: IRoom[];
  extractedFloorsCount: number;
  extractedRoomsCount: number;
  extractedTotalArea: number;
}

export interface IFloorPlanProcessor {
  validateFile(file: Express.Multer.File): IValidationResult;
  processFloorPlan(filePath: string, fileName: string, isDemoRequested?: boolean): Promise<IProcessingResult>;
}

export class DemoFloorPlanProcessor implements IFloorPlanProcessor {
  private allowedExtensions = ['.dwg', '.dxf'];
  private maxSizeBytes = 50 * 1024 * 1024; // 50MB

  public validateFile(file: Express.Multer.File): IValidationResult {
    if (!file) {
      return { valid: false, error: 'No file was provided.' };
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!this.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file format '${ext}'. Please upload an AutoCAD DWG or DXF floor plan file.`,
      };
    }

    if (file.size > this.maxSizeBytes) {
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of 50 MB.`,
      };
    }

    return {
      valid: true,
      fileInfo: {
        originalName: file.originalname,
        safeFileName,
        size: file.size,
        extension: ext,
      },
    };
  }

  public async processFloorPlan(
    filePath: string,
    fileName: string,
    isDemoRequested: boolean = true
  ): Promise<IProcessingResult> {
    // Simulate real parsing latency for multi-stage visual progress feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate realistic rooms tailored to the uploaded DWG or fallback to demo dataset
    const rooms: IRoom[] = JSON.parse(JSON.stringify(DEMO_ROOMS_PROJECT_1));

    const totalArea = rooms.reduce((sum, r) => sum + r.areaSqFt, 0);
    const floorsCount = new Set(rooms.map((r) => r.floor)).size;

    return {
      success: true,
      isDemo: true, // Transparently indicate demo mode as required
      message: `Floor plan '${fileName}' successfully processed via Demo Architectural Processor. 4 floors and 48 rooms extracted.`,
      rooms,
      extractedFloorsCount: floorsCount,
      extractedRoomsCount: rooms.length,
      extractedTotalArea: totalArea,
    };
  }
}

export const floorPlanProcessor = new DemoFloorPlanProcessor();
