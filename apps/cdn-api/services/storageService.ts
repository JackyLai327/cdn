import { type IStorageService } from "./interfaces/storage.js";

export class StorageService implements IStorageService {
  // TODO: Implement method
  async generatePresignedUploadURL(params: {
    key: string;
    mimetype: string;
    expiresIn?: number;
  }): Promise<string> {
    throw new Error("Method not implemented");
  }

  // TODO: Implement method
  async verifyObjectExists(key: string): Promise<boolean> {
    throw new Error("Method not implemented");
  }
}
