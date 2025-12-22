export interface IQueueService {
  /**
   * Get the current depth of the queue
   */
  getQueueDepth(): Promise<number>;

  /**
   * Update the queue depth metric
   */
  updateQueueDepth(): Promise<void>;
}
