import { query } from "../src/db.js";

try {
    await query("ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS trial_end timestamptz");
    console.log("OK: trial_end column added");
    process.exit(0);
} catch (e) {
    console.error(e);
    process.exit(1);
}
