export interface IDeleteProcessor {
  /**
   * Delete a file and all its variants
   * @param fileId
   * @param userId
   */
  deleteFile(fileId: string, userId: string): Promise<void>;
}
