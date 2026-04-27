import { Router } from "express";
import Stripe from "stripe";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query, pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { sendEmail } from "../utils/mailer.js";

const r = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_LIMITS = {
    Standard: { max_vehicles: 5, max_users: 2 },
    Pro: { max_vehicles: 50, max_users: 10 },
    Enterprise: { max_vehicles: 999999, max_users: 999999 },
};

function safeDate(val) {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}

// ─── Helper: create enterprise+user after payment success ───
async function createAccountAfterPayment({ registrationData, planInfo, billing_period, gateway, gateway_subscription_id, gateway_customer_id, subscription_end }) {
    const { full_name, email, password_hash, enterprise_name, enterprise_address, registry_number, country, city, vat_number, enterprise_phone, plan } = registrationData;
    // Normalize phone: empty strings → null to avoid unique constraint violations
    const phone = registrationData.phone?.trim() || null;

    // Check if already created (idempotency)
    const existingUser = await query(`SELECT id FROM users WHERE email=$1`, [email]);
    if (existingUser.rows[0]) {
        console.log(`⚠️ Account already exists for ${email}, skipping creation.`);
        return existingUser.rows[0];
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Idempotency check: see if enterprise already exists with this gateway ID
        let enterprise;
        const existingEnt = await client.query(
            `SELECT * FROM enterprises WHERE gateway_customer_id = $1 OR (gateway_subscription_id = $2 AND gateway_subscription_id IS NOT NULL)`,
            [gateway_customer_id, gateway_subscription_id]
        );

        if (existingEnt.rows[0]) {
            enterprise = existingEnt.rows[0];
            // Update the existing enterprise instead of failing
            await client.query(
                `UPDATE enterprises 
                 SET plan = $1, status = 'active', subscription_status = 'active', billing_period = $2, 
                     max_vehicles = $3, max_users = $4, gateway_subscription_id = $5, 
                     payment_gateway = $6, subscription_end = $7
                 WHERE id = $8`,
                [planInfo.plan, billing_period, planInfo.max_vehicles, planInfo.max_users, 
                 gateway_subscription_id, gateway, safeDate(subscription_end), enterprise.id]
            );
        } else {
            try {
                const entResult = await client.query(
                    `INSERT INTO enterprises(name, address, registry_number, country, city, vat_number, enterprise_phone, plan, status, subscription_status, billing_period, max_vehicles, max_users, gateway_subscription_id, payment_gateway, gateway_customer_id, subscription_end)
                     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'active','active',$9,$10,$11,$12,$13,$14,$15)
                     RETURNING *`,
                    [enterprise_name, enterprise_address||null, registry_number||null, country||null, city||null, vat_number||null, enterprise_phone||null,
                     planInfo.plan, billing_period, planInfo.max_vehicles, planInfo.max_users,
                     gateway_subscription_id||null, gateway, gateway_customer_id||null, safeDate(subscription_end)]
                );
                enterprise = entResult.rows[0];
            } catch (insertErr) {
                if (insertErr.code === '23505') { // unique_violation
                    console.log(`⚠️ Concurrent insert detected for gateway_customer_id ${gateway_customer_id}. Fetching existing...`);
                    const concurrentEnt = await client.query(
                        `SELECT * FROM enterprises WHERE gateway_customer_id = $1`,
                        [gateway_customer_id]
                    );
                    enterprise = concurrentEnt.rows[0];
                    if (enterprise) {
                        await client.query(
                            `UPDATE enterprises 
                             SET plan = $1, status = 'active', subscription_status = 'active', billing_period = $2, 
                                 max_vehicles = $3, max_users = $4, gateway_subscription_id = $5, 
                                 payment_gateway = $6, subscription_end = $7
                             WHERE id = $8`,
                            [planInfo.plan, billing_period, planInfo.max_vehicles, planInfo.max_users, 
                             gateway_subscription_id, gateway, safeDate(subscription_end), enterprise.id]
                        );
                    } else {
                        throw insertErr;
                    }
                } else {
                    throw insertErr;
                }
            }
        }

        const existingUser = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
        if (!existingUser.rows[0]) {
            await client.query(
                `INSERT INTO users(enterprise_id, email, phone, full_name, password_hash, role)
                 VALUES($1, $2, $3, $4, $5, 'director')`,
                [enterprise.id, email, phone, full_name, password_hash]
            );
        } else {
            // Update existing director if needed
            await client.query(
                `UPDATE users SET enterprise_id = $1, role = 'director' WHERE id = $2`,
                [enterprise.id, existingUser.rows[0].id]
            );
        }
        const userResult = await client.query(
            `SELECT id, email, role, full_name, enterprise_id FROM users WHERE email = $1`,
            [email]
        );
        const user = userResult.rows[0];

        await client.query('COMMIT');
        console.log(`✅ Account created for ${email} (enterprise: ${enterprise.id})`);

        // Send welcome email with credentials
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            await sendEmail({
                to: email,
                subject: `Bienvenue sur RentalCar — Votre compte est actif !`,
                html: `
                    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:40px;border:1px solid #f0f0f0;border-radius:16px;color:#1a1a1a">
                        <div style="text-align:center;margin-bottom:24px">
                            <h1 style="color:#3b82f6;margin:0;font-size:26px">RentalCar 🚗</h1>
                        </div>
                        <h2 style="font-size:20px;font-weight:700;margin-bottom:12px">🎉 Votre compte est maintenant actif !</h2>
                        <p style="color:#4b5563;line-height:1.6">Bonjour <strong>${full_name}</strong>,</p>
                        <p style="color:#4b5563;line-height:1.6">Votre abonnement <strong>${planInfo.plan}</strong> a bien été validé. Voici vos identifiants de connexion :</p>
                        <div style="background:#f3f8ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px;margin:20px 0;text-align:center">
                            <p style="margin:0 0 8px"><strong>Email :</strong> ${email}</p>
                            <p style="margin:0;color:#6b7280;font-size:13px">Utilisez le mot de passe défini lors de votre inscription.</p>
                        </div>
                        <div style="text-align:center;margin:28px 0">
                            <a href="${frontendUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:16px">
                                Accéder à mon tableau de bord
                            </a>
                        </div>
                        <p style="font-size:12px;color:#9ca3af;text-align:center">© 2026 RentalCar System. Tous droits réservés.</p>
                    </div>
                `
            });
        } catch(mailErr) {
            console.error('Failed to send welcome email:', mailErr);
        }

        return user;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('createAccountAfterPayment error:', err);
        throw err;
    } finally {
        client.release();
    }
}

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

