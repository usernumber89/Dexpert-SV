CREATE TABLE IF NOT EXISTS pyme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pyme_id UUID NOT NULL REFERENCES pymes(id) ON DELETE CASCADE,
  notify_new_applicants BOOLEAN NOT NULL DEFAULT true,
  notify_project_updates BOOLEAN NOT NULL DEFAULT true,
  notify_weekly_summary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pyme_id)
);

ALTER TABLE pyme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pyme_settings_select_own" ON pyme_settings
  FOR SELECT USING (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );

CREATE POLICY "pyme_settings_insert_own" ON pyme_settings
  FOR INSERT WITH CHECK (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );

CREATE POLICY "pyme_settings_update_own" ON pyme_settings
  FOR UPDATE USING (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );
