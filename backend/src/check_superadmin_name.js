import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSuperadminName() {
  const client = await pool.connect();
  try {
    console.log("🔄 Vérification du nom complet du superadmin...\n");

    const result = await client.query(`
      SELECT id, email, full_name, role, created_at
      FROM users
      WHERE role = 'superadmin'
    `);

    if (result.rows.length === 0) {
      console.log("⚠️  Aucun superadmin trouvé dans la base de données.");
    } else {
      console.log("✅ Superadmin(s) trouvé(s):\n");
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nom complet: "${user.full_name}"`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé le: ${new Date(user.created_at).toLocaleString("fr-FR")}`);
        console.log("");
      });
    }
  } catch (err) {
    console.error("❌ Erreur:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSuperadminName();
