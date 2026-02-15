CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =========================
-- ENTERPRISES (TENANTS)
-- =========================
CREATE TABLE IF NOT EXISTS enterprises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  status text NOT NULL DEFAULT 'active', -- active | suspended
  plan text NOT NULL DEFAULT 'Free', -- Free | Pro | Enterprise
  max_vehicles int NOT NULL DEFAULT 5, -- Free: 5, Pro: 50, Enterprise: 999999
  max_users int NOT NULL DEFAULT 2, -- Free: 2, Pro: 10, Enterprise: 999999
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- USERS
-- superadmin: enterprise_id NULL
-- director/agent: enterprise_id NOT NULL
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid REFERENCES enterprises(id) ON DELETE RESTRICT,
  email text UNIQUE NOT NULL,
  phone text UNIQUE,
  full_name text,
  profile_photo text,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('superadmin','director','agent')),
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- CUSTOMERS
-- =========================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  phone text,
  email text,
  driver_license_number text,
  license_expiry_date date,
  address text,
  city text,
  country text,
  date_of_birth date,
  id_card_recto_url text,
  id_card_verso_url text,
  driver_license_recto_url text,
  driver_license_verso_url text,
  notes text,
  preferred_language text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- VEHICLES
-- =========================
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  name text NOT NULL,
  plate text NOT NULL,
  daily_price_cents int NOT NULL,
  status text NOT NULL DEFAULT 'available', -- available | maintenance
  mileage int,
  year int,
  model text,
  color text,
  vin text UNIQUE,
  insurance_expiry date,
  last_maintenance_date date,
  next_maintenance_date date,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enterprise_id, plate)
);

-- =========================
-- VEHICLE MAINTENANCE
-- =========================
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type text NOT NULL, -- oil_change | tire_rotation | inspection | repair
  description text NOT NULL,
  cost_cents int NOT NULL DEFAULT 0,
  performed_by text, -- garage name or technician
  performed_at timestamptz NOT NULL DEFAULT now(),
  next_due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle ON vehicle_maintenance(vehicle_id);

-- =========================
-- RENTALS
-- =========================
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'reserved', -- reserved | active | completed | canceled
  total_cents int NOT NULL DEFAULT 0,
  deposit_cents int DEFAULT 0,
  pickup_time time,
  return_time time,
  pickup_location text,
  return_location text,
  notes text,
  contract_signed boolean DEFAULT false,
  contract_url text,
  assigned_agent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- =========================
-- RENTAL STATUS HISTORY
-- =========================
CREATE TABLE IF NOT EXISTS rental_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  notes text
);
CREATE INDEX IF NOT EXISTS idx_rental_status_history_rental ON rental_status_history(rental_id);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  amount_cents int NOT NULL,
  method text NOT NULL DEFAULT 'cash', -- cash | card | transfer
  payment_type text DEFAULT 'rental', -- rental | deposit | damage | late_fee
  transaction_id text, -- Stripe/PayPal ID
  status text DEFAULT 'completed', -- pending | completed | refunded
  notes text,
  paid_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE, -- NULL = tous les users
  type text NOT NULL, -- rental_reminder | payment_due | vehicle_maintenance
  title text NOT NULL,
  message text NOT NULL,
  related_rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_enterprise ON notifications(enterprise_id);

-- =========================
-- DOCUMENTS
-- =========================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  type text NOT NULL, -- contract | license | insurance | inspection_photo
  filename text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_rental ON documents(rental_id);
CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents(customer_id);

-- =========================
-- PRICING RULES
-- =========================
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE, -- NULL = all vehicles
  name text NOT NULL,
  rule_type text NOT NULL, -- seasonal | weekly | monthly | weekend
  start_date date,
  end_date date,
  discount_percent int,
  min_days int,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- EMAIL TEMPLATES
-- =========================
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  type text NOT NULL, -- confirmation | reminder | receipt | late_return
  subject text NOT NULL,
  body text NOT NULL, -- HTML template with placeholders
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(enterprise_id, type)
);

-- =========================
-- Prevent vehicle double-booking per enterprise
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rentals_no_overlap'
  ) THEN
    ALTER TABLE rentals
    ADD CONSTRAINT rentals_no_overlap
    EXCLUDE USING gist (
      enterprise_id WITH =,
      vehicle_id WITH =,
      daterange(start_date, end_date, '[]') WITH &&
    )
    WHERE (status <> 'canceled');
  END IF;
END$$;
