/**
 * PayPal Setup Script
 * Run once to create PayPal Product and Billing Plans.
 * node scripts/paypal-setup.js
 */
import "dotenv/config";
import fetch from "node-fetch";
import { query } from "../src/db.js";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function generateAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const data = await response.json();
    return data.access_token;
}

async function createProduct(token) {
    console.log("📦 Creating PayPal Product: RentalCar B2B SaaS...");
    const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": "PRODUCT-RENTALCAR-" + Date.now()
        },
        body: JSON.stringify({
            name: "RentalCar B2B SaaS",
            description: "Abonnement à la plateforme de gestion de location de voitures RentalCar",
            type: "SERVICE",
            category: "SOFTWARE",
        }),
    });
    const product = await response.json();
    return product.id;
}

async function createPlan(token, productId, name, description, amount, intervalUnit, intervalCount) {
    console.log(`💳 Creating PayPal Plan: ${name}...`);
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": "PLAN-" + name.replace(/\s+/g, '') + "-" + Date.now()
        },
        body: JSON.stringify({
            product_id: productId,
            name: name,
            description: description,
            status: "ACTIVE",
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: intervalUnit, // 'MONTH' or 'YEAR'
                        interval_count: intervalCount,
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0, // Infinite
                    pricing_scheme: {
                        fixed_price: {
                            value: amount.toString(),
                            currency_code: "USD"
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: "0.00",
                    currency_code: "USD"
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        })
    });
    const plan = await response.json();
    if (!response.ok) {
        console.error("PayPal Error:", plan);
        throw new Error("Failed to create plan");
    }
    return plan.id;
}

async function saveKey(key, value) {
    await query(`
        INSERT INTO payment_gateway_config (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [key, value]);
}

async function run() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("❌ PayPal credentials missing in .env");
        process.exit(1);
    }
    try {
        const token = await generateAccessToken();
        const productId = await createProduct(token);
        
        const proMonthly = await createPlan(token, productId, "Pro Monthly", "RentalCar Pro Monthly", "49.00", "MONTH", 1);
        const proYearly = await createPlan(token, productId, "Pro Yearly", "RentalCar Pro Yearly (-20%)", "470.40", "YEAR", 1);
        const entMonthly = await createPlan(token, productId, "Enterprise Monthly", "RentalCar Enterprise Monthly", "149.00", "MONTH", 1);
        const entYearly = await createPlan(token, productId, "Enterprise Yearly", "RentalCar Enterprise Yearly (-20%)", "1430.40", "YEAR", 1);
        
        await saveKey('paypal_pro_monthly', proMonthly);
        await saveKey('paypal_pro_yearly', proYearly);
        await saveKey('paypal_enterprise_monthly', entMonthly);
        await saveKey('paypal_enterprise_yearly', entYearly);
        
        console.log("✅ PayPal setup complete! IDs saved to payment_gateway_config table.");
        process.exit(0);
    } catch(err) {
        console.error("❌ Setup failed:", err.message);
        process.exit(1);
    }
}

run();
