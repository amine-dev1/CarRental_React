import { query } from "../db.js";

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user?.role) return res.status(401).json({ error: "Unauthorized" });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

export function requirePermission(permission) {
    return async (req, res, next) => {
        if (!req.user?.role) return res.status(401).json({ error: "Unauthorized" });
        
        // superadmin and director have full access implicitly
        if (req.user.role === 'superadmin' || req.user.role === 'director') {
            return next();
        }

        try {
            const result = await query(`
                SELECT r.permissions 
                FROM users u 
                LEFT JOIN roles r ON u.custom_role_id = r.id 
                WHERE u.id = $1
            `, [req.user.id]);
            
            const userPerms = result.rows[0]?.permissions || [];
            if (!userPerms.includes(permission)) {
                return res.status(403).json({ error: "Accès refusé : permission manquante (" + permission + ")" });
            }
            
            next();
        } catch (e) {
            console.error("Permission check error:", e);
            res.status(500).json({ error: "Erreur serveur" });
        }
    };
}
