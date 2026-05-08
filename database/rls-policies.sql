-- Row Level Security Policies for OpenClaw Skills Marketplace
-- Run this after creating the tables from schema.sql

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Skills policies
CREATE POLICY "Anyone can view approved skills"
  ON public.skills FOR SELECT
  USING (status = 'approved' OR seller_id = auth.uid());

CREATE POLICY "Sellers can insert own skills"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own skills"
  ON public.skills FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own skills"
  ON public.skills FOR DELETE
  USING (auth.uid() = seller_id);

-- Purchases policies
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can create reviews for purchased skills"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.buyer_id = auth.uid()
      AND purchases.skill_id = reviews.skill_id
    )
  );

CREATE POLICY "Buyers can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = buyer_id);

-- Seller subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON public.seller_subscriptions FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.seller_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Subscription tiers policies (public read)
CREATE POLICY "Anyone can view subscription tiers"
  ON public.subscription_tiers FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_subscriptions_updated_at
  BEFORE UPDATE ON public.seller_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, max_skills, features) VALUES
  ('Free', 0, 3, '["List up to 3 skills", "Basic analytics", "Community support"]'),
  ('Pro', 19.99, 25, '["List up to 25 skills", "Advanced analytics", "Priority support", "Featured listings"]'),
  ('Business', 49.99, NULL, '["Unlimited skills", "Full analytics suite", "Dedicated support", "Featured listings", "Custom branding"]')
ON CONFLICT (name) DO NOTHING;
