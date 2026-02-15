import { query } from "../src/db.js";

async function addPlanLimits() {
  console.log("🚀 Adding plan limit columns to enterprises table...");

  try {
    // Add columns
    await query(`
      ALTER TABLE enterprises 
        ADD COLUMN IF NOT EXISTS max_vehicles int NOT NULL DEFAULT 5,
        ADD COLUMN IF NOT EXISTS max_users int NOT NULL DEFAULT 2;
    `);

    console.log("✅ Columns added successfully!");

    // Update existing enterprises based on their plan
    console.log("🔄 Updating limits for existing enterprises...");

    await query(`
      UPDATE enterprises
      SET 
        max_vehicles = CASE 
          WHEN plan = 'Free' THEN 5
          WHEN plan = 'Pro' THEN 50
          WHEN plan = 'Enterprise' THEN 999999
          ELSE 5
        END,
        max_users = CASE 
          WHEN plan = 'Free' THEN 2
          WHEN plan = 'Pro' THEN 10
          WHEN plan = 'Enterprise' THEN 999999
          ELSE 2
        END
      WHERE max_vehicles = 5 AND max_users = 2; -- Only update if they still have defaults
    `);

    console.log("✅ Plan limits updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

addPlanLimits();
