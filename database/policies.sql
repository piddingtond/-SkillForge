-- Row Level Security Policies
-- Phase 1: Security Rules

-- Profiles: Anyone can read, users can update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skills: Public can read approved, sellers can manage their own
CREATE POLICY "Approved skills viewable by everyone"
  ON public.skills FOR SELECT
  USING (status = 'approved' OR seller_id = auth.uid());

CREATE POLICY "Sellers can insert own skills"
  ON public.skills FOR INSERT
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own skills"
  ON public.skills FOR UPDATE
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own skills"
  ON public.skills FOR DELETE
  USING (seller_id = auth.uid());

-- Purchases: Buyers can read their own
CREATE POLICY "Buyers can view own purchases"
  ON public.purchases FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Reviews: Anyone can read, buyers who purchased can write
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can review purchased skills"
  ON public.reviews FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE buyer_id = auth.uid() AND skill_id = reviews.skill_id
    )
  );

-- Seller Subscriptions: Sellers can view their own
CREATE POLICY "Sellers can view own subscription"
  ON public.seller_subscriptions FOR SELECT
  USING (seller_id = auth.uid());
