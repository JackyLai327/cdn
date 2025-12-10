import { config } from "../../config/index.js";
import { dbService } from "./dbService.js";
import { logger } from "../../lib/logger.js";
import { cdnService } from "./cdnService.js";
import { Variant } from "../types/variant.js";
import { storageService } from "./storageService.js";
import { IDeleteProcessor } from "./interfaces/deleteProcessor.js";

export class DeleteProcessor implements IDeleteProcessor {

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await dbService.getFile(fileId);
    if (!file) return;

    const variants: Variant[] = file.variants || [];

    const keys = [
      file.storage_key,
      ...variants.map((variant) => variant.key)
    ]

    // Delete all S3 objects
    await storageService.deleteFiles(keys);

    // Delete files from DB
    await dbService.markDeleted(fileId);

    logger.info(`Worker: deleted file ${fileId} and ${keys.length} objects`);

    const cdnPaths = keys.map((key) => {
      return `/cdn/${config.S3_BUCKET_PROCESSED}/${key}`;
    })

    await cdnService.invalidatePaths(cdnPaths);
  }
}

export const deleteProcessor = new DeleteProcessor();
