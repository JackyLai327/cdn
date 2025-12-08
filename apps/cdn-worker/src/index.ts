import sharp from "sharp";
import { config } from "../config";
import { logger } from "../lib/logger";
import { Variant } from "./types/variant";
import { FileProcessingJob } from "./types/job";
import { dbService } from "./services/dbService";
import { SqsConsumer } from "./queue/sqsConsumer";
import { storageService } from "./services/storageService";
import { imageProcessor } from "./services/imageProcessor";


async function handleJob(job: FileProcessingJob) {
  logger.info(`Worker: received job ${job.fileId}`);

  const {
    fileId,
    storageKey,
    requestedSizes
  } = job;

  try {
    // 1. Get file metadata
    const file = await dbService.getFile(fileId);

    logger.error(JSON.stringify(file));

    const mimeType = file.mime_type;

    // 2. Download raw file
    const raw = await storageService.downloadFile(config.S3_BUCKET_RAW, storageKey)

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

const consumer = new SqsConsumer(handleJob);
consumer.start();
