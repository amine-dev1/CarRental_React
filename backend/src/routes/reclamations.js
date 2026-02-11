import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

// =========================
// SCHEMAS
// =========================

const CreateReclamationSchema = z.object({
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(1000),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  attachment_url: z.string().url().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved", "closed"]),
});

const UpdateResponseSchema = z.object({
  response: z.string().min(1).max(1000),
});

const UpdatePrioritySchema = z.object({
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

// =========================
// ENTERPRISE USER ROUTES (Directors & Agents)
// =========================

// Create a new reclamation
r.post("/", async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.status(403).json({ error: "Superadmin cannot create reclamations" });
  }

  const parsed = CreateReclamationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { subject, message, priority, attachment_url } = parsed.data;

  try {
    const result = await query(
      `INSERT INTO reclamations(enterprise_id, user_id, subject, message, priority, attachment_url)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.enterprise_id, req.user.id, subject, message, priority, attachment_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating reclamation:", err);
    res.status(500).json({ error: "Failed to create reclamation" });
  }
});

// Get all reclamations for the user's enterprise
r.get("/", async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.status(403).json({ error: "Use /all endpoint for superadmin" });
  }

  try {
    const result = await query(
      `SELECT 
        r.*,
        u.full_name as user_name,
        u.email as user_email,
        e.name as enterprise_name
       FROM reclamations r
       JOIN users u ON r.user_id = u.id
       JOIN enterprises e ON r.enterprise_id = e.id
       WHERE r.enterprise_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.enterprise_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reclamations:", err);
    res.status(500).json({ error: "Failed to fetch reclamations" });
  }
});

// Get a specific reclamation
r.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `SELECT 
        r.*,
        u.full_name as user_name,
        u.email as user_email,
        e.name as enterprise_name
       FROM reclamations r
       JOIN users u ON r.user_id = u.id
       JOIN enterprises e ON r.enterprise_id = e.id
       WHERE r.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Reclamation not found" });
    }

    const reclamation = result.rows[0];

    // Check permissions
    if (req.user.role !== "superadmin" && reclamation.enterprise_id !== req.user.enterprise_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(reclamation);
  } catch (err) {
    console.error("Error fetching reclamation:", err);
    res.status(500).json({ error: "Failed to fetch reclamation" });
  }
});

// Update own reclamation (only if status is pending)
r.put("/:id", async (req, res) => {
  if (req.user.role === "superadmin") {
    return res.status(403).json({ error: "Superadmin cannot update reclamations directly" });
  }

  const { id } = req.params;
  const parsed = CreateReclamationSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  try {
    // Check ownership and status
    const check = await query(
      `SELECT * FROM reclamations WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
      [id, req.user.id]
    );

    if (!check.rows[0]) {
      return res.status(404).json({ error: "Reclamation not found or cannot be updated" });
    }

    const { subject, message, priority, attachment_url } = parsed.data;
    let sets = [];
    let params = [id];

    if (subject) {
      params.push(subject);
      sets.push(`subject=$${params.length}`);
    }
    if (message) {
      params.push(message);
      sets.push(`message=$${params.length}`);
    }
    if (priority) {
      params.push(priority);
      sets.push(`priority=$${params.length}`);
    }
    if (attachment_url !== undefined) {
      params.push(attachment_url);
      sets.push(`attachment_url=$${params.length}`);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(new Date().toISOString());
    sets.push(`updated_at=$${params.length}`);

    const result = await query(
      `UPDATE reclamations SET ${sets.join(", ")} WHERE id=$1 RETURNING *`,
      params
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating reclamation:", err);
    res.status(500).json({ error: "Failed to update reclamation" });
  }
});

// =========================
// SUPERADMIN ROUTES
// =========================

// Get all reclamations across all enterprises
r.get("/all/list", async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { status, priority, enterprise_id } = req.query;

  try {
    let queryText = `
      SELECT 
        r.*,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        e.name as enterprise_name
       FROM reclamations r
       JOIN users u ON r.user_id = u.id
       JOIN enterprises e ON r.enterprise_id = e.id
       WHERE 1=1
    `;

    const params = [];

    if (status) {
      params.push(status);
      queryText += ` AND r.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      queryText += ` AND r.priority = $${params.length}`;
    }

    if (enterprise_id) {
      params.push(enterprise_id);
      queryText += ` AND r.enterprise_id = $${params.length}`;
    }

    queryText += ` ORDER BY r.created_at DESC`;

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all reclamations:", err);
    res.status(500).json({ error: "Failed to fetch reclamations" });
  }
});

// Update reclamation status
r.put("/:id/status", async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.params;
  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { status } = parsed.data;

  try {
    const updates = [`status=$1`, `updated_at=$2`];
    const params = [status, new Date().toISOString()];

    if (status === "resolved") {
      updates.push(`resolved_at=$3`);
      params.push(new Date().toISOString());
    }

    params.push(id);
    const result = await query(
      `UPDATE reclamations SET ${updates.join(", ")} WHERE id=$${params.length} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Reclamation not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Add or update response
r.put("/:id/response", async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.params;
  const parsed = UpdateResponseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { response } = parsed.data;

  try {
    const result = await query(
      `UPDATE reclamations 
       SET response=$1, responded_at=COALESCE(responded_at, $2), updated_at=$2
       WHERE id=$3 
       RETURNING *`,
      [response, new Date().toISOString(), id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Reclamation not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating response:", err);
    res.status(500).json({ error: "Failed to update response" });
  }
});

// Update priority
r.put("/:id/priority", async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.params;
  const parsed = UpdatePrioritySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { priority } = parsed.data;

  try {
    const result = await query(
      `UPDATE reclamations SET priority=$1, updated_at=$2 WHERE id=$3 RETURNING *`,
      [priority, new Date().toISOString(), id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Reclamation not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating priority:", err);
    res.status(500).json({ error: "Failed to update priority" });
  }
});

export default r;
