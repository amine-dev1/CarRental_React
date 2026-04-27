import express from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";

const r = express.Router();
r.use(requireAuth);
r.use(requirePermission("reservations.view"));

// 1) Get all reservations for the enterprise
r.get("/", async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                r.*,
                c.full_name as customer_name,
                v.name as vehicle_name, v.plate,
                pa.name as pickup_agency_name,
                ra.name as return_agency_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN agencies pa ON r.pickup_agency_id = pa.id
            LEFT JOIN agencies ra ON r.return_agency_id = ra.id
            WHERE r.enterprise_id = $1
            ORDER BY r.created_at DESC
        `, [req.user.enterprise_id]);
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch reservations" });
    }
});

// 2) Create a new reservation
r.post("/", async (req, res) => {
    const { 
        customer_id, vehicle_id, pickup_agency_id, return_agency_id,
        pickup_date, return_date, quoted_total_cents, status, notes
    } = req.body;

    // Default status to 'pending' if not provided
    const resStatus = status || 'pending';
    const resNumber = 'RES-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    try {
        const result = await query(`
            INSERT INTO reservations (
                enterprise_id, reservation_number, customer_id, vehicle_id, 
                pickup_agency_id, return_agency_id, pickup_date, return_date, 
                quoted_total_cents, status, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            req.user.enterprise_id, resNumber, customer_id, vehicle_id || null,
            pickup_agency_id || null, return_agency_id || null, pickup_date || null, return_date || null,
            quoted_total_cents || 0, resStatus, notes || null
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create reservation" });
    }
});

// 3) Update a reservation
r.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { 
        customer_id, vehicle_id, pickup_agency_id, return_agency_id,
        pickup_date, return_date, quoted_total_cents, status, notes
    } = req.body;

    try {
        // First verify ownership
        const chk = await query('SELECT id FROM reservations WHERE id=$1 AND enterprise_id=$2', [id, req.user.enterprise_id]);
        if (chk.rows.length === 0) return res.status(404).json({ error: "Reservation not found" });

        const result = await query(`
            UPDATE reservations
            SET 
                customer_id = $1,
                vehicle_id = $2,
                pickup_agency_id = $3,
                return_agency_id = $4,
                pickup_date = $5,
                return_date = $6,
                quoted_total_cents = $7,
                status = $8,
                notes = $9,
                updated_at = NOW()
            WHERE id = $10 AND enterprise_id = $11
            RETURNING *
        `, [
            customer_id, vehicle_id || null, pickup_agency_id || null, return_agency_id || null,
            pickup_date || null, return_date || null, quoted_total_cents || 0, status, notes || null,
            id, req.user.enterprise_id
        ]);
        res.json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update reservation" });
    }
});

// 4) Delete a reservation
r.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query('DELETE FROM reservations WHERE id=$1 AND enterprise_id=$2 RETURNING id', [id, req.user.enterprise_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Reservation not found" });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete reservation" });
    }
});

export default r;
