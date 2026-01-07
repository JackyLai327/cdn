CREATE TYPE job_status AS ENUM (
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED_RETRYABLE',
  'FAILED'
);

CREATE TABLE IF NOT EXISTS files (
  id                UUID PRIMARY KEY,
  user_id           TEXT NOT NULL,

  original_filename TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  size_bytes        BIGINT NOT NULL,

  storage_key       TEXT NOT NULL,                -- e.g. raw/123/uuid-cat.png
  status            TEXT NOT NULL,                     -- 'pending_upload', 'uploaded', 'processing', 'ready', 'failed', 'deleted'
  variants          JSONB DEFAULT '[]'::jsonb,       -- Array of variant objects .e.g. ["1280/uuid.png", "640/uuid.png"]

  visibility        TEXT NOT NULL DEFAULT 'private', -- 'public', 'private'

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  deleted_at        TIMESTAMP NULL,
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id            TEXT PRIMARY KEY,
  job_type          TEXT NOT NULL,
  status            job_status NOT NULL,
  attempt_count     INT NOT NULL DEFAULT 0,
  max_attempts      INT NOT NULL DEFAULT 3,

  last_error        TEXT NULL,
  last_error_type   TEXT NULL,

  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW(),
  locked_at         TIMESTAMPTZ NULL,
);
