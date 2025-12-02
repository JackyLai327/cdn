export interface IDBService {
  /**
   * Create a new file record
   *
   * @param data: File record data
   * @returns Promise<void>: Resolves when the file record is created
   */
  createFileRecord(data: {
    id: string,
    userId: string,
    originalFilename: string,
    mimeType: string,
    sizeBytes: number,
    storageKey: string,
  }): Promise<void>;

  /**
   * Mark a file as uploaded
   *
   * @param id: File ID
   * @returns Promise<void>: Resolves when the file is marked as uploaded
   */
  markUploaded(id: string): Promise<void>;

  /**
   * Update the status of a file
   *
   * @param id: File ID
   * @param status: New status
   * @returns Promise<void>: Resolves when the file status is updated
   */
  updateStatus(id: string, status: string): Promise<void>;

  /**
   * Add variants to a file
   *
   * @param id: File ID
   * @param variants: Array of variant objects
   * @returns Promise<void>: Resolves when the variants are added
   */
  addVariants(id: string, variants: string[]): Promise<void>;

  /**
   * Get a file by ID
   *
   * @param id: File ID
   * @returns Promise<{...}>: Resolves with the file record
   */
  getFileById(id: string): Promise<{
    id: string,
    userId: string,
    originalFilename: string,
    mimeType: string,
    sizeBytes: number,
    storageKey: string,
    status: string,
    variants: string[],
    createdAt: Date,
    updatedAt: Date,
  }>;
}
