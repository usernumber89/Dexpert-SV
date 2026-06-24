  -- ============================================================
  -- SISTEMA DE VISTAS DE PROYECTOS
  -- ============================================================

  -- Asegurar unique constraint para que ON CONFLICT funcione
  ALTER TABLE project_analytics
  DROP CONSTRAINT IF EXISTS project_analytics_project_id_unique;

  ALTER TABLE project_analytics
  ADD CONSTRAINT project_analytics_project_id_unique UNIQUE (project_id);

  -- Función para incrementar vistas atómicamente
  CREATE OR REPLACE FUNCTION increment_project_views(p_project_id UUID)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    INSERT INTO project_analytics (project_id, total_views, total_applications, updated_at)
    VALUES (p_project_id, 1, 0, now())
    ON CONFLICT (project_id) DO UPDATE SET
      total_views = project_analytics.total_views + 1,
      updated_at = now();
  END;
  $$;

  -- También arreglar la función existente de aplicaciones por si acaso
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
