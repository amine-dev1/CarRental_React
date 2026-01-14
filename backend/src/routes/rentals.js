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
        `
    SELECT rentals.*, customers.full_name, vehicles.name AS vehicle_name, vehicles.plate
    FROM rentals
    JOIN customers ON customers.id = rentals.customer_id
    JOIN vehicles ON vehicles.id = rentals.vehicle_id
    WHERE rentals.enterprise_id=$1
    ORDER BY rentals.created_at DESC
    `,
        [enterpriseId]
    );
    res.json(data.rows);
});

const RentalSchema = z.object({
    customer_id: z.string().uuid(),
    vehicle_id: z.string().uuid(),
    start_date: z.string(), // YYYY-MM-DD
    end_date: z.string(),
});

function daysBetweenInclusive(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const ms = e - s;
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin")
        return res.status(403).json({ error: "Superadmin cannot create rentals (use director/agent)" });

    const parsed = RentalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { customer_id, vehicle_id, start_date, end_date } = parsed.data;

    // ✅ Ensure customer belongs to same enterprise
    const customer = await query(
        `SELECT id FROM customers WHERE id=$1 AND enterprise_id=$2`,
        [customer_id, req.user.enterprise_id]
    );
    if (!customer.rows[0]) return res.status(404).json({ error: "Customer not found" });

    // ✅ Ensure vehicle belongs to same enterprise
    const vehicle = await query(
        `SELECT daily_price_cents FROM vehicles WHERE id=$1 AND enterprise_id=$2`,
        [vehicle_id, req.user.enterprise_id]
    );
    if (!vehicle.rows[0]) return res.status(404).json({ error: "Vehicle not found" });

    const days = daysBetweenInclusive(start_date, end_date);
    const total = days * vehicle.rows[0].daily_price_cents;

    try {
        const data = await query(
            `INSERT INTO rentals(enterprise_id, customer_id, vehicle_id, start_date, end_date, total_cents)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
            [req.user.enterprise_id, customer_id, vehicle_id, start_date, end_date, total]
        );
        res.json(data.rows[0]);
    } catch {
        res.status(400).json({ error: "Vehicle is already booked for these dates" });
    }
});

export default r;
