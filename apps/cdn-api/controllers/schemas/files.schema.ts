import { z } from "zod";

export const initiateUploadSchema = z.object({
  userId: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().positive().max(50 * 1024 * 1024), // 50MB
})

export type InitiateUploadSchema = z.infer<typeof initiateUploadSchema>