// ─── Helper: get price IDs from DB ───
async function getGatewayPrices() {
    const result = await query("SELECT key, value FROM payment_gateway_config WHERE key != 'product_id'");
    const prices = {};
    for (const row of result.rows) {
        prices[row.key] = row.value;
    }
    return prices;
}

// ─── Helper: map Price ID → plan name & limits ───
async function planFromPriceId(priceId) {
    const prices = await getGatewayPrices();

    if (priceId === prices.pro_monthly || priceId === prices.pro_yearly || priceId === prices.paypal_pro_monthly || priceId === prices.paypal_pro_yearly) {
        return {
            plan: "Pro",
            max_vehicles: 50,
            max_users: 10,
            billing_period: (priceId === prices.pro_yearly || priceId === prices.paypal_pro_yearly) ? "yearly" : "monthly",
        };
    }
    if (priceId === prices.enterprise_monthly || priceId === prices.enterprise_yearly || priceId === prices.paypal_enterprise_monthly || priceId === prices.paypal_enterprise_yearly) {
        return {
            plan: "Enterprise",
            max_vehicles: 999999,
            max_users: 999999,
            billing_period: (priceId === prices.enterprise_yearly || priceId === prices.paypal_enterprise_yearly) ? "yearly" : "monthly",
        };
    }
    return null;
}

// ─── Helper: PayPal Token ───
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
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

