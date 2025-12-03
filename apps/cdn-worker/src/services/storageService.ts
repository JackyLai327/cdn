import { Readable } from "stream";
import { config } from "../../config";
import { IStorageService } from "./interfaces/storage";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: config.S3_REGION,
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      }
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
}

export const storageService = new StorageService();
