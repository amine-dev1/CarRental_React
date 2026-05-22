import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";

const router = Router();
router.use(requireAuth);
router.use(requireEnterpriseScope);

/**
 * GET /api/templates
 * List templates for an enterprise
 */
router.get("/", requirePermission("contracts.view"), async (req, res) => {
  const enterprise_id = req.user.enterprise_id;
  try {
    const data = await query(
      "SELECT id, name, is_default, created_at FROM contract_templates WHERE enterprise_id = $1 ORDER BY created_at DESC",
      [enterprise_id]
    );
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

/**
 * POST /api/templates
 * Create a new template
 */
router.post("/", requirePermission("contracts.template.manage"), async (req, res) => {
  const { name, html_template, is_default } = req.body;
  const enterprise_id = req.user.enterprise_id;

  try {
    if (is_default) {
      await query("UPDATE contract_templates SET is_default = false WHERE enterprise_id = $1", [enterprise_id]);
    }

    const data = await query(
      "INSERT INTO contract_templates (enterprise_id, name, html_template, is_default) VALUES ($1, $2, $3, $4) RETURNING *",
      [enterprise_id, name, html_template, is_default || false]
    );
    res.json(data.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create template" });
  }
});

export default router;
