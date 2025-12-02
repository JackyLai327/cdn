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
})

export type CompleteUploadSchema = z.infer<typeof completeUploadSchema>

export const fileIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export type FileIdParamsSchema = z.infer<typeof fileIdParamsSchema>