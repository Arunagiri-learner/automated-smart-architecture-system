import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';
import { IRoom } from '../types';
import { LibreDwgService } from './libreDwgService';

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
  processFloorPlan(filePath: string, fileName: string): Promise<IProcessingResult>;
}

export class ArchitecturalFloorPlanProcessor implements IFloorPlanProcessor {
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

  public async processFloorPlan(filePath: string, fileName: string): Promise<IProcessingResult> {
    const ext = path.extname(fileName).toLowerCase();
    let dxfContent: string;

    if (ext === '.dwg') {
      console.log(`⚙️ Processing DWG file '${fileName}' via LibreDWG WebAssembly Engine...`);
      const dwgResult = await LibreDwgService.convertDwgToDxf(filePath);
      if (!dwgResult.success || !dwgResult.dxfContent) {
        throw new Error(dwgResult.error || 'DWG parsing failed: unable to decode binary DWG geometry.');
      }
      dxfContent = dwgResult.dxfContent;
      console.log(`✅ DWG successfully parsed and converted to DXF (${dwgResult.stats?.dxfSizeBytes} bytes).`);
    } else if (ext === '.dxf') {
      try {
        dxfContent = fs.readFileSync(filePath, 'utf-8');
      } catch (err: any) {
        throw new Error(`Failed to read uploaded DXF file: ${err.message || 'File unreadable'}`);
      }
    } else {
      throw new Error(`Unsupported file extension '${ext}'. Only .dwg and .dxf files are supported.`);
    }

    // Parse DXF entity stream using dxf-parser
    const parser = new DxfParser();
    let dxfParsed: any;
    try {
      dxfParsed = parser.parseSync(dxfContent);
    } catch (err: any) {
      throw new Error(`Invalid or corrupt CAD geometry structure: ${err.message || 'Parse error'}`);
    }

    if (!dxfParsed || !dxfParsed.entities || !Array.isArray(dxfParsed.entities)) {
      throw new Error('CAD file contains no parseable entity elements.');
    }

    // Extract closed polylines as rooms
    const extractedRooms: IRoom[] = [];
    const textLabels: { text: string; x: number; y: number }[] = [];

    // 1. Collect Text Labels (MTEXT, TEXT)
    for (const entity of dxfParsed.entities) {
      if ((entity.type === 'MTEXT' || entity.type === 'TEXT') && entity.text) {
        const x = entity.position?.x || entity.startPoint?.x || 0;
        const y = entity.position?.y || entity.startPoint?.y || 0;
        textLabels.push({ text: entity.text.trim(), x, y });
      }
    }

    // 2. Collect Closed Polyline Boundaries (LWPOLYLINE, POLYLINE, 2D POLYLINE)
    let roomIndex = 1;
    for (const entity of dxfParsed.entities) {
      if (
        (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') &&
        entity.vertices &&
        entity.vertices.length >= 3
      ) {
        const vertices: { x: number; y: number }[] = entity.vertices.map((v: any) => ({ x: v.x, y: v.y }));

        // Check if closed
        const isClosed =
          entity.shape === true ||
          entity.closed === true ||
          (Math.abs(vertices[0].x - vertices[vertices.length - 1].x) < 0.01 &&
            Math.abs(vertices[0].y - vertices[vertices.length - 1].y) < 0.01);

        if (isClosed) {
          // Calculate polygon area (Shoelace formula)
          let area = 0;
          const n = vertices.length;
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += vertices[i].x * vertices[j].y;
            area -= vertices[j].x * vertices[i].y;
          }
          const absArea = Math.round((Math.abs(area) / 2) * 100) / 100;

          if (absArea > 5) {
            // Filter out tiny structural artifacts
            // Calculate bounding box
            const minX = Math.min(...vertices.map((v) => v.x));
            const maxX = Math.max(...vertices.map((v) => v.x));
            const minY = Math.min(...vertices.map((v) => v.y));
            const maxY = Math.max(...vertices.map((v) => v.y));
            const width = Math.round((maxX - minX) * 100) / 100;
            const height = Math.round((maxY - minY) * 100) / 100;

            // Find matching text label inside or near bounding box
            const matchingText = textLabels.find(
              (t) => t.x >= minX - 10 && t.x <= maxX + 10 && t.y >= minY - 10 && t.y <= maxY + 10
            );
            const locationName = matchingText ? matchingText.text : `Space ${roomIndex}`;

            extractedRooms.push({
              id: `rm-${roomIndex}`,
              slNo: roomIndex,
              floor: 'Ground',
              floorIndex: 0,
              location: locationName,
              areaSqFt: Math.round(absArea),
              heightFt: 10,
              occupancy: Math.max(1, Math.round(absArea / 100)),
              status: 'Analyzed',
              coordinates: {
                x: Math.round(minX),
                y: Math.round(minY),
                width,
                height,
              },
            });
            roomIndex++;
          }
        }
      }
    }

    if (extractedRooms.length === 0) {
      throw new Error(
        `${ext.toUpperCase()} parsed successfully, but no closed room boundaries were detected. Please ensure the CAD drawing contains closed polylines representing room boundaries.`
      );
    }

    const totalArea = extractedRooms.reduce((sum, r) => sum + r.areaSqFt, 0);
    const floorsCount = new Set(extractedRooms.map((r) => r.floor)).size;

    return {
      success: true,
      isDemo: false,
      message: `${ext.toUpperCase()} floor plan '${fileName}' analyzed successfully via LibreDWG engine. ${extractedRooms.length} spaces extracted with total area of ${totalArea.toLocaleString()} sq.ft.`,
      rooms: extractedRooms,
      extractedFloorsCount: floorsCount,
      extractedRoomsCount: extractedRooms.length,
      extractedTotalArea: totalArea,
    };
  }
}

export const floorPlanProcessor = new ArchitecturalFloorPlanProcessor();
