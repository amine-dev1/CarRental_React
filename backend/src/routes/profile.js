import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

// GET /api/profile/me — Retrieve current user's profile
r.get("/me", async (req, res) => {
    try {
        const result = await query(
            `SELECT id, full_name, email, phone, profile_photo, role, created_at FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: "User not found" });
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/profile/me — Update current user's profile
const profileSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
});

r.patch("/me", async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { full_name, phone } = parsed.data;

    const fields = [];
    const values = [];
    let idx = 1;

    if (full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }

    if (!fields.length) return res.status(400).json({ error: "No fields to update" });

    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, full_name, email, phone, profile_photo, role`,
        values
    );

    res.json(result.rows[0]);
});

export default r;
