import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requirePermission("categories.view"));
r.use(requireEnterpriseScope);

const CategorySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().nullable(),
    color: z.string().max(20).optional().nullable(),
    daily_price_cents: z.number().int().nonnegative().optional().nullable(),
});

// GET /api/categories — list all categories for this enterprise
r.get("/", async (req, res) => {
    try {
        const data = await query(
            `SELECT id, name, description, color, daily_price_cents, created_at,
                (SELECT COUNT(*) FROM vehicles v WHERE v.category_id = vehicle_categories.id AND v.enterprise_id = $1) AS vehicle_count
             FROM vehicle_categories
             WHERE enterprise_id = $1
             ORDER BY name ASC`,
            [req.user.enterprise_id]
        );
        res.json(data.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/categories/:id — single category
r.get("/:id", async (req, res) => {
    try {
        const data = await query(
            `SELECT * FROM vehicle_categories WHERE id = $1 AND enterprise_id = $2`,
            [req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Category not found" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/categories — create
r.post("/", async (req, res) => {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const { name, description, icon, color } = parsed.data;

    try {
        // Check duplicate name for this enterprise
        const exists = await query(
            `SELECT id FROM vehicle_categories WHERE name ILIKE $1 AND enterprise_id = $2`,
            [name, req.user.enterprise_id]
        );
        if (exists.rows.length) return res.status(409).json({ error: "Une catégorie avec ce nom existe déjà." });

        const data = await query(
            `INSERT INTO vehicle_categories (enterprise_id, name, description, color, daily_price_cents)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.enterprise_id, name, description || null, color || "#6366F1", parsed.data.daily_price_cents ?? null]
        );
        res.status(201).json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PUT /api/categories/:id — update
r.put("/:id", async (req, res) => {
    const parsed = CategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const { name, description, icon, color } = parsed.data;

    try {
        // Check duplicate name (exclude self)
        const exists = await query(
            `SELECT id FROM vehicle_categories WHERE name ILIKE $1 AND enterprise_id = $2 AND id != $3`,
            [name, req.user.enterprise_id, req.params.id]
        );
        if (exists.rows.length) return res.status(409).json({ error: "Une catégorie avec ce nom existe déjà." });

        const data = await query(
            `UPDATE vehicle_categories SET name=$1, description=$2, color=$3, daily_price_cents=$4, updated_at=now()
             WHERE id=$5 AND enterprise_id=$6 RETURNING *`,
            [name, description || null, color || "#6366F1", parsed.data.daily_price_cents ?? null, req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Category not found" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /api/categories/:id — delete
r.delete("/:id", async (req, res) => {
    try {
        // Check if category has vehicles assigned
        const vehicles = await query(
            `SELECT COUNT(*) FROM vehicles WHERE category_id = $1 AND enterprise_id = $2`,
            [req.params.id, req.user.enterprise_id]
        );
        if (parseInt(vehicles.rows[0].count) > 0) {
            return res.status(409).json({
                error: `Impossible de supprimer : ${vehicles.rows[0].count} véhicule(s) utilisent cette catégorie. Réassignez-les d'abord.`
            });
        }

        const data = await query(
            `DELETE FROM vehicle_categories WHERE id=$1 AND enterprise_id=$2 RETURNING *`,
            [req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Category not found" });
        res.json({ success: true, deleted: data.rows[0] });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default r;
