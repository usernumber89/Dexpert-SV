-- Hacer que los buckets de storage sean públicos para permitir la visualización de fotos de perfil y portafolios

-- Bucket: avatars (fotos de perfil y logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket: portfolios (imágenes de galería/portafolio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket: documents (CVs y documentos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas RLS para avatars: cualquiera puede leer, solo usuarios autenticados pueden subir
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload to avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload to avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Políticas RLS para portfolios: cualquiera puede leer, solo autenticados pueden subir
DROP POLICY IF EXISTS "Public read access for portfolios" ON storage.objects;
CREATE POLICY "Public read access for portfolios"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolios');

DROP POLICY IF EXISTS "Authenticated users can upload to portfolios" ON storage.objects;
CREATE POLICY "Authenticated users can upload to portfolios"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'portfolios' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own portfolio" ON storage.objects;
CREATE POLICY "Users can update own portfolio"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'portfolios' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own portfolio" ON storage.objects;
CREATE POLICY "Users can delete own portfolio"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'portfolios' AND auth.role() = 'authenticated');

-- Políticas RLS para documents: cualquiera puede leer, solo autenticados pueden subir
DROP POLICY IF EXISTS "Public read access for documents" ON storage.objects;
CREATE POLICY "Public read access for documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Authenticated users can upload to documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload to documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
