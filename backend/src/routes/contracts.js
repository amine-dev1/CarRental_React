import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { query, pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/roles.js";
import { requireEnterpriseScope } from "../middleware/tenant.js";
import { nextContractNumber } from "../utils/contractNumber.js";
import { generatePdf } from "../utils/pdfGenerator.js";
import { savePdf, getAbsolutePath, fileExists } from "../utils/storageService.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.use(requireAuth);
router.use(requireEnterpriseScope);

// Helper for formatting prices
Handlebars.registerHelper("format_price", (cents) => (cents / 100).toFixed(2));
Handlebars.registerHelper("format_date", (date) => new Date(date).toLocaleDateString("fr-FR"));
Handlebars.registerHelper("format_datetime", (date) => new Date(date).toLocaleString("fr-FR"));

/**
 * POST /api/contracts/generate
 * Generates a draft contract from a rental
 */
router.post("/generate", requirePermission("contracts.create"), async (req, res) => {
  const { rental_id, template_id, mileage_start, fuel_level_start, deposit_amount_cents, notes } = req.body;
  const enterprise_id = req.user.enterprise_id;

  try {
    // 1. Fetch Rental + Vehicle + Customer + Enterprise
    const rentalRes = await query(
      `SELECT r.*, v.name as vehicle_name, v.plate, c.full_name as customer_name, c.driver_license_number, 
              c.phone as customer_phone, c.address as customer_address, c.city as customer_city, c.country as customer_country,
              e.name as enterprise_name, e.address as enterprise_address, e.enterprise_phone, e.currency
       FROM rentals r
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN enterprises e ON e.id = r.enterprise_id
       WHERE r.id = $1 AND r.enterprise_id = $2`,
      [rental_id, enterprise_id]
    );

    const rental = rentalRes.rows[0];
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    // 2. Determine Contract Number (Transactional)
    const client = await pool.connect();
    let contractNumber;
    try {
      await client.query("BEGIN");
      contractNumber = await nextContractNumber(client, enterprise_id);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // 3. Load Template (Default or Custom)
    let templateSource;
    if (template_id) {
      const templateRes = await query(
        "SELECT html_template FROM contract_templates WHERE id = $1 AND enterprise_id = $2",
        [template_id, enterprise_id]
      );
      templateSource = templateRes.rows[0]?.html_template;
    }

    if (!templateSource) {
      const templatePath = path.join(__dirname, "../templates/contract.hbs");
      templateSource = fs.readFileSync(templatePath, "utf-8");
    }

    // 4. Prepare Data for Handlebars
    const data = {
      contract_number: contractNumber,
      start_date: new Date(rental.start_date || rental.planned_start_date).toLocaleDateString("fr-FR"),
      end_date: new Date(rental.end_date || rental.planned_end_date).toLocaleDateString("fr-FR"),
      enterprise: {
        name: rental.enterprise_name,
        address: rental.enterprise_address,
        enterprise_phone: rental.enterprise_phone
      },
      customer: {
        full_name: rental.customer_name,
        driver_license_number: rental.driver_license_number,
        phone: rental.customer_phone,
        address: rental.customer_address,
        city: rental.customer_city,
        country: rental.customer_country
      },
      vehicle: {
        plate: rental.plate,
        name: rental.vehicle_name
      },
      mileage_start: mileage_start || rental.mileage_start || 0,
      fuel_level_start: fuel_level_start || rental.fuel_level_start || "Plein",
      duration_days: rental.total_days || 1,
      daily_price: (rental.daily_price_cents / 100).toFixed(2),
      deposit_amount: ((deposit_amount_cents || rental.deposit_amount_cents || 0) / 100).toFixed(2),
      total_amount: (rental.total_cents / 100).toFixed(2),
      currency: rental.currency || "MAD",
      notes: notes || rental.notes || "",
      generated_at: new Date().toLocaleString("fr-FR")
    };

    const template = Handlebars.compile(templateSource);
    const html_preview = template(data);

    // 5. Update Rental & Create Contract Entry
    const contractRes = await query(
      `INSERT INTO contracts (enterprise_id, rental_id, contract_number, html_snapshot, created_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [enterprise_id, rental_id, contractNumber, html_preview, req.user.id, JSON.stringify(data)]
    );

    await query(
      `UPDATE rentals SET 
        contract_number = $1, 
        contract_status = 'pending_signature',
        mileage_start = $2,
        fuel_level_start = $3,
        deposit_amount_cents = $4,
        notes = $5
       WHERE id = $6`,
      [contractNumber, data.mileage_start, data.fuel_level_start, deposit_amount_cents || 0, data.notes, rental_id]
    );

    res.json({
      contract_id: contractRes.rows[0].id,
      contract_number: contractNumber,
      html_preview
    });

  } catch (error) {
    console.error("Generate Contract Error:", error);
    res.status(500).json({ error: "Failed to generate contract draft" });
  }
});

/**
 * POST /api/contracts/:id/sign
 * Finalizes contract with signature and generates PDF
 */
router.post("/:id/sign", requirePermission("contracts.sign"), async (req, res) => {
  const { signature_data, signed_by_name } = req.body;
  const contract_id = req.params.id;
  const enterprise_id = req.user.enterprise_id;
  const signature_ip = req.ip;

  try {
    // 1. Fetch Contract & verify status
    const contractRes = await query(
      `SELECT c.*, r.status as rental_status 
       FROM contracts c 
       JOIN rentals r ON r.id = c.rental_id
       WHERE c.id = $1 AND c.enterprise_id = $2`,
      [contract_id, enterprise_id]
    );

    const contract = contractRes.rows[0];
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    // 2. Inject signature into HTML snapshot
    const data = typeof contract.metadata === 'string' ? JSON.parse(contract.metadata) : contract.metadata;
    data.signature_data = signature_data;
    data.signed_by_name = signed_by_name;
    data.signed_at = new Date().toLocaleString("fr-FR");
    data.signature_ip = signature_ip;

    // We re-compile to include the signature in the final HTML
    const templatePath = path.join(__dirname, "../templates/contract.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateSource);
    const finalHtml = template(data);

    // 3. Generate PDF
    const pdfBuffer = await generatePdf(finalHtml);
    const filename = `${contract.contract_number}_v${contract.version}.pdf`;
    const { fileUrl, filePath } = savePdf(pdfBuffer, filename);

    // 4. Update Database
    const now = new Date();
    await query(
      `UPDATE contracts SET 
        signature_data = $1, 
        signed_by_name = $2, 
        signed_at = $3, 
        signature_ip = $4,
        pdf_url = $5,
        pdf_path = $6,
        html_snapshot = $7
       WHERE id = $8`,
      [signature_data, signed_by_name, now, signature_ip, fileUrl, filePath, finalHtml, contract_id]
    );

    await query(
      `UPDATE rentals SET 
        contract_status = 'signed', 
        signed_at = $1, 
        signature_ip = $2,
        pdf_url = $3,
        pdf_generated_at = $4
       WHERE id = $5`,
      [now, signature_ip, fileUrl, now, contract.rental_id]
    );

    res.json({
      pdf_url: fileUrl,
      signed_at: now
    });

  } catch (error) {
    console.error("Sign Contract Error:", error);
    res.status(500).json({ 
        error: "Failed to sign contract and generate PDF",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/contracts/by-rental/:rental_id/download
 * Downloads the latest signed PDF for a given rental
 */
router.get("/by-rental/:rental_id/download", async (req, res) => {
  const enterprise_id = req.user.enterprise_id;
  try {
    const contractRes = await query(
      `SELECT pdf_path, contract_number FROM contracts 
       WHERE rental_id = $1 AND enterprise_id = $2 AND pdf_path IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [req.params.rental_id, enterprise_id]
    );
    const contract = contractRes.rows[0];
    if (!contract || !contract.pdf_path) return res.status(404).json({ error: "Aucun PDF trouvé pour cette location. Le contrat doit d'abord être signé." });

    const absolutePath = getAbsolutePath(contract.pdf_path);
    if (!fileExists(absolutePath)) return res.status(404).json({ error: "Le fichier PDF n'existe plus sur le serveur." });

    res.download(absolutePath, `${contract.contract_number}.pdf`);
  } catch (error) {
    console.error("Download by rental error:", error);
    res.status(500).json({ error: "Download failed" });
  }
});

/**
 * GET /api/contracts/:id/download
 * Streams the PDF file by contract ID
 */
router.get("/:id/download", async (req, res) => {
  const enterprise_id = req.user.enterprise_id;
  try {
    const contractRes = await query(
      "SELECT pdf_path, contract_number FROM contracts WHERE id = $1 AND enterprise_id = $2",
      [req.params.id, enterprise_id]
    );
    const contract = contractRes.rows[0];
    if (!contract || !contract.pdf_path) return res.status(404).json({ error: "PDF not found" });

    const absolutePath = getAbsolutePath(contract.pdf_path);
    if (!fileExists(absolutePath)) return res.status(404).json({ error: "File does not exist on server" });

    res.download(absolutePath, `${contract.contract_number}.pdf`);
  } catch (error) {
    res.status(500).json({ error: "Download failed" });
  }
});

/**
 * GET /api/contracts
 * List contracts for a rental
 */
router.get("/", requirePermission("contracts.view"), async (req, res) => {
  const { rental_id } = req.query;
  const enterprise_id = req.user.enterprise_id;

  try {
    const data = await query(
      `SELECT id, contract_number, version, signed_at, pdf_url, created_at 
       FROM contracts 
       WHERE enterprise_id = $1 ${rental_id ? "AND rental_id = $2" : ""}
       ORDER BY created_at DESC`,
      rental_id ? [enterprise_id, rental_id] : [enterprise_id]
    );
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
});

export default router;
