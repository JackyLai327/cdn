import { Pool } from "pg";
import { Variant } from "../types/variant.js";
import { config } from "../../config/index.js";
import { measureDBDuration } from "./metrics.js";
import { FileMetadata } from "../types/fileMetadata.js";
import { IDBService, JobClaimStatus } from "./interfaces/db.js";

export class DBService implements IDBService {
  private db = new Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  async updateStatus(fileId: string, status: string): Promise<void> {
    const result = measureDBDuration("updateStatus", async () => {
      await this.db.query(
        `UPDATE files SET status=$1, updated_at=NOW() WHERE id=$2;`,
        [status, fileId]
      );
      return;
    });
    return result;
  }

  async addVariants(fileId: string, variants: Variant[]): Promise<void> {
    const result = measureDBDuration("addVariants", async () => {
      await this.db.query(
        `UPDATE files SET variants=$1, status='ready', updated_at=NOW() WHERE id=$2;`,
        [JSON.stringify(variants), fileId]
      );
      return;
    });
    return result;
  }

  async getFile(fileId: string): Promise<FileMetadata> {
    const result = measureDBDuration("getFile", async () => {
      const result = await this.db.query(`SELECT * FROM files WHERE id=$1;`, [
        fileId,
      ]);
      return result.rows[0];
    });
    return result;
  }

  async markDeleted(fileId: string): Promise<void> {
    const result = measureDBDuration("markDeleted", async () => {
      await this.updateStatus(fileId, "deleted");
      await this.db.query(`UPDATE files SET deleted_at=NOW() WHERE id=$1;`, [
        fileId,
      ]);
      return;
    });
    return result;
  }

  async getFilesReadyForPurge(
    limit: number,
    olderThanDays: number
  ): Promise<{ id: string }[]> {
    const result = measureDBDuration("getFilesReadyForPurge", async () => {
      const result = await this.db.query(
        `SELECT id FROM files WHERE status='deleted' AND deleted_at IS NOT NULL AND deleted_at < NOW() - ($1::interval) LIMIT $2;`,
        [`${olderThanDays} days`, limit]
      );
      return result.rows as { id: string }[];
    });
    return result;
  }

  async hardDeleteFiles(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const result = measureDBDuration("hardDeleteFiles", async () => {
      await this.db.query(`DELETE FROM files WHERE id=ANY($1::uuid[]);`, [ids]);
      return;
    });
    return result;
  }

  async claimJob(jobId: string): Promise<JobClaimStatus> {
    const result = measureDBDuration("claimJob", async () => {
      const result = await this.db.query(
        `UPDATE jobs
        SET
          status = 'processing',
          updated_at = NOW(),
          locked_at = NOW(),
          attempt_count = attempt_count + 1
        WHERE
          job_id = $1
          AND (
            status = 'queued'
            OR status = 'failed_retryable'
            OR (
              status = 'processing'
              AND locked_at < NOW() - INTERVAL '10 minutes'
            )
          )
        RETURNING job_id;`,
        [jobId]
      );

      if (result.rows.length === 1) {
        return JobClaimStatus.CLAIMED;
      }

      return JobClaimStatus.NOT_CLAIMED;
    });
    return result;
  }

  async updateJobStatus(jobId: string, status: string): Promise<void> {
    const result = measureDBDuration("updateJobStatus", async () => {
      await this.db.query(
        `UPDATE jobs SET status=$1, updated_at=NOW() WHERE job_id=$2;`,
        [status, jobId]
      );
      return;
    });
    return result;
  }

  async deleteJob(jobId: string): Promise<void> {
    const result = measureDBDuration("deleteJob", async () => {
      await this.db.query(`DELETE FROM jobs WHERE job_id=$1;`, [jobId]);
      return;
    });
    return result;
  }

  async updateJobLastError(jobId: string, error: string): Promise<void> {
    const result = measureDBDuration("updateJobLastError", async () => {
      await this.db.query(
        `UPDATE jobs SET last_error=$1, updated_at=NOW() WHERE job_id=$2;`,
        [error, jobId]
      );
      return;
    });
    return result;
  }

  async updateJobLastErrorType(
    jobId: string,
    errorType: string
  ): Promise<void> {
    const result = measureDBDuration("updateJobLastErrorType", async () => {
      await this.db.query(
        `UPDATE jobs SET last_error_type=$1, updated_at=NOW() WHERE job_id=$2;`,
        [errorType, jobId]
      );
      return;
    });
    return result;
  }

  async clearStuckFiles(batchSize: number): Promise<void> {
    const result = measureDBDuration("clearStuckFiles", async () => {
      await this.db.query(
        `DELETE FROM files WHERE (status='pending_upload') AND updated_at < NOW() - '24 hours'::interval LIMIT $1;`,
        [batchSize]
      );
      return;
    });
    return result;
  }

  async jobMaxAttemptsReached(jobId: string): Promise<boolean> {
    const result = measureDBDuration("jobMaxAttemptsReached", async () => {
      const maxAttemptsResult = await this.db.query(
        `SELECT max_attempts FROM jobs WHERE job_id=$1`,
        [jobId]
      );
      const attemptCountResult = await this.db.query(
        `SELECT attempt_count FROM jobs WHERE job_id=$1`,
        [jobId]
      );
      const maxAttempts = maxAttemptsResult.rows[0]?.max_attempts || 3;
      const attemptCount = attemptCountResult.rows[0]?.attempt_count || 0;
      return attemptCount >= maxAttempts;
    });
    return result;
  }
}

export const dbService = new DBService();
