  -- ============================================================
  -- FIX: Faltan políticas INSERT en evaluations y student_experience
  -- ============================================================

  -- Evaluations: permitir al estudiante insertar evaluación de su propia sesión
  CREATE POLICY "Students can insert evaluations for their own sessions"
    ON evaluations FOR INSERT
    WITH CHECK (session_id IN (
      SELECT id FROM simulation_sessions
      WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    ));

  -- Student experience: permitir insertar registro de experiencia propio
  CREATE POLICY "Students can insert their own experience"
    ON student_experience FOR INSERT
    WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
