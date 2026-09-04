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
        // Clean MTEXT formatting tags e.g. \pt119.22;{\fVNI-Helve-Condense...;label}
        let cleanText = entity.text
          .replace(/\\P/gi, ' ')
          .replace(/\{[^{}]*\}/g, (match: string) => {
            // Extract text after semicolon if present e.g. {\fFont;Text}
            const parts = match.split(';');
            return parts.length > 1 ? parts[parts.length - 1].replace(/}/g, '') : '';
          })
          .replace(/\\[a-zA-Z0-9.]+(;|\s)?/gi, '')
          .replace(/[{}]/g, '')
          .replace(/[^a-zA-Z0-9\s\-_áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệiíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]/g, '')
          .trim();
        if (!/^\d+(\.\d+)?$/.test(cleanText) && cleanText.length >= 2) {
          textLabels.push({ text: cleanText, x, y });
        }
      }
    }

    // Detect CAD units from DXF header ($INSUNITS)
    // 1: Inches, 2: Feet, 4: Millimeters, 5: Centimeters, 6: Meters
    const insUnits = dxfParsed.header ? dxfParsed.header['$INSUNITS'] : 0;
    let areaToSqFtFactor = 1.0; // Default: Feet
    let lengthToFtFactor = 1.0;

    if (insUnits === 4) {
      // Millimeters -> feet/sq.ft
      lengthToFtFactor = 0.00328084;
      areaToSqFtFactor = 1 / 92903.04;
    } else if (insUnits === 1) {
      // Inches -> feet/sq.ft
      lengthToFtFactor = 1 / 12;
      areaToSqFtFactor = 1 / 144;
    } else if (insUnits === 5) {
      // Centimeters -> feet/sq.ft
      lengthToFtFactor = 0.0328084;
      areaToSqFtFactor = 1 / 929.0304;
    } else if (insUnits === 6) {
      // Meters -> feet/sq.ft
      lengthToFtFactor = 3.28084;
      areaToSqFtFactor = 10.7639;
    } else {
      // Fallback heuristic: check model bounds
      let maxX = -Infinity, minX = Infinity;
      for (const ent of dxfParsed.entities) {
        if (ent.vertices) {
          for (const v of ent.vertices) {
            if (v.x > maxX) maxX = v.x;
            if (v.x < minX) minX = v.x;
          }
        }
      }
      const modelSpan = maxX - minX;
      if (modelSpan > 1000) {
        // Likely millimeters
        lengthToFtFactor = 0.00328084;
        areaToSqFtFactor = 1 / 92903.04;
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
          const rawArea = Math.abs(area) / 2;
          const areaSqFt = Math.round(rawArea * areaToSqFtFactor);

          // Filter sensible architectural room areas (e.g. 15 sq ft to 5,000 sq ft)
          if (areaSqFt >= 15 && areaSqFt <= 5000) {
            // Calculate bounding box
            const minX = Math.min(...vertices.map((v) => v.x));
            const maxX = Math.max(...vertices.map((v) => v.x));
            const minY = Math.min(...vertices.map((v) => v.y));
            const maxY = Math.max(...vertices.map((v) => v.y));
            const width = Math.round((maxX - minX) * lengthToFtFactor * 100) / 100;
            const height = Math.round((maxY - minY) * lengthToFtFactor * 100) / 100;

            // Find matching text label inside or near bounding box
            const matchingText = textLabels.find(
              (t) => t.x >= minX - 500 && t.x <= maxX + 500 && t.y >= minY - 500 && t.y <= maxY + 500
            );
            const locationName = matchingText ? matchingText.text : `Space ${roomIndex}`;

            extractedRooms.push({
              id: `rm-${roomIndex}`,
              slNo: roomIndex,
              floor: 'Ground',
              floorIndex: 0,
              location: locationName,
              areaSqFt,
              heightFt: 10,
              occupancy: Math.max(1, Math.round(areaSqFt / 100)),
              status: 'Analyzed',
              coordinates: {
                x: Math.round(minX * lengthToFtFactor),
                y: Math.round(minY * lengthToFtFactor),
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
