import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin", "director", "manager", "agent"));
r.use(requireEnterpriseScope);

r.get("/", async (req, res) => {
    const enterpriseId =
        req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;

    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    const data = await query(
        `SELECT a.*, 
            (SELECT count(*) FROM vehicles WHERE agency_id = a.id) as vehicle_count 
         FROM agencies a 
         WHERE a.enterprise_id=$1 
         ORDER BY a.created_at DESC`,
        [enterpriseId]
    );
    res.json(data.rows);
});

const AgencySchema = z.object({
    name: z.string().min(2),
    code: z.string().max(10).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    is_main: z.boolean().default(false),
    status: z.enum(["active", "inactive"]).optional(),
});

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin")
        return res.status(403).json({ error: "Superadmin cannot create agencies (use director/manager)" });

    const parsed = AgencySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const a = parsed.data;

    // If this agency is marked as main, we might want to unset other main agencies,
    // but for now, we'll just insert it.
    if (a.is_main) {
        await query(`UPDATE agencies SET is_main = false WHERE enterprise_id = $1`, [req.user.enterprise_id]);
    }

    const data = await query(
        `INSERT INTO agencies(enterprise_id, name, code, address, city, phone, email, is_main, status)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [req.user.enterprise_id, a.name, a.code || null, a.address || null, a.city || null, a.phone || null, a.email || null, a.is_main, a.status || "active"]
    );

    res.json(data.rows[0]);
});

r.put("/:id", async (req, res) => {
    const parsed = AgencySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const a = parsed.data;

    // Ensure it belongs to the enterprise
    const existing = await query(`SELECT id FROM agencies WHERE id=$1 AND enterprise_id=$2`, [req.params.id, req.user.enterprise_id]);
    if (!existing.rows[0]) return res.status(404).json({ error: "Agency not found" });

    if (a.is_main) {
        await query(`UPDATE agencies SET is_main = false WHERE enterprise_id = $1`, [req.user.enterprise_id]);
    }

    const data = await query(
        `UPDATE agencies 
         SET name=$1, code=$2, address=$3, city=$4, phone=$5, email=$6, is_main=$7, status=$8, updated_at=now()
         WHERE id=$9 RETURNING *`,
        [a.name, a.code || null, a.address || null, a.city || null, a.phone || null, a.email || null, a.is_main, a.status || "active", req.params.id]
    );

    res.json(data.rows[0]);
});

r.delete("/:id", async (req, res) => {
    // Check if vehicles are attached
    const vCount = await query(`SELECT count(*) FROM vehicles WHERE agency_id=$1`, [req.params.id]);
    if (parseInt(vCount.rows[0].count) > 0) {
        return res.status(400).json({ error: "Cannot delete agency with attached vehicles. Reassign them first." });
    }

    const data = await query(`DELETE FROM agencies WHERE id=$1 AND enterprise_id=$2 RETURNING *`, [req.params.id, req.user.enterprise_id]);
    if (!data.rows[0]) return res.status(404).json({ error: "Agency not found" });

    res.json({ success: true, deleted: data.rows[0] });
});

export default r;
