-- Extend portfolio_entries with student-customizable content
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS custom_description TEXT;
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS tools_used JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS role_description TEXT;
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE portfolio_entries ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Allow students to pick a color theme for their public portfolio
ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_theme TEXT NOT NULL DEFAULT 'blue' CHECK (portfolio_theme IN ('blue', 'dark', 'purple', 'teal'));
