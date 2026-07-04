-- ==========================================
-- SUPABASE POSTGRESQL ENTERPRISE DATABASE SCHEMA
-- Generated for: Content Hub & Admin Portal
-- Date: 2026-07-01
-- Objective: Scalable, Normalized, Ultra-Performant & Secure
-- ==========================================

-- Enable Extensions required for UUID generation, full-text search, and cryptographic keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext"; -- Case-insensitive email strings

-- Custom Types & Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE user_role_type AS ENUM ('Super_Admin', 'Editor', 'Author', 'Journalist', 'Subscriber');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE content_status AS ENUM ('Draft', 'Review', 'Published', 'Archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_level') THEN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'upload_privacy') THEN
    CREATE TYPE upload_privacy AS ENUM ('Public', 'Private');
  END IF;
END$$;

-- ==========================================
-- 1. AUTHENTICATION & CORE USERS
-- ==========================================

-- Users Table (Hooks into Supabase auth.users or can operate stand-alone)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Profiles Table (One-to-One with users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    profile_image TEXT,
    cover_image TEXT,
    bio TEXT,
    phone VARCHAR(20),
    email CITEXT UNIQUE NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb, -- Store links like GitHub, LinkedIn, Twitter
    skills TEXT[] DEFAULT '{}',             -- Array of skill tags
    experience JSONB DEFAULT '[]'::jsonb,   -- Work/project experience records
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roles assignment
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role user_role_type DEFAULT 'Subscriber' NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Fine-grained system permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    can_write BOOLEAN DEFAULT FALSE NOT NULL,
    can_delete BOOLEAN DEFAULT FALSE NOT NULL,
    can_manage_users BOOLEAN DEFAULT FALSE NOT NULL,
    can_configure_settings BOOLEAN DEFAULT FALSE NOT NULL,
    can_trigger_backups BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- ==========================================
-- 2. TAXONOMIES & ORGANIZATION
-- ==========================================

-- Category Directory
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags Catalogue
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. CONTENT SYSTEMS
-- ==========================================

-- News Articles Table
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_en TEXT,
    title_np TEXT,
    slug VARCHAR(280) UNIQUE NOT NULL,
    summary TEXT,
    summary_en TEXT,
    summary_np TEXT,
    content TEXT NOT NULL,
    content_en TEXT,
    content_np TEXT,
    source TEXT,
    featured_image TEXT,
    gallery TEXT[] DEFAULT '{}',               -- Secondary carousel asset links
    video_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status content_status DEFAULT 'Draft' NOT NULL,
    reading_time INTEGER DEFAULT 1 NOT NULL,   -- Calculated in minutes
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    breaking_news BOOLEAN DEFAULT FALSE NOT NULL,
    trending BOOLEAN DEFAULT FALSE NOT NULL,
    language VARCHAR(10) DEFAULT 'en' NOT NULL, -- e.g. 'np', 'en'
    search_vector TSVECTOR,                     -- Integrated GIN index for search speed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status content_status DEFAULT 'Draft' NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    reading_time INTEGER DEFAULT 1 NOT NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tutorials Module
CREATE TABLE IF NOT EXISTS public.tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate', -- Beginner, Intermediate, Expert
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status content_status DEFAULT 'Draft' NOT NULL,
    reading_time INTEGER DEFAULT 5 NOT NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] DEFAULT '{}', -- Technologies array
    github_url TEXT,
    live_demo_url TEXT,
    images TEXT[] DEFAULT '{}',       -- One-to-Many nested layout strings
    status VARCHAR(50) DEFAULT 'In Progress', -- Completed, In Progress, On Hold
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    completion_date DATE,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    certificate_name VARCHAR(150) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    platform VARCHAR(100),
    credential_id VARCHAR(100),
    verification_url TEXT,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    certificate_image TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Article to Tags Many-to-Many Linking Table
CREATE TABLE IF NOT EXISTS public.article_tags (
    article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- ==========================================
-- 4. MEDIA LIBRARY & DIRECTORIES
-- ==========================================

-- Folders
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, parent_id)
);

-- Library Registry
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- image/png, video/mp4, application/pdf
    size INTEGER NOT NULL,            -- in bytes
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    storage_bucket VARCHAR(50) NOT NULL, -- e.g. 'news-images', 'avatars'
    privacy upload_privacy DEFAULT 'Public' NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. INTERACTION & SOCIAL ENGAGEMENTS
-- ==========================================

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comment Replies
CREATE TABLE IF NOT EXISTS public.comment_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, news_id),
    UNIQUE(user_id, blog_id)
);

-- Likes Registry
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, news_id),
    UNIQUE(user_id, blog_id)
);

