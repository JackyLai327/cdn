import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { IQueueService } from "./interfaces/queue.js";
import { jobProcessedTotal, jobQueueDepth } from "./metrics.js";
import { GetQueueAttributesCommand, SQSClient } from "@aws-sdk/client-sqs";

export class QueueService implements IQueueService {
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: config.S3_REGION || "ap-southeast-2",
    })
  }

  checkQueueDepth = async (): Promise<void> => {
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: config.QUEUE_URL,
        AttributeNames: ["ApproximateNumberOfMessages"],
      })
      const result = await this.sqsClient.send(command)
      const depth = parseInt(result.Attributes?.ApproximateNumberOfMessages || "0")

      jobQueueDepth.set(depth);
    } catch (error) {
      logger.error(error)
      jobProcessedTotal.inc({ job_type: "queue_depth_check", status: "failed" });
      throw error;
    }
  }
}

export const queueService = new QueueService();
