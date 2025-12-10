import { config } from "../../config/index.js"
import { logger } from "../../lib/logger.js"
import { dbService } from "../services/dbService.js"

export const startPurgeLoop = () => {
  const purge = async () => {
    try {
      const candidates = await dbService.getFilesReadyForPurge(
        Number(config.PURGE_BATCH_SIZE),
        Number(config.PERMANENT_DELETE_AFTER_DAYS)
      )

      if (candidates.length === 0) {
        logger.info("Purger: no files ready for purge")
        return
      }

      const ids = candidates.map(candidate => candidate.id)
      logger.info(`Purger: purging ${ids.length} files [${ids.join(", ")}]`)

      await dbService.hardDeleteFiles(ids)
      logger.info(`Purger: purged ${ids.length} files [${ids.join(", ")}]`)
    } catch (error) {
      logger.error("Purger: failed to purge files", error)
    }
  }

  // Run once at start up
  purge()

  // Run every 10 minutes
  setInterval(purge, 10 * 60 * 1000)
}
