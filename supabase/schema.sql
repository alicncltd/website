-- Table for storing serialized WhatsApp sessions (ephemeral Render container bypass)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id TEXT PRIMARY KEY,
  session_data TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for caching synced catalog products
CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT DEFAULT '0',
  cloudinary_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for system logging and audit tracking
CREATE TABLE IF NOT EXISTS system_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog cached items (so the gallery page works for all visitors)
CREATE POLICY "Allow public read access to catalog items" ON catalog_items
  FOR SELECT USING (true);

-- Allow authenticated/service-role access to read/write all tables
CREATE POLICY "Allow full access for service role on whatsapp_sessions" ON whatsapp_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow full access for service role on catalog_items" ON catalog_items
  FOR ALL USING (true);

CREATE POLICY "Allow full access for service role on system_logs" ON system_logs
  FOR ALL USING (true);
