// Use this for enterprise-scoped routes (customers/vehicles/rentals/payments)
export function requireEnterpriseScope(req, res, next) {
    // superadmin can access anything but MUST specify enterprise_id explicitly (we'll handle per route)
    if (req.user.role === "superadmin") return next();

    // director/agent must be tied to one enterprise
    if (!req.user.enterprise_id) {
        return res.status(403).json({ error: "Enterprise required" });
    }
    next();
}

// helper to get tenantId for scoped queries
export function tenantIdOrFail(req) {
    // for director/agent, use token enterprise_id
    if (req.user.role !== "superadmin") return req.user.enterprise_id;

    // for superadmin, require ?enterprise_id=... on list endpoints
    return null;
}
