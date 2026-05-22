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

// ─── All available permissions ───────────────────────────────────────────────
const ALL_PERMISSIONS = [
    "fleet.view", "fleet.create", "fleet.edit", "fleet.delete",
    "customers.view", "customers.create", "customers.edit", "customers.delete",
    "rentals.view", "rentals.create", "rentals.edit", "rentals.delete",
    "reservations.view", "reservations.create", "reservations.edit", "reservations.delete",
    "agencies.view", "agencies.create", "agencies.edit", "agencies.delete",
    "categories.view", "categories.create", "categories.edit", "categories.delete",
    "reports.view", "reports.export",
    "contracts.view", "contracts.create", "contracts.sign", "contracts.download", "contracts.template.manage",
    "admin.access",
];

// GET /api/roles/permissions — list all available permissions
r.get("/permissions", (_req, res) => {
    const groups = {};
    ALL_PERMISSIONS.forEach(p => {
        const [module] = p.split(".");
        if (!groups[module]) groups[module] = [];
        groups[module].push(p);
    });
    res.json({ permissions: ALL_PERMISSIONS, groups });
});

// GET /api/roles — list all roles for this enterprise
r.get("/", async (req, res) => {
    try {
        const data = await query(
            `SELECT r.*, 
                (SELECT COUNT(*) FROM users u WHERE u.custom_role_id = r.id AND u.enterprise_id = $1) as user_count
             FROM roles r
             WHERE r.enterprise_id = $1
             ORDER BY r.is_system DESC, r.created_at ASC`,
            [req.user.enterprise_id]
        );
        res.json(data.rows);
    } catch (e) {
        console.error("GET /roles error:", e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/roles/:id
r.get("/:id", async (req, res) => {
    try {
        const data = await query(
            `SELECT * FROM roles WHERE id = $1 AND enterprise_id = $2`,
            [req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Rôle introuvable" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

const RoleSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().nullable(),
    permissions: z.array(z.string()).default([]),
});

// POST /api/roles — create role
r.post("/", async (req, res) => {
    const parsed = RoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { name, description, permissions } = parsed.data;

    // Validate permissions
    const invalid = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
    if (invalid.length) return res.status(400).json({ error: `Permissions invalides: ${invalid.join(", ")}` });

    try {
        const exists = await query(
            `SELECT id FROM roles WHERE enterprise_id = $1 AND LOWER(name) = LOWER($2)`,
            [req.user.enterprise_id, name]
        );
        if (exists.rows.length) return res.status(409).json({ error: "Un rôle avec ce nom existe déjà." });

        const data = await query(
            `INSERT INTO roles (enterprise_id, name, description, permissions)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.enterprise_id, name, description || null, JSON.stringify(permissions)]
        );
        res.status(201).json(data.rows[0]);
    } catch (e) {
        console.error("POST /roles error:", e);
        res.status(500).json({ error: "Erreur lors de la création du rôle" });
    }
});

// PUT /api/roles/:id — update role
r.put("/:id", async (req, res) => {
    const parsed = RoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { name, description, permissions } = parsed.data;

    const invalid = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
    if (invalid.length) return res.status(400).json({ error: `Permissions invalides: ${invalid.join(", ")}` });

    try {
        // Check system role
        const existing = await query(`SELECT is_system FROM roles WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        if (!existing.rows[0]) return res.status(404).json({ error: "Rôle introuvable" });

        // Check name uniqueness (excluding self)
        const dup = await query(
            `SELECT id FROM roles WHERE enterprise_id = $1 AND LOWER(name) = LOWER($2) AND id != $3`,
            [req.user.enterprise_id, name, req.params.id]
        );
        if (dup.rows.length) return res.status(409).json({ error: "Un rôle avec ce nom existe déjà." });

        const data = await query(
            `UPDATE roles SET name=$1, description=$2, permissions=$3, updated_at=now()
             WHERE id=$4 AND enterprise_id=$5 RETURNING *`,
            [name, description || null, JSON.stringify(permissions), req.params.id, req.user.enterprise_id]
        );
        res.json(data.rows[0]);
    } catch (e) {
        console.error("PUT /roles error:", e);
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
});

// DELETE /api/roles/:id
r.delete("/:id", async (req, res) => {
    try {
        const existing = await query(`SELECT is_system FROM roles WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        if (!existing.rows[0]) return res.status(404).json({ error: "Rôle introuvable" });
        if (existing.rows[0].is_system) return res.status(403).json({ error: "Impossible de supprimer un rôle système." });

        // Unassign users with this role
        await query(`UPDATE users SET custom_role_id = NULL WHERE custom_role_id = $1`, [req.params.id]);
        await query(`DELETE FROM roles WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        res.json({ ok: true });
    } catch (e) {
        console.error("DELETE /roles error:", e);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});

export default r;
