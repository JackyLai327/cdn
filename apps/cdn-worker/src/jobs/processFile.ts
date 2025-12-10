import sharp from "sharp";
import { config } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { Variant } from "../types/variant.js";
import { ProcessFileJob } from "../types/job.js";
import { dbService } from "../services/dbService.js";
import { storageService } from "../services/storageService.js";
import { imageProcessor } from "../services/imageProcessor.js";

export const processFile = async (job: ProcessFileJob) => {
  const {
    fileId,
    storageKey,
    requestedSizes
  } = job;

  try {
    // 1. Get file metadata
    const file = await dbService.getFile(fileId);
    const mimeType = file.mime_type;

    // 2. Download raw file
    const raw = await storageService.downloadFile(config.S3_BUCKET_RAW, storageKey)

    logger.info(`Worker: downloaded raw file ${storageKey}, size: ${raw.length} bytes`);
    if (raw.length > 0) {
      logger.info(`Worker: first 20 bytes: ${raw.subarray(0, 20).toString('hex')}`);
    } else {
      logger.warn(`Worker: downloaded file is empty`);
    }

    const variants: Variant[] = [];
    const fileName = storageKey.split("/").pop();

    // 3. Process sizes
    for (const size of requestedSizes) {
      const processed = await imageProcessor.resizeImage(raw, size, mimeType);
      const processedKey = `processed/${job.userId}/${fileId}/${size}/${fileName}`

      await storageService.uploadFile(
        config.S3_BUCKET_PROCESSED,
        processedKey,
        processed,
        mimeType
      )

      const imageMetadata = await sharp(processed).metadata();

      variants.push({
        width: imageMetadata.width ?? size,
        height: imageMetadata.height ?? null,
        bytes: processed.length,
        key: processedKey,
      })
    }

    // 4. Update DB
    await dbService.addVariants(fileId, variants);

    logger.info(`Worker: processed job ${job.fileId}`);
  } catch (error) {
    logger.error(`Worker: failed to process job ${job.fileId}`, error);
  }
}
