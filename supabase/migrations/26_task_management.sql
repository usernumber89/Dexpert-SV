-- ============================================================
-- MIGRATION 26: Task Management (Kanban Board)
-- Tables: task_statuses, project_tasks, task_comments
-- ============================================================

-- ============================================================
-- 1. TASK STATUSES (per project)
-- ============================================================
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#38A3F1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_statuses_project ON task_statuses(project_id);

-- ============================================================
-- 2. PROJECT TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID NOT NULL REFERENCES task_statuses(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  position REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_position ON project_tasks(project_id, status_id, position);

-- ============================================================
-- 3. TASK COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

-- ============================================================
-- 4. FUNCTION: Initialize default statuses for a project
-- ============================================================
CREATE OR REPLACE FUNCTION initialize_project_task_statuses()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_statuses (project_id, name, color, position) VALUES
    (NEW.id, 'Por hacer', '#93B8D4', 0),
    (NEW.id, 'En progreso', '#38A3F1', 1),
    (NEW.id, 'En revisión', '#D97706', 2),
    (NEW.id, 'Completado', '#1D9E75', 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. TRIGGER: Auto-create statuses when a project is created
-- ============================================================
DROP TRIGGER IF EXISTS trg_initialize_project_task_statuses ON projects;
CREATE TRIGGER trg_initialize_project_task_statuses
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION initialize_project_task_statuses();

-- ============================================================
-- 6. Initialize statuses for EXISTING active/completed projects
-- ============================================================
INSERT INTO task_statuses (project_id, name, color, position)
SELECT
  p.id, s.name, s.color, s.position
FROM projects p
CROSS JOIN (
  VALUES
    ('Por hacer', '#93B8D4', 0),
    ('En progreso', '#38A3F1', 1),
    ('En revisión', '#D97706', 2),
    ('Completado', '#1D9E75', 3)
) AS s(name, color, position)
WHERE NOT EXISTS (
  SELECT 1 FROM task_statuses ts WHERE ts.project_id = p.id
);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

-- ---- task_statuses ----
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_statuses_select_participant" ON task_statuses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM applications WHERE project_id = task_statuses.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
  );

CREATE POLICY "task_statuses_insert_pyme" ON task_statuses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
  );

CREATE POLICY "task_statuses_update_pyme" ON task_statuses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
  );

CREATE POLICY "task_statuses_delete_pyme" ON task_statuses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
  );

-- ---- project_tasks ----
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_select_participant" ON project_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM applications WHERE project_id = project_tasks.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
  );

CREATE POLICY "project_tasks_insert_participant" ON project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM applications WHERE project_id = project_tasks.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
  );

CREATE POLICY "project_tasks_update_participant" ON project_tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
    OR
    EXISTS (SELECT 1 FROM applications WHERE project_id = project_tasks.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
  );

CREATE POLICY "project_tasks_delete_own_or_pyme" ON project_tasks
  FOR DELETE USING (
    created_by = auth.uid()
    OR
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid()))
  );

-- ---- task_comments ----
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_select_participant" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN projects p ON p.id = pt.project_id
      WHERE pt.id = task_comments.task_id
      AND (
        p.pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM applications WHERE project_id = pt.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
      )
    )
  );

CREATE POLICY "task_comments_insert_participant" ON task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_tasks pt
      JOIN projects p ON p.id = pt.project_id
      WHERE pt.id = task_id
      AND (
        p.pyme_id IN (SELECT id FROM pymes WHERE user_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM applications WHERE project_id = pt.project_id AND student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) AND status IN ('ACCEPTED', 'COMPLETED'))
      )
    )
  );

CREATE POLICY "task_comments_delete_own" ON task_comments
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- 8. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;

ALTER TABLE project_tasks REPLICA IDENTITY FULL;
ALTER TABLE task_comments REPLICA IDENTITY FULL;
