export interface IDeleteProcessor {
  /**
   * Delete a file and all its variants
   * @param fileId
   */
  deleteFile(fileId: string): Promise<void>;
}
