import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { measureExternalDuration } from "./metrics.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type IStorageService } from "./interfaces/storage.js";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const isLocal = config.CDN_ENV === "local";

export class StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: config.AWS_REGION,
      ...(isLocal &&
      {
        endpoint: config.S3_ENDPOINT,   // This is important for MinIO and LocalStack
        forcePathStyle: true,           // This is important for MinIO and LocalStack
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        }
      }
      )
    })
  }

  async generatePresignedUploadURL({
    key,
    mimetype,
    expiresIn = 5 * 60,
  }: {
    key: string;
    mimetype: string;
    expiresIn?: number;
  }): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: config.S3_BUCKET_RAW,
        Key: key,
        ContentType: mimetype,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      logger.error(error);
      return "";
    }
  }

  async verifyObjectExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: config.S3_BUCKET_RAW,
        Key: key,
      });
      await measureExternalDuration(
        "s3",
        "verifyObjectExists",
        async () => {
          await this.s3.send(command);
        }
      );
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  async generatePresignedDownloadURL({
    key,
    bucket,
    expiresIn = 5 * 60,
  }: {
    key: string;
    bucket?: string;
    expiresIn?: number;
  }): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket ?? config.S3_BUCKET_RAW,
        Key: key,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      logger.error(error);
      return "";
    }
  }
}

export const storageService = new StorageService();
