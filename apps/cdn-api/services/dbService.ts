import { type IDBService } from "./interfaces/db.js";

export class DBService implements IDBService {
  // TODO: Implement methods
  async createFileRecord(data: {
    id: string,
    userId: string,
    originalFilename: string,
    mimeType: string,
    sizeBytes: number,
    storageKey: string,
  }): Promise<void> {
    throw new Error("Method not implemented");
  }

  // TODO: Implement method
  async markUploaded(id: string): Promise<void> {
    throw new Error("Method not implemented");
  }

  // TODO: Implement method
  async updateStatus(id: string, status: string): Promise<void> {
    throw new Error("Method not implemented");
  }

  // TODO: Implement method
  async addVariants(id: string, variants: string[]): Promise<void> {
    throw new Error("Method not implemented");
  }

  // TODO: Implement method
  async getFileById(id: string): Promise<any> {
    throw new Error("Method not implemented");
  }
}
