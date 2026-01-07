import { JobStatus } from "../types/jobStatus.js";

export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  QUEUED: ["PROCESSING"],
  PROCESSING: ["COMPLETED", "FAILED_RETRYABLE", "FAILED"],
  COMPLETED: [],
  FAILED_RETRYABLE: ["PROCESSING", "FAILED"],
  FAILED: [],
}

export const assertValidTransition = (
  from: JobStatus,
  to: JobStatus
) => {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new Error(`Invalid transition from ${from} to ${to}`)
  }
}
