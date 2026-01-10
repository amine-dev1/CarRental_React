import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const r = Router();

// ✅ Superadmin will create directors/agents later.
// For now we keep a protected "create superadmin once" endpoint
// You can remove it after you create the first superadmin.

const BootstrapSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// Create FIRST superadmin (you can keep it temporarily)
r.post("/bootstrap-superadmin", async (req, res) => {
    const parsed = BootstrapSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, password } = parsed.data;

    const existing = await query(`SELECT id FROM users WHERE role='superadmin' LIMIT 1`);
    if (existing.rows[0]) return res.status(400).json({ error: "Superadmin already exists" });

    const hash = await bcrypt.hash(password, 10);

    const result = await query(
        `INSERT INTO users(email, password_hash, role, enterprise_id)
     VALUES($1,$2,'superadmin',NULL)
     RETURNING id, email, role, enterprise_id, created_at`,
        [email, hash]
    );

    res.json(result.rows[0]);
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

r.post("/login", async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, password } = parsed.data;

    const result = await query(`
        SELECT u.*, e.status as enterprise_status 
        FROM users u 
        LEFT JOIN enterprises e ON u.enterprise_id = e.id 
        WHERE u.email=$1
    `, [email]);

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Block if enterprise is suspended (superadmins are exempt as they have enterprise_id NULL)
    if (user.role !== 'superadmin' && user.enterprise_status === 'suspended') {
        return res.status(403).json({ error: "Votre compte est suspendu. Veuillez contacter l'administrateur." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            enterprise_id: user.enterprise_id, // ✅ key
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            enterprise_id: user.enterprise_id,
        },
    });
});

import { sendEmail } from "../utils/mailer.js";
import crypto from "crypto";

const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

r.post("/forgot-password", async (req, res) => {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email } = parsed.data;

    const result = await query(`SELECT id FROM users WHERE email=$1`, [email]);
    const user = result.rows[0];

    if (!user) {
        return res.json({ message: "Si cet e-mail existe, un code de vérification a été envoyé." });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000); // Valable 15 minutes

    await query(
        `UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3`,
        [code, expires, user.id]
    );

    try {
        await sendEmail({
            to: email,
            subject: `${code} est votre code de récupération RentalCar`,
            text: `Votre code de récupération est : ${code}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; color: #1a1a1a;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #3b82f6; margin: 0; font-size: 24px;">RentalCar</h1>
                    </div>
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; text-align: center;">Code de récupération</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #4b5563; text-align: center;">
                        Utilisez le code ci-dessous pour réinitialiser le mot de passe de votre compte. Ce code est valable pendant 15 minutes.
                    </p>
                    <div style="background-color: #f3f8ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
                    </div>
                    <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 30px;">
                        Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        © 2026 RentalCar System. Tous droits réservés.
                    </p>
                </div>
            `,
        });
    } catch (err) {
        console.error("Failed to send code email:", err);
        return res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail." });
    }

    res.json({ message: "Si cet e-mail existe, un code de vérification a été envoyé." });
});

const VerifyCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

r.post("/verify-code", async (req, res) => {
    const parsed = VerifyCodeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, code } = parsed.data;

    const result = await query(
        `SELECT id FROM users WHERE email=$1 AND reset_token=$2 AND reset_token_expires > now()`,
        [email, code]
    );

    if (!result.rows[0]) {
        return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    res.json({ ok: true });
});

const ResetPasswordSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    password: z.string().min(6),
});

r.post("/reset-password", async (req, res) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, code, password } = parsed.data;

    const result = await query(
        `SELECT id FROM users WHERE email=$1 AND reset_token=$2 AND reset_token_expires > now()`,
        [email, code]
    );
    const user = result.rows[0];

    if (!user) {
        return res.status(400).json({ error: "Code invalide ou expiré." });
    }

    const hash = await bcrypt.hash(password, 10);

    await query(
        `UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2`,
        [hash, user.id]
    );

    res.json({ message: "Mot de passe mis à jour avec succès." });
});

// optional: whoami
r.get("/me", requireAuth, async (req, res) => {
    res.json({ user: req.user });
});

export default r;