// ═══════════════════════════════════════
//  GET /plans — Public pricing info
// ═══════════════════════════════════════
r.get("/plans", async (_req, res) => {
    try {
        const prices = await getGatewayPrices();

        res.json({
            plans: [
                {
                    name: "Standard",
                    monthly_price: 0,
                    yearly_price: 0,
                    max_vehicles: 5,
                    max_users: 2,
                    features: ["Basic rental management", "Up to 5 vehicles", "Up to 2 users"],
                    price_id_monthly: null,
                    price_id_yearly: null,
                    paypal_price_id_monthly: null,
                    paypal_price_id_yearly: null,
                },
                {
                    name: "Pro",
                    monthly_price: 4900,
                    yearly_price: 47040,
                    monthly_price_display: "$49",
                    yearly_price_display: "$470.40",
                    yearly_monthly_display: "$39.20",
                    max_vehicles: 50,
                    max_users: 10,
                    features: [
                        "Full rental workflow",
                        "Up to 50 vehicles",
                        "Up to 10 users",
                        "Dashboard analytics",
                        "Email notifications",
                    ],
                    price_id_monthly: prices.pro_monthly || null,
                    price_id_yearly: prices.pro_yearly || null,
                    paypal_price_id_monthly: prices.paypal_pro_monthly || null,
                    paypal_price_id_yearly: prices.paypal_pro_yearly || null,
                },
                {
                    name: "Enterprise",
                    monthly_price: 14900,
                    yearly_price: 143040,
                    monthly_price_display: "$149",
                    yearly_price_display: "$1,430.40",
                    yearly_monthly_display: "$119.20",
                    max_vehicles: 999999,
                    max_users: 999999,
                    features: [
                        "Unlimited vehicles",
                        "Unlimited users",
                        "Multi-location support",
                        "API access",
                        "Priority support",
                        "Advanced analytics",
                    ],
                    price_id_monthly: prices.enterprise_monthly || null,
                    price_id_yearly: prices.enterprise_yearly || null,
                    paypal_price_id_monthly: prices.paypal_enterprise_monthly || null,
                    paypal_price_id_yearly: prices.paypal_enterprise_yearly || null,
                },
            ],
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ error: "Failed to fetch plans" });
    }
});

