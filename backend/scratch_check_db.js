import { query } from "./src/db.js";

async function check() {
    try {
        const res = await query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tables:", res.rows.map(r => r.tablename));
        
        const pending = await query("SELECT * FROM pending_registrations LIMIT 1").catch(e => ({ error: e.message }));
        console.log("Pending registration check:", pending);
    } catch (e) {
        console.error("Check failed:", e);
    }
    process.exit(0);
}

check();
