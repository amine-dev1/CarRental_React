import { query } from "../src/db.js";

async function upgradeV2() {
  console.log("🚀 Starting database upgrade to V2...");

  try {
    // 1. rental_status_history
    console.log("📊 Creating rental_status_history table...");
    await query(`
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
    `);

    // 2. notifications
    console.log("🔔 Creating notifications table...");
    await query(`
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
    `);

    // 3. vehicles enhancement
    console.log("🚗 Enhancing vehicles table...");
    await query(`
      ALTER TABLE vehicles 
        ADD COLUMN IF NOT EXISTS mileage int,
        ADD COLUMN IF NOT EXISTS year int,
        ADD COLUMN IF NOT EXISTS model text,
        ADD COLUMN IF NOT EXISTS color text,
        ADD COLUMN IF NOT EXISTS vin text UNIQUE,
        ADD COLUMN IF NOT EXISTS insurance_expiry date,
        ADD COLUMN IF NOT EXISTS last_maintenance_date date,
        ADD COLUMN IF NOT EXISTS next_maintenance_date date,
        ADD COLUMN IF NOT EXISTS photo_url text;
    `);

    // 4. vehicle_maintenance
    console.log("🔧 Creating vehicle_maintenance table...");
    await query(`
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
    `);

    // 5. rentals extension
    console.log("📑 Extending rentals table...");
    await query(`
      ALTER TABLE rentals 
        ADD COLUMN IF NOT EXISTS deposit_cents int DEFAULT 0,
        ADD COLUMN IF NOT EXISTS pickup_time time,
        ADD COLUMN IF NOT EXISTS return_time time,
        ADD COLUMN IF NOT EXISTS pickup_location text,
        ADD COLUMN IF NOT EXISTS return_location text,
        ADD COLUMN IF NOT EXISTS notes text,
        ADD COLUMN IF NOT EXISTS contract_signed boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS contract_url text,
        ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 6. payments extension
    console.log("💰 Extending payments table...");
    await query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'rental', -- rental | deposit | damage | late_fee
        ADD COLUMN IF NOT EXISTS transaction_id text, -- Stripe/PayPal ID
        ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed', -- pending | completed | refunded
        ADD COLUMN IF NOT EXISTS notes text;
    `);

    // 7. customers extension
    console.log("👥 Extending customers table...");
    await query(`
      ALTER TABLE customers
        ADD COLUMN IF NOT EXISTS driver_license_number text,
        ADD COLUMN IF NOT EXISTS license_expiry_date date,
        ADD COLUMN IF NOT EXISTS address text,
        ADD COLUMN IF NOT EXISTS city text,
        ADD COLUMN IF NOT EXISTS country text,
        ADD COLUMN IF NOT EXISTS date_of_birth date,
        ADD COLUMN IF NOT EXISTS notes text,
        ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
    `);

    // 8. documents
    console.log("📁 Creating documents table...");
    await query(`
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
    `);

    // 9. pricing_rules
    console.log("📈 Creating pricing_rules table...");
    await query(`
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
    `);

    // 10. email_templates
    console.log("✉️ Creating email_templates table...");
    await query(`
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
    `);

    console.log("✅ Database upgrade to V2 completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Upgrade failed:", err);
    process.exit(1);
  }
}

upgradeV2();
