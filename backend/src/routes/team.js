import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requirePermission("admin.access"));
r.use(requireEnterpriseScope);

// GET /api/team — list all users in this enterprise (except the director themselves)
r.get("/", async (req, res) => {
    try {
        const data = await query(
            `SELECT u.id, u.email, u.phone, u.full_name, u.profile_photo, u.role, u.status, u.custom_role_id, u.created_at,
                    r.name as role_name, r.permissions as role_permissions
             FROM users u
             LEFT JOIN roles r ON u.custom_role_id = r.id
             WHERE u.enterprise_id = $1
             ORDER BY 
                CASE u.role WHEN 'director' THEN 0 ELSE 1 END,
                u.created_at DESC`,
            [req.user.enterprise_id]
        );
        res.json(data.rows);
    } catch (e) {
        console.error("GET /team error:", e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// GET /api/team/:id
r.get("/:id", async (req, res) => {
    try {
        const data = await query(
            `SELECT u.id, u.email, u.phone, u.full_name, u.profile_photo, u.role, u.status, u.custom_role_id, u.created_at,
                    r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.custom_role_id = r.id
             WHERE u.id = $1 AND u.enterprise_id = $2`,
            [req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

const CreateUserSchema = z.object({
    email: z.string().email("Email invalide"),
    full_name: z.string().min(1, "Nom requis").max(200),
    phone: z.string().optional().nullable(),
    password: z.string().min(6, "Mot de passe minimum 6 caractères"),
    custom_role_id: z.string().uuid().optional().nullable(),
});

// POST /api/team — create new team member (agent)
r.post("/", async (req, res) => {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    const { email, full_name, phone, password, custom_role_id } = parsed.data;

    try {
        // Check email uniqueness
        const exists = await query(`SELECT id FROM users WHERE email = $1`, [email]);
        if (exists.rows.length) return res.status(409).json({ error: "Cet email est déjà utilisé." });

        // Check enterprise user limit
        const entRes = await query(`SELECT max_users FROM enterprises WHERE id = $1`, [req.user.enterprise_id]);
        const maxUsers = entRes.rows[0]?.max_users ?? 2;
        const countRes = await query(`SELECT COUNT(*) as count FROM users WHERE enterprise_id = $1`, [req.user.enterprise_id]);
        if (parseInt(countRes.rows[0].count) >= maxUsers) {
            return res.status(403).json({ error: `Limite atteinte (${maxUsers} utilisateurs max pour votre plan).` });
        }

        // Validate role_id belongs to enterprise if provided
        if (custom_role_id) {
            const roleCheck = await query(`SELECT id FROM roles WHERE id = $1 AND enterprise_id = $2`, [custom_role_id, req.user.enterprise_id]);
            if (!roleCheck.rows.length) return res.status(400).json({ error: "Rôle invalide." });
        }

        const hash = await bcrypt.hash(password, 10);
        const data = await query(
            `INSERT INTO users (enterprise_id, email, full_name, phone, password_hash, role, custom_role_id, status)
             VALUES ($1, $2, $3, $4, $5, 'agent', $6, 'active')
             RETURNING id, email, full_name, phone, role, custom_role_id, status, created_at`,
            [req.user.enterprise_id, email, full_name, phone || null, hash, custom_role_id || null]
        );

        // Fetch with role name
        const result = await query(
            `SELECT u.id, u.email, u.phone, u.full_name, u.profile_photo, u.role, u.status, u.custom_role_id, u.created_at,
                    r.name as role_name
             FROM users u LEFT JOIN roles r ON u.custom_role_id = r.id
             WHERE u.id = $1`,
            [data.rows[0].id]
        );

        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error("POST /team error:", e);
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
});

const UpdateUserSchema = z.object({
    full_name: z.string().min(1).max(200).optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional(),
    custom_role_id: z.string().uuid().optional().nullable(),
    status: z.enum(["active", "suspended"]).optional(),
});

// PUT /api/team/:id — update team member
r.put("/:id", async (req, res) => {
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    try {
        // Check user belongs to this enterprise and is not a director
        const existing = await query(`SELECT id, role FROM users WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        if (!existing.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
        if (existing.rows[0].role === "director" && req.params.id !== req.user.id) {
            return res.status(403).json({ error: "Impossible de modifier un autre directeur." });
        }

        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, value] of Object.entries(parsed.data)) {
            if (value !== undefined) {
                fields.push(`${key} = $${idx++}`);
                values.push(value);
            }
        }

        if (!fields.length) return res.status(400).json({ error: "Aucun champ à mettre à jour" });

        values.push(req.params.id);
        values.push(req.user.enterprise_id);

        const data = await query(
            `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} AND enterprise_id = $${idx + 1}
             RETURNING id, email, full_name, phone, profile_photo, role, custom_role_id, status, created_at`,
            values
        );

        // Fetch with role name
        const result = await query(
            `SELECT u.id, u.email, u.phone, u.full_name, u.profile_photo, u.role, u.status, u.custom_role_id, u.created_at,
                    r.name as role_name
             FROM users u LEFT JOIN roles r ON u.custom_role_id = r.id
             WHERE u.id = $1`,
            [data.rows[0].id]
        );

        res.json(result.rows[0]);
    } catch (e) {
        console.error("PUT /team error:", e);
        if (e.code === '23505') return res.status(409).json({ error: "Cet email est déjà utilisé." });
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
});

const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Mot de passe minimum 6 caractères"),
});

// PATCH /api/team/:id/password — reset password
r.patch("/:id/password", async (req, res) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

    try {
        const existing = await query(`SELECT id, role FROM users WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        if (!existing.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
        if (existing.rows[0].role === "director") return res.status(403).json({ error: "Utilisez le profil pour changer votre mot de passe." });

        const hash = await bcrypt.hash(parsed.data.password, 10);
        await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, req.params.id]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// DELETE /api/team/:id
r.delete("/:id", async (req, res) => {
    try {
        const existing = await query(`SELECT id, role FROM users WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        if (!existing.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
        if (existing.rows[0].role === "director") return res.status(403).json({ error: "Impossible de supprimer un directeur." });

        await query(`DELETE FROM users WHERE id = $1 AND enterprise_id = $2`, [req.params.id, req.user.enterprise_id]);
        res.json({ ok: true });
    } catch (e) {
        console.error("DELETE /team error:", e);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
});

export default r;
