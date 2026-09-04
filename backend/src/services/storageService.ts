import fs from 'fs';
import path from 'path';

export interface IStoredFile {
  originalName: string;
  safeFileName: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export interface IFileStorageService {
  saveFile(file: Express.Multer.File): Promise<IStoredFile>;
  deleteFile(filePath: string): Promise<boolean>;
  getFilePath(fileName: string): string;
}

export class LocalFileStorageService implements IFileStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async saveFile(file: Express.Multer.File): Promise<IStoredFile> {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFileName = `${safeBaseName}-${Date.now()}${ext}`;
    const destinationPath = path.join(this.uploadDir, safeFileName);

    if (file.path && fs.existsSync(file.path) && file.path !== destinationPath) {
      fs.copyFileSync(file.path, destinationPath);
    }

    return {
      originalName: file.originalname,
      safeFileName,
      filePath: destinationPath,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  public getFilePath(fileName: string): string {
    return path.join(this.uploadDir, path.basename(fileName));
  }
}

export const fileStorageService = new LocalFileStorageService();
