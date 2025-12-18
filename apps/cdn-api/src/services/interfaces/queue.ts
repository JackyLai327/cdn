import { JobType } from "../../types/job.js";

export interface IQueueService {
  /**
   * Send a job to the queue
   *
   * @param payload: Job payload
   * @returns Promise<void>: Resolves when the job is sent
   */
  sendJob(payload: {
    jobId: string;
    type: JobType;
    fileId: string;
    storageKey?: string;
    userId: string;
    requestedSizes?: number[];
  }): Promise<void>;
}
