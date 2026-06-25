-- Habilitar RLS en profiles (si no lo está ya)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: usuario puede ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON profiles FOR SELECT
USING (id = auth.uid());

-- INSERT: usuario puede crear su propio perfil
CREATE POLICY "Usuarios pueden crear su propio perfil"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- UPDATE: usuario puede actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- DELETE: usuario puede eliminar su propio perfil
CREATE POLICY "Usuarios pueden eliminar su propio perfil"
ON profiles FOR DELETE
USING (id = auth.uid());
