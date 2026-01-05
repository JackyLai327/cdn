import { JobType } from "../../types/job.js";

export interface IDBService {
  /**
   * Create a new file record
   *
   * @param data: File record data
   * @returns Promise<void>: Resolves when the file record is created
   */
  createFileRecord(data: {
    id: string;
    userId: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
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
    id: string;
    userId: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    status: string;
    variants: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;

  /**
   * List files for a user
   *
   * @param userId: User ID
   * @param page: Page number
   * @param pageSize: Page size
   * @param sortBy: Sort by field
   * @param sortOrder: Sort order
   * @returns Promise<{...}>: Resolves with the list of files
   */
  listFiles(
    userId: string,
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
  ): Promise<{ files: {
    id: string,
    user_id: string,
    original_filename: string,
    mime_type: string,
    size_bytes: number,
    status: string,
    created_at: string,
    updated_at: string,
    thumbnail: {
      width: number,
      height: number,
      bytes: number,
      cdnUrl: string,
    } | null,
    variants: {
      width: number,
      height: number,
      bytes: number,
      key: string,
    }[],
    storage_key: string,
  }[]; total: number }>;

  /**
   * Count the number of files for a user
   *
   * @param userId: User ID
   * @returns Promise<number>: Resolves with the count of files
   */
  countFiles(userId: string): Promise<number>;

  /**
   * Get active files for a user
   *
   * @param userId: User ID
   * @returns Promise<{...}>: Resolves with the list of active files
   */
  getActiveFilesByUser(userId: string): Promise<{ id: string }[]>;

  /**
   * Get a job by ID
   *
   * @param jobId
   * @returns Promise<{...}>: Resolves with the job record
   */
  getJob(jobId: string): Promise<{
    job_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    locked_at: string;
  } | null>;

  /**
   * Create a new job record
   *
   * @param jobId: Job ID
   * @param jobType: Job type
   * @returns Promise<void>: Resolves when the job record is created
   */
  createJob(jobId: string, jobType: JobType): Promise<void>;
}
