import { Variant } from "../../types/variant"
import { FileMetadata } from "../../types/fileMetadata"

export interface IDBService {
  /**
   * Update the status of a file
   * @param fileId
   * @param status
   */
  updateStatus(fileId: string, status: string): Promise<void>

  /**
   * Add variants to a file
   * @param fileId
   * @param variants
   */
  addVariants(fileId: string, variants: Variant[]): Promise<void>

  /**
   * Get a file by ID
   * @param fileId
   */
  getFile(fileId: string): Promise<FileMetadata>
}
