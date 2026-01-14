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

r.get("/", async (req, res) => {
    const enterpriseId =
        req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;

    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    const data = await query(
        `SELECT * FROM vehicles WHERE enterprise_id=$1 ORDER BY created_at DESC`,
        [enterpriseId]
    );
    res.json(data.rows);
});

const VehicleSchema = z.object({
    name: z.string().min(2),
    plate: z.string().min(3),
    daily_price_cents: z.number().int().positive(),
    status: z.enum(["available", "maintenance"]).optional(),
});

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin")
        return res.status(403).json({ error: "Superadmin cannot create vehicles (use director/agent)" });

    const parsed = VehicleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const v = parsed.data;

    const data = await query(
        `INSERT INTO vehicles(enterprise_id, name, plate, daily_price_cents, status)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [req.user.enterprise_id, v.name, v.plate, v.daily_price_cents, v.status || "available"]
    );

    res.json(data.rows[0]);
});

export default r;
