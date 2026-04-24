/**
 * update-prices.js
 * Crée de nouveaux prix Stripe + plans PayPal avec les montants corrects
 * et met à jour la table payment_gateway_config en DB.
 *
 * Nouveaux tarifs annuels :
 *   - Pro Yearly     : $480 / an  ($40/mois)
 *   - Enterprise Yearly: $1440 / an ($120/mois)
 *
 * Run: node scripts/update-prices.js
 */
import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import fetch from "node-fetch";
import { query } from "../src/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE =
    process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

// ─── Stripe ───────────────────────────────────────────────
async function updateStripe() {
    console.log("\n🔵 STRIPE — Création des nouveaux prix...\n");

    // Récupère l'ID produit existant
    const existing = await query(
        "SELECT value FROM payment_gateway_config WHERE key='product_id'"
    );
    if (!existing.rows[0]) {
        throw new Error("product_id introuvable en DB. Lancez d'abord stripe-setup.js.");
    }
    const productId = existing.rows[0].value;
    console.log(`✅ Produit Stripe existant: ${productId}`);

    const newPrices = [
        { key: "pro_yearly",          nickname: "Pro Yearly (NEW)",          unit_amount: 48000,  interval: "year"  }, // $480/an
        { key: "enterprise_yearly",   nickname: "Enterprise Yearly (NEW)",    unit_amount: 144000, interval: "year"  }, // $1440/an
        // Mensuels inchangés — recréés pour cohérence (optionnel, commenter si OK)
        // { key: "pro_monthly",      nickname: "Pro Monthly",                unit_amount: 4900,   interval: "month" },
        // { key: "enterprise_monthly", nickname: "Enterprise Monthly",       unit_amount: 14900,  interval: "month" },
    ];

    for (const plan of newPrices) {
        const price = await stripe.prices.create({
            product: productId,
            unit_amount: plan.unit_amount,
            currency: "usd",
            recurring: { interval: plan.interval },
            nickname: plan.nickname,
        });

        await query(
            "INSERT INTO payment_gateway_config(key, value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2",
            [plan.key, price.id]
        );

        console.log(
            `✅ ${plan.nickname} → ${price.id}  ($${(plan.unit_amount / 100).toFixed(2)}/${plan.interval})`
        );
    }
}

// ─── PayPal ───────────────────────────────────────────────
async function getPayPalToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const data = await res.json();
    return data.access_token;
}

async function createPayPalPlan(token, productId, name, description, amount) {
    console.log(`💳 Création du plan PayPal: ${name} (${amount}$)...`);
    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "PayPal-Request-Id": "PLAN-NEW-" + name.replace(/\s+/g, "") + "-" + Date.now(),
        },
        body: JSON.stringify({
            product_id: productId,
            name,
            description,
            status: "ACTIVE",
            billing_cycles: [
                {
                    frequency: { interval_unit: "YEAR", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: { value: amount.toString(), currency_code: "USD" },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: "0.00", currency_code: "USD" },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3,
            },
        }),
    });
    const plan = await res.json();
    if (!res.ok) {
        console.error("PayPal Error:", plan);
        throw new Error(`Échec création plan PayPal: ${name}`);
    }
    return plan.id;
}

async function updatePayPal() {
    console.log("\n🟡 PAYPAL — Création des nouveaux plans...\n");

    const token = await getPayPalToken();

    // On réutilise le produit PayPal existant ou on en crée un nouveau
    // Récupère paypal_product_id si sauvegardé, sinon crée un nouveau produit
    let productId;
    const ppProduct = await query(
        "SELECT value FROM payment_gateway_config WHERE key='paypal_product_id'"
    );
    if (ppProduct.rows[0]) {
        productId = ppProduct.rows[0].value;
        console.log(`✅ Produit PayPal existant: ${productId}`);
    } else {
        // Créer un produit
        const prodRes = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "PayPal-Request-Id": "PRODUCT-RENTALCAR-UPDATE-" + Date.now(),
            },
            body: JSON.stringify({
                name: "RentalCar B2B SaaS",
                description: "Abonnement RentalCar",
                type: "SERVICE",
                category: "SOFTWARE",
            }),
        });
        const prod = await prodRes.json();
        productId = prod.id;
        await query(
            "INSERT INTO payment_gateway_config(key,value) VALUES('paypal_product_id',$1) ON CONFLICT(key) DO UPDATE SET value=$1",
            [productId]
        );
        console.log(`✅ Nouveau produit PayPal: ${productId}`);
    }

    const proYearlyId = await createPayPalPlan(
        token, productId,
        "Pro Yearly (NEW)", "RentalCar Pro Yearly $480/an", "480.00"
    );
    await query(
        "INSERT INTO payment_gateway_config(key,value) VALUES('paypal_pro_yearly',$1) ON CONFLICT(key) DO UPDATE SET value=$1",
        [proYearlyId]
    );
    console.log(`✅ paypal_pro_yearly → ${proYearlyId}`);

    const entYearlyId = await createPayPalPlan(
        token, productId,
        "Enterprise Yearly (NEW)", "RentalCar Enterprise Yearly $1440/an", "1440.00"
    );
    await query(
        "INSERT INTO payment_gateway_config(key,value) VALUES('paypal_enterprise_yearly',$1) ON CONFLICT(key) DO UPDATE SET value=$1",
        [entYearlyId]
    );
    console.log(`✅ paypal_enterprise_yearly → ${entYearlyId}`);
}

// ─── Main ──────────────────────────────────────────────────
async function main() {
    try {
        await updateStripe();
        await updatePayPal();
        console.log("\n🎉 Mise à jour terminée ! Les nouveaux prix sont actifs en DB.");
        process.exit(0);
    } catch (err) {
        console.error("\n❌ Erreur:", err.message);
        process.exit(1);
    }
}

main();
