-- Add payment tracking to certificates
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS transaction_id TEXT;
