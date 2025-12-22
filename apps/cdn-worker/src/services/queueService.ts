import { logger } from "../../lib/logger.js";
import { jobQueueDepth } from "./metrics.js";
import { config } from "../../config/index.js";
import { IQueueService } from "./interfaces/queue.js";
import { GetQueueAttributesCommand, SQSClient } from "@aws-sdk/client-sqs";

export class QueueService implements IQueueService {
  private sqsClient: SQSClient;
  private updating: boolean = false;

  constructor() {
    this.sqsClient = new SQSClient({
      region: config.AWS_REGION || "ap-southeast-2",
    })
  }

  getQueueDepth = async (): Promise<number> => {
    const command = new GetQueueAttributesCommand({
      QueueUrl: config.QUEUE_URL,
      AttributeNames: [
        "ApproximateNumberOfMessages",
        "ApproximateNumberOfMessagesNotVisible",
      ]
    })

    const response = await this.sqsClient.send(command);

    return Number(response.Attributes?.ApproximateNumberOfMessages || 0) + Number(response.Attributes?.ApproximateNumberOfMessagesNotVisible || 0);
  }

  updateQueueDepth = async (): Promise<void> => {
    if (this.updating) {
      return;
    }

    this.updating = true;
    try {
      jobQueueDepth.set(await this.getQueueDepth());
      return;
    } catch (error) {
      logger.error("Worker: failed to update queue depth", error);
    } finally {
      this.updating = false;
    }
  }
}

export const queueService = new QueueService();
