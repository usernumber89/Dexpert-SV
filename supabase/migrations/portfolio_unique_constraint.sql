-- ============================================================
-- Asegura que cada estudiante tenga solo una entrada por proyecto
-- Previene duplicados cuando múltiples estudiantes son aceptados
-- en el mismo proyecto (el constraint anterior solo cubría
-- source_id + source_type, sin student_id).
-- ============================================================

-- Eliminar constraint anterior si existe (solo source_id + source_type)
ALTER TABLE portfolio_entries DROP CONSTRAINT IF EXISTS portfolio_entries_source_id_source_type_key;

-- Agregar constraint único que incluya student_id
ALTER TABLE portfolio_entries
  ADD CONSTRAINT unique_student_project_entry
  UNIQUE (student_id, source_id, source_type);
