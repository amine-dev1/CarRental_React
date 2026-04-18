-- =============================================
-- Migration: Add Stripe subscription columns
-- Run once: npm run migrate:subscriptions
-- =============================================

-- Stripe Customer & Subscription tracking
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none';
  -- possible values: none | active | past_due | canceled
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';
  -- monthly | yearly
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS grace_period_end timestamptz;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS deactivated_at timestamptz;

-- Stripe config table (stores Price IDs created by setup script)
CREATE TABLE IF NOT EXISTS stripe_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
