/**
 * Grace Period Enforcement Script
 * Run daily via cron or manually: node scripts/grace-check.js
 *
 * Finds enterprises whose 7-day grace period has expired
 * and deactivates them.
 */
import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import { query } from "../src/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
    console.log("🔍 Checking for expired grace periods...\n");

    // Find enterprises whose grace period has expired and are still past_due
    const result = await query(`
        SELECT id, name, stripe_subscription_id, grace_period_end
        FROM enterprises
        WHERE subscription_status = 'past_due'
          AND grace_period_end IS NOT NULL
          AND grace_period_end < NOW()
          AND status != 'deactivated'
    `);

    if (result.rows.length === 0) {
        console.log("✅ No expired grace periods found.");
        process.exit(0);
    }

    console.log(`⚠️  Found ${result.rows.length} enterprise(s) to deactivate:\n`);

    for (const enterprise of result.rows) {
        console.log(`  → ${enterprise.name} (${enterprise.id})`);
        console.log(`    Grace period ended: ${enterprise.grace_period_end}`);

        try {
            // Cancel the Stripe subscription
            if (enterprise.stripe_subscription_id) {
                await stripe.subscriptions.cancel(enterprise.stripe_subscription_id);
                console.log(`    ✅ Stripe subscription canceled`);
            }

            // Deactivate the enterprise in our database
            await query(`
                UPDATE enterprises
                SET status = 'deactivated',
                    deactivated_at = NOW(),
                    subscription_status = 'canceled',
                    plan = 'Standard',
                    max_vehicles = 5,
                    max_users = 2
                WHERE id = $1
            `, [enterprise.id]);

            console.log(`    ✅ Enterprise deactivated in DB`);
            console.log(`    📅 Data retained until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}\n`);

        } catch (err) {
            console.error(`    ❌ Error processing ${enterprise.name}:`, err.message);
        }
    }

    console.log("🏁 Grace period check complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Grace check failed:", err);
    process.exit(1);
});
