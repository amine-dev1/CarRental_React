-- Alter enterprises table
ALTER TABLE enterprises
RENAME COLUMN stripe_customer_id TO gateway_customer_id;

ALTER TABLE enterprises
RENAME COLUMN stripe_subscription_id TO gateway_subscription_id;

ALTER TABLE enterprises
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50); -- 'stripe' or 'paypal'

-- Alter stripe_config to support paypal plan IDs
ALTER TABLE stripe_config RENAME TO payment_gateway_config;

ALTER TABLE payment_gateway_config
ADD COLUMN IF NOT EXISTS paypal_price_id VARCHAR(100);
