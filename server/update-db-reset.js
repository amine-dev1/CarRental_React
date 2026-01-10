import { query } from "./src/db.js";

async function updateSchema() {
    try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token text`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires timestamptz`);
        console.log("✅ Database columns added for password reset");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating database:", err);
        process.exit(1);
    }
}

updateSchema();
