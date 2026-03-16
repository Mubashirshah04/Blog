-- =============================================
-- Digital Info Blog - Supabase Database Setup
-- Ye SQL Supabase Dashboard > SQL Editor mein run karein
-- =============================================

-- 1. Profiles table (admin role ke liye)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile jab naya user sign up kare
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'trash')),
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories insert karein
INSERT INTO categories (name, slug) VALUES
  ('AI Tools', 'ai-tools'),
  ('Finance', 'finance'),
  ('Crypto', 'crypto'),
  ('Tech News', 'tech-news'),
  ('Mobile Apps', 'mobile-apps'),
  ('Online Earning', 'online-earning'),
  ('Cricket News', 'cricket-news')
ON CONFLICT (slug) DO NOTHING;

-- 4. Row Level Security (RLS) enable karein
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts policies (published posts sabko dikhen)
CREATE POLICY "Published posts are public" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin can do everything on posts" ON posts
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies (sabko read)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON categories
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- ADMIN USER BANANE KE BAAD:
-- Supabase > Authentication > Users mein jaake
-- apna admin email se user banayein, phir yeh SQL run karein:
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'aapka-email@example.com';
-- =============================================
