import { query } from "../src/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaSql = fs.readFileSync(path.join(__dirname, "..", "src", "schema.sql"), "utf8");

(async () => {
    console.log("🧨 Dropping all tables...");
    try {
        // Drop tables in correct order to respect foreign keys
        await query(`
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS rentals CASCADE;
      DROP TABLE IF EXISTS vehicles CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS enterprises CASCADE;
    `);
        console.log("✅ Tables dropped.");

        console.log("🏗️  Applying new schema...");
        await query(schemaSql);
        console.log("✅ Schema applied successfully!");

        process.exit(0);
    } catch (e) {
        console.error("❌ Reset failed:", e);
        process.exit(1);
    }
})();
