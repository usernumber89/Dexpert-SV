-- ============================================================
-- ADD student_id TO milestones (per-student milestones)
-- ============================================================

-- 1. Add the column (nullable initially for backfill)
ALTER TABLE milestones
ADD COLUMN student_id UUID REFERENCES students(id);

-- 2. Backfill: assign milestones to the first accepted student if they exist.
--    This only affects existing data; new milestones always require student_id.
UPDATE milestones m
SET student_id = (
  SELECT a.student_id
  FROM applications a
  WHERE a.project_id = m.project_id
    AND a.status IN ('ACCEPTED', 'COMPLETED')
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE m.student_id IS NULL;

-- If no accepted application was found, assign to any student that applied
UPDATE milestones m
SET student_id = (
  SELECT a.student_id
  FROM applications a
  WHERE a.project_id = m.project_id
  ORDER BY a.created_at ASC
  LIMIT 1
)
WHERE m.student_id IS NULL;

-- 3. Make student_id NOT NULL after backfill
ALTER TABLE milestones
ALTER COLUMN student_id SET NOT NULL;

-- ============================================================
-- UPDATE RLS POLICIES for per-student milestones
-- ============================================================

-- Drop old student policies that didn't check student_id
DROP POLICY IF EXISTS "Estudiante aceptado puede ver hitos del proyecto" ON milestones;
DROP POLICY IF EXISTS "Estudiante aceptado puede enviar entregable" ON milestones;

-- Student SELECT: only milestones assigned to them
CREATE POLICY "Estudiante puede ver sus hitos"
ON milestones FOR SELECT
USING (
  milestones.student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id = milestones.student_id
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
);

-- Student UPDATE (submit deliverable): only their own milestones
CREATE POLICY "Estudiante puede enviar entregable de sus hitos"
ON milestones FOR UPDATE
USING (
  milestones.student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id = milestones.student_id
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
)
WITH CHECK (
  milestones.student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id = milestones.student_id
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
);

-- PYME INSERT: must provide a student_id that is accepted to the project
DROP POLICY IF EXISTS "PYME puede crear hitos en sus proyectos" ON milestones;

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
  AND EXISTS (
    SELECT 1 FROM applications
    WHERE applications.project_id = milestones.project_id
      AND applications.student_id = milestones.student_id
      AND applications.status IN ('ACCEPTED', 'COMPLETED')
  )
);