// ═══════════════════════════════════════
//  POST /register-checkout (STRIPE — Public, pre-registration)
// ═══════════════════════════════════════
r.post("/register-checkout", async (req, res) => {
    try {
        const { full_name, email, phone, password, enterprise_name, enterprise_address, registry_number, country, city, vat_number, enterprise_phone, plan, billing } = req.body;

        if (!full_name || !email || !password || !enterprise_name || !plan) {
            return res.status(400).json({ error: "Champs obligatoires manquants." });
        }
        if (!['Pro','Enterprise'].includes(plan)) {
            return res.status(400).json({ error: "Plan invalide pour le paiement." });
        }

        // Check email uniqueness early
        const existing = await query(`SELECT id FROM users WHERE email=$1`, [email]);
        if (existing.rows[0]) {
            return res.status(400).json({ error: "Ce compte existe déjà. Veuillez vous connecter avec vos identifiants." });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const isYearly = billing === 'yearly';

        const prices = await getGatewayPrices();
        const priceId = plan === 'Pro'
            ? (isYearly ? prices.pro_yearly : prices.pro_monthly)
            : (isYearly ? prices.enterprise_yearly : prices.enterprise_monthly);

        if (!priceId) {
            return res.status(400).json({ error: "Prix non configuré pour ce plan." });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // ✅ FIX: Store registration data in DB (Stripe metadata limit is 500 chars per key)
        // Using same approach as PayPal — pending_registrations table
        const pendingResult = await query(
            `INSERT INTO pending_registrations(email, data)
             VALUES($1,$2)
             ON CONFLICT(email) DO UPDATE SET data=$2, created_at=now()
             RETURNING id`,
            [email, JSON.stringify({ full_name, email, phone: phone||null, password_hash, enterprise_name, enterprise_address: enterprise_address||null, registry_number: registry_number||null, country: country||null, city: city||null, vat_number: vat_number||null, enterprise_phone: enterprise_phone||null, plan })]
        );
        const pendingId = pendingResult.rows[0].id;

        // Create Stripe customer first
        const customer = await stripe.customers.create({
            email,
            name: full_name,
            metadata: { pending_registration: 'true' }
        });

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${frontendUrl}/register?success=true&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/register?step=4`,
            // Only store the short pending ID — not the full JSON (Stripe limit: 500 chars/key)
            metadata: { pending_id: String(pendingId), payment_gateway: 'stripe' },
            subscription_data: {
                metadata: { pending_id: String(pendingId), payment_gateway: 'stripe' }
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('register-checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});


// ═══════════════════════════════════════
//  POST /register-paypal (PAYPAL — Public, pre-registration)
// ═══════════════════════════════════════
r.post("/register-paypal", async (req, res) => {
    try {
        const { full_name, email, phone, password, enterprise_name, enterprise_address, registry_number, country, city, vat_number, enterprise_phone, plan, billing } = req.body;

        if (!full_name || !email || !password || !enterprise_name || !plan) {
            return res.status(400).json({ error: "Champs obligatoires manquants." });
        }
        if (!['Pro','Enterprise'].includes(plan)) {
            return res.status(400).json({ error: "Plan invalide pour le paiement." });
        }

        const existing = await query(`SELECT id FROM users WHERE email=$1`, [email]);
        if (existing.rows[0]) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const isYearly = billing === 'yearly';

        const prices = await getGatewayPrices();
        const planId = plan === 'Pro'
            ? (isYearly ? prices.paypal_pro_yearly : prices.paypal_pro_monthly)
            : (isYearly ? prices.paypal_enterprise_yearly : prices.paypal_enterprise_monthly);

        if (!planId) {
            return res.status(400).json({ error: "Plan PayPal non configuré." });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const token = await getPayPalAccessToken();

        // We encode registration data as a JSON string in custom_id (PayPal 127 char limit — use a reference key)
        // Store registration data temporarily in DB pending_registrations table
        const pendingResult = await query(
            `INSERT INTO pending_registrations(email, data) VALUES($1,$2) ON CONFLICT(email) DO UPDATE SET data=$2, created_at=now() RETURNING id`,
            [email, JSON.stringify({ full_name, email, phone: phone||null, password_hash, enterprise_name, enterprise_address: enterprise_address||null, registry_number: registry_number||null, country: country||null, city: city||null, vat_number: vat_number||null, enterprise_phone: enterprise_phone||null, plan })]
        );
        const pendingId = pendingResult.rows[0].id;

        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan_id: planId,
                custom_id: `PENDING:${pendingId}`,
                application_context: {
                    brand_name: 'RentalCar',
                    locale: 'fr-FR',
                    shipping_preference: 'NO_SHIPPING',
                    return_url: `${frontendUrl}/register?success=true&gateway=paypal`,
                    cancel_url: `${frontendUrl}/register?step=4`
                }
            })
        });

        const subscription = await response.json();
        if (!response.ok) {
            console.error('PayPal Subscription Error:', subscription);
            return res.status(500).json({ error: 'Failed to create PayPal subscription' });
        }

        const approveUrl = subscription.links.find(l => l.rel === 'approve')?.href;
        res.json({ url: approveUrl });
    } catch (err) {
        console.error('register-paypal error:', err);
        res.status(500).json({ error: 'Failed to create PayPal subscription' });
    }
});

// ═══════════════════════════════════════
//  POST /create-checkout-session (STRIPE — existing subscribers)
// ═══════════════════════════════════════
r.post("/create-checkout-session", requireAuth, requireRole("director"), async (req, res) => {
    try {
        const { price_id } = req.body;

        if (!price_id) {
            return res.status(400).json({ error: "price_id is required" });
        }

        const enterpriseId = req.user.enterprise_id;

        const enterprise = await query(
            "SELECT id, name, gateway_customer_id FROM enterprises WHERE id = $1",
            [enterpriseId]
        );
        if (!enterprise.rows[0]) {
            return res.status(404).json({ error: "Enterprise not found" });
        }

        const ent = enterprise.rows[0];
        let customerId = ent.gateway_customer_id;

        if (!customerId || !customerId.startsWith("cus_")) {
            const userResult = await query("SELECT email FROM users WHERE id = $1", [req.user.id]);
            const email = userResult.rows[0]?.email;

            const customer = await stripe.customers.create({
                email: email,
                name: ent.name,
                metadata: { enterprise_id: enterpriseId },
            });

            customerId = customer.id;

            await query(
                "UPDATE enterprises SET gateway_customer_id = $1 WHERE id = $2",
                [customerId, enterpriseId]
            );
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [{ price: price_id, quantity: 1 }],
            mode: "subscription",
            success_url: `${frontendUrl}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/billing?status=canceled`,
            metadata: {
                enterprise_id: enterpriseId,
                payment_gateway: "stripe"
            },
            subscription_data: {
                metadata: {
                    enterprise_id: enterpriseId,
                    payment_gateway: "stripe"
                },
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Checkout session error:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// ═══════════════════════════════════════
//  POST /create-paypal-subscription (PAYPAL)
// ═══════════════════════════════════════
r.post("/create-paypal-subscription", requireAuth, requireRole("director"), async (req, res) => {
    try {
        const { plan_id } = req.body;
        if (!plan_id) return res.status(400).json({ error: "plan_id is required" });

        const enterpriseId = req.user.enterprise_id;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const token = await getPayPalAccessToken();

        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                plan_id: plan_id,
                custom_id: enterpriseId, // We use custom_id to track the enterprise
                application_context: {
                    brand_name: "RentalCar",
                    locale: "fr-FR",
                    shipping_preference: "NO_SHIPPING",
                    return_url: `${frontendUrl}/billing?status=success&gateway=paypal`,
                    cancel_url: `${frontendUrl}/billing?status=canceled`
                }
            })
        });

        const subscription = await response.json();
        
        if (!response.ok) {
            console.error("PayPal Subscription Error:", subscription);
            return res.status(500).json({ error: "Failed to create PayPal subscription" });
        }

        const approveUrl = subscription.links.find(link => link.rel === "approve")?.href;
        res.json({ url: approveUrl });

    } catch(err) {
        console.error("PayPal checkout error:", err);
        res.status(500).json({ error: "Failed to create PayPal subscription" });
    }
});

// ═══════════════════════════════════════
//  POST /customer-portal
// ═══════════════════════════════════════
r.post("/customer-portal", requireAuth, requireRole("director"), async (req, res) => {
    try {
        const enterpriseId = req.user.enterprise_id;

        const enterprise = await query(
            "SELECT gateway_customer_id, payment_gateway, gateway_subscription_id FROM enterprises WHERE id = $1",
            [enterpriseId]
        );

        const ent = enterprise.rows[0];

        if (!ent?.gateway_subscription_id) {
            return res.status(400).json({ error: "No active subscription found. Please subscribe first." });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        if (ent.payment_gateway === 'stripe') {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: ent.gateway_customer_id,
                return_url: `${frontendUrl}/billing`,
            });
            res.json({ url: portalSession.url });
        } else if (ent.payment_gateway === 'paypal') {
            // PayPal doesn't have an exact equivalent drop-in portal, often you redirect to PayPal App:
            res.json({ url: "https://www.paypal.com/myaccount/autopay/" });
        } else {
             res.status(400).json({ error: "Unknown gateway" });
        }

    } catch (error) {
        console.error("Customer portal error:", error);
        res.status(500).json({ error: "Failed to create portal session" });
    }
});

// ═══════════════════════════════════════
//  GET /subscription-status
// ═══════════════════════════════════════
r.get("/subscription-status", requireAuth, requireRole("director"), async (req, res) => {
    try {
        const enterprise = await query(
            `SELECT plan, subscription_status, billing_period, grace_period_end, 
                    gateway_subscription_id, payment_gateway, status
             FROM enterprises WHERE id = $1`,
            [req.user.enterprise_id]
        );

        if (!enterprise.rows[0]) {
            return res.status(404).json({ error: "Enterprise not found" });
        }

        const ent = enterprise.rows[0];
        const result = {
            plan: ent.plan,
            subscription_status: ent.subscription_status,
            billing_period: ent.billing_period,
            enterprise_status: ent.status,
            grace_period_end: ent.grace_period_end,
            payment_gateway: ent.payment_gateway,
        };

        if (ent.gateway_subscription_id && ent.subscription_status === "active") {
            if (ent.payment_gateway === 'stripe') {
                try {
                    const sub = await stripe.subscriptions.retrieve(ent.gateway_subscription_id);
                    result.current_period_end = new Date(sub.current_period_end * 1000).toISOString();
                    result.cancel_at_period_end = sub.cancel_at_period_end;
                } catch {}
            } else if (ent.payment_gateway === 'paypal') {
                 try {
                     const token = await getPayPalAccessToken();
                     const subRes = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${ent.gateway_subscription_id}`, {
                         headers: { Authorization: `Bearer ${token}` }
                     });
                     const sub = await subRes.json();
                     if (sub.billing_info?.next_billing_time) {
                         result.current_period_end = sub.billing_info.next_billing_time;
                     }
                 } catch {}
            }
        }

        res.json(result);
    } catch (error) {
        console.error("Subscription status error:", error);
        res.status(500).json({ error: "Failed to fetch subscription status" });
    }
});

