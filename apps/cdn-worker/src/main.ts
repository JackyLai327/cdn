import { logger } from "../lib/logger.js";
import { startPurgeLoop } from "./cron/purger.js";
import { deleteFile } from "./jobs/deleteFile.js";
import { processFile } from "./jobs/processFile.js";
import { dbService } from "./services/dbService.js";
import { SqsConsumer } from "./queue/sqsConsumer.js";
import { startMetricsServer } from "./services/metrics.js";
import { JobClaimStatus } from "./services/interfaces/db.js";
import { DeleteFileJob, JobType, ProcessFileJob } from "./types/job.js";
async function handleJob(job: ProcessFileJob | DeleteFileJob) {
  const { jobId } = job;
  logger.info(`Worker: received job ${jobId}`);

  const claimedStatus: JobClaimStatus = await dbService.claimJob(jobId);

  if (claimedStatus === JobClaimStatus.LOCKED_BY_OTHER) {
    logger.info(`Worker: job ${jobId} already claimed (locked by another worker)`);
    throw new Error(`Worker: job ${jobId} already claimed (locked by another worker)`);
  }
  if (claimedStatus === JobClaimStatus.ALREADY_COMPLETED) {
    logger.info(`Worker: job ${jobId} already completed`);
    return;
  }

  try {
    if (job.type === JobType.DELETE_FILE) {
      await deleteFile(job);
    }

    if (job.type === JobType.PROCESS_FILE) {
      await processFile(job);
    }

    await dbService.updateJobStatus(jobId, "completed");
  } catch (error) {
    logger.error(`Worker: failed to process job ${jobId}:`, error);
    await dbService.updateJobStatus(jobId, "failed");
    throw error;
  }
}

async function main() {
  const consumer = new SqsConsumer(handleJob);
  consumer.start();
  startPurgeLoop();
  startMetricsServer(9091);
}

main().catch((err) => {
  logger.error("Worker: failed to start", err);
  process.exit(1);
})

