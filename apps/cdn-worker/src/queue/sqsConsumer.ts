import { config } from "../../config";
import { SQSClient } from "@aws-sdk/client-sqs";
import { FileProcessingJob } from "../types/job";

export class SqsConsumer {
  private sqs: SQSClient;

  constructor(
    private handleJob: (job: FileProcessingJob) => Promise<void>
  ) {
    this.sqs = new SQSClient({
      region: config.S3_REGION,
      endpoint: config.SQS_ENDPOINT, // For LocalStack
    });
  }

  async start() {
    console.log("Worker")
  }
}
