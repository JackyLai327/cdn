import { logger } from "../lib/logger";
import { deleteFile } from "./jobs/deleteFile";
import { processFile } from "./jobs/processFile";
import { SqsConsumer } from "./queue/sqsConsumer";
import { DeleteFileJob, JobType, ProcessFileJob } from "./types/job";


async function handleJob(job: ProcessFileJob | DeleteFileJob) {
  logger.info(`Worker: received job ${job.fileId}`);

  if (job.type === JobType.DELETE_FILE) {
    await deleteFile(job);
    return;
  }

  if (job.type === JobType.PROCESS_FILE) {
    await processFile(job);
    return;
  }
}

const consumer = new SqsConsumer(handleJob);
consumer.start();
