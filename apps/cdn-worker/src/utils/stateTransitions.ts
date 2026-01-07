import { JobStatusType } from "../types/jobStatus.js";

export const ALLOWED_TRANSITIONS: Record<JobStatusType, JobStatusType[]> = {
  QUEUED: ["PROCESSING"],
  PROCESSING: ["COMPLETED", "FAILED_RETRYABLE", "FAILED"],
  COMPLETED: [],
  FAILED_RETRYABLE: ["PROCESSING", "FAILED"],
  FAILED: [],
}

export const assertValidTransition = (
  from: JobStatusType,
  to: JobStatusType
) => {
  if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
    throw new Error(`Invalid transition from ${from} to ${to}`)
  }
}
