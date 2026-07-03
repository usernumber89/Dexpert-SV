-- ============================================================
-- SECUENCIA ATÓMICA PARA NÚMEROS DE FACTURA
-- Previene race condition cuando múltiples webhooks corren
-- ============================================================

CREATE TABLE IF NOT EXISTS invoice_sequences (
  year INTEGER PRIMARY KEY,
  seq INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION next_invoice_number(p_year INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val INTEGER;
BEGIN
  INSERT INTO invoice_sequences (year, seq)
  VALUES (p_year, 1)
  ON CONFLICT (year) DO UPDATE SET seq = invoice_sequences.seq + 1
  RETURNING seq INTO next_val;
  RETURN next_val;
END;
$$;
