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
  jobId: string;
  jobType: JobType;
  status: string;
  attemptCount: number;
  maxAttempts: number;
  lastError: string | null;
  lastErrorType: string | null;
  createdAt: Date;
  updatedAt: Date;
  lockedAt: Date | null;
}
