-- ============================================================
-- MIGRATION 27: Student Boost + Credit Expiry
-- ============================================================

-- Student Boost (30-day profile visibility)
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_boost_until TIMESTAMPTZ;

-- Credit expiry (12 months)
ALTER TABLE pyme_credits ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Index for boosted students (talent ordering)
CREATE INDEX IF NOT EXISTS idx_students_boost ON students(profile_boost_until DESC NULLS LAST);

-- Index for credit expiry cleanup
CREATE INDEX IF NOT EXISTS idx_pyme_credits_expiry ON pyme_credits(expires_at);
