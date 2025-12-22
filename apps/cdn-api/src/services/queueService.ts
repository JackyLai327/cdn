import { JobType } from "../types/job.js";
import { config } from "../../config/index.js";
import { measureExternalDuration } from "./metrics.js";
import { type IQueueService } from "./interfaces/queue.js";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const isLocal = config.CDN_ENV === "local";

export class QueueService implements IQueueService {
  private sqs: SQSClient;

  constructor() {
    this.sqs = new SQSClient({
      region: config.AWS_REGION,
      ...(isLocal && {
        endpoint: config.SQS_ENDPOINT || "http://localhost:4566",
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        },
      }),
    });
  }

  async sendJob(payload: {
    jobId: string;
    type: JobType;
    fileId: string;
    storageKey?: string;
    userId: string;
    requestedSizes?: number[];
  }): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: config.QUEUE_URL,
      MessageBody: JSON.stringify(payload),
    });

    await measureExternalDuration(
      "sqs",
      "sendMessage",
      async () => this.sqs.send(command)
    );
  }
}

export const queueService = new QueueService();
