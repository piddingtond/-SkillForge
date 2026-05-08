-- Add processed webhook events tracking table
-- Prevents replay attacks

CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_processed_events_stripe_id 
ON public.processed_webhook_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_processed_events_type 
ON public.processed_webhook_events(event_type);

-- Enable RLS
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only system can write, admins can read
CREATE POLICY "Admin can view webhook events"
  ON public.processed_webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-delete old events (keep 90 days)
CREATE OR REPLACE FUNCTION delete_old_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.processed_webhook_events
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.processed_webhook_events IS 'Tracks processed Stripe webhook events to prevent replay attacks';
COMMENT ON FUNCTION delete_old_webhook_events() IS 'Cleanup function - run daily to remove events older than 90 days';
