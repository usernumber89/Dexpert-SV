  -- ============================================================
  -- FEATURES PREMIUM PARA PYME
  -- ============================================================

  -- 1. Proyectos destacados (is_featured)
  ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

  -- 2. Talent pool / estudiantes guardados por PYME
  CREATE TABLE IF NOT EXISTS saved_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pyme_id UUID NOT NULL REFERENCES pymes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pyme_id, student_id)
  );

  ALTER TABLE saved_students ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "PYMEs can manage their saved students"
    ON saved_students FOR ALL
    USING (pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
    WITH CHECK (pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()));

  -- 3. Vista de match score entre proyectos y estudiantes (para analítica)
  CREATE TABLE IF NOT EXISTS project_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    total_views INTEGER NOT NULL DEFAULT 0,
    total_applications INTEGER NOT NULL DEFAULT 0,
    avg_student_score DECIMAL(5,2) DEFAULT 0,
    avg_completion_time_days DECIMAL(8,2),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "PYMEs can view analytics of their projects"
    ON project_analytics FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())));

  -- Trigger function to update project_analytics on application changes
  CREATE OR REPLACE FUNCTION update_project_analytics()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO project_analytics (project_id, total_applications, updated_at)
    VALUES (
      NEW.project_id,
      (SELECT COUNT(*) FROM applications WHERE project_id = NEW.project_id),
      now()
    )
    ON CONFLICT (project_id) DO UPDATE SET
      total_applications = (SELECT COUNT(*) FROM applications WHERE project_id = NEW.project_id),
      updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trigger_update_project_analytics ON applications;
  CREATE TRIGGER trigger_update_project_analytics
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_project_analytics();

  -- 4. Inicializar project_analytics para proyectos existentes
  INSERT INTO project_analytics (project_id, total_applications, updated_at)
  SELECT
    p.id,
    (SELECT COUNT(*) FROM applications WHERE project_id = p.id),
    now()
  FROM projects p
  WHERE NOT EXISTS (SELECT 1 FROM project_analytics WHERE project_id = p.id);
