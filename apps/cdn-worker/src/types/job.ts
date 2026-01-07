export enum JobType {
  PROCESS_FILE = "process_file",
  DELETE_FILE = "delete_file",
}

export type ProcessFileJob = {
  jobId: string;
  type: JobType.PROCESS_FILE;
  fileId: string;
  storageKey: string;
  requestedSizes: number[];
  userId: string;
};

export type DeleteFileJob = {
  jobId: string;
  type: JobType.DELETE_FILE;
  fileId: string;
  userId: string;
};

export type Job = {
  job_id: string;
  job_type: JobType;
  status: string;
  attempt_count: number;
  max_attempts: number;
  last_error: string | null;
  last_error_type: string | null;
  created_at: Date;
  updated_at: Date;
  locked_at: Date | null;
}
