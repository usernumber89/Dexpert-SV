  -- ============================================================
  -- FIX: Faltan policies INSERT/UPDATE en project_analytics
  -- El trigger update_project_analytics() hace upsert después
  -- de cada INSERT/UPDATE en applications, pero RLS lo bloquea.
  -- ============================================================

  CREATE POLICY "PYMEs can insert analytics of their projects"
    ON project_analytics FOR INSERT
    WITH CHECK (project_id IN (
      SELECT id FROM projects
      WHERE pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
    ));

  CREATE POLICY "PYMEs can update analytics of their projects"
    ON project_analytics FOR UPDATE
    USING (project_id IN (
      SELECT id FROM projects
      WHERE pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
    ))
    WITH CHECK (project_id IN (
      SELECT id FROM projects
      WHERE pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
    ));
