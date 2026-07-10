-- Add payment tracking to students for portfolio download
ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_pdf_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_transaction_id TEXT;
