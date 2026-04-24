import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

import { slowDownLimiter } from "../middleware/rateLimiter.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin", "director", "manager", "agent"));
r.use(requireEnterpriseScope);

r.get("/", slowDownLimiter, async (req, res) => {
    const enterpriseId = req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;
    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    const data = await query(
        `SELECT id, enterprise_id, full_name, phone, email, driver_license_number, license_expiry_date,
            address, city, country, date_of_birth, notes, created_at,
            phone_alt, nationality, id_type, id_number, id_expiry_date, license_country,
            is_company, company_name, company_tax_number, is_blacklisted, blacklist_reason,
            blacklisted_at, blacklisted_by, total_rentals, updated_at
        FROM customers WHERE enterprise_id=$1 ORDER BY created_at DESC`,
        [enterpriseId]
    );
    res.json(data.rows);
});

const CustomerSchema = z.object({
    full_name: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone_alt: z.string().optional(),
    nationality: z.string().optional(),
    id_type: z.enum(["cni", "passeport", "titre_sejour"]).optional().nullable(),
    id_number: z.string().optional(),
    license_country: z.string().optional(),
    is_company: z.boolean().optional().default(false),
    company_name: z.string().optional(),
    company_tax_number: z.string().optional(),
});

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin") return res.status(403).json({ error: "Superadmin cannot create customers" });

    const parsed = CustomerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const c = parsed.data;

    try {
        const data = await query(
            `INSERT INTO customers(
                enterprise_id, full_name, phone, email,
                phone_alt, nationality, id_type, id_number, license_country,
                is_company, company_name, company_tax_number
            ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [
                req.user.enterprise_id, c.full_name, c.phone || null, c.email || null,
                c.phone_alt || null, c.nationality || null, c.id_type || null, c.id_number || null, c.license_country || null,
                c.is_company, c.company_name || null, c.company_tax_number || null
            ]
        );
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

r.put("/:id", async (req, res) => {
    const parsed = CustomerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const c = parsed.data;

    try {
        const data = await query(
            `UPDATE customers SET
                full_name=$1, phone=$2, email=$3,
                phone_alt=$4, nationality=$5, id_type=$6, id_number=$7, license_country=$8,
                is_company=$9, company_name=$10, company_tax_number=$11, updated_at=now()
             WHERE id=$12 AND enterprise_id=$13 RETURNING *`,
            [
                c.full_name, c.phone || null, c.email || null,
                c.phone_alt || null, c.nationality || null, c.id_type || null, c.id_number || null, c.license_country || null,
                c.is_company, c.company_name || null, c.company_tax_number || null,
                req.params.id, req.user.enterprise_id
            ]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Customer not found" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

r.delete("/:id", async (req, res) => {
    try {
        const data = await query(`DELETE FROM customers WHERE id=$1 AND enterprise_id=$2 RETURNING *`, [req.params.id, req.user.enterprise_id]);
        if (!data.rows[0]) return res.status(404).json({ error: "Customer not found" });
        res.json({ success: true, deleted: data.rows[0] });
    } catch (e) {
        res.status(400).json({ error: "Cannot delete customer. It may be linked to rentals." });
    }
});

r.post("/:id/blacklist", async (req, res) => {
    const { is_blacklisted, reason } = req.body;
    try {
        const data = await query(
            `UPDATE customers SET
                is_blacklisted=$1, blacklist_reason=$2, 
                blacklisted_at=CASE WHEN $1 THEN now() ELSE null END,
                blacklisted_by=CASE WHEN $1 THEN $3 ELSE null END,
                updated_at=now()
             WHERE id=$4 AND enterprise_id=$5 RETURNING *`,
            [is_blacklisted, is_blacklisted ? reason : null, req.user.id, req.params.id, req.user.enterprise_id]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Customer not found" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default r;
