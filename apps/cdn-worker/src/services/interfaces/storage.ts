export interface IStorageService {
  /**
   * Download a file from storage
   * @param bucket
   * @param key
   */
  downloadFile(bucket: string, key: string): Promise<Buffer>;

  /**
   * Upload a file to storage
   * @param bucket
   * @param key
   * @param body
   * @param contentType
   */
  uploadFile(bucket: string, key: string, body: Buffer, contentType: string): Promise<void>;

  /**
   * Delete a file from storage
   * @param keys
   */
  deleteFiles(keys: string[]): Promise<void>;
}