-- Shares analytics
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'news', 'blog', 'project'
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL,     -- 'facebook', 'twitter', 'linkedin', 'copy'
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. AUDIENCE & ADVERTISING
-- ==========================================

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Advertisements Engine
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    placement VARCHAR(50) NOT NULL, -- 'sidebar', 'header', 'mid-article'
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    impressions INTEGER DEFAULT 0 NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' NOT NULL, -- 'Active', 'Paused', 'Ended'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. SEO METADATA & ROUTING
-- ==========================================

-- SEO Metadata
CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    title VARCHAR(100),
    description VARCHAR(255),
    keywords TEXT,
    og_image TEXT,
    canonical_url TEXT
);

-- Redirect Router (Enterprise URL Manager)
CREATE TABLE IF NOT EXISTS public.redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url VARCHAR(255) UNIQUE NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    status_code INTEGER DEFAULT 301 NOT NULL, -- 301 or 302
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. ANALYTICS & MONITORING
-- ==========================================

-- Page Views (High-Performance Time-Series log)
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(255) NOT NULL,
    referrer TEXT,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Article Views Tracker (Used for Popular Trending Engine)
CREATE TABLE IF NOT EXISTS public.article_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
    blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily/Hourly Visitor Statistics cache
CREATE TABLE IF NOT EXISTS public.visitor_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    total_views INTEGER DEFAULT 0 NOT NULL,
    unique_visitors INTEGER DEFAULT 0 NOT NULL,
    avg_duration_seconds INTEGER DEFAULT 0 NOT NULL,
    bounce_rate REAL DEFAULT 0.0 NOT NULL
);

-- ==========================================
-- 9. NOTIFICATIONS & SETTINGS
-- ==========================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    type VARCHAR(50) DEFAULT 'system' NOT NULL, -- 'system', 'comment', 'breaking'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Website Global Settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 10. SYSTEM & COMPLIANCE LOGS
-- ==========================================

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email CITEXT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Login History (Cybersecurity gate)
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    device VARCHAR(100),
    browser VARCHAR(100),
    country VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'blocked'
    reason VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System Backups Registers
CREATE TABLE IF NOT EXISTS public.backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_name VARCHAR(150) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'Success' NOT NULL, -- 'Success', 'Pending', 'Failed'
    file_url TEXT NOT NULL,
    is_manual BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- INDEXING STRATEGY
-- ==========================================
-- Optimize all slug columns (Ensuring O(1) url lookup routing)
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- Optimize date queries (Sorting timelines)
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON public.news_articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news_articles(status);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blog_posts(status);

