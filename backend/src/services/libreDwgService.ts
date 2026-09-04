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
  private static cachedMod: any = null;
  private static cachedWasmInstance: any = null;

  private static async getLibreDwgInstance(): Promise<any> {
    if (!this.cachedMod) {
      this.cachedMod = await import('@mlightcad/libredwg-web');
    }
    const mod = this.cachedMod;

    if (!this.cachedWasmInstance) {
      const createModuleFunc =
        typeof mod.createModule === 'function'
          ? mod.createModule
          : typeof mod.createModule?.default === 'function'
          ? mod.createModule.default
          : typeof mod.default?.createModule === 'function'
          ? mod.default.createModule
          : undefined;

      if (createModuleFunc) {
        this.cachedWasmInstance = await createModuleFunc();
      }
    }

    const LibreDwgClass = mod.LibreDwg || mod.default?.LibreDwg;
    return this.cachedWasmInstance
      ? new LibreDwgClass(this.cachedWasmInstance)
      : new LibreDwgClass();
  }

  public static async convertDwgToDxf(filePath: string): Promise<IDwgConversionResult> {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found at path '${filePath}'` };
      }

      const fileBuffer = fs.readFileSync(filePath);
      const uint8Array = new Uint8Array(fileBuffer);

      const libreDwgInstance = await this.getLibreDwgInstance();

      let dxfUint8Array: Uint8Array | null = libreDwgInstance.dwg_write_dxf(uint8Array.buffer);

      if (!dxfUint8Array || dxfUint8Array.length === 0) {
        return {
          success: false,
          error: 'DWG parsing failed: LibreDWG WASM parser was unable to decode the uploaded binary DWG file.',
        };
      }

      const dxfSizeBytes = dxfUint8Array.length;
      const dxfContent = new TextDecoder('utf-8').decode(dxfUint8Array);

      // Release WASM memory references
      dxfUint8Array = null;

      return {
        success: true,
        dxfContent,
        stats: {
          fileSizeBytes: fileBuffer.length,
          dxfSizeBytes,
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
