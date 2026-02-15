import bcrypt from "bcrypt";
import { query } from "../src/db.js";

async function createTestAccounts() {
  console.log("🚀 Creating test accounts for Free, Pro, and Enterprise plans...\n");

  try {
    const password = "password123";
    const hash = await bcrypt.hash(password, 10);

    // 1. CREATE FREE PLAN ENTERPRISE
    console.log("📦 Creating Free Plan Enterprise...");
    const freeEnterprise = await query(
      `INSERT INTO enterprises (name, plan, status, max_vehicles, max_users, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ["AutoRent Free", "Free", "active", 5, 2, "123 Free Street, Casablanca"]
    );

    if (freeEnterprise.rows.length > 0) {
      const freeEnterpriseId = freeEnterprise.rows[0].id;
      
      // Create Free Director
      await query(
        `INSERT INTO users (enterprise_id, email, password_hash, role, full_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [freeEnterpriseId, "free@director.com", hash, "director", "Director Free"]
      );
      
      console.log("✅ Free Plan created!");
      console.log("   Email: free@director.com");
      console.log("   Password: password123");
      console.log("   Plan: Free (5 vehicles max, 2 users max)\n");
    }

    // 2. CREATE PRO PLAN ENTERPRISE
    console.log("⭐ Creating Pro Plan Enterprise...");
    const proEnterprise = await query(
      `INSERT INTO enterprises (name, plan, status, max_vehicles, max_users, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ["ProRent Solutions", "Pro", "active", 50, 10, "456 Pro Avenue, Rabat"]
    );

    if (proEnterprise.rows.length > 0) {
      const proEnterpriseId = proEnterprise.rows[0].id;
      
      // Create Pro Director
      await query(
        `INSERT INTO users (enterprise_id, email, password_hash, role, full_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [proEnterpriseId, "pro@director.com", hash, "director", "Director Pro"]
      );
      
      console.log("✅ Pro Plan created!");
      console.log("   Email: pro@director.com");
      console.log("   Password: password123");
      console.log("   Plan: Pro (50 vehicles max, 10 users max)\n");
    }

    // 3. CREATE ENTERPRISE PLAN
    console.log("👑 Creating Enterprise Plan...");
    const enterpriseEnterprise = await query(
      `INSERT INTO enterprises (name, plan, status, max_vehicles, max_users, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ["EliteRent Enterprise", "Enterprise", "active", 999999, 999999, "789 Enterprise Boulevard, Marrakech"]
    );

    if (enterpriseEnterprise.rows.length > 0) {
      const enterpriseEnterpriseId = enterpriseEnterprise.rows[0].id;
      
      // Create Enterprise Director
      await query(
        `INSERT INTO users (enterprise_id, email, password_hash, role, full_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [enterpriseEnterpriseId, "enterprise@director.com", hash, "director", "Director Enterprise"]
      );
      
      console.log("✅ Enterprise Plan created!");
      console.log("   Email: enterprise@director.com");
      console.log("   Password: password123");
      console.log("   Plan: Enterprise (unlimited vehicles & users)\n");
    }

    console.log("=" .repeat(60));
    console.log("🎉 All test accounts created successfully!");
    console.log("=" .repeat(60));
    console.log("\n📋 TEST CREDENTIALS SUMMARY:\n");
    console.log("FREE PLAN:");
    console.log("  Email: free@director.com");
    console.log("  Password: password123\n");
    
    console.log("PRO PLAN:");
    console.log("  Email: pro@director.com");
    console.log("  Password: password123\n");
    
    console.log("ENTERPRISE PLAN:");
    console.log("  Email: enterprise@director.com");
    console.log("  Password: password123\n");
    
    console.log("=" .repeat(60));

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating test accounts:", err);
    process.exit(1);
  }
}

createTestAccounts();
