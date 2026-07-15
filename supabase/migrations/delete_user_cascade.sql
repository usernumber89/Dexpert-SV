-- =============================================================================
-- Safe user deletion with full cascade cleanup
-- Run this from Supabase SQL editor or call via rpc('delete_user_cascade', { ... })
-- Required because auth.users has FK constraints from public tables
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_user_cascade(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_id_var UUID;
  pyme_id_var UUID;
BEGIN
  -- Only admins or service_role can delete users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  -- Get the student & pyme record IDs for this user
  SELECT id INTO student_id_var FROM students WHERE user_id = target_user_id;
  SELECT id INTO pyme_id_var FROM pymes WHERE user_id = target_user_id;

  -- =============================================
  -- 1. Delete STUDENT-related data
  -- =============================================
  IF student_id_var IS NOT NULL THEN
    DELETE FROM applications WHERE student_id = student_id_var;
    DELETE FROM saved_students WHERE student_id = student_id_var;
    DELETE FROM premium_features WHERE student_id = student_id_var;
    DELETE FROM professional_levels WHERE student_id = student_id_var;
    DELETE FROM simulation_sessions WHERE student_id = student_id_var;
    DELETE FROM portfolio_links WHERE student_id = student_id_var;
    DELETE FROM portfolio_education WHERE student_id = student_id_var;
    DELETE FROM portfolio_experience WHERE student_id = student_id_var;
    DELETE FROM portfolio_entries WHERE student_id = student_id_var;
    DELETE FROM portfolio_messages WHERE student_id = student_id_var;
    DELETE FROM student_experience WHERE student_id = student_id_var;
    DELETE FROM credit_purchases WHERE student_id = student_id_var;
    DELETE FROM certificates WHERE student_id = student_id_var;
    DELETE FROM evaluations WHERE student_id = student_id_var;
    DELETE FROM experience_levels WHERE student_id = student_id_var;
    DELETE FROM milestones WHERE student_id = student_id_var;
    DELETE FROM students WHERE id = student_id_var;
  END IF;

  -- =============================================
  -- 2. Delete PYME-related data
  -- =============================================
  IF pyme_id_var IS NOT NULL THEN
    -- Delete project-related data first
    DELETE FROM task_comments WHERE task_id IN (
      SELECT id FROM project_tasks WHERE project_id IN (
        SELECT id FROM projects WHERE pyme_id = pyme_id_var
      )
    );
    DELETE FROM project_tasks WHERE project_id IN (
      SELECT id FROM projects WHERE pyme_id = pyme_id_var
    );
    DELETE FROM task_statuses WHERE project_id IN (
      SELECT id FROM projects WHERE pyme_id = pyme_id_var
    );
    DELETE FROM project_analytics WHERE project_id IN (
      SELECT id FROM projects WHERE pyme_id = pyme_id_var
    );
    DELETE FROM applications WHERE project_id IN (
      SELECT id FROM projects WHERE pyme_id = pyme_id_var
    );
    DELETE FROM projects WHERE pyme_id = pyme_id_var;

    DELETE FROM saved_students WHERE pyme_id = pyme_id_var;
    DELETE FROM premium_features WHERE pyme_id = pyme_id_var;
    DELETE FROM pyme_team_members WHERE pyme_id = pyme_id_var;
    DELETE FROM pyme_settings WHERE pyme_id = pyme_id_var;
    DELETE FROM invoices WHERE pyme_id = pyme_id_var;
    DELETE FROM milestones WHERE pyme_id = pyme_id_var;
    DELETE FROM pymes WHERE id = pyme_id_var;
  END IF;

  -- =============================================
  -- 3. Delete common/shared data
  -- =============================================
  DELETE FROM notifications WHERE user_id = target_user_id;
  IF student_id_var IS NOT NULL THEN
    DELETE FROM change_requests WHERE student_id = student_id_var;
  END IF;

  -- =============================================
  -- 4. Delete profile
  -- =============================================
  DELETE FROM profiles WHERE id = target_user_id;

  -- =============================================
  -- 5. Delete from auth.users
  -- =============================================
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Allow the service_role and authenticated users to call this function via RPC
GRANT EXECUTE ON FUNCTION public.delete_user_cascade TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_cascade TO authenticated;
