/**
 * Stripe Setup Script
 * Run once: node scripts/stripe-setup.js
 *
 * Creates:
 *   - 1 Stripe Product ("Car Rental Platform")
 *   - 4 Stripe Prices (Pro monthly/yearly, Enterprise monthly/yearly)
 *   - Stores all Price IDs in the stripe_config DB table
 */
import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import { query } from "../src/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = [
    {
        key: "pro_monthly",
        nickname: "Pro Monthly",
        unit_amount: 4900, // $49.00
        interval: "month",
    },
    {
        key: "pro_yearly",
        nickname: "Pro Yearly",
        unit_amount: 47040, // $470.40 (20% off $588)
        interval: "year",
    },
    {
        key: "enterprise_monthly",
        nickname: "Enterprise Monthly",
        unit_amount: 14900, // $149.00
        interval: "month",
    },
    {
        key: "enterprise_yearly",
        nickname: "Enterprise Yearly",
        unit_amount: 143040, // $1,430.40 (20% off $1,788)
        interval: "year",
    },
];

async function main() {
    console.log("🚀 Starting Stripe setup...\n");

    // 1. Check if already configured
    const existing = await query("SELECT key, value FROM payment_gateway_config WHERE key = 'product_id'");
    if (existing.rows.length > 0) {
        console.log("⚠️  Stripe is already configured. Product ID:", existing.rows[0].value);
        console.log("   If you want to re-run, delete rows from payment_gateway_config first.");
        process.exit(0);
    }

    // 2. Create the Product
    const product = await stripe.products.create({
        name: "Car Rental Platform",
        description: "SaaS subscription for the Car Rental management platform",
    });
    console.log("✅ Product created:", product.id);

    // Store product ID
    await query(
        "INSERT INTO payment_gateway_config(key, value) VALUES($1, $2) ON CONFLICT(key) DO UPDATE SET value=$2",
        ["product_id", product.id]
    );

    // 3. Create Prices
    for (const plan of PLANS) {
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.unit_amount,
            currency: "usd",
            recurring: { interval: plan.interval },
            nickname: plan.nickname,
        });

        console.log(`✅ Price created: ${plan.nickname} → ${price.id} ($${(plan.unit_amount / 100).toFixed(2)}/${plan.interval})`);

        await query(
            "INSERT INTO payment_gateway_config(key, value) VALUES($1, $2) ON CONFLICT(key) DO UPDATE SET value=$2",
            [plan.key, price.id]
        );
    }

    console.log("\n🎉 Stripe setup complete! All Price IDs stored in stripe_config table.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Stripe setup failed:", err);
    process.exit(1);
});
