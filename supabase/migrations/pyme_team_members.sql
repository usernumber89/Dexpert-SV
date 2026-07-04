CREATE TABLE IF NOT EXISTS pyme_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pyme_id UUID NOT NULL REFERENCES pymes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pyme_id, email)
);

ALTER TABLE pyme_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pyme_team_members_select_own" ON pyme_team_members
  FOR SELECT USING (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );

CREATE POLICY "pyme_team_members_insert_own" ON pyme_team_members
  FOR INSERT WITH CHECK (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );

CREATE POLICY "pyme_team_members_update_own" ON pyme_team_members
  FOR UPDATE USING (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );

CREATE POLICY "pyme_team_members_delete_own" ON pyme_team_members
  FOR DELETE USING (
    pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
  );
