CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,

  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,

  storage_key TEXT NOT NULL,            -- e.g. raw/123/uuid-cat.png
  status TEXT NOT NULL,                 -- 'pending_upload', 'uploaded', 'processing', 'ready', 'failed'
  variants JSONB DEFAULT '[]'::jsonb,          -- Array of variant objects .e.g. ["1280/uuid.png", "640/uuid.png"]

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
