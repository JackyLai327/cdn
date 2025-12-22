import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { jobQueueLatency } from "../services/metrics.js";
import { ProcessFileJob, DeleteFileJob } from "../types/job.js";
import { DeleteMessageCommand, MessageSystemAttributeName, ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const isLocal = config.CDN_ENV === "local";

export class SqsConsumer {
  private sqs: SQSClient;
  private isRunning: boolean = true;

  constructor(
    private handleJob: (job: ProcessFileJob | DeleteFileJob) => Promise<void>
  ) {
    this.sqs = new SQSClient({
      region: config.AWS_REGION,
      ...(isLocal && {
        endpoint: config.SQS_ENDPOINT, // For LocalStack
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        }
      })
    });
  }

  async start() {
    process.on("SIGINT", () => {
      this.isRunning = false;
    });

    process.on("SIGTERM", () => {
      this.isRunning = false;
    });

    logger.info("Worker: polling SQS...");

    while (this.isRunning) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: config.QUEUE_URL,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 20,          // Long polling
          VisibilityTimeout: 30,        // 30 seconds of processing time before message is re-queued
          MessageAttributeNames: [MessageSystemAttributeName.SentTimestamp],
        });

        const response = await this.sqs.send(command);

        if (!response.Messages || response.Messages.length === 0) {
          continue; // no messages, keep looping
        }

        for (const message of response.Messages) {
          const body = JSON.parse(message.Body!) as ProcessFileJob | DeleteFileJob;

          if (message.Attributes?.SentTimestamp) {
            const sentTime = Number(message.Attributes.SentTimestamp);
            const currentTime = Date.now();
            const latency = currentTime - sentTime;

            jobQueueLatency.observe(
              { job_type: body.type },
              latency,
            );
          }

          try {
            await this.handleJob(body);

            // Delete job after successful processing
            await this.sqs.send(
              new DeleteMessageCommand({
                QueueUrl: config.QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle!,
              })
            );

            logger.info(`Worker: processed and deleted job ${body.fileId}`);
          } catch (error: unknown) {
            logger.error(`Worker: failed to process job ${body.fileId}: {
              message: ${(error as Error)?.message || "Unknown"},
              stack: ${(error as Error)?.stack || "Unknown"}
            }`);
          }
        }
      } catch (error: unknown) {
        logger.error(`Worker: polling error: {
          name: ${(error as Error)?.name || "Unknown"},
          message: ${(error as Error)?.message || "Unknown"},
          stack: ${(error as Error)?.stack || "Unknown"}
        }`);
      }
    }
  }
}
