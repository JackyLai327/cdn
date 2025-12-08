import { z } from "zod";

export const initiateUploadSchema = z.object({
  userId: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive().max(50 * 1024 * 1024), // 50MB
})

export type InitiateUploadSchema = z.infer<typeof initiateUploadSchema>

export const completeUploadSchema = z.object({
  fileId: z.string().uuid(),
  storageKey: z.string().min(1),
  userId: z.string().min(1),
})

export type CompleteUploadSchema = z.infer<typeof completeUploadSchema>

export const fileIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export type FileIdParamsSchema = z.infer<typeof fileIdParamsSchema>

export const listFilesQuerySchema = z.object({
  userId: z.string().min(1),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type ListFilesQuerySchema = z.infer<typeof listFilesQuerySchema>
