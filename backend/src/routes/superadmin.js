import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query, pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin"));

r.get("/stats", async (req, res) => {
    const { period = 'monthly' } = req.query;

    const enterprises = await query("SELECT count(*) FROM enterprises");
    const users = await query("SELECT count(*) FROM users");
    const activeSubscriptions = await query("SELECT count(*) FROM enterprises WHERE status = 'active' AND plan IN ('Pro', 'Enterprise')");

    // Total Revenue (all time cents)
    const revTotal = await query("SELECT COALESCE(SUM(amount_cents), 0) as total FROM payments");

    let chartQuery = "";
    if (period === 'weekly') {
        chartQuery = `
            SELECT 
                TO_CHAR(paid_at, 'DD/MM') as label,
                SUM(amount_cents) as amount,
                MIN(paid_at) as sort_val
            FROM payments
            WHERE paid_at >= NOW() - INTERVAL '7 days'
            GROUP BY label
            ORDER BY sort_val
        `;
    } else if (period === 'annual') {
        chartQuery = `
            SELECT 
                TO_CHAR(paid_at, 'YYYY') as label,
                SUM(amount_cents) as amount,
                MIN(paid_at) as sort_val
            FROM payments
            WHERE paid_at >= NOW() - INTERVAL '5 years'
            GROUP BY label
            ORDER BY sort_val
        `;
    } else {
        // Default monthly
        chartQuery = `
            SELECT 
                TO_CHAR(paid_at, 'Mon') as label,
                SUM(amount_cents) as amount,
                MIN(paid_at) as sort_val
            FROM payments
            WHERE paid_at >= NOW() - INTERVAL '6 months'
            GROUP BY label
            ORDER BY sort_val
        `;
    }

    const revChart = await query(chartQuery);

    res.json({
        enterprises: parseInt(enterprises.rows[0].count),
        users: parseInt(users.rows[0].count),
        activeSubscriptions: parseInt(activeSubscriptions.rows[0].count),
        revenue: parseInt(revTotal.rows[0].total) / 100,
        chartData: revChart.rows.map(row => ({
            label: row.label,
            revenue: parseInt(row.amount) / 100
        }))
    });
});

const EnterpriseSchema = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    status: z.enum(["active", "suspended"]).optional(),
    plan: z.enum(["Standard", "Pro", "Enterprise"]).optional(),
});

r.post("/enterprises", async (req, res) => {
    const parsed = EnterpriseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { name, address, status = "active", plan = "Standard" } = parsed.data;

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
    plan: z.enum(["Standard", "Pro", "Enterprise"]).optional(),
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

r.patch("/enterprises/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // active, suspended

    if (!["active", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const result = await query(
        `UPDATE enterprises SET status=$1 WHERE id=$2 RETURNING *`,
        [status, id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Enterprise not found" });
    res.json(result.rows[0]);
});

r.delete("/enterprises/:id", async (req, res) => {
    const { id } = req.params;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Delete all related data in order because of foreign key constraints (ON DELETE RESTRICT)
        // 1. Payments (link to rentals)
        await client.query('DELETE FROM payments WHERE enterprise_id=$1', [id]);

        // 2. Rentals (link to customers, vehicles)
        await client.query('DELETE FROM rentals WHERE enterprise_id=$1', [id]);

        // 3. Vehicles
        await client.query('DELETE FROM vehicles WHERE enterprise_id=$1', [id]);

        // 4. Customers
        await client.query('DELETE FROM customers WHERE enterprise_id=$1', [id]);

        // 5. Users
        await client.query('DELETE FROM users WHERE enterprise_id=$1', [id]);

        // 6. Enterprise itself
        const result = await client.query('DELETE FROM enterprises WHERE id=$1 RETURNING id', [id]);

        if (!result.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Enterprise not found" });
        }

        await client.query('COMMIT');
        res.json({ message: "Enterprise and all related data deleted", id: result.rows[0].id });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error deleting enterprise:", error);
        res.status(500).json({ error: "Failed to delete enterprise" });
    } finally {
        client.release();
    }
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
