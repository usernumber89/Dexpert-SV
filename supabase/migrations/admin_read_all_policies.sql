-- Allow admins to read all data across tables used by the dashboard
-- Run this AFTER admin_dashboard.sql (must have is_admin() function)

-- INVOICES
DROP POLICY IF EXISTS "Admins can read all invoices" ON invoices;
CREATE POLICY "Admins can read all invoices"
  ON invoices FOR SELECT
  USING (is_admin());

-- PROJECTS (check if RLS is enabled first)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all projects" ON projects;
CREATE POLICY "Admins can read all projects"
  ON projects FOR SELECT
  USING (is_admin());

-- PURCHASES
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all purchases" ON purchases;
CREATE POLICY "Admins can read all purchases"
  ON purchases FOR SELECT
  USING (is_admin());

-- CREDIT PURCHASES
DROP POLICY IF EXISTS "Admins can read all credit purchases" ON credit_purchases;
CREATE POLICY "Admins can read all credit purchases"
  ON credit_purchases FOR SELECT
  USING (is_admin());

-- STUDENTS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all students" ON students;
CREATE POLICY "Admins can read all students"
  ON students FOR SELECT
  USING (is_admin());
DROP POLICY IF EXISTS "Students can insert own record" ON students;
CREATE POLICY "Students can insert own record"
  ON students FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Students can update own record" ON students;
CREATE POLICY "Students can update own record"
  ON students FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- PYMES
ALTER TABLE pymes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all pymes" ON pymes;
CREATE POLICY "Admins can read all pymes"
  ON pymes FOR SELECT
  USING (is_admin());
DROP POLICY IF EXISTS "Pymes can insert own record" ON pymes;
CREATE POLICY "Pymes can insert own record"
  ON pymes FOR INSERT
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Pymes can update own record" ON pymes;
CREATE POLICY "Pymes can update own record"
  ON pymes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- APPLICATIONS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all applications" ON applications;
CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  USING (is_admin());

-- CERTIFICATES
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all certificates" ON certificates;
CREATE POLICY "Admins can read all certificates"
  ON certificates FOR SELECT
  USING (is_admin());

-- MILESTONES
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read all milestones" ON milestones;
CREATE POLICY "Admins can read all milestones"
  ON milestones FOR SELECT
  USING (is_admin());
