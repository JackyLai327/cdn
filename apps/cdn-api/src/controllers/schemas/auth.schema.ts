import { z } from "zod";

export const devAuthSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
});

export type DevAuthSchema = z.infer<typeof devAuthSchema>;