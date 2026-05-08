-- Migration 003: Admin bypass RLS + seller earnings visibility + payout requests

-- Payout requests: sellers request withdrawal of their earnings
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  bank_details TEXT,
  notes       TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own payout requests"
  ON public.payout_requests
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins manage all payout requests"
  ON public.payout_requests
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_payout_requests_seller ON public.payout_requests(seller_id);

-- Sellers can see purchases of their own skills (needed for earnings tracking)
CREATE POLICY "Sellers view purchases of own skills"
  ON public.purchases FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR EXISTS (
      SELECT 1 FROM public.skills
      WHERE skills.id = purchases.skill_id
        AND skills.seller_id = auth.uid()
    )
  );

-- Admin bypass RLS policies
-- Allows users with role='admin' in profiles to read all data

CREATE POLICY "Admins read all skills"
  ON public.skills FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins update all skills"
  ON public.skills FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Admins read all purchases"
  ON public.purchases FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins insert purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
