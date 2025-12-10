import { Variant } from "../../types/variant.js";
import { FileMetadata } from "../../types/fileMetadata.js";

export interface IDBService {
  /**
   * Update the status of a file
   * @param fileId
   * @param status
   */
  updateStatus(fileId: string, status: string): Promise<void>;

  /**
   * Add variants to a file
   * @param fileId
   * @param variants
   */
  addVariants(fileId: string, variants: Variant[]): Promise<void>;

  /**
   * Get a file by ID
   * @param fileId
   */
  getFile(fileId: string): Promise<FileMetadata>;

  /**
   * Mark a file as deleted
   * @param fileId
   */
  markDeleted(fileId: string): Promise<void>;

  /**
   * Get a list of file IDs that are ready for purge
   * @param limit
   * @param olderThanDays
   */
  getFilesReadyForPurge(
    limit: number,
    olderThanDays: number
  ): Promise<{ id: string }[]>;

  /**
   * Hard delete files from the database
   * @param ids
   */
  hardDeleteFiles(ids: string[]): Promise<void>;
}
