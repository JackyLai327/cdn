import { logger } from "../../lib/logger.js";
import { DeleteFileJob } from "../types/job.js";
import { deleteProcessor } from "../services/deleteProcessor.js";

export const deleteFile = async (job: DeleteFileJob) => {
  const { fileId } = job;

  try {
    await deleteProcessor.deleteFile(fileId);
  } catch (error) {
    logger.error(`Worker: failed to delete file ${fileId}`, error);
  }
}
