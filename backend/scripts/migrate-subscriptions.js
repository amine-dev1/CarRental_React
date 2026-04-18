/**
 * Migration: Add subscription columns to enterprises table
 * Run once: node scripts/migrate-subscriptions.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../src/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = fs.readFileSync(path.join(__dirname, "add_subscription_columns.sql"), "utf8");

(async () => {
    await query(sql);
    console.log("✅ Subscription columns added successfully");
    process.exit(0);
})().catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
});
