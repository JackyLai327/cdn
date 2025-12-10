import { z } from "zod";
import path from "path";
import dotenv from "dotenv";
import { logger } from "../lib/logger.js";

// Load environment variables immediately
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: path.resolve(process.cwd(), envFile), debug: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_PORT: z.string().default("3000"),

  // DB
  DB_HOST: z.string(),
  DB_PORT: z.string().default("5432"),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // S3 / MinIO
  S3_ENDPOINT: z.string(),
  S3_REGION: z.string().default("ap-southeast-2"),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_RAW: z.string(),
  S3_BUCKET_PROCESSED: z.string(),

  // Queue (SQS / LocalStack)
  SQS_ENDPOINT: z.string().optional(),
  QUEUE_URL: z.string(),

  // CDN container's base URL
  CDN_BASE_URL: z.string(),

  JWT_SECRET: z.string(),

  CDN_ENV: z.enum(["local", "aws"]).default("local"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(`Invalid environment variables: ${JSON.stringify(parsed.error.format())}`);
  process.exit(1);
}

export const config = parsed.data;
