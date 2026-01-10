import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

(async () => {
    await query(sql);
    console.log("✅ Schema applied");
    process.exit(0);
})().catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
});
