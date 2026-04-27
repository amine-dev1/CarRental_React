import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../utils/mailer.js";

const r = Router();
r.use(requireAuth);

// In-memory store for email change codes { userId: { code, newEmail, expiresAt } }
// For production, use Redis.
const emailChangeCodes = new Map();

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
    profile_photo: z.string().optional().nullable(),
});

r.patch("/me", async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { full_name, phone, profile_photo } = parsed.data;

    const fields = [];
    const values = [];
    let idx = 1;

    if (full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(full_name); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (profile_photo !== undefined) { fields.push(`profile_photo = $${idx++}`); values.push(profile_photo); }

    if (!fields.length) return res.status(400).json({ error: "No fields to update" });

    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, full_name, email, phone, profile_photo, role`,
        values
    );

    res.json(result.rows[0]);
});

// POST /api/profile/request-email-change
// Sends a 6-digit verification code to the NEW email
r.post("/request-email-change", async (req, res) => {
    const schema = z.object({ newEmail: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Adresse email invalide." });

    const { newEmail } = parsed.data;
    const userId = req.user.id;

    // Check it's not already taken
    const existing = await query(`SELECT id FROM users WHERE email = $1 AND id != $2`, [newEmail, userId]);
    if (existing.rows.length) {
        return res.status(409).json({ error: "Cette adresse email est déjà utilisée par un autre compte." });
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    emailChangeCodes.set(userId, { code, newEmail, expiresAt });

    // Send email via Brevo (nodemailer)
    try {
        await sendEmail({
            to: newEmail,
            subject: "Confirmation de changement d'adresse email",
            html: `
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
                    <div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:32px 36px">
                        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800">Changement d'email</h1>
                        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">RentalCar System</p>
                    </div>
                    <div style="padding:36px">
                        <p style="color:#475569;font-size:15px;margin:0 0 24px">
                            Vous avez demandé à changer votre adresse email. Utilisez le code ci-dessous pour confirmer.
                        </p>
                        <div style="background:#EEF2FF;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                            <span style="font-size:40px;font-weight:800;letter-spacing:8px;color:#6366F1">${code}</span>
                        </div>
                        <p style="color:#94a3b8;font-size:13px;margin:0">
                            ⏱️ Ce code expire dans <strong>10 minutes</strong>.<br>
                            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                        </p>
                    </div>
                </div>
            `,
        });
        res.json({ success: true, message: "Code envoyé à " + newEmail });
    } catch (err) {
        console.error("Email send error:", err);
        emailChangeCodes.delete(userId);
        res.status(500).json({ error: "Impossible d'envoyer l'email. Réessayez plus tard." });
    }
});

// POST /api/profile/confirm-email-change
// Verifies the code and updates the email
r.post("/confirm-email-change", async (req, res) => {
    const schema = z.object({ code: z.string().length(6) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Code invalide." });

    const userId = req.user.id;
    const entry = emailChangeCodes.get(userId);

    if (!entry) {
        return res.status(400).json({ error: "Aucun changement d'email en attente. Recommencez." });
    }
    if (Date.now() > entry.expiresAt) {
        emailChangeCodes.delete(userId);
        return res.status(400).json({ error: "Le code a expiré. Recommencez." });
    }
    if (req.body.code !== entry.code) {
        return res.status(400).json({ error: "Code incorrect." });
    }

    // Update email in DB
    try {
        const result = await query(
            `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, phone, profile_photo, role`,
            [entry.newEmail, userId]
        );
        emailChangeCodes.delete(userId);
        res.json({ success: true, user: result.rows[0] });
    } catch (e) {
        if (e.code === "23505") {
            return res.status(409).json({ error: "Cette adresse email est déjà utilisée." });
        }
        res.status(500).json({ error: e.message });
    }
});

export default r;
