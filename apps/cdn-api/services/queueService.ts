import { config } from "../config/index.js";
import { type IQueueService } from "./interfaces/queue.js";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class QueueService implements IQueueService {

  private sqs: SQSClient;

  constructor() {
    const endpoint = config.S3_ENDPOINT.includes("minio")
      ? undefined // MinIO doesn't support SQS
      : config.QUEUE_URL.startsWith("http")
        ? config.QUEUE_URL.replace(/\/[^\/]+$/, "")
        : undefined;

    this.sqs = new SQSClient({
      region: config.S3_REGION,
      ...(endpoint && { endpoint }),
    });
  }

  async sendJob(payload: object): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: config.QUEUE_URL,
      MessageBody: JSON.stringify(payload),
    });

    await this.sqs.send(command);
  }
}

export const queueService = new QueueService();
