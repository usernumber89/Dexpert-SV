-- ============================================================
-- Agrega columna accepted_count a students y un trigger que la
-- mantiene sincronizada automáticamente cuando cambia el status
-- de una aplicación a ACCEPTED o desde ACCEPTED.
-- ============================================================

-- 1. Agregar columna
ALTER TABLE students ADD COLUMN IF NOT EXISTS accepted_count INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill: contar aceptaciones existentes
UPDATE students s
SET accepted_count = (
  SELECT COUNT(*)
  FROM applications a
  WHERE a.student_id = s.id AND a.status = 'ACCEPTED'
);

-- 3. Función del trigger
CREATE OR REPLACE FUNCTION sync_accepted_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se inserta una aplicación ACCEPTED
  IF TG_OP = 'INSERT' AND NEW.status = 'ACCEPTED' THEN
    UPDATE students SET accepted_count = accepted_count + 1
    WHERE id = NEW.student_id;

  -- Cuando se actualiza el status
  ELSIF TG_OP = 'UPDATE' THEN
    -- De ACCEPTED a otro status → decrementar
    IF OLD.status = 'ACCEPTED' AND NEW.status != 'ACCEPTED' THEN
      UPDATE students SET accepted_count = GREATEST(accepted_count - 1, 0)
      WHERE id = NEW.student_id;

    -- De otro status a ACCEPTED → incrementar
    ELSIF OLD.status != 'ACCEPTED' AND NEW.status = 'ACCEPTED' THEN
      UPDATE students SET accepted_count = accepted_count + 1
      WHERE id = NEW.student_id;
    END IF;

  -- Cuando se elimina una aplicación ACCEPTED
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACCEPTED' THEN
    UPDATE students SET accepted_count = GREATEST(accepted_count - 1, 0)
    WHERE id = OLD.student_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger (se ejecuta después de INSERT/UPDATE/DELETE)
DROP TRIGGER IF EXISTS trigger_sync_accepted_count ON applications;
CREATE TRIGGER trigger_sync_accepted_count
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION sync_accepted_count();
