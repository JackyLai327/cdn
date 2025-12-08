import { Pool } from "pg";
import { config } from "../config/index.js";
import { type IDBService } from "./interfaces/db.js";

const pool = new Pool({
  host: config.DB_HOST,
  port: Number(config.DB_HOST),
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
});

export class DBService implements IDBService {
  async createFileRecord(data: {
    id: string;
    userId: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
  }): Promise<void> {
    const query = `
      INSERT INTO files
        (id, user_id, original_filename, mime_type, size_bytes, storage_key, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending_upload');
    `;
    await pool.query(query, [
      data.id,
      data.userId,
      data.originalFilename,
      data.mimeType,
      data.sizeBytes,
      data.storageKey,
    ]);
  }

  async markUploaded(id: string): Promise<void> {
    await pool.query(
      `UPDATE files SET status='uploaded', updated_at=NOW() WHERE id=$1;`,
      [id]
    );
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await pool.query(
      `UPDATE files SET status=$2, updated_at=NOW() WHERE id=$1;`,
      [id, status]
    );
  }

  async addVariants(id: string, variants: string[]): Promise<void> {
    await pool.query(
      `UPDATE files SET variants=$2, updated_at=NOW() WHERE id=$1;`,
      [id, JSON.stringify(variants)]
    );
  }

  async getFileById(id: string): Promise<any> {
    const result = await pool.query(`SELECT * FROM files WHERE id=$1;`, [id]);
    return result.rows[0];
  }

  async listFiles(
    userId: string,
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
  ): Promise<{ files: any[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const order = sortOrder === "desc" ? "DESC" : "ASC";
    const sort = sortBy === "createdAt" ? "created_at" : "updated_at";

    const result = await pool.query(
      `SELECT * FROM files WHERE user_id=$1 ORDER BY ${sort} ${order} LIMIT $2 OFFSET $3;`,
      [userId, limit, offset]
    );

    return {
      files: result.rows,
      total: result.rowCount || 0,
    };
  }

  async countFiles(userId: string): Promise<number> {
    const result = await pool.query(`SELECT COUNT(*) AS count FROM files WHERE user_id=$1;`, [userId]);
    return result.rows[0].count;
  }
}

export const dbService = new DBService();
