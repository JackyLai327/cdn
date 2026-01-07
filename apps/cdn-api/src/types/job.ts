export enum JobType {
  PROCESS_FILE = "process_file",
  DELETE_FILE = "delete_file",
}

export enum JobStatusEnum {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED_RETRYABLE = "FAILED_RETRYABLE",
  FAILED = "FAILED",
}
