-- ============================================================
-- MIGRATION v1 → v2  ·  CarRental SaaS
-- Exécuter sur la base de production existante
-- NE TOUCHE PAS : payments, payment_gateway_config, pending_registrations
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════════════════
-- STEP 1 · EXTENSION
-- ════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ════════════════════════════════════════════════════════════
-- STEP 2 · ALTER enterprises
-- ════════════════════════════════════════════════════════════
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS legal_name text;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS tax_number varchar(100);
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS iban text;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Relax status constraint to accept new values
ALTER TABLE enterprises DROP CONSTRAINT IF EXISTS enterprises_status_check;
ALTER TABLE enterprises ADD CONSTRAINT enterprises_status_check
  CHECK (status IN ('active','suspended','trial','cancelled','deactivated'));


-- ════════════════════════════════════════════════════════════
-- STEP 3 · CREATE agencies
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS agencies (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid        NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  code          varchar(10),
  address       text,
  city          text,
  phone         text,
  email         text,
  is_main       boolean     DEFAULT false,
  opening_hours jsonb,
  latitude      numeric(10,7),
  longitude     numeric(10,7),
  status        text        DEFAULT 'active'
                CHECK (status IN ('active','inactive')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 4 · CREATE subscription_plans
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscription_plans (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id       uuid        NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  plan_name           text        NOT NULL
                      CHECK (plan_name IN ('starter','standard','pro','enterprise')),
  max_agencies        int         DEFAULT 1,
  max_vehicles        int         DEFAULT 10,
  max_users           int         DEFAULT 5,
  price_monthly_cents int,
  start_date          date        NOT NULL,
  end_date            date,
  status              text        DEFAULT 'active'
                      CHECK (status IN ('active','expired','cancelled')),
  created_at          timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 5 · ALTER users (add columns + expand role constraint)
-- ════════════════════════════════════════════════════════════
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Expand role CHECK to include 'manager'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('superadmin','director','manager','agent'));


-- ════════════════════════════════════════════════════════════
-- STEP 6 · CREATE user_agency_assignments
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_agency_assignments (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id   uuid        NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  is_primary  boolean     DEFAULT true,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, agency_id)
);


-- ════════════════════════════════════════════════════════════
-- STEP 7 · CREATE vehicle_categories
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id         uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  type                  text,
  description           text,
  base_daily_price_cents int,
  deposit_cents         int  DEFAULT 0,
  min_driver_age        int  DEFAULT 21,
  created_at            timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 8 · ALTER vehicles
-- ════════════════════════════════════════════════════════════
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES agencies(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES vehicle_categories(id);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission text DEFAULT 'manuelle';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats int DEFAULT 5;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doors int DEFAULT 4;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ac boolean DEFAULT true;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS deposit_cents int;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage_km int DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_service_km int DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS next_service_km int;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Copy existing mileage data to new column name
UPDATE vehicles SET mileage_km = mileage WHERE mileage IS NOT NULL AND mileage_km = 0;

-- Expand status CHECK
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
DO $$ BEGIN
  ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check
    CHECK (status IN ('available','rented','reserved','maintenance','out_of_service'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add fuel_type CHECK
DO $$ BEGIN
  ALTER TABLE vehicles ADD CONSTRAINT vehicles_fuel_type_check
    CHECK (fuel_type IS NULL OR fuel_type IN ('essence','diesel','hybride','electrique'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add transmission CHECK
DO $$ BEGIN
  ALTER TABLE vehicles ADD CONSTRAINT vehicles_transmission_check
    CHECK (transmission IN ('manuelle','automatique'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════
-- STEP 9 · CREATE vehicle_documents
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      uuid        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type            text        NOT NULL
                  CHECK (type IN ('carte_grise','assurance','vignette','visite_technique','autre')),
  file_url        text,
  issued_date     date,
  expiry_date     date,
  reminder_sent   boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 10 · CREATE vehicle_extras_available
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vehicle_extras_available (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id     uuid        NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name              text        NOT NULL,
  description       text,
  price_type        text        DEFAULT 'per_day'
                    CHECK (price_type IN ('per_day','fixed','per_rental')),
  unit_price_cents  int         NOT NULL,
  is_active         boolean     DEFAULT true,
  created_at        timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 11 · CREATE maintenance_records
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS maintenance_records (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id            uuid        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  agency_id             uuid        REFERENCES agencies(id),
  type                  text        CHECK (type IN ('preventive','curative','accident','autre')),
  description           text        NOT NULL,
  provider              text,
  start_date            date        NOT NULL,
  end_date              date,
  cost_cents            int         DEFAULT 0,
  mileage_at_service_km int,
  status                text        DEFAULT 'planned'
                        CHECK (status IN ('planned','in_progress','completed')),
  notes                 text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 12 · ALTER customers
-- ════════════════════════════════════════════════════════════
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_alt text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_type text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_number text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_expiry_date date;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS license_country text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_company boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_tax_number text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_blacklisted boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS blacklist_reason text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS blacklisted_at timestamptz;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS blacklisted_by uuid REFERENCES users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_rentals int DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add id_type CHECK
DO $$ BEGIN
  ALTER TABLE customers ADD CONSTRAINT customers_id_type_check
    CHECK (id_type IS NULL OR id_type IN ('cni','passeport','titre_sejour'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════
-- STEP 13 · CREATE customer_documents
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customer_documents (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   uuid        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type          text        NOT NULL
                CHECK (type IN ('cni_recto','cni_verso','permis_recto','permis_verso','passeport','autre')),
  file_url      text        NOT NULL,
  expiry_date   date,
  verified      boolean     DEFAULT false,
  verified_by   uuid        REFERENCES users(id),
  verified_at   timestamptz,
  created_at    timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 14 · ALTER pricing_rules
-- ════════════════════════════════════════════════════════════
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS applies_to text;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS applies_to_id uuid;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS price_modifier_pct numeric(5,2);
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS fixed_daily_price_cents int;

DO $$ BEGIN
  ALTER TABLE pricing_rules ADD CONSTRAINT pricing_rules_applies_to_check
    CHECK (applies_to IS NULL OR applies_to IN ('vehicle','category','all'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════
-- STEP 15 · CREATE discount_codes
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS discount_codes (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id   uuid        NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  code            text        UNIQUE NOT NULL,
  description     text,
  discount_type   text        CHECK (discount_type IN ('percent','fixed')),
  discount_value  numeric(10,2),
  min_rental_days int         DEFAULT 1,
  max_uses        int,
  used_count      int         DEFAULT 0,
  valid_from      date,
  valid_until     date,
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 16 · CREATE reservations
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reservations (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id         uuid        NOT NULL REFERENCES enterprises(id),
  reservation_number    text        UNIQUE NOT NULL,
  customer_id           uuid        NOT NULL REFERENCES customers(id),
  vehicle_id            uuid        NOT NULL REFERENCES vehicles(id),
  category_id           uuid        REFERENCES vehicle_categories(id),
  pickup_agency_id      uuid        NOT NULL REFERENCES agencies(id),
  return_agency_id      uuid        NOT NULL REFERENCES agencies(id),
  agent_id              uuid        REFERENCES users(id),
  pickup_date           timestamptz NOT NULL,
  return_date           timestamptz NOT NULL,
  quoted_daily_price_cents int,
  quoted_total_cents    int,
  deposit_cents         int         DEFAULT 0,
  discount_code_id      uuid        REFERENCES discount_codes(id),
  discount_amount_cents int         DEFAULT 0,
  source                text        DEFAULT 'counter'
                        CHECK (source IN ('counter','phone','web','app','partner')),
  status                text        DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','checked_in','cancelled','no_show','completed')),
  cancellation_reason   text,
  cancelled_at          timestamptz,
  notes                 text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 17 · CREATE reservation_extras
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reservation_extras (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id  uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  extra_id        uuid NOT NULL REFERENCES vehicle_extras_available(id),
  quantity        int  DEFAULT 1,
  unit_price_cents int,
  total_cents     int
);


-- ════════════════════════════════════════════════════════════
-- STEP 18 · ALTER rentals
-- ════════════════════════════════════════════════════════════

-- New columns
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS contract_number text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS reservation_id uuid REFERENCES reservations(id);
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS pickup_agency_id uuid REFERENCES agencies(id);
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS return_agency_id uuid REFERENCES agencies(id);
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS planned_start_date date;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS planned_end_date date;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS actual_start_date timestamptz;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS actual_end_date timestamptz;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS daily_price_cents int;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS total_days int;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS extras_total_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS discount_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS damage_charges_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS fuel_charges_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS late_return_charges_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS subtotal_cents int;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS tax_pct numeric(5,2) DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS tax_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS deposit_payment_id uuid;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS deposit_returned_cents int DEFAULT 0;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS deposit_status text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS mileage_out_km int;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS mileage_in_km int;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS fuel_level_out text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS fuel_level_in text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS contract_pdf_url text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS customer_signature_url text;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS discount_code_id uuid;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Rename assigned_agent_id → agent_id
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='assigned_agent_id')
     AND NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='rentals' AND column_name='agent_id')
  THEN
    ALTER TABLE rentals RENAME COLUMN assigned_agent_id TO agent_id;
  END IF;
END $$;

-- Copy existing dates to new planned_* columns
UPDATE rentals SET planned_start_date = start_date WHERE planned_start_date IS NULL AND start_date IS NOT NULL;
UPDATE rentals SET planned_end_date = end_date WHERE planned_end_date IS NULL AND end_date IS NOT NULL;
UPDATE rentals SET subtotal_cents = total_cents WHERE subtotal_cents IS NULL AND total_cents IS NOT NULL;

-- Expand status CHECK
ALTER TABLE rentals DROP CONSTRAINT IF EXISTS rentals_status_check;
DO $$ BEGIN
  ALTER TABLE rentals ADD CONSTRAINT rentals_status_check
    CHECK (status IN ('reserved','active','ongoing','completed','canceled','cancelled','draft','dispute'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Deposit status CHECK
DO $$ BEGIN
  ALTER TABLE rentals ADD CONSTRAINT rentals_deposit_status_check
    CHECK (deposit_status IS NULL OR deposit_status IN ('pending','held','partially_returned','returned'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fuel level CHECKs
DO $$ BEGIN
  ALTER TABLE rentals ADD CONSTRAINT rentals_fuel_out_check
    CHECK (fuel_level_out IS NULL OR fuel_level_out IN ('vide','1/4','1/2','3/4','plein'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE rentals ADD CONSTRAINT rentals_fuel_in_check
    CHECK (fuel_level_in IS NULL OR fuel_level_in IN ('vide','1/4','1/2','3/4','plein'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════
-- STEP 19 · CREATE rental_extras
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rental_extras (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id        uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  extra_id         uuid REFERENCES vehicle_extras_available(id),
  name             text NOT NULL,
  quantity         int  DEFAULT 1,
  unit_price_cents int  NOT NULL,
  days             int  DEFAULT 1,
  total_cents      int  NOT NULL
);


-- ════════════════════════════════════════════════════════════
-- STEP 20 · CREATE inspections
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inspections (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id             uuid        NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  type                  text        NOT NULL CHECK (type IN ('depart','retour')),
  agent_id              uuid        NOT NULL REFERENCES users(id),
  mileage_km            int         NOT NULL,
  fuel_level            text        NOT NULL
                        CHECK (fuel_level IN ('vide','1/4','1/2','3/4','plein')),
  body_condition        jsonb       NOT NULL DEFAULT '{}',
  interior_condition    jsonb       DEFAULT '{}',
  tires_condition       jsonb       DEFAULT '{}',
  accessories_present   jsonb       DEFAULT '{}',
  notes                 text,
  photos                jsonb       DEFAULT '[]',
  customer_signature_url text,
  agent_signature_url   text,
  pdf_url               text,
  done_at               timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 21 · CREATE damages
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS damages (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id             uuid        NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  inspection_id         uuid        REFERENCES inspections(id),
  zone                  text,
  description           text        NOT NULL,
  photos                jsonb       DEFAULT '[]',
  repair_cost_cents     int         DEFAULT 0,
  charged_to_customer   boolean     DEFAULT false,
  charged_amount_cents  int         DEFAULT 0,
  status                text        DEFAULT 'reported'
                        CHECK (status IN ('reported','assessed','repaired','waived')),
  notes                 text,
  reported_at           timestamptz DEFAULT now(),
  repaired_at           timestamptz
);


-- ════════════════════════════════════════════════════════════
-- STEP 22 · CREATE payment_refunds
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_refunds (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      uuid        NOT NULL REFERENCES payments(id),
  rental_id       uuid        NOT NULL REFERENCES rentals(id),
  amount_cents    int         NOT NULL,
  method          text        CHECK (method IN ('cash','card','bank_transfer','cheque','mobile_pay')),
  reason          text        NOT NULL,
  status          text        DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','failed')),
  processed_by    uuid        REFERENCES users(id),
  refunded_at     timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 23 · CREATE invoices + invoice_lines
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invoices (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id   uuid        NOT NULL REFERENCES enterprises(id),
  rental_id       uuid        NOT NULL REFERENCES rentals(id),
  customer_id     uuid        NOT NULL REFERENCES customers(id),
  invoice_number  text        UNIQUE NOT NULL,
  type            text        DEFAULT 'invoice'
                  CHECK (type IN ('invoice','credit_note','receipt')),
  status          text        DEFAULT 'draft'
                  CHECK (status IN ('draft','issued','paid','cancelled')),
  subtotal_cents  int         NOT NULL,
  discount_cents  int         DEFAULT 0,
  tax_pct         numeric(5,2) DEFAULT 0,
  tax_cents       int         DEFAULT 0,
  total_cents     int         NOT NULL,
  notes           text,
  pdf_url         text,
  issued_at       timestamptz,
  due_date        date,
  paid_at         timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id       uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description      text NOT NULL,
  quantity         numeric(10,2) DEFAULT 1,
  unit_price_cents int  NOT NULL,
  total_cents      int  NOT NULL,
  line_type        text CHECK (line_type IN ('rental','extra','damage','fuel','discount','tax','other')),
  sort_order       int  DEFAULT 0
);


-- ════════════════════════════════════════════════════════════
-- STEP 24 · CREATE notification_templates + notification_logs
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_templates (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id   uuid        NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  trigger_event   text        NOT NULL,
  channel         text        CHECK (channel IN ('email','sms','whatsapp')),
  subject         text,
  body            text        NOT NULL,
  is_active       boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id   uuid        NOT NULL REFERENCES enterprises(id),
  template_id     uuid        REFERENCES notification_templates(id),
  recipient_type  text        CHECK (recipient_type IN ('customer','user')),
  recipient_id    uuid,
  channel         text,
  subject         text,
  body            text,
  status          text        DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','failed','bounced')),
  error_message   text,
  sent_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 25 · CREATE audit_logs + number_sequences
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid        REFERENCES enterprises(id),
  user_id       uuid        REFERENCES users(id),
  action        text        NOT NULL,
  table_name    text        NOT NULL,
  record_id     uuid,
  old_data      jsonb,
  new_data      jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS number_sequences (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('reservation','contract','invoice')),
  prefix        text NOT NULL,
  last_number   int  DEFAULT 0,
  UNIQUE (enterprise_id, type)
);

-- Seed number_sequences for all existing enterprises
INSERT INTO number_sequences (enterprise_id, type, prefix, last_number)
SELECT e.id, t.type, t.prefix, 0
FROM enterprises e
CROSS JOIN (VALUES ('reservation','RES'), ('contract','CTR'), ('invoice','FAC')) AS t(type, prefix)
ON CONFLICT (enterprise_id, type) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 26 · CREATE INDEXES
-- ════════════════════════════════════════════════════════════

-- Vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_enterprise  ON vehicles(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_agency      ON vehicles(agency_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status      ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate       ON vehicles(plate);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_enterprise ON customers(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone      ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email      ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_license    ON customers(driver_license_number);
CREATE INDEX IF NOT EXISTS idx_customers_search     ON customers USING gin(full_name gin_trgm_ops);

-- Reservations
CREATE INDEX IF NOT EXISTS idx_reservations_enterprise ON reservations(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer   ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle    ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status     ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates      ON reservations(pickup_date, return_date);

-- Rentals
CREATE INDEX IF NOT EXISTS idx_rentals_enterprise      ON rentals(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_rentals_customer        ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_vehicle         ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status          ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates           ON rentals(planned_start_date, planned_end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_contract_number ON rentals(contract_number);

-- Payments (index only, no table modification)
CREATE INDEX IF NOT EXISTS idx_payments_rental      ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_enterprise  ON payments(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_enterprise     ON audit_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_audit_user           ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table          ON audit_logs(table_name, record_id);

-- Documents expiry
CREATE INDEX IF NOT EXISTS idx_vehicle_docs_expiry  ON vehicle_documents(expiry_date) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_customer_docs_expiry ON customer_documents(expiry_date);


-- ════════════════════════════════════════════════════════════
-- STEP 27 · CREATE FUNCTIONS
-- ════════════════════════════════════════════════════════════

-- Auto-numérotation contrats
CREATE OR REPLACE FUNCTION generate_contract_number(p_enterprise_id uuid)
RETURNS text AS $$
DECLARE v_next_num int;
BEGIN
  UPDATE number_sequences
  SET last_number = last_number + 1
  WHERE enterprise_id = p_enterprise_id AND type = 'contract'
  RETURNING last_number INTO v_next_num;
  RETURN 'CTR-' || to_char(now(), 'YYYY') || '-' || lpad(v_next_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-numérotation réservations
CREATE OR REPLACE FUNCTION generate_reservation_number(p_enterprise_id uuid)
RETURNS text AS $$
DECLARE v_next_num int;
BEGIN
  UPDATE number_sequences SET last_number = last_number + 1
  WHERE enterprise_id = p_enterprise_id AND type = 'reservation'
  RETURNING last_number INTO v_next_num;
  RETURN 'RES-' || to_char(now(), 'YYYY') || '-' || lpad(v_next_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-numérotation factures
CREATE OR REPLACE FUNCTION generate_invoice_number(p_enterprise_id uuid)
RETURNS text AS $$
DECLARE v_next_num int;
BEGIN
  UPDATE number_sequences SET last_number = last_number + 1
  WHERE enterprise_id = p_enterprise_id AND type = 'invoice'
  RETURNING last_number INTO v_next_num;
  RETURN 'FAC-' || to_char(now(), 'YYYY') || '-' || lpad(v_next_num::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- MAJ kilométrage véhicule après retour
CREATE OR REPLACE FUNCTION update_vehicle_mileage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.mileage_in_km IS NOT NULL THEN
    UPDATE vehicles
    SET mileage_km = NEW.mileage_in_km, updated_at = now()
    WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Compteur total_rentals client
CREATE OR REPLACE FUNCTION update_customer_rental_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE customers
    SET total_rentals = total_rentals + 1, updated_at = now()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Libération véhicule après clôture contrat
CREATE OR REPLACE FUNCTION release_vehicle_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed','cancelled','canceled') THEN
    UPDATE vehicles
    SET status = 'available', updated_at = now()
    WHERE id = NEW.vehicle_id
      AND status IN ('rented','reserved');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
-- STEP 28 · CREATE TRIGGERS
-- ════════════════════════════════════════════════════════════

-- Drop if exists to be idempotent
DROP TRIGGER IF EXISTS trg_update_vehicle_mileage  ON rentals;
DROP TRIGGER IF EXISTS trg_customer_rental_count   ON rentals;
DROP TRIGGER IF EXISTS trg_release_vehicle         ON rentals;
DROP TRIGGER IF EXISTS trg_enterprises_upd         ON enterprises;
DROP TRIGGER IF EXISTS trg_agencies_upd            ON agencies;
DROP TRIGGER IF EXISTS trg_users_upd               ON users;
DROP TRIGGER IF EXISTS trg_vehicles_upd            ON vehicles;
DROP TRIGGER IF EXISTS trg_customers_upd           ON customers;
DROP TRIGGER IF EXISTS trg_reservations_upd        ON reservations;
DROP TRIGGER IF EXISTS trg_rentals_upd             ON rentals;
DROP TRIGGER IF EXISTS trg_invoices_upd            ON invoices;
DROP TRIGGER IF EXISTS trg_maintenance_upd         ON maintenance_records;

CREATE TRIGGER trg_update_vehicle_mileage
  AFTER UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_vehicle_mileage();

CREATE TRIGGER trg_customer_rental_count
  AFTER UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_customer_rental_count();

CREATE TRIGGER trg_release_vehicle
  AFTER UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION release_vehicle_on_completion();

CREATE TRIGGER trg_enterprises_upd    BEFORE UPDATE ON enterprises         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_agencies_upd       BEFORE UPDATE ON agencies            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_upd          BEFORE UPDATE ON users               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vehicles_upd       BEFORE UPDATE ON vehicles            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_upd      BEFORE UPDATE ON customers           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_upd   BEFORE UPDATE ON reservations        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_rentals_upd        BEFORE UPDATE ON rentals             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_upd       BEFORE UPDATE ON invoices            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_maintenance_upd    BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ════════════════════════════════════════════════════════════
-- STEP 29 · CREATE VIEWS
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_vehicles_available AS
SELECT
  v.id, v.enterprise_id, v.agency_id,
  a.name  AS agency_name,
  a.city  AS agency_city,
  c.name  AS category_name,
  v.brand, v.model, v.year, v.color, v.plate,
  v.fuel_type, v.transmission, v.seats,
  v.daily_price_cents, v.deposit_cents, v.mileage_km
FROM vehicles v
LEFT JOIN agencies          a ON a.id = v.agency_id
LEFT JOIN vehicle_categories c ON c.id = v.category_id
WHERE v.status = 'available';

CREATE OR REPLACE VIEW v_active_rentals AS
SELECT
  r.id, r.contract_number, r.enterprise_id,
  cu.full_name AS customer_name, cu.phone AS customer_phone,
  v.plate, v.brand, v.model,
  a_pick.name  AS pickup_agency,
  a_ret.name   AS return_agency,
  r.planned_start_date, r.planned_end_date,
  r.total_days, r.total_cents, r.deposit_cents,
  r.status
FROM rentals r
JOIN customers  cu    ON cu.id  = r.customer_id
JOIN vehicles   v     ON v.id   = r.vehicle_id
LEFT JOIN agencies a_pick ON a_pick.id = r.pickup_agency_id
LEFT JOIN agencies a_ret  ON a_ret.id  = r.return_agency_id
WHERE r.status IN ('active','ongoing');

CREATE OR REPLACE VIEW v_expiring_documents AS
SELECT 'vehicle' AS entity_type, vd.vehicle_id AS entity_id,
  v.plate AS entity_ref, vd.type, vd.expiry_date,
  vd.expiry_date - CURRENT_DATE AS days_remaining
FROM vehicle_documents vd
JOIN vehicles v ON v.id = vd.vehicle_id
WHERE vd.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
UNION ALL
SELECT 'customer', cd.customer_id, cu.full_name,
  cd.type, cd.expiry_date,
  cd.expiry_date - CURRENT_DATE
FROM customer_documents cd
JOIN customers cu ON cu.id = cd.customer_id
WHERE cd.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
ORDER BY days_remaining;


-- ════════════════════════════════════════════════════════════
-- STEP 30 · BACKFILL contract_number on existing rentals
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
  seq int;
BEGIN
  FOR r IN (
    SELECT DISTINCT enterprise_id FROM rentals WHERE contract_number IS NULL ORDER BY enterprise_id
  ) LOOP
    seq := 0;
    FOR r IN (
      SELECT id, enterprise_id, created_at
      FROM rentals
      WHERE enterprise_id = r.enterprise_id AND contract_number IS NULL
      ORDER BY created_at ASC
    ) LOOP
      seq := seq + 1;
      UPDATE rentals
      SET contract_number = 'CTR-' || to_char(r.created_at, 'YYYY') || '-' || lpad(seq::text, 5, '0')
      WHERE id = r.id;
    END LOOP;
    -- Update the sequence counter to match
    UPDATE number_sequences
    SET last_number = seq
    WHERE enterprise_id = r.enterprise_id AND type = 'contract';
  END LOOP;
END $$;

-- Now add UNIQUE constraint (not NOT NULL yet — phase 2)
DO $$ BEGIN
  ALTER TABLE rentals ADD CONSTRAINT rentals_contract_number_unique UNIQUE (contract_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════
-- STEP 31 · RLS POLICIES (created but NOT enabled)
-- ════════════════════════════════════════════════════════════
-- NOTE: DO NOT enable RLS until middleware injects app.current_enterprise_id

DO $$ BEGIN CREATE POLICY "tenant_isolation_agencies"     ON agencies     USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_users"        ON users        USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_vehicles"     ON vehicles     USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_customers"    ON customers    USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_reservations" ON reservations USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_rentals"      ON rentals      USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_payments"     ON payments     USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenant_isolation_invoices"     ON invoices     USING (enterprise_id = current_setting('app.current_enterprise_id')::uuid); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS NOT ENABLED — will be enabled in phase 2
-- ALTER TABLE agencies               ENABLE ROW LEVEL SECURITY;
-- (etc.)


COMMIT;

-- ════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ════════════════════════════════════════════════════════════
