export enum JobType {
  PROCESS_FILE = "process_file",
  DELETE_FILE = "delete_file",
}

export type ProcessFileJob = {
  type: JobType.PROCESS_FILE;
  fileId: string;
  storageKey: string;
  requestedSizes: number[];
  userId: string;
};

export type DeleteFileJob = {
  type: JobType.DELETE_FILE;
  fileId: string;
  userId: string;
};

