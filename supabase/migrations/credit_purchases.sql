-- ============================================================
-- CREDIT PURCHASES TABLE (historial de compras de créditos)
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pyme_id UUID NOT NULL,
  plan TEXT NOT NULL,
  stripe_id TEXT NOT NULL,
  credits_granted INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own credit purchases
CREATE POLICY "Users can view their own credit purchases"
  ON credit_purchases FOR SELECT
  USING (user_id = auth.uid());

-- Allow the webhook (service role) to insert credit purchases
CREATE POLICY "Service role can insert credit purchases"
  ON credit_purchases FOR INSERT
  WITH CHECK (true);
