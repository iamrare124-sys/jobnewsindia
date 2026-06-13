-- ============================================================
-- JobNewsIndia — Supabase Schema
-- Matches your EXACT existing table structure
-- Run ONLY the ALTER TABLE section if table already exists
-- ============================================================

-- ── Option A: Fresh install (table does not exist yet) ────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id                uuid          NOT NULL DEFAULT gen_random_uuid(),
  slug              TEXT          NOT NULL,
  title             TEXT          NOT NULL,
  excerpt           TEXT,
  content           TEXT          NOT NULL,   -- stored as JSON string
  category          TEXT          NOT NULL,
  tags              TEXT[]        DEFAULT '{}'::text[],
  cover_image       TEXT,
  cover_image_alt   TEXT,
  author_name       TEXT,
  author_title      TEXT,
  meta_title        TEXT,
  meta_description  TEXT,
  schema_json       JSONB,
  live_data         JSONB,
  faq               JSONB,
  reading_time      INTEGER       DEFAULT 5,
  word_count        INTEGER       DEFAULT 800,
  ai_score          INTEGER       DEFAULT 8,
  published         BOOLEAN       DEFAULT true,
  tweeted           BOOLEAN       DEFAULT false,
  source_url        TEXT,
  source_headline   TEXT,
  created_at        TIMESTAMPTZ   DEFAULT now(),
  updated_at        TIMESTAMPTZ   DEFAULT now(),
  site_name         TEXT          DEFAULT 'jobnewsindia',
  published_at      TIMESTAMPTZ   DEFAULT now(),
  views             INTEGER       DEFAULT 0,
  CONSTRAINT posts_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ── Option B: Table already exists — run just these ALTER statements ──────────
-- These are safe to run even if columns already exist (IF NOT EXISTS)

-- Add site_name if missing (critical for multi-site)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'jobnewsindia';

-- Add any other columns that may be missing
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS published_at   TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS views          INTEGER     DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS faq            JSONB;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS live_data      JSONB;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS word_count     INTEGER     DEFAULT 800;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS ai_score       INTEGER     DEFAULT 8;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_title   TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cover_image_alt TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tweeted        BOOLEAN     DEFAULT false;

-- ── Fix unique constraint: slug alone → (site_name, slug) ────────────────────
-- This allows same slug on different sites
-- Step 1: Drop old single-column unique constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_slug_key;

-- Step 2: Add composite unique index
CREATE UNIQUE INDEX IF NOT EXISTS posts_site_slug_idx
  ON public.posts (site_name, slug);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug        ON public.posts USING btree (slug)         TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_category    ON public.posts USING btree (category)     TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON public.posts USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_published   ON public.posts USING btree (published)    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_posts_source_url  ON public.posts USING btree (source_url)   TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS posts_site_name_idx   ON public.posts USING btree (site_name)    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS posts_views_idx       ON public.posts USING btree (views DESC)   TABLESPACE pg_default;

-- Composite index for most common query (site + published + date)
CREATE INDEX IF NOT EXISTS posts_site_published_idx
  ON public.posts (site_name, published, created_at DESC);

-- ── Auto-update updated_at trigger ───────────────────────────────────────────
-- Only create function if it doesn't exist (your DB may already have it)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published" ON public.posts;
CREATE POLICY "Public read published"
  ON public.posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Service full access" ON public.posts;
CREATE POLICY "Service full access"
  ON public.posts FOR ALL
  USING (auth.role() = 'service_role');

-- ── Run this to verify after applying ────────────────────────────────────────
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'posts'
--   ORDER BY ordinal_position;
