import { logger } from "../../lib/logger.js";
import { DeleteFileJob } from "../types/job.js";
import { measureJobDuration } from "../services/metrics.js";
import { deleteProcessor } from "../services/deleteProcessor.js";

export const deleteFile = async (job: DeleteFileJob) => {
  const { fileId, userId } = job;

  try {
    const result = measureJobDuration(
      "deleteFile",
      "success",
      async () => {
        await deleteProcessor.deleteFile(fileId, userId);
      }
    );
    return result;
  } catch (error) {
    logger.error(`Worker: failed to delete file ${fileId}`, error);
    throw error;
  }
}
