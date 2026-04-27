import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

import { slowDownLimiter } from "../middleware/rateLimiter.js";

const r = Router();
r.use(requireAuth);
r.use(requirePermission("fleet.view"));
r.use(requireEnterpriseScope);
r.get("/categories", async (req, res) => {
    try {
        const data = await query(`SELECT * FROM vehicle_categories WHERE enterprise_id = $1 OR enterprise_id IS NULL ORDER BY name ASC`, [req.user.enterprise_id]);
        res.json(data.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

r.get("/", slowDownLimiter, async (req, res) => {
    const enterpriseId = req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;
    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    let sql = `
        SELECT v.*, a.name AS agency_name, c.name AS category_name
        FROM vehicles v
        LEFT JOIN agencies a ON a.id = v.agency_id
        LEFT JOIN vehicle_categories c ON c.id = v.category_id
        WHERE v.enterprise_id = $1
    `;
    const params = [enterpriseId];
    
    if (req.query.agency_id) {
        params.push(req.query.agency_id);
        sql += ` AND v.agency_id = $2`;
    }
    
    sql += ` ORDER BY v.created_at DESC`;

    try {
        const data = await query(sql, params);
        res.json(data.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const VehicleSchema = z.object({
    name: z.string().min(2),
    plate: z.string().min(3),
    daily_price_cents: z.number().int().positive(),
    status: z.enum(["available", "rented", "reserved", "maintenance", "out_of_service"]).optional(),
    agency_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    year: z.number().int().optional().nullable(),
    color: z.string().optional().nullable(),
    vin: z.string().optional().nullable(),
    fuel_type: z.enum(["essence", "diesel", "hybride", "electrique"]).optional().nullable(),
    transmission: z.enum(["manuelle", "automatique"]).optional().nullable(),
    seats: z.number().int().positive().optional().nullable(),
    doors: z.number().int().positive().optional().nullable(),
    ac: z.boolean().optional(),
    deposit_cents: z.number().int().nonnegative().optional().nullable(),
    mileage: z.number().int().nonnegative().optional().nullable(),
    last_service_km: z.number().int().nonnegative().optional().nullable(),
    next_service_km: z.number().int().nonnegative().optional().nullable(),
    insurance_expiry: z.string().optional().nullable(), // date string
    last_maintenance_date: z.string().optional().nullable(), // date string
    next_maintenance_date: z.string().optional().nullable(), // date string
    photo_url: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin") return res.status(403).json({ error: "Superadmin cannot create vehicles" });

    const parsed = VehicleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const v = parsed.data;

    try {
        const data = await query(
            `INSERT INTO vehicles (
                enterprise_id, name, plate, daily_price_cents, status,
                agency_id, category_id, brand, model, year, color, vin, fuel_type, transmission, 
                seats, doors, ac, deposit_cents, mileage, last_service_km, next_service_km,
                insurance_expiry, last_maintenance_date, next_maintenance_date, photo_url, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
            [
                req.user.enterprise_id, v.name, v.plate, v.daily_price_cents, v.status || "available",
                v.agency_id, v.category_id, v.brand, v.model, v.year, v.color, v.vin, v.fuel_type, v.transmission,
                v.seats || 5, v.doors || 4, v.ac ?? true, v.deposit_cents, v.mileage, v.last_service_km, v.next_service_km,
                v.insurance_expiry || null, v.last_maintenance_date || null, v.next_maintenance_date || null, v.photo_url || null, v.notes || null
            ]
        );
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

r.put("/:id", async (req, res) => {
    const parsed = VehicleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const v = parsed.data;

    try {
        const data = await query(
            `UPDATE vehicles SET
                name=$1, plate=$2, daily_price_cents=$3, status=$4,
                agency_id=$5, category_id=$6, brand=$7, model=$8, year=$9, color=$10, vin=$11, fuel_type=$12,
                transmission=$13, seats=$14, doors=$15, ac=$16, deposit_cents=$17, 
                mileage=$18, last_service_km=$19, next_service_km=$20,
                insurance_expiry=$21, last_maintenance_date=$22, next_maintenance_date=$23, photo_url=$24, notes=$25,
                updated_at=now()
             WHERE id=$26 AND enterprise_id=$27 RETURNING *`,
            [
                v.name, v.plate, v.daily_price_cents, v.status || "available",
                v.agency_id, v.category_id, v.brand, v.model, v.year, v.color, v.vin, v.fuel_type,
                v.transmission, v.seats, v.doors, v.ac ?? true, v.deposit_cents,
                v.mileage, v.last_service_km, v.next_service_km,
                v.insurance_expiry || null, v.last_maintenance_date || null, v.next_maintenance_date || null, v.photo_url || null, v.notes || null,
                req.params.id, req.user.enterprise_id
            ]
        );
        if (!data.rows[0]) return res.status(404).json({ error: "Vehicle not found" });
        res.json(data.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

r.delete("/:id", async (req, res) => {
    try {
        const data = await query(`DELETE FROM vehicles WHERE id=$1 AND enterprise_id=$2 RETURNING *`, [req.params.id, req.user.enterprise_id]);
        if (!data.rows[0]) return res.status(404).json({ error: "Vehicle not found or cannot be deleted" });
        res.json({ success: true, deleted: data.rows[0] });
    } catch (e) {
        res.status(400).json({ error: "Cannot delete vehicle. It may be linked to rentals." });
    }
});

export default r;
