import { query } from "../src/db.js";

(async () => {
    try {
        console.log("Adding phone column to users table...");
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone text UNIQUE;
        `);
        console.log("✅ Phone column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error adding phone column:", err);
        process.exit(1);
    }
})();
