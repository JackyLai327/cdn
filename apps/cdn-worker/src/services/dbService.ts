import { Pool } from "pg";
import { config } from "../../config";
import { Variant } from "../types/variant";
import { IDBService } from "./interfaces/db";
import { FileMetadata } from "../types/fileMetadata";

export class DBService implements IDBService {

  private db = new Pool({
    host: config.DB_HOST,
    port: Number(config.DB_PORT),
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  })

  async updateStatus(fileId: string, status: string): Promise<void> {
    await this.db.query(
      `UPDATE files SET status=$1, updated_at=NOW() WHERE id=$2;`,
      [status, fileId]
    )
  }

  async addVariants(fileId: string, variants: Variant[]): Promise<void> {
    await this.db.query(
      `UPDATE files SET variants=$1, status='ready', updated_at=NOW() WHERE id=$2;`,
      [JSON.stringify(variants), fileId]
    )
  }

  async getFile(fileId: string): Promise<FileMetadata> {
    const result = await this.db.query(
      `SELECT * FROM files WHERE id=$1;`,
      [fileId]
    )
    return result.rows[0]
  }

  async markDeleted(fileId: string): Promise<void> {
    await this.updateStatus(fileId, "deleted");
    await this.db.query(
      `UPDATE files SET deleted_at=NOW() WHERE id=$1;`,
      [fileId]
    )
  }
}

export const dbService = new DBService();
