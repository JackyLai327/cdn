import z from "zod";

export const getJobStatusSchema = z.object({
  jobId: z.string().uuid(),
})

export type GetJobStatusSchema = z.infer<typeof getJobStatusSchema>
