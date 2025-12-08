import { logger } from "../../lib/logger";
import { DeleteFileJob } from "../types/job";
import { deleteProcessor } from "../services/deleteProcessor";

export const deleteFile = async (job: DeleteFileJob) => {
  const { fileId, userId } = job;

  try {
    await deleteProcessor.deleteFile(fileId, userId);
  } catch (error) {
    logger.error(`Worker: failed to delete file ${fileId}`, error);
  }
}
