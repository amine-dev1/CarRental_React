import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("director")); // Only directors can manage their company
r.use(requireEnterpriseScope);

// List all agents in my enterprise
r.get("/users", async (req, res) => {
    const data = await query(
        `SELECT id, email, role, created_at FROM users 
     WHERE enterprise_id=$1 AND role='agent'
     ORDER BY created_at DESC`,
        [req.user.enterprise_id]
    );
    res.json(data.rows);
});

const AgentSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// Create a new Agent
r.post("/users", async (req, res) => {
    const parsed = AgentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const { email, password } = parsed.data;
    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await query(
            `INSERT INTO users(enterprise_id, email, password_hash, role)
       VALUES($1,$2,$3,'agent')
       RETURNING id, email, role, enterprise_id, created_at`,
            [req.user.enterprise_id, email, hash]
        );
        res.json(result.rows[0]);
    } catch (e) {
        res.status(400).json({ error: "Email already exists" });
    }
});

// Dashboard Analytics
r.get("/dashboard", async (req, res) => {
    const eid = req.user.enterprise_id;

    try {
        // Parallelize independent queries
        const [
            revenueRes,
            activeRentalsRes,
            totalVehiclesRes,
            customersRes,
            vehicleStatusRes,
            recentRentalsRes,
            chartRes,
            paymentStatsRes
        ] = await Promise.all([
            // Total Revenue (Current) - All time or this month? Let's do all time for simplicity or last 30 days
            query(`SELECT COALESCE(SUM(amount_cents), 0) as total FROM payments WHERE enterprise_id=$1`, [eid]),

            // Active Rentals
            query(`SELECT COUNT(*) as count FROM rentals WHERE enterprise_id=$1 AND status='active'`, [eid]),

            // Total Vehicles
            query(`SELECT COUNT(*) as count FROM vehicles WHERE enterprise_id=$1`, [eid]),

            // Total Customers
            query(`SELECT COUNT(*) as count FROM customers WHERE enterprise_id=$1`, [eid]),

            // Vehicle Status Distribution
            query(`SELECT status, COUNT(*) as count FROM vehicles WHERE enterprise_id=$1 GROUP BY status`, [eid]),

            // Recent Rentals
            query(`
                SELECT r.id, c.full_name as customer, v.name as vehicle, r.status, r.total_cents as amount, r.created_at as date 
                FROM rentals r 
                JOIN customers c ON r.customer_id = c.id 
                JOIN vehicles v ON r.vehicle_id = v.id 
                WHERE r.enterprise_id=$1 
                ORDER BY r.created_at DESC 
                LIMIT 5
            `, [eid]),

            // Revenue Chart (Last 7 Days)
            query(`
                SELECT to_char(paid_at, 'Dy') as date, SUM(amount_cents)/100 as revenue, COUNT(*) as rentals
                FROM payments 
                WHERE enterprise_id=$1 AND paid_at >= NOW() - INTERVAL '7 days'
                GROUP BY 1, date_trunc('day', paid_at)
                ORDER BY date_trunc('day', paid_at)
            `, [eid]),

            // Payment Methods
            query(`SELECT method, SUM(amount_cents)/100 as amount, COUNT(*) as count FROM payments WHERE enterprise_id=$1 GROUP BY method`, [eid])
        ]);

        const revenue = parseInt(revenueRes.rows[0].total || 0) / 100;
        const activeRentals = parseInt(activeRentalsRes.rows[0].count || 0);
        const totalVehicles = parseInt(totalVehiclesRes.rows[0].count || 0);
        const totalCustomers = parseInt(customersRes.rows[0].count || 0);

        // Format Vehicle Status for Recharts
        const vehicleStatus = vehicleStatusRes.rows.map(row => ({
            name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            value: parseInt(row.count),
            color: row.status === 'available' ? '#10b981' : row.status === 'maintenance' ? '#f59e0b' : '#3b82f6'
        }));

        // Format Recent Rentals
        const recentRentals = recentRentalsRes.rows.map(row => ({
            ...row,
            amount: row.amount / 100, // Cents to units
            date: new Date(row.date).toISOString().split('T')[0]
        }));

        // Format Chart Data - Fill missing days if necessary, but direct DB result is okay for start
        // To strictly match "Mon, Tue..." order we might need JS filling, but DB order by date is chronologically correct.
        const revenueChart = chartRes.rows.map(row => ({
            date: row.date,
            revenue: parseFloat(row.revenue),
            rentals: parseInt(row.rentals)
        }));

        // Format Payment Methods
        const totalPaymentAmount = paymentStatsRes.rows.reduce((acc, r) => acc + parseFloat(r.amount), 0);
        const paymentMethods = paymentStatsRes.rows.map(row => ({
            method: row.method.charAt(0).toUpperCase() + row.method.slice(1),
            amount: parseFloat(row.amount),
            percentage: totalPaymentAmount ? Math.round((parseFloat(row.amount) / totalPaymentAmount) * 100) : 0
        }));

        res.json({
            stats: {
                revenue: { current: revenue, previous: 0, change: 0 }, // Mock previous/change for now
                activeRentals: { current: activeRentals, previous: 0, change: 0 },
                totalVehicles: { current: totalVehicles, previous: 0, change: 0 },
                customers: { current: totalCustomers, previous: 0, change: 0 }
            },
            revenueChart,
            vehicleStatus,
            paymentMethods,
            recentRentals,
            alerts: [] // Dynamic alerts to be implemented later (maintenance logic, etc.)
        });

    } catch (e) {
        console.error("Dashboard Error:", e);
        res.status(500).json({ error: "Failed to load dashboard data" });
    }
});

export default r;
