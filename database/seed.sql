-- Seed Data: Subscription Tiers
-- Phase 1: Initial Data

INSERT INTO public.subscription_tiers (name, price_monthly, max_skills, features) VALUES
(
  'Free',
  0.00,
  1,
  '["1 skill listing", "Basic analytics", "Community support"]'
),
(
  'Basic',
  9.00,
  5,
  '["5 skill listings", "Full analytics", "Email support", "Seller badge"]'
),
(
  'Pro',
  29.00,
  NULL, -- unlimited
  '["Unlimited skills", "Advanced analytics", "Priority support", "Featured placement", "Custom seller page", "Pro badge"]'
),
(
  'Enterprise',
  99.00,
  NULL,
  '["Unlimited skills", "White-label options", "Dedicated support", "Featured placement", "Custom branding", "Enterprise badge", "Revenue reports"]'
);
