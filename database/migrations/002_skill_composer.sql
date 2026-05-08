-- Migration 002: Skill Composer — admin RLS + composition_test_results INSERT policy
-- Safe to run after 001_commission_model.sql
-- The composer tables (compositions, composition_skills, composition_test_results) were
-- already created in migration 001. This migration only adds the missing INSERT policy
-- on composition_test_results and admin bypass policies.

-- Allow users to insert test results for their own compositions
-- (001 only granted SELECT via "Users view composition tests")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'composition_test_results'
      AND policyname = 'Users insert composition tests'
  ) THEN
    CREATE POLICY "Users insert composition tests"
      ON public.composition_test_results
      FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.compositions
        WHERE id = composition_id AND owner_id = auth.uid()
      ));
  END IF;
END $$;

-- Allow users to update composition_skills position (needed for drag-reorder if added later)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'composition_skills'
      AND policyname = 'Users manage composition skills write'
  ) THEN
    CREATE POLICY "Users manage composition skills write"
      ON public.composition_skills
      FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.compositions
        WHERE id = composition_id AND owner_id = auth.uid()
      ));
  END IF;
END $$;
