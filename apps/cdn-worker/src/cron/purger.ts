import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { dbService } from "../services/dbService.js";
import { measureJobDuration } from "../services/metrics.js";

export const startPurgeLoop = () => {
  const purge = async () => {
    const result = measureJobDuration(
      "purgeExpiredFiles",
      "success",
      async () => {
        try {
          const candidates = await dbService.getFilesReadyForPurge(
            Number(config.PURGE_BATCH_SIZE),
            Number(config.PERMANENT_DELETE_AFTER_DAYS)
          );

          if (candidates.length === 0) {
            logger.info("Purger: no files ready for purge");
            return;
          }

          const ids = candidates.map((candidate) => candidate.id);
          logger.info(
            `Purger: purging ${ids.length} files [${ids.join(", ")}]`
          );

          await dbService.hardDeleteFiles(ids);
          logger.info(`Purger: purged ${ids.length} files [${ids.join(", ")}]`);
        } catch (error) {
          logger.error("Purger: failed to purge files", error);
          throw error;
        }
      }
    );
    return result;
  };

  const clearStuckFiles = async () => {
    const result = measureJobDuration(
      "clearStuckFiles",
      "success",
      async () => {
        try {
          await dbService.clearStuckFiles(20);
          logger.info("Purger: cleared stuck files");
        } catch (error) {
          logger.error("Purger: failed to clear stuck files", error);
          throw error;
        }
      }
    )
    return result;
  }

  // Run once at start up
  purge();
  clearStuckFiles();

  // Run every 10 minutes
  setInterval(purge, 10 * 60 * 1000);

  // Run every 5 minutes
  setInterval(clearStuckFiles, 5 * 60 * 1000);
};
