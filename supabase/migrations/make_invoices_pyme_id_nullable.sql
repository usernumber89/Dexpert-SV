-- Allow student purchases (certificates, portfolio, boost) to have invoices without a pyme_id
ALTER TABLE invoices ALTER COLUMN pyme_id DROP NOT NULL;
