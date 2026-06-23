-- ============================================================
-- INVOICES TABLE (facturación automática post-pago)
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pyme_id UUID NOT NULL REFERENCES pymes(id),
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'paid',
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can only see their own invoices
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (user_id = auth.uid());

-- Allow the webhook (service role) to insert invoices
CREATE POLICY "Service role can insert invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);
