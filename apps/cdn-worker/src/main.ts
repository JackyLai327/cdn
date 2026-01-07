import { logger } from "../lib/logger.js";
import { startPurgeLoop } from "./cron/purger.js";
import { deleteFile } from "./jobs/deleteFile.js";
import { processFile } from "./jobs/processFile.js";
import { dbService } from "./services/dbService.js";
import { SqsConsumer } from "./queue/sqsConsumer.js";
import { JobStatusEnum } from "./types/jobStatus.js";
import { computeRetryDelay } from "./utils/retry.js";
import { queueService } from "./services/queueService.js";
import { startMetricsServer } from "./services/metrics.js";
import { JobClaimStatus } from "./services/interfaces/db.js";
import { DeleteFileJob, JobType, ProcessFileJob } from "./types/job.js";
async function handleJob(job: ProcessFileJob | DeleteFileJob) {
  const { jobId, type: jobType } = job;
  logger.info(`Worker: received job ${jobId}`);

  const claimedStatus: JobClaimStatus = await dbService.claimJob(jobId);

  if (claimedStatus === JobClaimStatus.NOT_CLAIMED) {
    logger.info(`Worker: job ${jobId} already handled or locked by another worker`);
    return;
  }

  try {
    if (jobType === JobType.DELETE_FILE) {
      await deleteFile(job);
    }

    if (jobType === JobType.PROCESS_FILE) {
      await processFile(job);
    }

    await dbService.updateJobStatus(jobId, JobStatusEnum.COMPLETED);
  } catch (error: unknown) {
    logger.error(`Worker: failed to process job ${jobId}:`, error);

    const maxAttemptsReached = await dbService.jobMaxAttemptsReached(jobId);
    if (maxAttemptsReached) {
      await dbService.updateJobStatus(jobId, JobStatusEnum.FAILED);
      return;
    }

    const jobDB = await dbService.getJob(jobId);
    const delayMs = computeRetryDelay(jobDB.attempt_count);
    await dbService.updateJobStatus(jobId, JobStatusEnum.FAILED_RETRYABLE);
    await dbService.updateJobRetryAt(jobId, jobType, delayMs);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "UnknownError";

    await dbService.updateJobLastError(jobId, errorMessage);
    await dbService.updateJobLastErrorType(jobId, errorName);
    throw error;
  }
}

async function main() {
  const consumer = new SqsConsumer(handleJob);
  consumer.start();
  startPurgeLoop();
  startMetricsServer(9091);

  setInterval(() => {
    queueService.updateQueueDepth();
  }, 30 * 1000);
}

main().catch((err) => {
  logger.error("Worker: failed to start", err);
  process.exit(1);
})

