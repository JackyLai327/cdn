export interface IQueueService {
  checkQueueDepth(): Promise<void>;
}
