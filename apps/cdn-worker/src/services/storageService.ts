import { Readable } from "stream";
import { logger } from "../../lib/logger.js";
import { config } from "../../config/index.js";
import { IStorageService } from "./interfaces/storage.js";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const isLocal = config.CDN_ENV === "local";

export class StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: config.S3_REGION,
      ...(isLocal && {
        endpoint: config.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY_ID,
          secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        },
      }),
    });
  }

  async downloadFile(bucket: string, key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await this.s3.send(command);

      const stream = response.Body as Readable;
      const chucks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chucks.push(chunk);
      }

      return Buffer.concat(chucks);
    } catch (error) {
      logger.error(`Worker: failed to download file ${key}`, error);
      throw error;
    }
  }

  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3.send(command);
    } catch (error) {
      logger.error(`Worker: failed to upload file ${key}`, error);
      throw error;
    }
  }

  async deleteFiles(keys: string[]) {
    try {
      const rawKeys = keys.filter((key) => key.startsWith("raw/"));
      const processedKeys = keys.filter((key) => key.startsWith("processed/"));

      const deleteRawCommand = new DeleteObjectsCommand({
        Bucket: config.S3_BUCKET_RAW,
        Delete: {
          Objects: rawKeys.map((key) => ({ Key: key })),
        },
      });

      const deleteProcessedCommand = new DeleteObjectsCommand({
        Bucket: config.S3_BUCKET_PROCESSED,
        Delete: {
          Objects: processedKeys.map((key) => ({ Key: key })),
        },
      });

      await this.s3.send(deleteRawCommand);
      await this.s3.send(deleteProcessedCommand);
    } catch (error) {
      logger.error(`Worker: failed to delete files ${keys}`, error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
