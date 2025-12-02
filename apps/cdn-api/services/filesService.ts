import { v4 as uuid } from "uuid";
import { DBService } from "./dbService.js";
import { QueueService } from "./queueService.js";
import { StorageService } from "./storageService.js";

/**
 * File service - Orchestrates file upload and processing logic
 */
export class FilesService {
  constructor(
    private dbService: DBService,
    private queueService: QueueService,
    private storageService: StorageService,
  ) {}

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
}
