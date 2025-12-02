export interface IStorageService {
  /**
   * Generate a presigned upload URL
   *
   * @param params: Upload parameters
   * @returns Promise<string>: Resolves with the presigned upload URL
   */
  generatePresignedUploadURL(params: {
    key: string;
    mimetype: string;
    expiresIn?: number;
  }): Promise<string>;

  /**
   * Verify if an object exists in the storage
   *
   * @param key: Object key
   * @returns Promise<boolean>: Resolves with true if the object exists, false otherwise
   */
  verifyObjectExists(key: string): Promise<boolean>;
}
