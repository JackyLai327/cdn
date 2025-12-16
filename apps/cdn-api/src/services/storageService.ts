import { config } from "../../config/index.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type IStorageService } from "./interfaces/storage.js";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { logger } from "../../lib/logger.js";

const isLocal = config.CDN_ENV === "local";

export class StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: config.S3_REGION,
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
    const command = new PutObjectCommand({
      Bucket: config.S3_BUCKET_RAW,
      Key: key,
      ContentType: mimetype,
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  async verifyObjectExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: config.S3_BUCKET_RAW,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      logger.error(`Storage: verifyObjectExists: ${error}`);
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
    const command = new GetObjectCommand({
      Bucket: bucket ?? config.S3_BUCKET_RAW,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }
}

export const storageService = new StorageService();