-- Optimize foreign key joins
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_news_author ON public.news_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_news ON public.comments(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_blog ON public.comments(blog_id);

-- GIN index for fast JSONB querying inside profiles
CREATE INDEX IF NOT EXISTS idx_profiles_social_links ON public.profiles USING gin (social_links);
CREATE INDEX IF NOT EXISTS idx_profiles_experience ON public.profiles USING gin (experience);


-- ==========================================
-- FULL TEXT SEARCH ENGINE (fts_vector)
-- ==========================================

-- 1. Function to trigger Full-Text Vector Compilation for News
CREATE OR REPLACE FUNCTION public.news_generate_fts_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_news_fts_update ON public.news_articles;
CREATE TRIGGER tr_news_fts_update
    BEFORE INSERT OR UPDATE OF title, summary, content ON public.news_articles
    FOR EACH ROW EXECUTE FUNCTION public.news_generate_fts_vector();


-- 2. GIN Index on Full-Text Vectors for multi-million record index traversal
CREATE INDEX IF NOT EXISTS idx_news_search_vector ON public.news_articles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_blogs_search_vector ON public.blog_posts USING gin(search_vector);


-- ==========================================
-- DATABASE FUNCTIONS
-- ==========================================

-- Function: Generate Slug automatically from arbitrary title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slugified TEXT;
BEGIN
  slugified := lower(title);
  slugified := regexp_replace(slugified, '[^a-z0-9\s-]', '', 'g'); -- remove special characters
  slugified := regexp_replace(slugified, '\s+', '-', 'g');       -- replace whitespaces with dashes
  slugified := regexp_replace(slugified, '-+', '-', 'g');        -- shrink consecutive dashes
  slugified := trim(both '-' from slugified);
  RETURN slugified;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function: Calculate Reading Time (Standard 200 Words Per Minute metric)
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  minutes INTEGER;
BEGIN
  word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
  minutes := ceil(word_count::real / 200.0);
  IF minutes < 1 THEN
    minutes := 1;
  END IF;
  RETURN minutes;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function: Increment Views atomically safely
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.article_views (news_id, viewed_at)
  VALUES (article_id, timezone('utc'::text, now()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: Calculate Trending Score (Logarithmic decay based on age and views)
-- trending_score = views / (hours_since_published + 2)^1.5
CREATE OR REPLACE FUNCTION public.get_trending_score(article_id UUID)
RETURNS REAL AS $$
DECLARE
  v_views INTEGER;
  v_hours NUMERIC;
  score REAL;
BEGIN
  SELECT count(*) INTO v_views FROM public.article_views WHERE news_id = article_id;
  SELECT EXTRACT(EPOCH FROM (now() - publish_date))/3600.0 INTO v_hours 
    FROM public.news_articles WHERE id = article_id;
    
  score := v_views::real / power((coalesce(v_hours, 0) + 2.0), 1.5);
  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function: Article Search using Full-Text search GIN index
CREATE OR REPLACE FUNCTION public.search_articles(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  summary TEXT,
  publish_date TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id, 
    n.title, 
    n.slug, 
    n.summary, 
    n.publish_date,
    ts_rank_cd(n.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM public.news_articles n
  WHERE n.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, n.publish_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;


-- ==========================================
-- DATABASE TRIGGERS
-- ==========================================

-- Trigger function: Update automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to dynamic tables
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_news_updated_at ON public.news_articles;
CREATE TRIGGER tr_news_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS tr_blogs_updated_at ON public.blog_posts;
CREATE TRIGGER tr_blogs_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Trigger function: Automatically generate slugs & reading times on content inserts
CREATE OR REPLACE FUNCTION public.auto_content_orchestration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  NEW.reading_time := public.calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_news_slug_reading ON public.news_articles;
CREATE TRIGGER tr_news_slug_reading BEFORE INSERT ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.auto_content_orchestration();

DROP TRIGGER IF EXISTS tr_blog_slug_reading ON public.blog_posts;
CREATE TRIGGER tr_blog_slug_reading BEFORE INSERT ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.auto_content_orchestration();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper function to check if a user is a Super Admin safely (using SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'Super_Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Anyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- User can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. News Articles Policies
-- Clean up existing policies to prevent conflicts
DROP POLICY IF EXISTS "Anyone can view published news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Admins and Editors have full access on news" ON public.news_articles;
DROP POLICY IF EXISTS "Authors can write and view their own articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can view news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can insert news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can update news articles" ON public.news_articles;
DROP POLICY IF EXISTS "Anyone can delete news articles" ON public.news_articles;

CREATE POLICY "Anyone can view news articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert news articles" ON public.news_articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update news articles" ON public.news_articles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete news articles" ON public.news_articles FOR DELETE USING (true);

-- 3. Blog Posts Policies
DROP POLICY IF EXISTS "Anyone can view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can write and view their own blogs" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can delete blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can view blog posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blog posts" ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete blog posts" ON public.blog_posts FOR DELETE USING (true);

-- 4. Comments Policies
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can edit or delete comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.comments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete comments" ON public.comments FOR DELETE USING (true);

-- 5. User Roles Policies
-- Drop existing policies to prevent conflicts
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

-- 6. Users Table Policies
-- Drop existing policies to prevent conflicts
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


-- ==========================================
-- EXPLICIT DATABASE TABLE GRANTS
-- ==========================================
-- Force permissions so service_role, anon, and authenticated never get 42501 Permission Denied errors

-- 1. Schema-level usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Table-level standard privileges (safely granting roles permissions they need)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role, postgres;

-- 3. Explicit permissions for comment inserts (anonymous commenting support if any)
GRANT INSERT ON public.comments TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;

-- 4. Sequences privileges for auto-increment keys
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- 5. Functions privileges for custom procedures
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated, anon;

-- 6. Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres, service_role, authenticated, anon;


-- ==========================================
-- SUPABASE STORAGE BUCKET SEED SCRIPT
-- ==========================================
-- Seed query to ensure standard Supabase Storage structures are configured
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('profile-covers', 'profile-covers', true),
('news-images', 'news-images', true),
('blog-images', 'blog-images', true),
('tutorial-images', 'tutorial-images', true),
('project-images', 'project-images', true),
('certificate-images', 'certificate-images', true),
('documents', 'documents', false),
('videos', 'videos', true),
('backups', 'backups', false),
('temporary-files', 'temporary-files', false)
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- SUPABASE REALTIME CONFIGURATION
-- ==========================================
-- Enable Realtime for key collaborative channels
alter publication supabase_realtime add table public.news_articles;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.visitor_statistics;
