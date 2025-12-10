import { Pool } from "pg";
import { config } from "../../config/index.js";
import { Variant } from "../types/variant.js";
import { IDBService } from "./interfaces/db.js";
import { FileMetadata } from "../types/fileMetadata.js";

export class DBService implements IDBService {
  private db = new Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  async updateStatus(fileId: string, status: string): Promise<void> {
    await this.db.query(
      `UPDATE files SET status=$1, updated_at=NOW() WHERE id=$2;`,
      [status, fileId]
    );
  }

  async addVariants(fileId: string, variants: Variant[]): Promise<void> {
    await this.db.query(
      `UPDATE files SET variants=$1, status='ready', updated_at=NOW() WHERE id=$2;`,
      [JSON.stringify(variants), fileId]
    );
  }

  async getFile(fileId: string): Promise<FileMetadata> {
    const result = await this.db.query(`SELECT * FROM files WHERE id=$1;`, [
      fileId,
    ]);
    return result.rows[0];
  }

  async markDeleted(fileId: string): Promise<void> {
    await this.updateStatus(fileId, "deleted");
    await this.db.query(`UPDATE files SET deleted_at=NOW() WHERE id=$1;`, [
      fileId,
    ]);
  }

  async getFilesReadyForPurge(
    limit: number,
    olderThanDays: number
  ): Promise<{ id: string }[]> {
    const result = await this.db.query(
      `SELECT id FROM files WHERE status='deleted' AND deleted_at IS NOT NULL AND deleted_at < NOW() - ($1::interval) LIMIT $2;`,
      [`${olderThanDays} days`, limit]
    );

    return result.rows as { id: string }[];
  }

  async hardDeleteFiles(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.query(`DELETE FROM files WHERE id=ANY($1::uuid[]);`, [ids]);
  }
}

export const dbService = new DBService();
