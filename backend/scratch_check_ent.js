import { query } from "./src/db.js";

async function check() {
    try {
        const res = await query("SELECT id, name, gateway_customer_id, gateway_subscription_id FROM enterprises");
        console.log("Enterprises in DB:", res.rows);
        
        const sessions = await query("SELECT * FROM pending_registrations");
        console.log("Pending registrations:", sessions.rows.length);
    } catch (e) {
        console.error("Check failed:", e);
    }
    process.exit(0);
}

check();
