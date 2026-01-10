import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin"));

r.get("/stats", async (_req, res) => {
    const enterprises = await query("SELECT count(*) FROM enterprises");
    const users = await query("SELECT count(*) FROM users");
    const rentals = await query("SELECT count(*) FROM rentals WHERE status != 'canceled'");

    res.json({
        enterprises: parseInt(enterprises.rows[0].count),
        users: parseInt(users.rows[0].count),
        rentals: parseInt(rentals.rows[0].count),
        revenue: 0 // Placeholder for now
    });
});

const EnterpriseSchema = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    status: z.enum(["active", "suspended"]).optional(),
    plan: z.enum(["Free", "Pro", "Enterprise"]).optional(),
});

r.post("/enterprises", async (req, res) => {
    const parsed = EnterpriseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { name, address, status = "active", plan = "Free" } = parsed.data;

    const result = await query(
        `INSERT INTO enterprises(name, address, status, plan) VALUES($1, $2, $3, $4) RETURNING *`,
        [name, address, status, plan]
    );

    res.json(result.rows[0]);
});

r.get("/enterprises", async (_req, res) => {
    const result = await query(`
        SELECT 
            e.*,
            (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'director') as directors_count,
            (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'agent') as agents_count,
            (SELECT COUNT(*) FROM vehicles WHERE enterprise_id = e.id) as vehicles_count,
            (SELECT COUNT(*) FROM customers WHERE enterprise_id = e.id) as customers_count,
            (SELECT COUNT(*) FROM rentals WHERE enterprise_id = e.id) as rentals_count,
            (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE enterprise_id = e.id) as revenue_cents
        FROM enterprises e
        ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
});

const UpdateEnterpriseSchema = z.object({
    name: z.string().min(2).optional(),
    address: z.string().optional(),
    status: z.enum(["active", "suspended"]).optional(),
    plan: z.enum(["Free", "Pro", "Enterprise"]).optional(),
});

r.put("/enterprises/:id", async (req, res) => {
    const { id } = req.params;
    const parsed = UpdateEnterpriseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { name, address, status, plan } = parsed.data;

    // Dynamically build the update query
    let sets = [];
    let params = [id];
    if (name) {
        params.push(name);
        sets.push(`name=$${params.length}`);
    }
    if (address) {
        params.push(address);
        sets.push(`address=$${params.length}`);
    }
    if (status) {
        params.push(status);
        sets.push(`status=$${params.length}`);
    }
    if (plan) {
        params.push(plan);
        sets.push(`plan=$${params.length}`);
    }

    if (sets.length === 0) return res.status(400).json({ error: "No fields to update" });

    const result = await query(
        `UPDATE enterprises SET ${sets.join(", ")} WHERE id=$1 RETURNING *`,
        params
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Enterprise not found" });
    res.json(result.rows[0]);
});

r.delete("/enterprises/:id", async (req, res) => {
    const { id } = req.params;

    // Check if there are users linked to this enterprise
    const users = await query("SELECT count(*) FROM users WHERE enterprise_id=$1", [id]);
    if (parseInt(users.rows[0].count) > 0) {
        return res.status(400).json({ error: "Impossible de supprimer une entreprise avec des utilisateurs actifs. Suspendez-la plutôt." });
    }

    const result = await query("DELETE FROM enterprises WHERE id=$1 RETURNING id", [id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Enterprise not found" });

    res.json({ message: "Enterprise deleted", id: result.rows[0].id });
});

const CreateUserSchema = z.object({
    enterprise_id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["director", "agent"]),
});

r.post("/users", async (req, res) => {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { enterprise_id, email, password, role } = parsed.data;

    const ent = await query(`SELECT id FROM enterprises WHERE id=$1`, [enterprise_id]);
    if (!ent.rows[0]) return res.status(404).json({ error: "Enterprise not found" });

    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await query(
            `INSERT INTO users(enterprise_id, email, password_hash, role)
       VALUES($1,$2,$3,$4)
       RETURNING id, email, role, enterprise_id, created_at`,
            [enterprise_id, email, hash, role]
        );
        res.json(result.rows[0]);
    } catch {
        res.status(400).json({ error: "Email already exists" });
    }
});

r.get("/enterprises/:id/users", async (req, res) => {
    const { id } = req.params;
    const result = await query(
        `SELECT id, email, role, enterprise_id, created_at
     FROM users
     WHERE enterprise_id=$1
     ORDER BY created_at DESC`,
        [id]
    );
    res.json(result.rows);
});

export default r;
