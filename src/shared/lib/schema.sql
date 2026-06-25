-- ============================================================
-- Arphia Docs — Database Setup
-- Execute no Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabela de perfis (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role      TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Usuário pode ler o próprio perfil
CREATE POLICY "Usuário lê próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. Editor pode ver todos os perfis
CREATE POLICY "Editor lê todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'editor'
    )
  );

-- 5. Trigger: cria perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Após executar o SQL acima:
-- 1. Vá em Authentication > Users > Add User
-- 2. Crie o usuário:
--      Email:  editor@arphia.com.br
--      Senha:  Arphia@2026!
-- 3. Execute o UPDATE abaixo para promovê-lo a editor:
-- ============================================================

-- UPDATE profiles
-- SET role = 'editor', full_name = 'Editor Arphia'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'editor@arphia.com.br'
-- );
