import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin", "director", "agent"));
r.use(requireEnterpriseScope);

// For superadmin, require enterprise_id query param to list:
r.get("/", async (req, res) => {
    const enterpriseId =
        req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;

    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    const data = await query(
        `SELECT * FROM customers WHERE enterprise_id=$1 ORDER BY created_at DESC`,
        [enterpriseId]
    );
    res.json(data.rows);
});

const CustomerSchema = z.object({
    full_name: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
});

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin")
        return res.status(403).json({ error: "Superadmin cannot create customers (use director/agent)" });

    const parsed = CustomerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { full_name, phone, email } = parsed.data;

    const data = await query(
        `INSERT INTO customers(enterprise_id, full_name, phone, email)
     VALUES($1,$2,$3,$4) RETURNING *`,
        [req.user.enterprise_id, full_name, phone || null, email || null]
    );

    res.json(data.rows[0]);
});

export default r;
