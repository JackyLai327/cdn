import { Variant } from "./variant";

export type FileMetadata = {
  id: string,
  userId: string,
  originalFilename: string,
  mimeType: string,
  sizeBytes: number,
  storageKey: string,
  variants: Variant[],
  status: string,
  createdAt: Date,
  updatedAt: Date,
}
