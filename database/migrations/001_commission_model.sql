-- Migration 001: Commission-only model + Skill Composer fields
-- Run in Supabase SQL editor after the base schema.sql

-- 1. Add cross-platform and composer fields to skills
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS input_schema    TEXT,
  ADD COLUMN IF NOT EXISTS output_schema   TEXT,
  ADD COLUMN IF NOT EXISTS compatible_runtimes TEXT[] DEFAULT '{}';

-- 2. Everyone can list — change default role from 'buyer' to 'seller'
--    and expand the role constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('seller', 'admin'));

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'seller';

-- Backfill existing buyers to seller (commission model, no gating)
UPDATE public.profiles SET role = 'seller' WHERE role = 'buyer';

-- 3. Drop subscription tables (no longer used)
--    Comment these out if you want to keep historical data.
-- DROP TABLE IF EXISTS public.seller_subscriptions;
-- DROP TABLE IF EXISTS public.subscription_tiers;

-- 4. Index for runtime filter queries
CREATE INDEX IF NOT EXISTS idx_skills_runtimes
  ON public.skills USING GIN (compatible_runtimes);

-- 5. Skill Composer tables (Lab → Wiring → Test → Deployed)
CREATE TABLE IF NOT EXISTS public.compositions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  mode        TEXT NOT NULL CHECK (mode IN ('sequential', 'selective', 'layered', 'synthesized')),
  state       TEXT NOT NULL DEFAULT 'lab' CHECK (state IN ('lab', 'wiring', 'test', 'deployed')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.composition_skills (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  composition_id  UUID REFERENCES public.compositions(id) ON DELETE CASCADE NOT NULL,
  skill_id        UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  position        INTEGER NOT NULL DEFAULT 0,
  input_mapping   JSONB,
  output_mapping  JSONB,
  UNIQUE (composition_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.composition_test_results (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  composition_id  UUID REFERENCES public.compositions(id) ON DELETE CASCADE NOT NULL,
  prompt          TEXT NOT NULL,
  component_scores JSONB,
  composed_score  JSONB,
  passed          BOOLEAN NOT NULL DEFAULT false,
  tested_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for composer tables
ALTER TABLE public.compositions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composition_skills      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composition_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own compositions"
  ON public.compositions
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users manage composition skills"
  ON public.composition_skills
  USING (EXISTS (
    SELECT 1 FROM public.compositions
    WHERE id = composition_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Users view composition tests"
  ON public.composition_test_results
  USING (EXISTS (
    SELECT 1 FROM public.compositions
    WHERE id = composition_id AND owner_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compositions_owner
  ON public.compositions(owner_id);

CREATE INDEX IF NOT EXISTS idx_composition_skills_comp
  ON public.composition_skills(composition_id);
