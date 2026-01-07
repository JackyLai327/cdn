import { Variant } from "../../types/variant.js";
import { Job, JobType } from "../../types/job.js";
import { FileMetadata } from "../../types/fileMetadata.js";

export enum JobClaimStatus {
  CLAIMED,
  NOT_CLAIMED
}

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

  /**
   * Claim a job
   * @param jobId
   */
  claimJob(jobId: string): Promise<JobClaimStatus>;

  /**
   * Get a job by ID
   * @param jobId
   */
  getJob(jobId: string): Promise<Job>;

  /**
   * Update the status of a job
   * @param jobId
   * @param status (processing, completed, failed)
   */
  updateJobStatus(jobId: string, status: string): Promise<void>;

  /**
   * Delete a job
   * @param jobId
   */
  deleteJob(jobId: string): Promise<void>;

  /**
   * Update the last error of a job
   * @param jobId
   * @param error
   */
  updateJobLastError(jobId: string, error: string): Promise<void>;

  /**
   * Update the last error type of a job
   * @param jobId
   * @param errorType
   */
  updateJobLastErrorType(jobId: string, errorType: string): Promise<void>;

  /**
   * Clear stuck files
   * @param batchSize
   */
  clearStuckFiles(batchSize: number): Promise<void>;

  /**
   * Check if a job has reached its max attempts
   * @param jobId
   */
  jobMaxAttemptsReached(jobId: string): Promise<boolean>;

  /**
   * Update the retry at time of a job
   * @param jobId
   * @param jobType
   * @param retryMs
   */
  updateJobRetryAt(jobId: string, jobType: JobType, retryMs: number): Promise<void>;
}
