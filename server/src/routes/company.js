import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("director")); // Only directors can manage their company
r.use(requireEnterpriseScope);

// List all agents in my enterprise
r.get("/users", async (req, res) => {
    const data = await query(
        `SELECT id, email, role, created_at FROM users 
     WHERE enterprise_id=$1 AND role='agent'
     ORDER BY created_at DESC`,
        [req.user.enterprise_id]
    );
    res.json(data.rows);
});

const AgentSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// Create a new Agent
r.post("/users", async (req, res) => {
    const parsed = AgentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, password } = parsed.data;
    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await query(
            `INSERT INTO users(enterprise_id, email, password_hash, role)
       VALUES($1,$2,$3,'agent')
       RETURNING id, email, role, enterprise_id, created_at`,
            [req.user.enterprise_id, email, hash]
        );
        res.json(result.rows[0]);
    } catch (e) {
        res.status(400).json({ error: "Email already exists" });
    }
});

export default r;
