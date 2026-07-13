-- About Me (longer bio for portfolio)
ALTER TABLE students ADD COLUMN IF NOT EXISTS about_me TEXT;

-- View counter
ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_views INTEGER NOT NULL DEFAULT 0;

-- Education entries
CREATE TABLE IF NOT EXISTS portfolio_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_education ENABLE ROW LEVEL SECURITY;

-- Work Experience entries
CREATE TABLE IF NOT EXISTS portfolio_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  tools TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;

-- Custom links
CREATE TABLE IF NOT EXISTS portfolio_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_links ENABLE ROW LEVEL SECURITY;

-- Contact messages
CREATE TABLE IF NOT EXISTS portfolio_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_messages ENABLE ROW LEVEL SECURITY;

-- RLS: students manage their own data, public can read if paid
CREATE POLICY "Students manage their education"
  ON portfolio_education FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Public can read education"
  ON portfolio_education FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE portfolio_pdf_paid = true));

CREATE POLICY "Students manage their experience"
  ON portfolio_experience FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Public can read experience"
  ON portfolio_experience FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE portfolio_pdf_paid = true));

CREATE POLICY "Students manage their links"
  ON portfolio_links FOR ALL
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Public can read links"
  ON portfolio_links FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE portfolio_pdf_paid = true));

CREATE POLICY "Anyone can insert messages"
  ON portfolio_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can read their messages"
  ON portfolio_messages FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
