import { query } from "./src/db.js";
import dotenv from "dotenv";
dotenv.config();

async function clear() {
    try {
        await query(`DELETE FROM payment_gateway_config WHERE key IN ('product_id', 'pro_monthly', 'pro_yearly', 'enterprise_monthly', 'enterprise_yearly')`);
        console.log("✅ Stripe config cleared from payment_gateway_config");
    } catch (e) {
        console.error("❌ Error clearing config:", e);
    }
    process.exit(0);
}
clear();
