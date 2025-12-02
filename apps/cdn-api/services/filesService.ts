import { v4 as uuid } from "uuid";
import { DBService } from "./dbService.js";
import { config } from "../config/index.js";
import { QueueService } from "./queueService.js";
import { NotFoundError } from "../lib/errors.js";
import { StorageService } from "./storageService.js";

type VariantRecord = {
  size: number,
  key: string
}

/**
 * File service - Orchestrates file upload and processing logic
 */
export class FilesService {
  constructor(
    private dbService: DBService,
    private queueService: QueueService,
    private storageService: StorageService,
  ) { }

  async initiateUpload(params: {
    userId: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  }) {
    const id = uuid();
    const storageKey = `raw/${params.userId}/${id}-${params.originalFilename}`;

    // Create DB record
    await this.dbService.createFileRecord({
      id,
      userId: params.userId,
      originalFilename: params.originalFilename,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      storageKey,
    });

    // Generate upload URL (Presigned URL)
    const uploadURL = await this.storageService.generatePresignedUploadURL({
      key: storageKey,
      mimetype: params.mimeType,
    });

    return {
      fileId: id,
      uploadURL,
      storageKey,
    };
  }

  async completeUpload(params: {
    fileId: string;
    storageKey: string;
  }) {
    const { fileId, storageKey } = params;

    // Check S3 object
    const exists = await this.storageService.verifyObjectExists(storageKey);
    if (!exists) {
      throw new Error("File not found");
    }

    // Update DB record
    await this.dbService.markUploaded(fileId);

    // Send to queue
    await this.queueService.sendJob({
      fileId,
      storageKey,
      requestedSizes: ["1280", "640", "320"],
    });

    return { status: "processing" };
  }

  async getFile(fileId: string) {
    const row = await this.dbService.getFileById(fileId);
    if (!row) {
      throw new NotFoundError("File not found");
    }

    const variantsRaw: VariantRecord[] = row.variants || [];

    // Original file URL (from RAW bucket)
    let originalFileUrl: string | null = null;
    if (row.status === "uploaded" || row.status === "processing" || row.status === "ready") {
      originalFileUrl = await this.storageService.generatePresignedDownloadURL({
        key: row.storageKey,
        bucket: config.S3_BUCKET_RAW
      });
    }

    // Variants URLs (from processed bucket)
    const variants = await Promise.all(
      variantsRaw.map(async (v) => {
        const url = await this.storageService.generatePresignedDownloadURL({
          key: v.key,
          bucket: config.S3_BUCKET_PROCESSED
        });

        return {
          size: v.size,
          key: v.key,
          url,
        }
      })
    )

    return {
      id: row.id,
      userId: row.user_id,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      variants,
      originalFileUrl,
    }
  }
}
