/**
 * Migration: Rename Stripe columns to generic gateway ones
 * Run once: node scripts/migrate-gateway.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../src/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = fs.readFileSync(path.join(__dirname, "db_gateway_migration.sql"), "utf8");

(async () => {
    try {
        await query(sql);
        console.log("✅ Gateway columns migrated successfully");
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    }
})();
