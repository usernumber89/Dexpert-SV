-- ============================================================
-- HABILITAR RLS EN milestones (si no lo está ya)
-- ============================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. SELECT: PYME dueña del proyecto O estudiante aceptado
-- ============================================================
CREATE POLICY "PYME puede ver hitos de sus proyectos"
ON milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = milestones.project_id
      AND projects.pyme_id IN (
        SELECT id FROM pymes WHERE user_id = auth.uid()
      )
  )
);

CREATE POLICY "Estudiante aceptado puede ver hitos del proyecto"
ON milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
      )
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
);

-- ============================================================
-- 2. INSERT: Solo la PYME dueña del proyecto
-- ============================================================
CREATE POLICY "PYME puede crear hitos en sus proyectos"
ON milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = milestones.project_id
      AND projects.pyme_id IN (
        SELECT id FROM pymes WHERE user_id = auth.uid()
      )
  )
);

-- ============================================================
-- 3. UPDATE:
--    - Estudiante aceptado puede subir entregable (deliverable_url, status -> IN_REVIEW)
--    - PYME puede aprobar/rechazar (status, feedback)
-- ============================================================
CREATE POLICY "Estudiante aceptado puede enviar entregable"
ON milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
      )
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
)
WITH CHECK (
  -- Solo permite cambiar deliverable_url y status -> IN_REVIEW
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
      )
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
);

CREATE POLICY "PYME puede revisar hitos de sus proyectos"
ON milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = milestones.project_id
      AND projects.pyme_id IN (
        SELECT id FROM pymes WHERE user_id = auth.uid()
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = milestones.project_id
      AND projects.pyme_id IN (
        SELECT id FROM pymes WHERE user_id = auth.uid()
      )
  )
);
