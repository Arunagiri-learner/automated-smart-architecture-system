import fs from 'fs';

export interface IDwgConversionResult {
  success: boolean;
  dxfContent?: string;
  error?: string;
  stats?: {
    fileSizeBytes: number;
    dxfSizeBytes?: number;
  };
}

export class LibreDwgService {
  private static wasmModule: any = null;

  private static async getWasmModule(): Promise<any> {
    if (this.wasmModule) {
      return this.wasmModule;
    }
    try {
      const mod: any = await import('@mlightcad/libredwg-web');
      if (mod.createModule) {
        const wasmInstance = await mod.createModule();
        this.wasmModule = {
          LibreDwg: mod.LibreDwg,
          wasmInstance,
        };
      } else {
        this.wasmModule = {
          LibreDwg: mod.LibreDwg,
        };
      }
      console.log('✅ LibreDWG WebAssembly module initialized successfully.');
      return this.wasmModule;
    } catch (err: any) {
      console.error('❌ Failed to initialize LibreDWG WASM module:', err);
      throw new Error(`LibreDWG WebAssembly initialization failed: ${err.message}`);
    }
  }

  public static async convertDwgToDxf(filePath: string): Promise<IDwgConversionResult> {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found at path '${filePath}'` };
      }

      const fileBuffer = fs.readFileSync(filePath);
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );

      const mod = await this.getWasmModule();
      const libreDwgInstance = mod.wasmInstance ? new mod.LibreDwg(mod.wasmInstance) : new mod.LibreDwg();

      const dxfUint8Array = libreDwgInstance.dwg_write_dxf(arrayBuffer);

      if (!dxfUint8Array || dxfUint8Array.length === 0) {
        return {
          success: false,
          error: 'DWG parsing failed: LibreDWG WASM parser was unable to decode the uploaded binary DWG file.',
        };
      }

      const dxfContent = new TextDecoder('utf-8').decode(dxfUint8Array);

      return {
        success: true,
        dxfContent,
        stats: {
          fileSizeBytes: fileBuffer.length,
          dxfSizeBytes: dxfUint8Array.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: `DWG parsing failed: ${err.message || 'Unknown WebAssembly parser error'}`,
      };
    }
  }
}
