import { query } from "./db.js";

(async () => {
    try {
        console.log("Adding 'profile_photo' column to 'users' table...");
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_photo text
        `);
        console.log("✅ Success: 'profile_photo' column added.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
})();
