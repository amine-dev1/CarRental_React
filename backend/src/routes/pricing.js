import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requirePermission("admin.access"));
r.use(requireEnterpriseScope);

// GET /api/pricing — list all pricing rules
r.get("/", async (req, res) => {
    try {
        const data = await query(
            `SELECT p.*, v.name as vehicle_name, v.plate as vehicle_plate, c.name as category_name
             FROM pricing_rules p
             LEFT JOIN vehicles v ON p.vehicle_id = v.id
             LEFT JOIN vehicle_categories c ON p.category_id = c.id
             WHERE p.enterprise_id = $1
             ORDER BY p.created_at DESC`,
            [req.user.enterprise_id]
        );
        res.json(data.rows);
    } catch (e) {
        console.error("GET /pricing error:", e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

const PricingSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional().nullable(),
    rule_type: z.enum(["seasonal", "weekly", "monthly", "weekend", "long_term", "custom"]),
    vehicle_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    discount_percent: z.number().int().min(0).max(100).optional().nullable(),
    surcharge_percent: z.number().int().min(0).max(200).optional().nullable(),
    min_days: z.number().int().min(1).optional().nullable(),
    is_active: z.boolean().default(true),
});

// POST /api/pricing
r.post("/", async (req, res) => {
    const parsed = PricingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const d = parsed.data;
    try {
        const data = await query(
            `INSERT INTO pricing_rules (enterprise_id, name, description, rule_type, vehicle_id, category_id, start_date, end_date, discount_percent, surcharge_percent, min_days, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [req.user.enterprise_id, d.name, d.description||null, d.rule_type, d.vehicle_id||null, d.category_id||null, d.start_date||null, d.end_date||null, d.discount_percent??null, d.surcharge_percent??null, d.min_days??null, d.is_active]
        );
        res.status(201).json(data.rows[0]);
    } catch (e) { console.error("POST /pricing error:", e); res.status(500).json({ error: "Erreur lors de la création" }); }
});

// PUT /api/pricing/:id
r.put("/:id", async (req, res) => {
    const parsed = PricingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const d = parsed.data;
    try {
        const data = await query(
            `UPDATE pricing_rules SET name=$1, description=$2, rule_type=$3, vehicle_id=$4, category_id=$5, start_date=$6, end_date=$7, discount_percent=$8, surcharge_percent=$9, min_days=$10, is_active=$11, updated_at=now()
             WHERE id=$12 AND enterprise_id=$13 RETURNING *`,
            [d.name, d.description||null, d.rule_type, d.vehicle_id||null, d.category_id||null, d.start_date||null, d.end_date||null, d.discount_percent??null, d.surcharge_percent??null, d.min_days??null, d.is_active, req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Règle introuvable" });
        res.json(data.rows[0]);
    } catch (e) { console.error("PUT /pricing error:", e); res.status(500).json({ error: "Erreur lors de la mise à jour" }); }
});

// PATCH /api/pricing/:id/toggle — toggle active
r.patch("/:id/toggle", async (req, res) => {
    try {
        const data = await query(
            `UPDATE pricing_rules SET is_active = NOT is_active, updated_at = now() WHERE id=$1 AND enterprise_id=$2 RETURNING *`,
            [req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Règle introuvable" });
        res.json(data.rows[0]);
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// DELETE /api/pricing/:id
r.delete("/:id", async (req, res) => {
    try {
        const data = await query(`DELETE FROM pricing_rules WHERE id=$1 AND enterprise_id=$2 RETURNING id`, [req.params.id, req.user.enterprise_id]);
        if (!data.rows[0]) return res.status(404).json({ error: "Règle introuvable" });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

export default r;
