import jwt from "jsonwebtoken";
import { query } from "../db.js";

export async function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If not superadmin, check if enterprise is suspended
        if (decoded.role !== 'superadmin' && decoded.enterprise_id) {
            const result = await query(
                "SELECT status FROM enterprises WHERE id = $1",
                [decoded.enterprise_id]
            );
            const enterprise = result.rows[0];

            if (!enterprise || enterprise.status === 'suspended') {
                return res.status(403).json({ error: "Votre agence est suspendue. Accès refusé." });
            }
        }

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
