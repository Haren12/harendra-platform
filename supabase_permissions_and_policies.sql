-- =======================================================================
-- BILINGUAL ENTERPRISE TECHNOLOGY PLATFORM - SUPABASE DATABASE PATCH
-- Author: Harendra Lamsal
-- Description: Grants robust privileges, handles Row Level Security (RLS) 
--              dynamically, and creates recursion-safe policies.
-- Instructions: Copy and run this entire script in your Supabase SQL Editor.
-- =======================================================================

-- 1. RECURSION-SAFE IS_SUPER_ADMIN FUNCTION
-- Declared as SECURITY DEFINER to bypass RLS policies and completely prevent 42P17 Infinite Recursion errors on user_roles lookup.
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- We query raw user_roles. Since it is run as SECURITY DEFINER (postgres/owner), RLS won't recurse.
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'Super_Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. DYNAMIC SCHEMAS, TABLES AND PRIVILEGES GRANTS
-- Safely grants permissions across all currently existing tables to prevent 42501 (Permission Denied) errors.
DO $$
DECLARE
  r RECORD;
BEGIN
  -- A. Grant schema usage
  EXECUTE 'GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role';

  -- B. Dynamically grant privileges for all BASE TABLES that currently exist in the database
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE 'GRANT SELECT ON public.' || quote_ident(r.table_name) || ' TO anon';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.' || quote_ident(r.table_name) || ' TO authenticated';
    EXECUTE 'GRANT ALL PRIVILEGES ON public.' || quote_ident(r.table_name) || ' TO service_role, postgres';
  END LOOP;

  -- C. Dynamically grant privileges for all SEQUENCES that currently exist
  FOR r IN 
    SELECT sequence_name 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE 'GRANT ALL PRIVILEGES ON public.' || quote_ident(r.sequence_name) || ' TO postgres, service_role, authenticated, anon';
  END LOOP;
END$$;


-- 3. SPECIFIC PRIVILEGES FOR ANONYMOUS OPERATIONS
-- Supports guest/public comments and newsletter subscription workflows.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    GRANT INSERT ON public.comments TO anon;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    GRANT INSERT ON public.newsletter_subscribers TO anon;
  END IF;
END$$;


-- 4. DYNAMIC ROW LEVEL SECURITY ENABLER
-- Safely enables Row Level Security (RLS) on core tables only if they exist.
DO $$
DECLARE
  t_names text[] := ARRAY['users', 'profiles', 'user_roles', 'news_articles', 'blog_posts', 'comments', 'tutorials', 'projects', 'certificates'];
  t_name text;
BEGIN
  FOREACH t_name IN ARRAY t_names LOOP
    IF EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t_name
    ) THEN
      EXECUTE 'ALTER TABLE public.' || quote_ident(t_name) || ' ENABLE ROW LEVEL SECURITY';
    END IF;
  END LOOP;
END$$;


-- 5. DEFINE ROW LEVEL SECURITY POLICIES (DYNAMIC AND RECURSION-SAFE)
DO $$
BEGIN
  -- A. Blog Posts Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
    DROP POLICY IF EXISTS "Public select blogs" ON public.blog_posts;
    DROP POLICY IF EXISTS "Admins full access blogs" ON public.blog_posts;
    DROP POLICY IF EXISTS "Anyone can view blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Anyone can insert blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Anyone can update blog posts" ON public.blog_posts;
    DROP POLICY IF EXISTS "Anyone can delete blog posts" ON public.blog_posts;

    CREATE POLICY "Anyone can view blog posts" ON public.blog_posts FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update blog posts" ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Anyone can delete blog posts" ON public.blog_posts FOR DELETE USING (true);
  END IF;

  -- B. News Articles Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_articles') THEN
    DROP POLICY IF EXISTS "Public select news" ON public.news_articles;
    DROP POLICY IF EXISTS "Admins full access news" ON public.news_articles;
    DROP POLICY IF EXISTS "Anyone can view news articles" ON public.news_articles;
    DROP POLICY IF EXISTS "Anyone can insert news articles" ON public.news_articles;
    DROP POLICY IF EXISTS "Anyone can update news articles" ON public.news_articles;
    DROP POLICY IF EXISTS "Anyone can delete news articles" ON public.news_articles;

    CREATE POLICY "Anyone can view news articles" ON public.news_articles FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert news articles" ON public.news_articles FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update news articles" ON public.news_articles FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Anyone can delete news articles" ON public.news_articles FOR DELETE USING (true);
  END IF;

  -- C. Tutorials Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tutorials') THEN
    DROP POLICY IF EXISTS "Public select tutorials" ON public.tutorials;
    DROP POLICY IF EXISTS "Admins full access tutorials" ON public.tutorials;

    CREATE POLICY "Public select tutorials" ON public.tutorials FOR SELECT USING (true);
    CREATE POLICY "Admins full access tutorials" ON public.tutorials FOR ALL TO authenticated USING (true);
  END IF;

  -- D. Projects Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    DROP POLICY IF EXISTS "Public select projects" ON public.projects;
    DROP POLICY IF EXISTS "Admins full access projects" ON public.projects;

    CREATE POLICY "Public select projects" ON public.projects FOR SELECT USING (true);
    CREATE POLICY "Admins full access projects" ON public.projects FOR ALL TO authenticated USING (true);
  END IF;

  -- E. Certificates Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificates') THEN
    DROP POLICY IF EXISTS "Public select certificates" ON public.certificates;
    DROP POLICY IF EXISTS "Admins full access certificates" ON public.certificates;

    CREATE POLICY "Public select certificates" ON public.certificates FOR SELECT USING (true);
    CREATE POLICY "Admins full access certificates" ON public.certificates FOR ALL TO authenticated USING (true);
  END IF;

  -- F. Comments Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
    DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
    DROP POLICY IF EXISTS "Admins full access comments" ON public.comments;
    DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
    DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
    DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;

    CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can update comments" ON public.comments FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Anyone can delete comments" ON public.comments FOR DELETE USING (true);
  END IF;

  -- G. User Roles Policies (RECURSION-SAFE via SELECT USING true and INSERT/UPDATE/DELETE using SECURITY DEFINER function)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Super Admins can manage all roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Super Admins can insert roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Super Admins can update roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Super Admins can delete roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins have full access" ON public.user_roles;
    DROP POLICY IF EXISTS "Anyone can view user_roles" ON public.user_roles;

    CREATE POLICY "Anyone can view user_roles" ON public.user_roles FOR SELECT USING (true);
    CREATE POLICY "Super Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
    CREATE POLICY "Super Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid()));
    CREATE POLICY "Super Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
  END IF;

  -- H. Users Policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own row" ON public.users;
    DROP POLICY IF EXISTS "Super Admins can manage all users" ON public.users;
    DROP POLICY IF EXISTS "Super Admins can insert users" ON public.users;
    DROP POLICY IF EXISTS "Super Admins can update users" ON public.users;
    DROP POLICY IF EXISTS "Super Admins can delete users" ON public.users;

    CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
    CREATE POLICY "Users can update their own row" ON public.users FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Super Admins can insert users" ON public.users FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
    CREATE POLICY "Super Admins can update users" ON public.users FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid()));
    CREATE POLICY "Super Admins can delete users" ON public.users FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
  END IF;
END$$;


-- 6. DEFAULT PRIVILEGES FOR ALL FUTURE CREATED TABLES
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres, service_role, authenticated, anon;
