import { logger } from "../lib/logger.js";
import { startPurgeLoop } from "./cron/purger.js";
import { deleteFile } from "./jobs/deleteFile.js";
import { processFile } from "./jobs/processFile.js";
import { SqsConsumer } from "./queue/sqsConsumer.js";
import { DeleteFileJob, JobType, ProcessFileJob } from "./types/job.js";


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

async function main() {
  const consumer = new SqsConsumer(handleJob);
  consumer.start();
  startPurgeLoop();
}

main().catch((err) => {
  logger.error("Worker: failed to start", err);
  process.exit(1);
})
