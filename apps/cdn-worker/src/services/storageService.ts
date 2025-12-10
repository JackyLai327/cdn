import { Readable } from "stream";
import { config } from "../../config/index.js";
import { IStorageService } from "./interfaces/storage.js";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const isLocal = config.CDN_ENV === "local";

export class StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: config.S3_REGION,
      ...(isLocal &&
        {
          endpoint: config.S3_ENDPOINT,
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.S3_ACCESS_KEY_ID,
            secretAccessKey: config.S3_SECRET_ACCESS_KEY,
          }
        }
      )
    });
  }

  async downloadFile(bucket: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    const response = await this.s3.send(command);

    const stream = response.Body as Readable;
    const chucks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chucks.push(chunk);
    }

    return Buffer.concat(chucks);
  }

  async uploadFile(bucket: string, key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })

    await this.s3.send(command);
  }

  async deleteFiles(keys: string[]) {
    const rawKeys = keys.filter((key) => key.startsWith("raw/"));
    const processedKeys = keys.filter((key) => key.startsWith("processed/"));

    const deleteRawCommand = new DeleteObjectsCommand({
      Bucket: config.S3_BUCKET_RAW,
      Delete: {
        Objects: rawKeys.map((key) => ({ Key: key })),
      },
    })

    const deleteProcessedCommand = new DeleteObjectsCommand({
      Bucket: config.S3_BUCKET_PROCESSED,
      Delete: {
        Objects: processedKeys.map((key) => ({ Key: key })),
      },
    })

    await this.s3.send(deleteRawCommand);
    await this.s3.send(deleteProcessedCommand);
  }
}

export const storageService = new StorageService();
