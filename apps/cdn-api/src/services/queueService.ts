import { config } from "../../config/index.js";
import { type IQueueService } from "./interfaces/queue.js";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const isLocal = config.CDN_ENV === "local";

export class QueueService implements IQueueService {

  private sqs: SQSClient;

  constructor() {
    this.sqs = new SQSClient({
      region: config.S3_REGION,
      ...(isLocal && {
        endpoint: config.SQS_ENDPOINT || "http://localhost:4566",
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        }
      })
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
