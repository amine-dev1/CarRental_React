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
    const enterpriseId = req.user.role === "superadmin" ? req.query.enterprise_id : req.user.enterprise_id;
    if (!enterpriseId) return res.status(400).json({ error: "enterprise_id is required" });

    const data = await query(
        `
    SELECT r.*, cu.full_name, v.name AS vehicle_name, v.plate,
           ap.name as pickup_agency_name, ar.name as return_agency_name
    FROM rentals r
    JOIN customers cu ON cu.id = r.customer_id
    JOIN vehicles v ON v.id = r.vehicle_id
    LEFT JOIN agencies ap ON ap.id = r.pickup_agency_id
    LEFT JOIN agencies ar ON ar.id = r.return_agency_id
    WHERE r.enterprise_id=$1
    ORDER BY r.created_at DESC
    `,
        [enterpriseId]
    );
    res.json(data.rows);
});

const RentalSchema = z.object({
    customer_id: z.string().uuid(),
    vehicle_id: z.string().uuid(),
    planned_start_date: z.string(), // YYYY-MM-DD
    planned_end_date: z.string(),
    pickup_agency_id: z.string().uuid().optional().nullable(),
    return_agency_id: z.string().uuid().optional().nullable(),
    daily_price_cents: z.number().int().nonnegative().optional(),
});

function daysBetweenInclusive(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    const ms = e - s;
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

r.post("/", async (req, res) => {
    if (req.user.role === "superadmin") return res.status(403).json({ error: "Superadmin cannot create rentals" });

    const parsed = RentalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const dataInput = parsed.data;

    // Check customer
    const customer = await query(`SELECT id FROM customers WHERE id=$1 AND enterprise_id=$2`, [dataInput.customer_id, req.user.enterprise_id]);
    if (!customer.rows[0]) return res.status(404).json({ error: "Customer not found" });

    // Check vehicle
    const vehicle = await query(`SELECT daily_price_cents FROM vehicles WHERE id=$1 AND enterprise_id=$2`, [dataInput.vehicle_id, req.user.enterprise_id]);
    if (!vehicle.rows[0]) return res.status(404).json({ error: "Vehicle not found" });

    const days = daysBetweenInclusive(dataInput.planned_start_date, dataInput.planned_end_date);
    const dailyPrice = dataInput.daily_price_cents || vehicle.rows[0].daily_price_cents;
    const subtotal = days * dailyPrice;

    // Generate contract number
    const contractNumQuery = await query(`SELECT generate_contract_number($1) as num`, [req.user.enterprise_id]);
    const contractNumber = contractNumQuery.rows[0].num;

    // We can't specify start_date and end_date since those were left as NULL during standard new operations in v2, 
    // Wait, the v1 routes used start_date and end_date. rentals now has planned_start_date and planned_end_date, 
    // but start_date and end_date still exist and must satisfy CHECK (end_date >= start_date) and rentals_no_overlap exclusion constraint.
    // So we must also insert start_date and end_date to keep it backward compatible and use the DB logic!

    try {
        const data = await query(
            `INSERT INTO rentals (
                enterprise_id, contract_number, customer_id, vehicle_id, 
                agent_id, pickup_agency_id, return_agency_id,
                planned_start_date, planned_end_date, start_date, end_date, daily_price_cents, total_days,
                subtotal_cents, total_cents, status
             ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                req.user.enterprise_id, contractNumber, dataInput.customer_id, dataInput.vehicle_id,
                req.user.id, dataInput.pickup_agency_id, dataInput.return_agency_id,
                dataInput.planned_start_date, dataInput.planned_end_date, dataInput.planned_start_date, dataInput.planned_end_date, dailyPrice, days,
                subtotal, subtotal, "reserved"
            ]
        );
        res.json(data.rows[0]);
    } catch(e) {
        res.status(400).json({ error: "Could not create rental", details: e.message });
    }
});

r.put("/:id/status", async (req, res) => {
    const { status, note } = req.body;
    try {
        const rentalCheck = await query(`SELECT id, status FROM rentals WHERE id=$1 AND enterprise_id=$2`, [req.params.id, req.user.enterprise_id]);
        if (!rentalCheck.rows[0]) return res.status(404).json({ error: "Rental not found" });
        const oldStatus = rentalCheck.rows[0].status;

        await query("BEGIN");

        const data = await query(`UPDATE rentals SET status=$1, updated_at=now() WHERE id=$2 RETURNING *`, [status, req.params.id]);
        
        await query(
            `INSERT INTO rental_status_history (rental_id, old_status, new_status, changed_by, note)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.params.id, oldStatus, status, req.user.id, note || null]
        );

        await query("COMMIT");
        res.json(data.rows[0]);
    } catch (e) {
        await query("ROLLBACK");
        res.status(400).json({ error: e.message });
    }
});

export default r;
