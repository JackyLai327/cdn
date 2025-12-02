import { type IQueueService } from "./interfaces/queue.js";

export class QueueService implements IQueueService {
  // TODO: Implement method
  async sendJob(payload: object): Promise<void> {
    throw new Error("Method not implemented");
  }
}
