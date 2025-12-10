export interface IQueueService {
  /**
   * Send a job to the queue
   *
   * @param payload: Job payload
   * @returns Promise<void>: Resolves when the job is sent
   */
  sendJob(payload: object): Promise<void>;
}