// ═══════════════════════════════════════
//  POST /webhook — Stripe webhook handler
// ═══════════════════════════════════════
r.post("/webhook", async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (endpointSecret) {
        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        try {
            event = JSON.parse(payload.toString());
        } catch {
            return res.status(400).send("Invalid payload");
        }
    }

    console.log(`📩 Stripe event: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                if (session.mode !== 'subscription') break;

                const subscriptionId = session.subscription;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price?.id;
                const planInfo = await planFromPriceId(priceId);
                if (!planInfo) break;

                const billingPeriod = planInfo.billing_period;

                // Case 1: NEW registration — read from pending_registrations DB (pending_id in metadata)
                const pendingId = session.metadata?.pending_id;
                if (pendingId) {
                    const pending = await query(`SELECT data FROM pending_registrations WHERE id=$1`, [pendingId]);
                    if (pending.rows[0]) {
                        try {
                            const data = pending.rows[0].data;
                            const registrationData = typeof data === 'string' ? JSON.parse(data) : data;
                            await createAccountAfterPayment({
                                registrationData,
                                planInfo,
                                billing_period: billingPeriod,
                                gateway: 'stripe',
                                gateway_subscription_id: subscriptionId,
                                gateway_customer_id: session.customer,
                                subscription_end: safeDate(subscription.current_period_end * 1000)
                            });
                            await query(`DELETE FROM pending_registrations WHERE id=$1`, [pendingId]);
                        } catch(e) {
                            console.error('Failed to create account from Stripe webhook:', e);
                        }
                    }
                    break;
                }

                // Legacy fallback: registration_data in metadata (old sessions)
                const rawRegData = session.metadata?.registration_data;
                if (rawRegData) {
                    try {
                        const registrationData = JSON.parse(rawRegData);
                        await createAccountAfterPayment({
                            registrationData,
                            planInfo,
                            billing_period: billingPeriod,
                            gateway: 'stripe',
                            gateway_subscription_id: subscriptionId,
                            gateway_customer_id: session.customer,
                            subscription_end: new Date(subscription.current_period_end * 1000)
                        });
                    } catch(e) {
                        console.error('Failed to create account from Stripe webhook (legacy):', e);
                    }
                    break;
                }

                // Case 2: Existing enterprise upgrade
                const enterpriseId = session.metadata?.enterprise_id;
                if (enterpriseId) {
                    await query(
                        `UPDATE enterprises
                         SET plan = $1, max_vehicles = $2, max_users = $3,
                             gateway_subscription_id = $4, payment_gateway = 'stripe',
                             subscription_status = 'active', billing_period = $5,
                             status = 'active', grace_period_end = NULL, deactivated_at = NULL,
                             subscription_end = $6
                         WHERE id = $7`,
                        [planInfo.plan, planInfo.max_vehicles, planInfo.max_users, subscriptionId, billingPeriod, new Date(subscription.current_period_end * 1000), enterpriseId]
                    );
                    console.log(`✅ Enterprise ${enterpriseId} upgraded via Stripe`);
                }
                break;
            }

            case "invoice.paid": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                if (!subscriptionId) break;

                const enterprise = await query("SELECT id, subscription_status FROM enterprises WHERE gateway_subscription_id = $1", [subscriptionId]);
                if (enterprise.rows[0]) {
                    const ent = enterprise.rows[0];
                    if (ent.subscription_status === "past_due") {
                        await query(`UPDATE enterprises SET subscription_status = 'active', status = 'active', grace_period_end = NULL, deactivated_at = NULL WHERE id = $1`, [ent.id]);
                    }
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                if (!subscriptionId) break;

                const enterprise = await query("SELECT id, grace_period_end FROM enterprises WHERE gateway_subscription_id = $1", [subscriptionId]);
                if (enterprise.rows[0]) {
                    const ent = enterprise.rows[0];
                    if (!ent.grace_period_end) {
                        const gracePeriodEnd = new Date();
                        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
                        await query(`UPDATE enterprises SET subscription_status = 'past_due', grace_period_end = $1 WHERE id = $2`, [gracePeriodEnd.toISOString(), ent.id]);
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const enterprise = await query("SELECT id FROM enterprises WHERE gateway_subscription_id = $1", [subscription.id]);
                if (enterprise.rows[0]) {
                    await query(`UPDATE enterprises SET plan = 'Standard', max_vehicles = 5, max_users = 2, subscription_status = 'canceled', gateway_subscription_id = NULL, billing_period = 'monthly', grace_period_end = NULL, payment_gateway = NULL WHERE id = $1`, [enterprise.rows[0].id]);
                }
                break;
            }
        }
    } catch (err) {
        console.error("Stripe Webhook processing error:", err);
    }
    res.json({ received: true });
});

// ═══════════════════════════════════════
//  POST /webhook/paypal — PayPal webhook handler
// ═══════════════════════════════════════
r.post("/webhook/paypal", async (req, res) => {
    // Note: In production you should verify PayPal's webhook signature.
    // For now we accept the payload and process matching events.
    const event = req.body;
    console.log(`📩 PayPal event: ${event.event_type}`);

    try {
        switch(event.event_type) {
            case "BILLING.SUBSCRIPTION.ACTIVATED": {
                const subscription = event.resource;
                const customId = subscription.custom_id || '';
                const planId = subscription.plan_id;

                const planInfo = await planFromPriceId(planId);
                if (!planInfo) break;

                // Case 1: NEW registration (custom_id starts with PENDING:)
                if (customId.startsWith('PENDING:')) {
                    const pendingId = customId.replace('PENDING:', '');
                    const pending = await query(`SELECT data FROM pending_registrations WHERE id=$1`, [pendingId]);
                    if (pending.rows[0]) {
                        try {
                            const data = pending.rows[0].data;
                            const registrationData = typeof data === 'string' ? JSON.parse(data) : data;
                            await createAccountAfterPayment({
                                registrationData,
                                planInfo,
                                billing_period: planInfo.billing_period,
                                gateway: 'paypal',
                                gateway_subscription_id: subscription.id,
                                gateway_customer_id: subscription.subscriber?.payer_id || null,
                                subscription_end: safeDate(subscription.billing_info?.next_billing_time)
                            });
                            await query(`DELETE FROM pending_registrations WHERE id=$1`, [pendingId]);
                        } catch(e) {
                            console.error('Failed to create account from PayPal webhook:', e);
                        }
                    }
                    break;
                }

                // Case 2: Existing enterprise upgrade
                const enterpriseId = customId;
                if (enterpriseId) {
                    await query(
                        `UPDATE enterprises
                         SET plan = $1, max_vehicles = $2, max_users = $3,
                             gateway_subscription_id = $4, payment_gateway = 'paypal', gateway_customer_id = $5,
                             subscription_status = 'active', billing_period = $6,
                             status = 'active', grace_period_end = NULL, deactivated_at = NULL,
                             subscription_end = $7
                         WHERE id = $8`,
                        [planInfo.plan, planInfo.max_vehicles, planInfo.max_users, subscription.id, subscription.subscriber?.payer_id, planInfo.billing_period,
                         subscription.billing_info?.next_billing_time ? new Date(subscription.billing_info.next_billing_time) : null,
                         enterpriseId]
                    );
                    console.log(`✅ Enterprise ${enterpriseId} upgraded via PayPal`);
                }
                break;
            }

            case "PAYMENT.SALE.DENIED":
            case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
                const resource = event.resource;
                // resource might be a sale or subscription. We need the subscription ID.
                const subscriptionId = resource.billing_agreement_id || resource.id; 
                if (!subscriptionId) break;

                const enterprise = await query("SELECT id, grace_period_end FROM enterprises WHERE gateway_subscription_id = $1", [subscriptionId]);
                if (enterprise.rows[0]) {
                    const ent = enterprise.rows[0];
                    if (!ent.grace_period_end) {
                        const gracePeriodEnd = new Date();
                        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
                        await query(`UPDATE enterprises SET subscription_status = 'past_due', grace_period_end = $1 WHERE id = $2`, [gracePeriodEnd.toISOString(), ent.id]);
                        console.log(`⚠️ PayPal payment failed for ${ent.id}, grace period started.`);
                    }
                }
                break;
            }
            
            case "PAYMENT.SALE.COMPLETED": {
                const resource = event.resource;
                const subscriptionId = resource.billing_agreement_id;
                if (!subscriptionId) break;

                const enterprise = await query("SELECT id, subscription_status FROM enterprises WHERE gateway_subscription_id = $1", [subscriptionId]);
                if (enterprise.rows[0]) {
                    const ent = enterprise.rows[0];
                    if (ent.subscription_status === "past_due") {
                         await query(`UPDATE enterprises SET subscription_status = 'active', status = 'active', grace_period_end = NULL, deactivated_at = NULL WHERE id = $1`, [ent.id]);
                         console.log(`✅ PayPal sub ${ent.id} reactivated after payment.`);
                    }
                }
                break;
            }

            case "BILLING.SUBSCRIPTION.CANCELLED":
            case "BILLING.SUBSCRIPTION.SUSPENDED":
            case "BILLING.SUBSCRIPTION.EXPIRED": {
                const subscription = event.resource;
                const enterprise = await query("SELECT id FROM enterprises WHERE gateway_subscription_id = $1", [subscription.id]);
                if (enterprise.rows[0]) {
                    await query(`UPDATE enterprises SET plan = 'Standard', max_vehicles = 5, max_users = 2, subscription_status = 'canceled', gateway_subscription_id = NULL, billing_period = 'monthly', grace_period_end = NULL, payment_gateway = NULL WHERE id = $1`, [enterprise.rows[0].id]);
                    console.log(`🔻 Enterprise ${enterprise.rows[0].id} downgraded via PayPal Cancelation`);
                }
                break;
            }
        }
    } catch(err) {
        console.error("PayPal webhook error:", err);
    }

    res.status(200).send("OK");
});

// ═══════════════════════════════════════
//  POST /verify-session — Verify Stripe session & create account (fallback for local dev / webhook delays)
// ═══════════════════════════════════════
r.post("/verify-session", async (req, res) => {
    try {
        const { session_id } = req.body;
        if (!session_id) {
            return res.status(400).json({ error: "session_id is required" });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // Only process completed subscription sessions
        if (session.payment_status !== "paid" || session.mode !== "subscription") {
            return res.status(400).json({ error: "Payment not completed or not a subscription" });
        }

        // ── GLOBAL IDEMPOTENCY: check if enterprise already exists for this Stripe customer ──
        const existingEntByCustomer = await query(
            `SELECT e.id, u.email FROM enterprises e LEFT JOIN users u ON u.enterprise_id = e.id AND u.role = 'director' WHERE e.gateway_customer_id = $1`,
            [session.customer]
        );
        if (existingEntByCustomer.rows[0]) {
            // Enterprise + director already exist — clean up pending if any
            const pendingId = session.metadata?.pending_id;
            if (pendingId) await query(`DELETE FROM pending_registrations WHERE id=$1`, [pendingId]);
            return res.json({ ok: true, message: "Account already created." });
        }

        // Retrieve the subscription for plan info
        const subscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = await planFromPriceId(priceId);

        if (!planInfo) {
            return res.status(400).json({ error: "Could not determine plan from price." });
        }

        // ── Case 1: pending_id in metadata (new approach) ──
        const pendingId = session.metadata?.pending_id;
        if (pendingId) {
            const pending = await query(`SELECT data FROM pending_registrations WHERE id=$1`, [pendingId]);
            if (!pending.rows[0]) {
                return res.json({ ok: true, message: "Account already created." });
            }
            const data = pending.rows[0].data;
            const registrationData = typeof data === 'string' ? JSON.parse(data) : data;

            // Idempotency: check if user already created
            const existingUser = await query(`SELECT id FROM users WHERE email=$1`, [registrationData.email]);
            if (existingUser.rows[0]) {
                await query(`DELETE FROM pending_registrations WHERE id=$1`, [pendingId]);
                return res.json({ ok: true, message: "Account already created." });
            }

            await createAccountAfterPayment({
                registrationData,
                planInfo,
                billing_period: planInfo.billing_period,
                gateway: 'stripe',
                gateway_subscription_id: subscriptionId,
                gateway_customer_id: session.customer,
                subscription_end: safeDate(subscription.current_period_end * 1000)
            });
            await query(`DELETE FROM pending_registrations WHERE id=$1`, [pendingId]);
            return res.json({ ok: true, message: "Account created successfully." });
        }

        // ── Case 2: Legacy — registration_data in metadata ──
        const rawRegData = session.metadata?.registration_data;
        if (!rawRegData) {
            return res.json({ ok: true, message: "Existing user upgrade — processed via webhook." });
        }

        const registrationData = JSON.parse(rawRegData);

        const existingUser = await query(`SELECT id FROM users WHERE email=$1`, [registrationData.email]);
        if (existingUser.rows[0]) {
            return res.json({ ok: true, message: "Account already created." });
        }

        await createAccountAfterPayment({
            registrationData,
            planInfo,
            billing_period: planInfo.billing_period,
            gateway: 'stripe',
            gateway_subscription_id: subscriptionId,
            gateway_customer_id: session.customer,
            subscription_end: safeDate(subscription.current_period_end * 1000)
        });

        res.json({ ok: true, message: "Account created successfully." });
    } catch (err) {
        console.error("verify-session error:", err.message, err.stack);
        res.status(500).json({ error: `Failed to verify session and create account. Detail: ${err.message}` });
    }
});

export default r;
