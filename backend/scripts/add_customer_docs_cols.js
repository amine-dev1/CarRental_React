import { query } from "../src/db.js";

async function addCustomerDocsCols() {
  console.log("🚀 Adding document columns (recto/verso) to customers table...");

  try {
    await query(`
      ALTER TABLE customers 
        ADD COLUMN IF NOT EXISTS id_card_recto_url text,
        ADD COLUMN IF NOT EXISTS id_card_verso_url text,
        ADD COLUMN IF NOT EXISTS driver_license_recto_url text,
        ADD COLUMN IF NOT EXISTS driver_license_verso_url text;
    `);

    console.log("✅ Document columns added successfully to customers table!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

addCustomerDocsCols();
