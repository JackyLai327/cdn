import { Variant } from "./variant";

export type FileMetadata = {
  id: string,
  user_id: string,
  original_filename: string,
  mime_type: string,
  size_bytes: number,
  storage_key: string,
  variants: Variant[],
  status: string,
  created_at: Date,
  updated_at: Date,
}
