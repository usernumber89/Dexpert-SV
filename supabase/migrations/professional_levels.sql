-- ============================================================
-- TABLAS PARA NIVEL 1: SIMULACIÓN PROFESIONAL
-- ============================================================

-- Escenarios de simulación por área profesional
CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL CHECK (area IN (
    'Desarrollo de Software', 'Diseño Gráfico', 'Marketing',
    'Administración', 'Arquitectura', 'Ingeniería', 'Otras áreas'
  )),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_personality TEXT NOT NULL,
  client_goal TEXT NOT NULL,
  brief TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]',
  constraints JSONB NOT NULL DEFAULT '[]',
  skills_required TEXT[] NOT NULL DEFAULT '{}',
  estimated_days INTEGER NOT NULL DEFAULT 14,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;

-- Estudiantes pueden leer escenarios activos
CREATE POLICY "Students can read active scenarios"
  ON simulation_scenarios FOR SELECT
  USING (is_active = true);

-- Sesiones de simulación de cada estudiante
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  scenario_id UUID NOT NULL REFERENCES simulation_scenarios(id),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'evaluated')),
  brief TEXT NOT NULL,
  objectives JSONB NOT NULL DEFAULT '[]',
  constraints JSONB NOT NULL DEFAULT '[]',
  deliverable_url TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;

-- Estudiantes pueden ver y crear sus propias sesiones
CREATE POLICY "Students can manage their own sessions"
  ON simulation_sessions FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Historial de conversación de la simulación
CREATE TABLE IF NOT EXISTS simulation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE simulation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own session messages"
  ON simulation_messages FOR SELECT
  USING (session_id IN (SELECT id FROM simulation_sessions WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

CREATE POLICY "Students can insert messages in their own sessions"
  ON simulation_messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM simulation_sessions WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

-- Solicitudes de cambio del cliente ficticio
CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage change requests of their sessions"
  ON change_requests FOR ALL
  USING (session_id IN (SELECT id FROM simulation_sessions WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())))
  WITH CHECK (session_id IN (SELECT id FROM simulation_sessions WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

-- ============================================================
-- TABLAS PARA NIVEL 2: EVALUACIÓN Y RETROALIMENTACIÓN
-- ============================================================

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  rubric JSONB NOT NULL DEFAULT '[]',
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvements TEXT[] NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own evaluations"
  ON evaluations FOR SELECT
  USING (session_id IN (SELECT id FROM simulation_sessions WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())));

-- ============================================================
-- TABLAS PARA NIVEL 3: PORTAFOLIO AUTOMÁTICO
-- ============================================================

CREATE TABLE IF NOT EXISTS portfolio_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('simulation', 'real_project')),
  source_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_demonstrated TEXT[] NOT NULL DEFAULT '{}',
  hours_invested INTEGER NOT NULL DEFAULT 0,
  results TEXT NOT NULL,
  score INTEGER,
  document_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own portfolio entries"
  ON portfolio_entries FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can read published portfolio entries"
  ON portfolio_entries FOR SELECT
  USING (is_published = true);

-- ============================================================
-- TABLAS PARA NIVEL 4: EXPERIENCIA REAL
-- ============================================================

CREATE TABLE IF NOT EXISTS student_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) UNIQUE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  total_xp INTEGER NOT NULL DEFAULT 0,
  simulations_completed INTEGER NOT NULL DEFAULT 0,
  real_projects_completed INTEGER NOT NULL DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE student_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own experience"
  ON student_experience FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Students can update their own experience"
  ON student_experience FOR UPDATE
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Niveles de experiencia: define qué se desbloquea en cada nivel
CREATE TABLE IF NOT EXISTS experience_levels (
  level INTEGER PRIMARY KEY CHECK (level >= 1 AND level <= 10),
  xp_required INTEGER NOT NULL,
  title TEXT NOT NULL,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  unlocks_real_projects BOOLEAN NOT NULL DEFAULT false
);

-- Datos iniciales de niveles
INSERT INTO experience_levels (level, xp_required, title, benefits, unlocks_real_projects) VALUES
  (1, 0, 'Novato', ARRAY['Acceso a simulaciones básicas'], false),
  (2, 100, 'Aprendiz', ARRAY['Simulaciones intermedias', 'Feedback detallado'], false),
  (3, 250, 'Practicante', ARRAY['Simulaciones avanzadas', 'Solicitudes de cambio'], false),
  (4, 500, 'Analista', ARRAY['Evaluaciones completas', 'Portafolio automático'], false),
  (5, 800, 'Especialista', ARRAY['Postulación a proyectos reales básicos'], true),
  (6, 1200, 'Senior en Formación', ARRAY['Proyectos reales intermedios', 'Prioridad en postulaciones'], true),
  (7, 1700, 'Profesional', ARRAY['Proyectos reales avanzados', 'Certificaciones premium'], true),
  (8, 2300, 'Experto', ARRAY['Proyectos premium', 'Mentoría a novatos'], true),
  (9, 3000, 'Master', ARRAY['Proyectos elite', 'Recomendaciones laborales'], true),
  (10, 4000, 'Dexpert Legend', ARRAY['Acceso completo a la plataforma', 'Badge de leyenda'], true)
ON CONFLICT (level) DO NOTHING;

ALTER TABLE experience_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read experience levels"
  ON experience_levels FOR SELECT
  USING (true);
