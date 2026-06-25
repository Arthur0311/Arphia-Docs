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

-- 3. Políticas de leitura (recriar sem erro se já existirem)
DROP POLICY IF EXISTS "Usuário lê próprio perfil" ON profiles;
CREATE POLICY "Usuário lê próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Editor lê todos os perfis" ON profiles;
CREATE POLICY "Editor lê todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'editor'
    )
  );

-- 4. Trigger: cria perfil automaticamente ao criar usuário
--
-- ON CONFLICT DO NOTHING: evita erro se o perfil já existir
-- EXCEPTION WHEN OTHERS: garante que uma falha no trigger nunca
--   cancele a criação do usuário (o erro fica em logs do Postgres,
--   não bloqueia o fluxo de auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Loga o erro mas não bloqueia a criação do usuário
    RAISE WARNING 'handle_new_user: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Após executar o SQL acima, crie usuários em:
--   Authentication > Users > Add user > Create new user
--
-- Para promover um usuário a editor:
-- ============================================================

-- UPDATE profiles
-- SET role = 'editor', full_name = 'Nome do Editor'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'email@exemplo.com'
-- );
