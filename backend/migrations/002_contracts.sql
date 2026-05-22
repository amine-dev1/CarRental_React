-- ============================================================
-- Migration 002: Contract Management System
-- ============================================================

-- 1. Add contract-related columns to rentals table
-- (Some columns may already exist from v1→v2 migration, so we use IF NOT EXISTS pattern)
DO $$
BEGIN
  -- contract_status: draft | pending_signature | signed | cancelled
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='contract_status') THEN
    ALTER TABLE rentals ADD COLUMN contract_status VARCHAR(20) NOT NULL DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='signed_at') THEN
    ALTER TABLE rentals ADD COLUMN signed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='signature_ip') THEN
    ALTER TABLE rentals ADD COLUMN signature_ip INET;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='pdf_url') THEN
    ALTER TABLE rentals ADD COLUMN pdf_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='pdf_generated_at') THEN
    ALTER TABLE rentals ADD COLUMN pdf_generated_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='deposit_amount_cents') THEN
    ALTER TABLE rentals ADD COLUMN deposit_amount_cents INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='mileage_start') THEN
    ALTER TABLE rentals ADD COLUMN mileage_start INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='mileage_end') THEN
    ALTER TABLE rentals ADD COLUMN mileage_end INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='fuel_level_start') THEN
    ALTER TABLE rentals ADD COLUMN fuel_level_start VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='fuel_level_end') THEN
    ALTER TABLE rentals ADD COLUMN fuel_level_end VARCHAR(20);
  END IF;
END$$;


-- 2. Contracts table (versioned history of generated contracts)
CREATE TABLE IF NOT EXISTS contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id     UUID NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  rental_id         UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  contract_number   VARCHAR(50) NOT NULL,
  version           INT NOT NULL DEFAULT 1,
  html_snapshot     TEXT,
  pdf_path          TEXT,
  pdf_url           TEXT,
  signature_data    TEXT,
  signed_by_name    TEXT,
  signed_at         TIMESTAMPTZ,
  signature_ip      INET,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata          JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_contracts_rental     ON contracts(rental_id);
CREATE INDEX IF NOT EXISTS idx_contracts_enterprise  ON contracts(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_contracts_number      ON contracts(contract_number);


-- 3. Contract templates table (per enterprise)
CREATE TABLE IF NOT EXISTS contract_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id  UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  html_template  TEXT NOT NULL,
  is_default     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contract_templates_enterprise ON contract_templates(enterprise_id);
