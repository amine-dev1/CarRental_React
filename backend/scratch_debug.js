import { query } from "./src/db.js";

async function debug() {
    try {
        const ents = await query("SELECT id, name, gateway_customer_id, gateway_subscription_id, plan, status FROM enterprises ORDER BY created_at DESC LIMIT 5");
        console.log("\n=== ENTERPRISES ===");
        ents.rows.forEach(r => console.log(r));

        const users = await query("SELECT id, email, role, enterprise_id FROM users WHERE role='director' ORDER BY enterprise_id DESC LIMIT 5");
        console.log("\n=== DIRECTOR USERS ===");
        users.rows.forEach(r => console.log(r));

        const pends = await query("SELECT id, email, created_at FROM pending_registrations");
        console.log("\n=== PENDING REGISTRATIONS ===");
        pends.rows.forEach(r => console.log(r));
    } catch (e) {
        console.error("Debug failed:", e.message);
    }
    process.exit(0);
}

debug();
