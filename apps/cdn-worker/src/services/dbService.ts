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
        `
      INSERT INTO jobs (job_id, status, locked_at)
      VALUES ($1, 'processing', NOW())
      ON CONFLICT (job_id) DO UPDATE
      SET status = 'processing', updated_at = NOW(), locked_at = NOW()
      WHERE jobs.status = 'failed' OR (jobs.status = 'processing' AND jobs.locked_at < NOW() - '10 minutes'::interval)
      RETURNING job_id;
    `,
        [jobId]
      );

      if (result.rows.length === 0) {
        const current = await this.db.query(
          "SELECT status FROM jobs WHERE job_id=$1",
          [jobId]
        );
        if (current.rows[0]?.status === "completed")
          return JobClaimStatus.ALREADY_COMPLETED;
        if (current.rows[0]?.status === "processing")
          return JobClaimStatus.LOCKED_BY_OTHER;
      }
      return JobClaimStatus.CLAIMED;
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
}

export const dbService = new DBService();
