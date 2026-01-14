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
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('superadmin','director','agent')),
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- BUSINESS TABLES (scoped by enterprise_id)
-- =========================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  name text NOT NULL,
  plate text NOT NULL,
  daily_price_cents int NOT NULL,
  status text NOT NULL DEFAULT 'available', -- available | maintenance
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enterprise_id, plate)
);

CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'reserved', -- reserved | active | completed | canceled
  total_cents int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE RESTRICT,
  rental_id uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  amount_cents int NOT NULL,
  method text NOT NULL DEFAULT 'cash', -- cash | card | transfer
  paid_at timestamptz NOT NULL DEFAULT now()
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
