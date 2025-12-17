import { v4 as uuid } from "uuid";
import { JobType } from "../types/job.js";
import { DBService } from "./dbService.js";
import { config } from "../../config/index.js";
import { QueueService } from "./queueService.js";
import { StorageService } from "./storageService.js";
import { ForbiddenError, NotFoundError } from "../../lib/errors.js";

type VariantRecord = {
  width: number;
  height: number;
  bytes: number;
  key: string;
};

/**
 * File service - Orchestrates file upload and processing logic
 */
export class FilesService {
  constructor(
    private dbService: DBService,
    private queueService: QueueService,
    private storageService: StorageService
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
    userId: string;
  }) {
    const { fileId, storageKey, userId } = params;

    // Check current status
    const file = await this.dbService.getFileById(fileId);
    if (!file) {
      throw new NotFoundError("File not found");
    }

    if (["uploaded", "processing", "ready"].includes(file.status)) {
      return { status: file.status };
    }

    // Check S3 object
    const exists = await this.storageService.verifyObjectExists(storageKey);
    if (!exists) {
      throw new Error("File not found in storage");
    }

    // Update DB record
    await this.dbService.markUploaded(fileId);

    // Send to queue
    await this.queueService.sendJob({
      type: JobType.PROCESS_FILE,
      fileId,
      storageKey,
      userId,
      requestedSizes: [1280, 1080, 640, 720, 320, 300],
    });

    return { status: "processing" };
  }

  async getFile(fileId: string, userId: string) {
    const row = await this.dbService.getFileById(fileId);
    if (!row) {
      throw new NotFoundError("File not found");
    }

    const storageKey = row.storage_key;

    if (row.user_id !== userId) {
      throw new ForbiddenError("You are not authorized to access this file");
    }

    const variantsRaw: VariantRecord[] = row.variants || [];

    // Original file URL (from RAW bucket)
    let originalFileUrl: string | null = null;
    if (
      row.status === "uploaded" ||
      row.status === "processing" ||
      row.status === "ready"
    ) {
      originalFileUrl = await this.storageService.generatePresignedDownloadURL({
        key: storageKey,
        bucket: config.S3_BUCKET_RAW,
      });
    }

    // Variants URLs (from processed bucket)
    const variants = await Promise.all(
      variantsRaw.map(async (v) => {
        const url = await this.storageService.generatePresignedDownloadURL({
          key: v.key,
          bucket: config.S3_BUCKET_PROCESSED,
        });

        return {
          width: v.width,
          height: v.height,
          bytes: v.bytes,
          key: v.key,
          url,
        };
      })
    );

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
    };
  }

  async listFiles(params: {
    userId: string;
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: string;
  }) {
    const { userId, page, pageSize, sortBy, sortOrder } = params;

    const [result, totalItems] = await Promise.all([
      this.dbService.listFiles(
        userId,
        page,
        pageSize,
        sortBy,
        sortOrder
      ),
      this.dbService.countFiles(userId)
    ])

    const items = result.files.map((file) => {
      const variants = file.variants || [];
      const storageKey = file.storage_key;

      const thumbnailVariant = variants.length > 0
        ? variants.reduce((smallest: VariantRecord, v: VariantRecord) =>
          !smallest || (v.width ?? Infinity) < (smallest.width ?? Infinity)
            ? v
            : smallest
        )
        : null;

      const status = file.status;
      const bustCache = status === "deleted";

      const thumbnail = thumbnailVariant && storageKey
        ? {
          width: thumbnailVariant.width,
          height: thumbnailVariant.height,
          bytes: thumbnailVariant.bytes,
          cdnUrl: `${config.CDN_BASE_URL}/${config.S3_BUCKET_PROCESSED}/${thumbnailVariant.key}${bustCache ? `?bust=${Date.now()}` : ""}`,
        }
        : null;

      return {
        id: file.id,
        userId: file.user_id,
        originalFilename: file.original_filename,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        status: file.status,
        createdAt: file.created_at,
        updatedAt: file.updated_at,
        thumbnail,
      };
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
      }
    };
  }

  async countFiles(userId: string) {
    const result = await this.dbService.countFiles(userId);
    return result;
  }

  async requestDelete(fileId: string) {
    const file = await this.dbService.getFileById(fileId);
    if (!file) {
      throw new NotFoundError("File not found");
    }

    if (file.status === 'deleted') return;

    await this.dbService.updateStatus(fileId, 'pending_delete');

    await this.queueService.sendJob({
      type: JobType.DELETE_FILE,
      fileId,
      userId: file.user_id,
    });
  }

  async requestDeleteForUser(userId: string) {
    const files = await this.dbService.getActiveFilesByUser(userId);

    if (files.length === 0) {
      return { count: 0 };
    }

    const batchSize = 50;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (file) => {
          await this.requestDelete(file.id);
        })
      );
    }

    return { count: files.length };
  }
}
