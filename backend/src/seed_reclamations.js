import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedReclamations() {
  const client = await pool.connect();
  try {
    console.log("🔄 Seeding sample reclamations...");

    // Get an enterprise and user
    const enterprises = await client.query("SELECT id FROM enterprises LIMIT 1");
    if (enterprises.rows.length === 0) {
      console.log("⚠️  No enterprises found. Please create an enterprise first.");
      return;
    }

    const enterpriseId = enterprises.rows[0].id;

    // Get a director or agent from that enterprise
    const users = await client.query(
      "SELECT id FROM users WHERE enterprise_id = $1 AND role IN ('director', 'agent') LIMIT 1",
      [enterpriseId]
    );

    if (users.rows.length === 0) {
      console.log("⚠️  No directors or agents found. Please create a user first.");
      return;
    }

    const userId = users.rows[0].id;

    // Sample reclamations
    const reclamations = [
      {
        subject: "Problème avec le système de paiement",
        message: "Nous rencontrons des difficultés avec le traitement des paiements par carte. Les clients se plaignent que leurs transactions sont refusées.",
        priority: "high",
        status: "pending",
      },
      {
        subject: "Demande de nouvelle fonctionnalité",
        message: "Il serait utile d'avoir un rapport mensuel automatique sur les revenus et les locations. Cela nous aiderait dans notre comptabilité.",
        priority: "medium",
        status: "pending",
      },
      {
        subject: "Bug dans l'interface de gestion de flotte",
        message: "Lorsque nous essayons de modifier les détails d'un véhicule, la page se rafraîchit et les modifications sont perdues.",
        priority: "urgent",
        status: "in_progress",
      },
      {
        subject: "Question sur les permissions des agents",
        message: "Est-il possible de donner aux agents l'accès en lecture seule aux statistiques sans leur permettre de modifier les prix ?",
        priority: "low",
        status: "resolved",
        response: "Oui, nous avons ajouté cette fonctionnalité. Vous pouvez maintenant configurer les permissions granulaires dans les paramètres.",
      },
    ];

    for (const rec of reclamations) {
      await client.query(
        `INSERT INTO reclamations(enterprise_id, user_id, subject, message, priority, status, response)
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [
          enterpriseId,
          userId,
          rec.subject,
          rec.message,
          rec.priority,
          rec.status,
          rec.response || null,
        ]
      );
    }

    console.log("✅ Sample reclamations created successfully!");
    console.log(`   Enterprise ID: ${enterpriseId}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Total reclamations: ${reclamations.length}`);

    // Display created reclamations
    const result = await client.query(
      "SELECT id, subject, priority, status FROM reclamations WHERE enterprise_id = $1",
      [enterpriseId]
    );

    console.log("\n📋 Created reclamations:");
    result.rows.forEach((r) => {
      console.log(`   - ${r.subject} [${r.priority}] (${r.status})`);
    });
  } catch (err) {
    console.error("❌ Error seeding reclamations:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedReclamations();
