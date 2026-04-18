import dotenv from "dotenv";
dotenv.config();
import { query } from "./src/db.js";

async function check() {
    try {
        console.log("--- payment_gateway_config ---");
        const res = await query("SELECT * FROM payment_gateway_config");
        console.table(res.rows);

        console.log("\n--- stripe_config (if exists) ---");
        try {
            const res2 = await query("SELECT * FROM stripe_config");
            console.table(res2.rows);
        } catch (e) {
            console.log("stripe_config does not exist (Good if migrated)");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
check();
