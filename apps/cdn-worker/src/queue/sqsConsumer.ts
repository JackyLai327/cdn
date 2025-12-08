import { config } from "../../config";
import { logger } from "../../lib/logger";
import { ProcessFileJob, DeleteFileJob } from "../types/job";
import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class SqsConsumer {
  private sqs: SQSClient;

  constructor(
    private handleJob: (job: ProcessFileJob | DeleteFileJob) => Promise<void>
  ) {
    this.sqs = new SQSClient({
      region: config.S3_REGION,
      endpoint: config.SQS_ENDPOINT, // For LocalStack
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      }
    });
  }

  async start() {
    logger.info("Worker: polling SQS...");

    while (true) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: config.QUEUE_URL,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,          // Long polling
          VisibilityTimeout: 30,        // 30 seconds of processing time before message is re-queued
        });

        const response = await this.sqs.send(command);

        if (!response.Messages || response.Messages.length === 0) {
          continue; // no messages, keep looping
        }

        for (const message of response.Messages) {
          const body = JSON.parse(message.Body!) as ProcessFileJob | DeleteFileJob;
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
          } catch (error: any) {
            logger.error(`Worker: failed to process job ${body.fileId}: {
              message: ${error.message},
              stack: ${error.stack}
            }`);
          }
        }
      } catch (error: any) {
        logger.error(`Worker: polling error: {
          name: ${error.name}
          message: ${error.message},
          stack: ${error.stack},
          errors: ${(error.errors ?? []).map((e: any) => e.message).join(", ")}
        }`);
      }
    }
  }
}
